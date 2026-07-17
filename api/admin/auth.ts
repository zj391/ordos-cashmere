/**
 * Admin auth (Vercel Node API endpoint, independent function).
 *   POST /api/admin/auth?action=login     (body: password)
 *   POST /api/admin/auth?action=logout
 *   GET  /api/admin/auth?action=logout
 *   GET  /api/admin/auth                  → 302 to /admin/login/
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
      redirectTo(res, '/admin/login/');
      return;
    }
  }

  if (method === 'POST' && (action === 'login' || !action)) {
    // login
    const expected = process.env.ADMIN_PASSWORD || 'erdosdx2026';
    let password = '';
    const ct = String(req.headers['content-type'] || '');
    if (typeof req.body === 'object' && req.body && !Buffer.isBuffer(req.body)) {
      password = String((req.body as Record<string, unknown>).password || '');
    } else if (typeof req.body === 'string') {
      // form-urlencoded or raw body
      const raw: string = req.body;
      if (ct.includes('application/x-www-form-urlencoded')) {
        const params = new URLSearchParams(raw);
        password = params.get('password') || '';
      } else if (ct.includes('multipart/form-data')) {
        // crude parse: look for name="password"\r\n\r\n<value>\r\n
        const m = raw.match(/name="password"\r\n\r\n([^\r\n]*)/);
        password = m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : '';
      } else {
        // try JSON
        try { password = String((JSON.parse(raw) as Record<string, unknown>).password || ''); } catch { /* ignore */ }
      }
    } else if (Buffer.isBuffer(req.body)) {
      const raw = (req.body as Buffer).toString('utf8');
      if (ct.includes('application/x-www-form-urlencoded')) {
        password = new URLSearchParams(raw).get('password') || '';
      }
    }
    if (password !== expected) {
      redirectTo(res, '/admin/login/?error=1');
      return;
    }
    setSessionCookie(res);
    redirectTo(res, '/admin/inquiries/');
    return;
  }

  // GET no action → redirect to login
  if (method === 'GET' && !action) {
    redirectTo(res, '/admin/login/');
    return;
  }

  res.status(405).json({ error: 'method_not_allowed' });
}
