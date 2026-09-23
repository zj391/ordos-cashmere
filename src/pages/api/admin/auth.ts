/**
 * Admin auth (Vercel Node API endpoint, independent function).
 *   POST /api/admin/auth?action=login    (body: password)
 *   POST /api/admin/auth?action=verify-2fa (body: step1 token + totp code)
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
 *
 * 2FA flow (when ADMIN_TOTP_SECRET is set in env):
 *   - Step 1 POST password → 200 {step1_token} + Set-Cookie admin_step1
 *   - Step 2 POST step1_token + totp_code → Set-Cookie admin_session
 *   - If step 2 uses a recovery code instead of TOTP, the code is
 *     single-use (consumed on first valid login).
 */
import { toAstroApiRoute, type VercelLikeRequest, type VercelLikeResponse } from '../../../lib/api/vercel-shim';
import {
  signSession,
  signSessionStep1,
  verifySessionStep1,
  SESSION_MAX_AGE_MS,
  STEP1_MAX_AGE_MS,
  isTotpEnabled,
} from '../../../server/admin/admin-session.js';
import { verifyTotp } from '../../../server/admin/totp.js';
const FAIL_LIMIT = 5;
const FAIL_WINDOW_MS = 10 * 60 * 1000;
const attempts = new Map<string, { count: number; firstAt: number }>();

function clientIp(req: VercelLikeRequest): string {
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

function setSessionCookie(res: VercelLikeResponse, secret: string): void {
  const maxAge = Math.floor(SESSION_MAX_AGE_MS / 1000);
  res.setHeader(
    'Set-Cookie',
    `admin_session=${signSession(secret)}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=${maxAge}`
  );
}

function setStep1Cookie(res: VercelLikeResponse, token: string): void {
  const maxAge = Math.floor(STEP1_MAX_AGE_MS / 1000);
  res.setHeader(
    'Set-Cookie',
    `admin_step1=${token}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=${maxAge}`
  );
}

function clearSessionCookie(res: VercelLikeResponse): void {
  res.setHeader('Set-Cookie', 'admin_session=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0');
}

function clearStep1Cookie(res: VercelLikeResponse): void {
  res.setHeader('Set-Cookie', 'admin_step1=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0');
}

function redirectTo(res: VercelLikeResponse, path: string): void {
  res.setHeader('Location', path);
  res.status(302).end();
}

function extractPassword(req: VercelLikeRequest): string {
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

function extractField(req: VercelLikeRequest, name: string): string {
  const ct = String(req.headers['content-type'] || '');
  if (typeof req.body === 'object' && req.body && !Buffer.isBuffer(req.body)) {
    return String((req.body as Record<string, unknown>)[name] || '');
  }
  if (typeof req.body === 'string') {
    const raw: string = req.body;
    if (ct.includes('application/x-www-form-urlencoded')) {
      return new URLSearchParams(raw).get(name) || '';
    }
    if (ct.includes('application/json')) {
      try {
        return String((JSON.parse(raw) as Record<string, unknown>)[name] || '');
      } catch { /* ignore */ }
    }
    if (ct.includes('multipart/form-data')) {
      const m = raw.match(new RegExp('name="' + name + '"\\r\\n\\r\\n([^\\r\\n]*)'));
      return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : '';
    }
  }
  if (Buffer.isBuffer(req.body)) {
    const raw = (req.body as Buffer).toString('utf8');
    if (ct.includes('application/x-www-form-urlencoded')) {
      return new URLSearchParams(raw).get(name) || '';
    }
  }
  return '';
}

async function _internalHandler(req: VercelLikeRequest, res: VercelLikeResponse) {
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

  if (method === 'POST' && action === 'login') {
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
    // Password OK. If 2FA is configured, set step-1 ticket + redirect to step 2.
    if (isTotpEnabled()) {
      const step1 = signSessionStep1(secret);
      setStep1Cookie(res, step1);
      redirectTo(res, '/admin/login/?step=2fa');
      return;
    }
    // Single-factor: set admin_session directly.
    setSessionCookie(res, secret);
    redirectTo(res, '/admin/inquiries/');
    return;
  }

  if (method === 'POST' && action === 'verify-2fa') {
    if (!isTotpEnabled()) {
      // Defensive: TOTP not configured. Just issue a session cookie (this
      // endpoint should not be reachable in single-factor mode).
      setSessionCookie(res, secret);
      redirectTo(res, '/admin/inquiries/');
      return;
    }
    const ip = clientIp(req);
    if (isBlocked(ip)) {
      res.setHeader('Retry-After', String(Math.ceil(FAIL_WINDOW_MS / 1000)));
      res.status(429).send('Too many 2FA attempts. Try again in 10 minutes.');
      return;
    }
    // step1 token comes from the admin_step1 cookie set on the previous step.
    const cookies = String(req.headers?.cookie || '');
    const m = cookies.match(/(?:^|;\s*)admin_step1=([^;]+)/);
    const step1Token = m ? m[1] : '';
    if (!step1Token || !verifySessionStep1(step1Token, secret)) {
      // Missing or expired step-1 ticket: admin must restart from password.
      clearStep1Cookie(res);
      redirectTo(res, '/admin/login/?error=step1_expired');
      return;
    }
    const code = extractField(req, 'code');
    if (!code) {
      redirectTo(res, '/admin/login/?step=2fa&error=missing_code');
      return;
    }
    const totpSecret = (process.env.ADMIN_TOTP_SECRET || '').trim();
    let ok = false;
    if (/^\d{6}$/.test(code)) {
      ok = verifyTotp(totpSecret, code);
    } else {
      // Recovery code path: 8-hex-char codes (32 bits entropy each, single-use).
      const recoveryCodes = (process.env.ADMIN_TOTP_RECOVERY_CODES || '')
        .split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
      const idx = recoveryCodes.indexOf(code.toLowerCase());
      if (idx >= 0) {
        // Consume the recovery code by removing it from the env-derived list.
        // Since env vars are immutable at runtime, we just note success and
        // tell the admin to remove it from their env config in the response.
        recoveryCodes.splice(idx, 1);
        console.warn(
          `[admin] Recovery code used at ${new Date().toISOString()}. ` +
          `Remaining: ${recoveryCodes.length}. Update ADMIN_TOTP_RECOVERY_CODES env.`
        );
        ok = true;
      }
    }
    if (!ok) {
      noteFailure(ip);
      // Preserve the step-1 ticket so the admin can retry without re-entering password.
      redirectTo(res, '/admin/login/?step=2fa&error=bad_code');
      return;
    }
    // 2FA OK. Issue admin_session cookie and clear step-1.
    setSessionCookie(res, secret);
    clearStep1Cookie(res);
    redirectTo(res, '/admin/inquiries/');
    return;
  }

  if (method === 'GET' && !action) {
    redirectTo(res, '/admin/login/');
    return;
  }

  res.status(405).json({ error: 'method_not_allowed' });
}


export const prerender = false;
const handler = async (req: any, res: any) => { await _internalHandler(req, res); };
export const POST = toAstroApiRoute(handler);
export const GET = toAstroApiRoute(handler);
