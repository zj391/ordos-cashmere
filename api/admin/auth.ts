/**
 * Admin auth (Vercel Node API endpoint, independent function).
 *   POST /api/admin/auth?action=login     (body: password)
 *   POST /api/admin/auth?action=logout
 *   GET  /api/admin/auth?action=logout
 *   GET  /api/admin/auth                  → 302 to /admin/login
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

function setSessionCookie(res: VercelResponse) {
  const maxAge = 60 * 60 * 24 * 7;
  res.setHeader('Set-Cookie',
    `admin_session=1; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=${maxAge}`);
}

function clearSessionCookie(res: VercelResponse) {
  res.setHeader('Set-Cookie',
    `admin_session=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0`);
}

function redirectTo(res: VercelResponse, path: string) {
  res.setHeader('Location', path);
  res.status(302).end();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const url = new URL(req.url || '/', `https://${req.headers.host || 'erdosdx.com'}`);
  const action = url.searchParams.get('action');
  const method = req.method || 'GET';

  // logout can be GET or POST
  if (action === 'logout' || (method === 'POST' && !action)) {
    // POST without action => treat as login by default; with explicit logout do logout
    if (method === 'POST' && !action) {
      // ambiguous — fall through to login
    } else {
      clearSessionCookie(res);
      redirectTo(res, '/admin/login');
      return;
    }
  }

  if (method === 'POST' && (action === 'login' || !action)) {
    // login
    const expected = process.env.ADMIN_PASSWORD || 'erdosdx2026';
    let password = '';
    if (typeof req.body === 'object' && req.body) {
      password = String((req.body as any).password || '');
    } else {
      // form data
      const ct = String(req.headers['content-type'] || '');
      if (ct.includes('application/x-www-form-urlencoded') || ct.includes('multipart/form-data')) {
        // Vercel doesn't auto-parse form; rely on body being already parsed or read raw
        // For simplicity, expect body.password from JSON or form-parsed
      }
    }
    if (password !== expected) {
      redirectTo(res, '/admin/login?error=1');
      return;
    }
    setSessionCookie(res);
    redirectTo(res, '/admin/inquiries');
    return;
  }

  // GET no action → redirect to login
  if (method === 'GET' && !action) {
    redirectTo(res, '/admin/login');
    return;
  }

  res.status(405).json({ error: 'method_not_allowed' });
}
