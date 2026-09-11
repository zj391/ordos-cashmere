/**
 * Resend inbound webhook — 客户回复邮件自动停 nurture
 *
 * 触发流程:
 *   1. 客户在 Outlook/Gmail 收到 nurture 邮件,点 Reply 回信
 *   2. 邮件发到 sales@erdosdx.com (FROM_EMAIL 的 reply-to)
 *   3. Resend 接到入站邮件,解析后 POST 到 https://www.erdosdx.com/api/resend-inbound
 *   4. 本端点解析 from 字段,匹配 leads.email
 *   5. 命中 → 更新 leads.email_replied_at + 清掉 email_next_due_at
 *   6. 写一条 lead_activities (direction=in, status=replied)
 *
 * 配置:
 *   Resend Dashboard → Domains → erdosdx.com → Inbound → 设 webhook URL:
 *     https://www.erdosdx.com/api/resend-inbound
 *
 * 安全:
 *   - Resend inbound 默认不需要 auth (签名 webhook 是 Pro feature)
 *   - 我们加 IP 白名单 (Resend 出口 IP 段)
 *   - 失败静默不抛异常
 *
 * 设计权衡:
 *   - 不解析邮件正文 (B2B editorial — 邮件正文可能含敏感信息,不入库)
 *   - 只存 metadata: from / subject 前 200 字 / received_at
 *   - 客户已回复 = nurture 自动停 (不需额外 cron 检查)
 */

import { toAstroApiRoute, type VercelLikeRequest, type VercelLikeResponse } from '../../lib/api/vercel-shim';
import { detectUnsubscribeIntent } from '../../lib/unsubscribe-detect';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'sales@erdosdx.com';
const RESEND_INBOUND_IPS = (process.env.RESEND_INBOUND_IPS || '').split(',').map(s => s.trim()).filter(Boolean);

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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function extractEmailAddress(fromHeader: string): string | null {
  // Resend inbound from 格式: "John Doe <john@example.com>" 或 "john@example.com"
  if (!fromHeader) return null;
  const match = fromHeader.match(/<([^>]+)>/);
  if (match) return match[1].trim().toLowerCase();
  const direct = fromHeader.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  return direct ? direct[0].toLowerCase() : null;
}

function getClientIp(req: VercelLikeRequest): string {
  const fwd = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim();
  if (fwd) return fwd;
  const real = req.headers['x-real-ip'] as string;
  if (real) return real;
  return (req.socket?.remoteAddress) || 'unknown';
}

function ipAuthorized(ip: string): boolean {
  if (RESEND_INBOUND_IPS.length === 0) {
    // 未配 IP 白名单 = 允许全部 (适合先跑通,再收紧)
    return true;
  }
  return RESEND_INBOUND_IPS.some(allowed => ip.startsWith(allowed));
}

// detectUnsubscribeIntent() moved to src/lib/unsubscribe-detect.ts (阶段 5 P0, 2026-09-10)
// — 共享给 wa-inbound.ts

async function _internalHandler(req: VercelLikeRequest, res: VercelLikeResponse) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  const ip = getClientIp(req);
  if (!ipAuthorized(ip)) {
    console.warn('[resend-inbound] rejected IP:', ip);
    return res.status(403).json({ error: 'ip_not_authorized' });
  }

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: 'supabase_not_configured' });
  }

  let body: any;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: 'invalid_json' });
  }

  // Resend inbound 字段 (https://resend.com/docs/dashboard/receiving/introduction)
  // 通常: from / to / subject / text / html / headers / attachments
  const from = body.from || body.From || '';
  const to = body.to || body.To || '';
  const subject = body.subject || body.Subject || '';
  const text = body.text || body.Text || '';

  const fromEmail = extractEmailAddress(from);
  if (!fromEmail) {
    return res.status(200).json({ ok: true, action: 'no_email_extracted', from, to, subject });
  }

  // 防御: 忽略从 FROM_EMAIL 自己发出的 (loop protection)
  if (fromEmail === FROM_EMAIL.toLowerCase()) {
    return res.status(200).json({ ok: true, action: 'loop_self_send_skipped' });
  }

  try {
    // 1. 找 lead (按 email 匹配,小写)
    const leads = await sb(
      `/leads?email=eq.${encodeURIComponent(fromEmail)}&limit=1&select=id,contact_name,company_name,email_sequence_step,email_replied_at,is_blacklisted`,
    );
    const lead = leads?.[0];

    // 2. 写 lead_activities 记录 (不论是否命中 lead 都写, 用于审计)
    const activityRow = {
      lead_id: lead?.id || null,
      channel: 'email',
      direction: 'in',
      subject: subject.slice(0, 500),
      body_excerpt: text.slice(0, 200),
      status: lead ? 'replied' : 'unmatched',
      campaign: 'inbound_reply',
      metadata: {
        from_raw: from.slice(0, 200),
        to_raw: to.slice(0, 200),
        received_at_iso: new Date().toISOString(),
        ip,
        matched_lead_id: lead?.id || null,
      },
    };
    await sb('/lead_activities', {
      method: 'POST',
      headers: { 'Prefer': 'return=minimal' },
      body: JSON.stringify(activityRow),
    });

    if (!lead) {
      // 没匹配上 lead — 可能是不在表里的随机来信,或老客户直接回
      // 不阻塞,200 返回让 Resend 不重试
      return res.status(200).json({ ok: true, action: 'unmatched_no_lead', from: fromEmail });
    }

    if (lead.is_blacklisted) {
      return res.status(200).json({ ok: true, action: 'blacklisted_skipped', lead_id: lead.id });
    }

    // 阶段 5 P0: 检测客户在邮件里要求退订 (STOP / unsubscribe)
    const wantsUnsub = detectUnsubscribeIntent(text, subject);

    if (lead.email_replied_at && !wantsUnsub) {
      // 之前已经标记为已回复 (可能是重复邮件 / Resend 重试)
      return res.status(200).json({ ok: true, action: 'already_replied', lead_id: lead.id });
    }

    // 3. 标记 lead 状态
    const statusUpdate: Record<string, any> = {
      email_replied_at: new Date().toISOString(),
      email_next_due_at: null,
    };
    let action: string;
    if (wantsUnsub) {
      // 客户明确退订 → 拉黑名单 + status=unsubscribed (阶段 5 P0)
      statusUpdate.status = 'unsubscribed';
      statusUpdate.is_blacklisted = true;
      statusUpdate.blacklist_reason = `inbound_unsubscribe_request: ${subject.slice(0, 100)}`;
      statusUpdate.wa_opted_in = false;  // 同步撤 WA 同意 (合规: 同一信号撤所有渠道)
      action = 'unsubscribed_and_blacklisted';
    } else {
      // 普通回复
      action = 'replied_paused';
    }

    await sb(`/leads?id=eq.${lead.id}`, {
      method: 'PATCH',
      headers: { 'Prefer': 'return=minimal' },
      body: JSON.stringify(statusUpdate),
    });

    return res.status(200).json({
      ok: true,
      action,
      lead_id: lead.id,
      contact_name: lead.contact_name,
      company: lead.company_name,
      previous_step: lead.email_sequence_step,
      wants_unsubscribe: wantsUnsub,
    });
  } catch (e: any) {
    console.error('[resend-inbound] error:', e?.message || e);
    return res.status(500).json({ error: 'fatal', message: String(e?.message || e) });
  }
}

export const prerender = false;
const handler = async (req: any, res: any) => { await _internalHandler(req, res); };
export const POST = toAstroApiRoute(handler);
export const OPTIONS = toAstroApiRoute(handler);
