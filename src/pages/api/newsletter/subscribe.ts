/**
 * Newsletter subscribe endpoint (Footer form)
 *
 * 阶段 7 P0 (2026-09-10): trade journal signup
 *
 * 行为:
 *   1. POST email → 校验格式 + 写入 Supabase newsletter_subscribers
 *   2. 重复 email (idempotent) → 200 + skip
 *   3. 推 n8n event 'newsletter_subscribed' 让 zj workflow 决定是否触发欢迎邮件
 *
 * 设计权衡:
 *   - 暂不接 Mailchimp / Resend Audiences (要付费 / 迁移成本)
 *   - 先用 Supabase 表存 email + locale + timestamp, 未来再迁
 *   - 不发欢迎邮件 — n8n 接管 (zj 偏好 workflow 可视化编辑)
 */

import { toAstroApiRoute, type VercelLikeRequest, type VercelLikeResponse } from '../../../lib/api/vercel-shim';
import { broadcast } from '../../../lib/n8n-broadcast';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '';

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

function inferLocale(acceptLanguage: string): string {
  const m = acceptLanguage.match(/^([a-z]{2,3})/i);
  if (!m) return 'en';
  const code = m[1].toLowerCase();
  // Map to our 6 supported locales
  if (code === 'zh') return 'cn';
  if (code === 'ko') return 'kr';
  if (code === 'ja') return 'ja';
  if (code === 'de') return 'de';
  if (code === 'fr') return 'fr';
  return 'en';
}

async function _internalHandler(req: VercelLikeRequest, res: VercelLikeResponse) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: 'supabase_not_configured' });
  }

  // 解析 form-encoded (浏览器 form submit 默认) 或 JSON (API 调用)
  let email = '';
  let locale = '';
  if (req.body && typeof req.body === 'object' && !(req.body instanceof Buffer)) {
    email = String(req.body.email || '').trim().toLowerCase();
    locale = String(req.body.locale || '');
  } else if (typeof req.body === 'string') {
    const raw = req.body;
    if (raw.includes('email=')) {
      // urlencoded
      const params = new URLSearchParams(raw);
      email = String(params.get('email') || '').trim().toLowerCase();
      locale = String(params.get('locale') || '');
    }
  }

  if (!email) {
    email = String(req.query?.email || '').trim().toLowerCase();
  }

  if (!locale) {
    locale = inferLocale(String(req.headers['accept-language'] || ''));
  }

  // 简单 email 校验
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return res.status(400).json({ error: 'invalid_email' });
  }

  try {
    // 检查重复
    const existing = await sb(
      `/newsletter_subscribers?email=eq.${encodeURIComponent(email)}&limit=1`,
    );

    if (existing.length > 0) {
      return res.status(200).json({ ok: true, action: 'already_subscribed', email });
    }

    // 插入
    const inserted = await sb('/newsletter_subscribers', {
      method: 'POST',
      headers: { 'Prefer': 'return=minimal' },
      body: JSON.stringify({
        email,
        locale,
        source: 'footer',
        subscribed_at: new Date().toISOString(),
      }),
    });

    // 推 n8n 让 zj workflow 触发欢迎邮件 / CRM 同步
    broadcast({
      event: 'newsletter_subscribed',
      data: { email, locale, source: 'footer' },
    });

    // Form submit 用户期望 redirect 回 footer (非 API JSON)
    const accept = String(req.headers['accept'] || '');
    if (accept.includes('text/html')) {
      // redirect 到首页带 ?newsletter=ok query
      const referer = String(req.headers['referer'] || '/');
      const url = new URL(referer);
      url.searchParams.set('newsletter', 'subscribed');
      res.setHeader('Location', url.toString());
      return res.status(303).end();
    }

    return res.status(200).json({ ok: true, action: 'subscribed', email });
  } catch (e: any) {
    console.error('[newsletter-subscribe] error:', e?.message || e);
    return res.status(500).json({ error: 'fatal', message: String(e?.message || e) });
  }
}

export const prerender = false;
const handler = async (req: any, res: any) => { await _internalHandler(req, res); };
export const POST = toAstroApiRoute(handler);
export const GET = toAstroApiRoute(handler);
export const OPTIONS = toAstroApiRoute(handler);
