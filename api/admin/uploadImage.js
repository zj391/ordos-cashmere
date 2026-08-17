/**
 * Admin product image upload (Vercel Node API endpoint).
 * Stub for bisect - moved to api/admin/ to test directory-level limit.
 */
import { verifySession, getSecret } from './_session.js';

function authed(req) {
  const cookie = String(req.headers.cookie || '');
  const m = cookie.match(/(?:^|;\s*)admin_session=([^;]+)/);
  return verifySession(m ? m[1] : '', getSecret());
}

export default async function handler(req, res) {
  if (!authed(req)) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }
  res.json({ ok: true });
}
