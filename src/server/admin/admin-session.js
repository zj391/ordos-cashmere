/**
 * Stateless admin session tokens: `<timestamp>.<hex(HMAC-SHA256(secret, timestamp))>`.
 *
 * Verified by every admin API endpoint without any DB or shared cache, so it
 * survives Vercel cold starts / multiple instances. The secret is ADMIN_PASSWORD,
 * which is also what a valid login requires — forging a cookie therefore needs
 * the password itself.
 *
 * 2FA flow (when ADMIN_TOTP_SECRET is set in env):
 *   - Step 1: password verified → signSessionStep1(token) returned (5min TTL)
 *   - Step 2: step1 token + TOTP code verified → signSession() cookie set
 *
 * The step-1 token is a shorter-lived ticket that proves password was correct
 * without yet establishing admin access. It's verified on the /api/admin/auth
 * step-2 endpoint, then exchanged for the full admin_session cookie.
 *
 * NOTE: this is a .js file (not .ts) because Vercel Node API routes load
 * the raw JS directly. Don't add TS type annotations here — keep it
 * plain JS that Node 20 can execute without a build step.
 */
import { createHmac, timingSafeEqual, randomBytes } from 'crypto';

export const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
export const STEP1_MAX_AGE_MS = 5 * 60 * 1000;               // 5 minutes

export function signSession(secret) {
  const ts = String(Date.now());
  const mac = createHmac('sha256', secret).update(ts).digest('hex');
  return `${ts}.${mac}`;
}

export function verifySession(token, secret) {
  if (!token || !secret) return false;
  const idx = token.indexOf('.');
  if (idx <= 0) return false;
  const ts = token.slice(0, idx);
  const mac = token.slice(idx + 1);
  if (!/^\d+$/.test(ts)) return false;
  const now = Date.now();
  if (now - Number(ts) > SESSION_MAX_AGE_MS) return false;
  if (Number(ts) > now + 60 * 1000) return false; // reject future timestamps
  const expected = createHmac('sha256', secret).update(ts).digest('hex');
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Step-1 ticket: same shape as a session but with a 5-minute TTL and a
 * `step1.` prefix so it can never be confused with a real session. Cookie
 * name is `admin_step1` (not `admin_session`) so API endpoints ignore it.
 */
export function signSessionStep1(secret) {
  const ts = String(Date.now());
  const mac = createHmac('sha256', secret).update('step1').update(ts).digest('hex');
  return `step1.${ts}.${mac}`;
}

export function verifySessionStep1(token, secret) {
  if (!token || !secret) return false;
  const parts = String(token).split('.');
  if (parts.length !== 3 || parts[0] !== 'step1') return false;
  const ts = parts[1];
  const mac = parts[2];
  if (!/^\d+$/.test(ts)) return false;
  const now = Date.now();
  if (now - Number(ts) > STEP1_MAX_AGE_MS) return false;
  if (Number(ts) > now + 60 * 1000) return false;
  const expected = createHmac('sha256', secret).update('step1').update(ts).digest('hex');
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Generate 8 recovery codes (8 hex chars each, single-use, easy to write down). */
export function generateRecoveryCodes(count) {
  const n = count || 8;
  const out = [];
  for (let i = 0; i < n; i++) {
    out.push(randomBytes(4).toString('hex')); // 8 hex chars = 32 bits
  }
  return out;
}

export function getSecret() {
  return process.env.ADMIN_PASSWORD || '';
}

/**
 * Returns true if TOTP is configured. When false, /admin/login skips step 2
 * entirely (single-password flow preserved for backward compatibility).
 */
export function isTotpEnabled() {
  const s = (process.env.ADMIN_TOTP_SECRET || '').trim();
  return s.length > 0;
}

/**
 * 2026-09-10 (Stage 14): CSRF token for admin POST/PATCH/DELETE.
 *
 * 设计:
 *   - token = hex(HMAC(secret, session_token))
 *   - 校验: header `x-csrf-token` 必须等于 token
 *   - 派生自 session, 即使 session 过期 token 也失效
 *   - 不需要额外存储
 *
 * 用法:
 *   - 服务端: 渲染 admin 页面时, 在 hidden input 放 csrfToken(session, secret)
 *   - 前端: 所有 POST form 加 hidden input + fetch 设 header
 *   - API endpoint: POST/PATCH/DELETE 校验 header 里的 token
 */
export function csrfToken(sessionToken, secret) {
  if (!sessionToken || !secret) return '';
  return createHmac('sha256', secret).update(sessionToken).digest('hex');
}

export function verifyCsrf(sessionToken, providedToken, secret) {
  if (!sessionToken || !providedToken || !secret) return false;
  const expected = csrfToken(sessionToken, secret);
  const a = Buffer.from(providedToken);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
