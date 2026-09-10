/**
 * Resend delivery event webhook — 邮件打开/点击/退回追踪
 *
 * 触发:
 *   Resend Dashboard → Webhooks → Add endpoint
 *   URL: https://www.erdosdx.com/api/resend-events
 *   Events: email.sent / email.delivered / email.opened / email.clicked / email.bounced / email.complained
 *
 * 行为:
 *   1. 收到 Resend POST, 解析 event type + email_id
 *   2. 在 lead_activities 表里找 external_id == email_id 的那条 (nurture 发送时记录的)
 *   3. 更新 lead_activities.status: sent → delivered → opened → clicked / bounced / complained
 *   4. 如果是 bounced/complained: 标记 lead.status='unsubscribed' + is_blacklisted=true (合规)
 *
 * 设计权衡:
 *   - Resend webhook 不签名 (Pro plan 有 signature 头, Hobby 没有)
 *   - 加 IP 白名单 (默认放行,生产前收紧)
 *   - 用 lead_activities.status 而非新表: 已有的 UI/timeline 立即可用
 *   - bounce/complaint 直接拉黑名单 (避免反复推 nurture 被打入垃圾邮件)
 *
 * Stage 3 P1 (2026-09-10)
 */

import { toAstroApiRoute, type VercelLikeRequest, type VercelLikeResponse } from '../../lib/api/vercel-shim';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '';
const RESEND_EVENT_IPS = (process.env.RESEND_EVENT_IPS || '').split(',').map(s => s.trim()).filter(Boolean);

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

function getClientIp(req: VercelLikeRequest): string {
  const fwd = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim();
  if (fwd) return fwd;
  const real = req.headers['x-real-ip'] as string;
  if (real) return real;
  return (req.socket?.remoteAddress) || 'unknown';
}

function ipAuthorized(ip: string): boolean {
  if (RESEND_EVENT_IPS.length === 0) return true;
  return RESEND_EVENT_IPS.some(allowed => ip.startsWith(allowed));
}

// Resend event type → lead_activities.status 映射
const EVENT_STATUS_MAP: Record<string, string> = {
  'email.sent': 'sent',
  'email.delivered': 'delivered',
  'email.opened': 'opened',
  'email.clicked': 'clicked',
  'email.bounced': 'bounced',
  'email.complained': 'complained',
  'email.delivery_delayed': 'delayed',
};

interface ResendEvent {
  type: string;
  created_at: string;
  data: {
    email_id?: string;
    to?: string[];
    from?: string;
    subject?: string;
    click?: { link: string };
    bounce?: { type: string; message?: string };
  };
}

async function _internalHandler(req: VercelLikeRequest, res: VercelLikeResponse) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  const ip = getClientIp(req);
  if (!ipAuthorized(ip)) {
    console.warn('[resend-events] rejected IP:', ip);
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

  // Resend 实际发的格式: { type, created_at, data: {...} } 单个事件
  // 但也可能批量 (数组),逐个处理
  const events: ResendEvent[] = Array.isArray(body) ? body : [body];
  const results: any[] = [];

  for (const event of events) {
    const eventType = event.type || '';
    const newStatus = EVENT_STATUS_MAP[eventType];
    const emailId = event.data?.email_id;

    if (!eventType || !newStatus) {
      results.push({ type: eventType, action: 'unknown_event_skipped' });
      continue;
    }

    if (!emailId) {
      results.push({ type: eventType, action: 'no_email_id_skipped' });
      continue;
    }

    try {
      // 找 lead_activities 中 external_id == emailId 的行
      const activities = await sb(
        `/lead_activities?external_id=eq.${encodeURIComponent(emailId)}&limit=1`,
      );
      const activity = activities?.[0];
      if (!activity) {
        results.push({ type: eventType, email_id: emailId, action: 'no_activity_found' });
        continue;
      }

      // 更新 status (单调推进: sent → delivered → opened → clicked 不能倒着改)
      // 简化: 直接覆盖, last write wins
      const updatePayload: Record<string, any> = { status: newStatus };
      if (event.data?.click?.link) {
        updatePayload.metadata = {
          ...(activity.metadata || {}),
          last_click_link: event.data.click.link,
          last_event_at: event.created_at || new Date().toISOString(),
        };
      } else {
        updatePayload.metadata = {
          ...(activity.metadata || {}),
          last_event_at: event.created_at || new Date().toISOString(),
        };
      }

      await sb(`/lead_activities?id=eq.${activity.id}`, {
        method: 'PATCH',
        headers: { 'Prefer': 'return=minimal' },
        body: JSON.stringify(updatePayload),
      });

      // bounced/complained → 拉黑 lead, 停 nurture
      if (newStatus === 'bounced' || newStatus === 'complained') {
        await sb(`/leads?id=eq.${activity.lead_id}`, {
          method: 'PATCH',
          headers: { 'Prefer': 'return=minimal' },
          body: JSON.stringify({
            status: 'unsubscribed',
            is_blacklisted: true,
            blacklist_reason: `email_${newStatus}: ${eventType}`,
            email_next_due_at: null,  // 立刻停 nurture
          }),
        });
      }

      results.push({
        type: eventType,
        email_id: emailId,
        lead_id: activity.lead_id,
        new_status: newStatus,
        action: newStatus === 'bounced' || newStatus === 'complained' ? 'blacklisted' : 'tracked',
      });
    } catch (e: any) {
      results.push({ type: eventType, email_id: emailId, action: 'error', error: String(e?.message || e) });
    }
  }

  return res.status(200).json({ ok: true, processed: results.length, results });
}

export const prerender = false;
const handler = async (req: any, res: any) => { await _internalHandler(req, res); };
export const POST = toAstroApiRoute(handler);
export const OPTIONS = toAstroApiRoute(handler);
