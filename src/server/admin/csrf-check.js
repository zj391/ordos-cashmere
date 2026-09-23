/**
 * Admin CSRF verification helper (plain JS — Vercel Node API routes load raw JS).
 *
 * Returns null when CSRF check passes; otherwise a Vercel-like Response
 * indicating why the request was rejected. Callers should `return res` it.
 *
 * Usage:
 *   import { verifyCsrfOrReject } from '../../../server/admin/csrf-check.js';
 *   if (req.method === 'POST') {
 *     const denied = verifyCsrfOrReject(req, res);
 *     if (denied) return denied;
 *     // ...rest of POST handler
 *   }
 *
 * Token comes from either:
 *  - HTTP header `x-csrf-token` (preferred; used by fetch wrappers)
 *  - Form field `__csrf` (fallback for legacy <form method="POST">)
 *
 * The expected token is HMAC-SHA256(secret, sessionToken) where sessionToken
 * is the verified `admin_session` cookie. This means an attacker can't
 * forge a token without also knowing ADMIN_PASSWORD (the cookie's HMAC
 * secret), even if they trick the admin's browser into a cross-site POST.
 *
 * NOTE: admin endpoints are additionally protected by the middleware
 * checking the admin_session cookie, and the cookie is HttpOnly +
 * SameSite=Lax so cross-site fetch/forms don't include it. CSRF is the
 * belt-and-suspenders layer that catches misconfigured cookies, future
 * CORS relaxations, or same-site sub-domain attacks.
 */
import { verifySession, verifyCsrf, getSecret } from './admin-session.js';

function readCookie(req, name) {
  const cookieHeader = req.headers?.cookie || '';
  const m = String(cookieHeader).match(
    new RegExp('(?:^|;\\s*)' + name + '=([^;]+)')
  );
  return m ? decodeURIComponent(m[1]) : '';
}

function readFormField(req, name) {
  // Only invoked for application/x-www-form-urlencoded bodies. The
  // caller passes req.body which has already been parsed by the
  // endpoint's own parser — we only need the field, so we accept
  // either an object body or a string body.
  const body = req.body;
  if (body && typeof body === 'object' && !Buffer.isBuffer(body)) {
    return String((body)[name] || '');
  }
  if (typeof body === 'string') {
    try {
      const params = new URLSearchParams(body);
      return params.get(name) || '';
    } catch { /* ignore */ }
  }
  if (Buffer.isBuffer(body)) {
    try {
      const params = new URLSearchParams(body.toString('utf8'));
      return params.get(name) || '';
    } catch { /* ignore */ }
  }
  return '';
}

/**
 * Verify CSRF token on a mutating request. Returns null if OK, or a
 * Vercel-like Response to short-circuit the handler.
 *
 * @param {any} req  VercelLikeRequest (or anything with .headers + .body)
 * @param {any} res  VercelLikeResponse
 */
export function verifyCsrfOrReject(req, res) {
  const secret = getSecret();
  if (!secret) {
    res.status(503).send('Admin not configured (ADMIN_PASSWORD missing).');
    return res;
  }
  const sessionToken = readCookie(req, 'admin_session');
  if (!verifySession(sessionToken, secret)) {
    // No valid session — middleware should have already blocked, but
    // be defensive (e.g. if middleware is bypassed in dev).
    res.status(401).json({ error: 'unauthorized' });
    return res;
  }
  // Prefer header (used by fetch wrappers). Fall back to form field
  // for legacy <form method="POST"> submissions.
  const headerToken = String(req.headers?.['x-csrf-token'] || '');
  const fieldToken = headerToken ? '' : readFormField(req, '__csrf');
  const provided = headerToken || fieldToken;
  if (!verifyCsrf(sessionToken, provided, secret)) {
    res.status(403).json({
      error: 'csrf_failed',
      hint: 'Token missing or invalid. Refresh the page to get a fresh token, then retry.',
    });
    return res;
  }
  return null;
}