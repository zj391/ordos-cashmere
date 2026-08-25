/**
 * Admin auth (Vercel Node API endpoint, independent function).
 *   POST /api/admin/auth?action=login     (body: password)
 *   POST /api/admin/auth?action=logout
 *   GET  /api/admin/auth?action=logout
 *   GET  /api/admin/auth                  → 302 to /admin/login/
 *
 * Security (Phase 0 hardening):
 *   - ADMIN_PASSWORD must be set on Vercel; login fails closed otherwise
 *     (no hardcoded fallback password).
 *   - Login attempts are rate-limited per IP (5 failures / 10 min).
 *   - The session cookie carries a stateless signed token (timestamp + HMAC),
 *     verified by src/server/admin/admin-session.js in every admin API endpoint.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { signSession, SESSION_MAX_AGE_MS } from '../../src/server/admin/admin-session.js';

const FAIL_LIMIT = 5;
const FAIL_WINDOW_MS = 10 * 60 * 1000;
const attempts = new Map<string, { count: number; firstAt: number }>();

function clientIp(req: VercelRequest): string {
  const fwd = req.headers['x-forwarded-for'];
  const ip = Array.isArray(fwd) ? fwd[0] : String(fwd || req.socket?.remoteAddress || 'unknown');
  return ip;
}

function isBlocked(ip: string): boolean {
  const now = Date.now();
  const rec = attempts.get(ip);
  if (!rec) return false;
  if (now - rec.firstAt > FAIL_WINDOW_MS) {
    attempts.delete(ip);
    return false;
  }
  return rec.count >= FAIL_LIMIT;
}

function noteFailure(ip: string): void {
  const now = Date.now();
  const rec = attempts.get(ip);
  if (!rec || now - rec.firstAt > FAIL_WINDOW_MS) {
    attempts.set(ip, { count: 1, firstAt: now });
  } else {
    rec.count += 1;
  }
}

function setSessionCookie(res: VercelResponse, secret: string): void {
  const maxAge = Math.floor(SESSION_MAX_AGE_MS / 1000);
  res.setHeader(
    'Set-Cookie',
    `admin_session=${signSession(secret)}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=${maxAge}`
  );
}

function clearSessionCookie(res: VercelResponse): void {
  res.setHeader('Set-Cookie', 'admin_session=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0');
}

function redirectTo(res: VercelResponse, path: string): void {
  res.setHeader('Location', path);
  res.status(302).end();
}

function extractPassword(req: VercelRequest): string {
  const ct = String(req.headers['content-type'] || '');
  if (typeof req.body === 'object' && req.body && !Buffer.isBuffer(req.body)) {
    return String((req.body as Record<string, unknown>).password || '');
  }
  if (typeof req.body === 'string') {
    const raw: string = req.body;
    if (ct.includes('application/x-www-form-urlencoded')) {
      return new URLSearchParams(raw).get('password') || '';
    }
    if (ct.includes('multipart/form-data')) {
      const m = raw.match(/name="password"\r\n\r\n([^\r\n]*)/);
      return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : '';
    }
    try {
      return String((JSON.parse(raw) as Record<string, unknown>).password || '');
    } catch { /* ignore */ }
  }
  if (Buffer.isBuffer(req.body)) {
    const raw = (req.body as Buffer).toString('utf8');
    if (ct.includes('application/x-www-form-urlencoded')) {
      return new URLSearchParams(raw).get('password') || '';
    }
  }
  return '';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const url = new URL(req.url || '/', `https://${req.headers.host || 'erdosdx.com'}`);
  const action = url.searchParams.get('action');
  const method = req.method || 'GET';

  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) {
    // Fail closed: never fall back to a hardcoded password.
    res.status(503).send('Admin auth is not configured (ADMIN_PASSWORD missing).');
    return;
  }

  // Logout can be GET or POST with action=logout.
  if (action === 'logout') {
    clearSessionCookie(res);
    redirectTo(res, '/admin/login/');
    return;
  }

  if (method === 'POST' && (action === 'login' || !action)) {
    const ip = clientIp(req);
    if (isBlocked(ip)) {
      res.setHeader('Retry-After', String(Math.ceil(FAIL_WINDOW_MS / 1000)));
      res.status(429).send('Too many login attempts. Try again in 10 minutes.');
      return;
    }
    const provided = extractPassword(req);
    if (provided !== secret) {
      noteFailure(ip);
      redirectTo(res, '/admin/login/?error=1');
      return;
    }
    setSessionCookie(res, secret);
    redirectTo(res, '/admin/inquiries/');
    return;
  }

  if (method === 'GET' && !action) {
    redirectTo(res, '/admin/login/');
    return;
  }

  res.status(405).json({ error: 'method_not_allowed' });
}
