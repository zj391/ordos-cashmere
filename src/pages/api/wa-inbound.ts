/**
 * WhatsApp Cloud API inbound webhook — 客户在 WA 里回复自动停 nurture
 *
 * 触发:
 *   Meta Business Suite → WhatsApp → Configuration → Webhook
 *   URL: https://www.erdosdx.com/api/wa-inbound
 *   Verify token: WA_WEBHOOK_VERIFY_TOKEN (配在 Vercel env, Meta 那边填一致)
 *   Events: messages
 *
 * 行为:
 *   1. GET: Meta webhook 验证 — 返回 hub.challenge 当 hub.verify_token 匹配
 *   2. POST: Meta 推 inbound message 事件
 *      - 验证 X-Hub-Signature-256 签名 (HMAC SHA256 of raw body, 用 WA_APP_SECRET)
 *      - 解析 entry[].changes[].value.messages[] (跳过 status/echo)
 *      - 匹配 leads.phone → 找到 lead → 置 email_replied_at (复用字段, 也代表"主动回复了")
 *      - 写 wa_send_log (direction=in) 用于审计
 *
 * 设计权衡:
 *   - Meta 不会重复发, 但 Vercel 可能 timeout; 我们 idempotent 处理 (重复时 already_replied 200)
 *   - 不存消息正文 (B2B 隐私, GDPR), 只存 from / type / timestamp
 *   - 客户在 WA 里发图片/语音/位置 — 我们只标记为已回复,不解析内容
 *
 * Stage 4 P0 (2026-09-10)
 */

import { toAstroApiRoute, type VercelLikeRequest, type VercelLikeResponse } from '../../lib/api/vercel-shim';
import { detectUnsubscribeIntent } from '../../lib/unsubscribe-detect';
import { broadcast } from '../../lib/n8n-broadcast';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '';
const WA_WEBHOOK_VERIFY_TOKEN = process.env.WA_WEBHOOK_VERIFY_TOKEN || '';
const WA_APP_SECRET = process.env.WA_APP_SECRET || '';

async function sb(pathname: string, opts: any = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${pathname}`, {
    ...opts,
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
    },
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Supabase ${res.status}: ${t.slice(0, 200)}`);
  }
  return res.json();
}

function setCors(res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Hub-Signature-256');
}

async function hmacSha256(secret: string, body: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(body));
  return 'sha256=' + Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.length === 11 && digits.startsWith('1')) return '+86' + digits;
  if (digits.length === 13 && digits.startsWith('86')) return '+' + digits;
  return '+' + digits;
}

function getRawBody(req: VercelLikeRequest): string {
  if (typeof req.body === 'string') return req.body;
  if (req.body && typeof req.body === 'object') return JSON.stringify(req.body);
  return '';
}

async function _internalHandler(req: VercelLikeRequest, res: VercelLikeResponse) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  // ====== GET: Meta webhook verification ======
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    if (mode === 'subscribe' && token === WA_WEBHOOK_VERIFY_TOKEN) {
      return res.status(200).send(String(challenge));
    }
    return res.status(403).json({ error: 'forbidden', hint: 'check WA_WEBHOOK_VERIFY_TOKEN' });
  }

  // ====== POST: inbound messages ======
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: 'supabase_not_configured' });
  }

  const rawBody = getRawBody(req);

  // 签名验证 (如果配了 WA_APP_SECRET)
  if (WA_APP_SECRET) {
    const sigHeader = req.headers['x-hub-signature-256'];
    const sigValue = typeof sigHeader === 'string' ? sigHeader : (Array.isArray(sigHeader) ? sigHeader[0] : '');
    if (!sigValue) {
      return res.status(401).json({ error: 'missing_signature' });
    }
    const expected = await hmacSha256(WA_APP_SECRET, rawBody);
    if (sigValue !== expected) {
      console.warn('[wa-inbound] signature mismatch, expected', expected, 'got', sigValue);
      return res.status(401).json({ error: 'invalid_signature' });
    }
  }

  let body: any;
  try {
    body = rawBody ? JSON.parse(rawBody) : req.body;
  } catch {
    return res.status(400).json({ error: 'invalid_json' });
  }

  // Meta webhook body shape:
  // { object: 'whatsapp_business_account', entry: [{ id, changes: [{ value: { messages: [...], statuses: [...] }, field: 'messages' }] }] }
  const entries = body.entry || [];
  const results: any[] = [];

  for (const entry of entries) {
    const changes = entry.changes || [];
    for (const change of changes) {
      const value = change.value || {};
      const messages = value.messages || [];
      const contacts = value.contacts || [];

      for (const msg of messages) {
        const fromPhone = msg.from;  // E.164 (无 +)
        const msgType = msg.type;
        const msgId = msg.id;
        const waTimestamp = msg.timestamp;  // unix seconds
        // contact name lookup (Meta 通常在 contacts[].wa_id 匹配)
        const contactName = contacts.find((c: any) => c.wa_id === fromPhone)?.profile?.name || null;

        if (!fromPhone || !msgType || !msgId) {
          results.push({ msg_id: msgId, action: 'malformed_skipped' });
          continue;
        }

        const phone = normalizePhone(fromPhone);

        try {
          // 找 lead (按 phone)
          // leads 表 phone 字段是 free-form, 我们用 normalize 后的 E.164 匹配
          const digitsOnly = phone.replace(/[^0-9]/g, '');
          const altDigits = digitsOnly.startsWith('86') ? digitsOnly.slice(2) : '86' + digitsOnly;
          const leads = await sb(
            `/leads?or=(phone.eq.${encodeURIComponent(phone)},phone.eq.${encodeURIComponent(digitsOnly)},phone.eq.${encodeURIComponent(altDigits)})&limit=1&select=id,contact_name,phone,email_sequence_step,is_blacklisted`,
          );
          const lead = leads?.[0];

          // 写 wa_send_log (direction=in)
          await sb('/wa_send_log', {
            method: 'POST',
            headers: { 'Prefer': 'return=minimal' },
            body: JSON.stringify({
              lead_id: lead?.id || null,
              phone,
              direction: 'in',
              template_name: null,
              body: `[${msgType}] ${contactName ? contactName + ': ' : ''}(message body redacted for privacy)`,
              status: 'replied',
              wa_message_id: msgId,
              campaign: 'wa_inbound_reply',
              triggered_by: 'meta-webhook',
              metadata: {
                msg_type: msgType,
                wa_timestamp: waTimestamp,
                contact_name: contactName,
                received_at_iso: new Date().toISOString(),
                matched_lead_id: lead?.id || null,
              },
            }),
          });

          if (!lead) {
            results.push({ msg_id: msgId, phone, action: 'unmatched_no_lead' });
            continue;
          }

          if (lead.is_blacklisted) {
            results.push({ msg_id: msgId, lead_id: lead.id, action: 'blacklisted_skipped' });
            continue;
          }

          // 阶段 5 P0: 检测客户在 WA 里要求退订 (STOP / unsubscribe)
          // WA message body 在 msg.text.body (text type) 或 msg[msgType] (其他类型)
          let msgBody = '';
          if (msgType === 'text' && msg.text?.body) msgBody = msg.text.body;
          else if (msg[msgType]?.body) msgBody = msg[msgType].body;
          else if (msg[msgType]?.caption) msgBody = msg[msgType].caption;  // 图片/视频
          const wantsUnsub = detectUnsubscribeIntent(msgBody, msgType);

          // 标记 lead 状态 (replied 或 unsubscribed)
          const statusUpdate: Record<string, any> = {
            email_replied_at: new Date().toISOString(),
            email_next_due_at: null,
          };
          let action: string;
          if (wantsUnsub) {
            // 客户明确退订 → 拉黑 (阶段 5 P0)
            statusUpdate.status = 'unsubscribed';
            statusUpdate.is_blacklisted = true;
            statusUpdate.blacklist_reason = `wa_unsubscribe: ${msgType}`;
            action = 'unsubscribed_and_blacklisted';
          } else {
            statusUpdate.status = 'replied';
            action = 'replied_paused';
          }

          await sb(`/leads?id=eq.${lead.id}`, {
            method: 'PATCH',
            headers: { 'Prefer': 'return=minimal' },
            body: JSON.stringify(statusUpdate),
          });

          // 同步写一条 lead_activities 便于 timeline UI 展示
          await sb('/lead_activities', {
            method: 'POST',
            headers: { 'Prefer': 'return=minimal' },
            body: JSON.stringify({
              lead_id: lead.id,
              channel: 'whatsapp',
              direction: 'in',
              subject: `WhatsApp reply (${msgType})`,
              body_excerpt: contactName ? `${contactName} replied via WhatsApp` : 'Replied via WhatsApp',
              status: wantsUnsub ? 'unsubscribed' : 'replied',
              external_id: msgId,
              campaign: wantsUnsub ? 'wa_unsubscribe_request' : 'wa_inbound_reply',
              metadata: {
                wa_timestamp: waTimestamp,
                received_at_iso: new Date().toISOString(),
                wants_unsubscribe: wantsUnsub,
              },
            }),
          });

          // 阶段 6 P0: 推 WA lifecycle 事件到 n8n
          broadcast({
            event: wantsUnsub ? 'lead_unsubscribed' : 'lead_wa_replied',
            data: {
              lead_id: lead.id,
              phone,
              msg_type: msgType,
              wants_unsubscribe: wantsUnsub,
              contact_name: contactName,
              wa_timestamp: waTimestamp,
            },
          });

          results.push({ msg_id: msgId, lead_id: lead.id, action, wants_unsubscribe: wantsUnsub });
        } catch (e: any) {
          console.error('[wa-inbound] error processing msg', msgId, e?.message || e);
          results.push({ msg_id: msgId, action: 'error', error: String(e?.message || e) });
        }
      }
    }
  }

  return res.status(200).json({ ok: true, processed: results.length, results });
}

export const prerender = false;
const handler = async (req: any, res: any) => { await _internalHandler(req, res); };
export const GET = toAstroApiRoute(handler);
export const POST = toAstroApiRoute(handler);
export const OPTIONS = toAstroApiRoute(handler);
