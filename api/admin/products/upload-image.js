/**
 * Admin product image upload (Vercel Node API endpoint).
 * Minimal stub for bisect: full implementation restored after build is green.
 */
import { verifySession, getSecret } from '../_session.js';

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
