/**
 * Stateless admin session tokens: `<timestamp>.<hex(HMAC-SHA256(secret, timestamp))>`.
 *
 * Verified by every admin API endpoint without any DB or shared cache, so it
 * survives Vercel cold starts / multiple instances. The secret is ADMIN_PASSWORD,
 * which is also what a valid login requires — forging a cookie therefore needs
 * the password itself.
 */
import { createHmac, timingSafeEqual } from 'crypto';

export const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

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

export function getSecret() {
  return process.env.ADMIN_PASSWORD || '';
}
