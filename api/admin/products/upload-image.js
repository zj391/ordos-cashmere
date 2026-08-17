/**
 * Admin product image upload (Vercel Node API endpoint).
 *   POST /api/admin/products/upload-image
 *   body: { filename, data }  (data = base64 of the image)
 * Uploads to Supabase Storage bucket `product-images` (auto-created, public)
 * and returns the public URL. Requires admin_session cookie.
 */
import { verifySession, getSecret } from '../_session.js';

const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
const BUCKET = 'product-images';
const MAX_BYTES = 5 * 1024 * 1024;

const MIME = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
  webp: 'image/webp', gif: 'image/gif', avif: 'image/avif',
};

function authed(req) {
  const cookie = String(req.headers.cookie || '');
  const m = cookie.match(/(?:^|;\s*)admin_session=([^;]+)/);
  return verifySession(m ? m[1] : '', getSecret());
}

async function ensureBucket() {
  const check = await fetch(`${SUPABASE_URL}/storage/v1/bucket/${BUCKET}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY },
  });
  if (check.ok) return true;
  const create = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: 'Bearer ' + SUPABASE_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id: BUCKET, name: BUCKET, public: true }),
  });
  return create.ok || create.status === 409;
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
  const body = (req.body && typeof req.body === 'object') ? req.body : {};
  const filename = String(body.filename || '').trim();
  const data = String(body.data || '').trim();
  if (!filename || !data) {
    res.status(400).json({ error: 'missing_file' });
    return;
  }
  let buf;
  try {
    buf = Buffer.from(data, 'base64');
  } catch {
    res.status(400).json({ error: 'bad_base64' });
    return;
  }
  if (buf.length === 0 || buf.length > MAX_BYTES) {
    res.status(413).json({ error: 'file_too_large' });
    return;
  }
  const m = /\.([a-zA-Z0-9]+)$/.exec(filename);
  const ext = m ? m[1].toLowerCase().replace(/[^a-z0-9]/g, '') : 'jpg';
  const contentType = MIME[ext] || 'application/octet-stream';
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    res.status(500).json({ error: 'no_supabase_env' });
    return;
  }
  await ensureBucket();
  const up = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${safeName}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: 'Bearer ' + SUPABASE_KEY,
      'Content-Type': contentType,
    },
    body: buf,
  });
  if (!up.ok) {
    const t = await up.text();
    res.status(500).json({ error: `storage ${up.status}: ${t.slice(0, 200)}` });
    return;
  }
  res.json({ url: `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${safeName}` });
}