import type { APIRoute } from 'astro';
import { verifySession, getSecret } from '../../../../api/admin/_session.js';

export const prerender = false;

const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
const BUCKET = 'product-images';
const MAX_BYTES = 5 * 1024 * 1024;

const MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  avif: 'image/avif',
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function ensureBucket(): Promise<boolean> {
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

export const POST: APIRoute = async ({ request }) => {
  // Admin session gate (middleware already requires the cookie; verify signature here)
  const cookie = request.headers.get('cookie') || '';
  const m = cookie.match(/(?:^|;\s*)admin_session=([^;]+)/);
  if (!verifySession(m ? m[1] : '', getSecret())) {
    return json({ error: 'unauthorized' }, 401);
  }
  if (request.method !== 'POST') {
    return json({ error: 'method_not_allowed' }, 405);
  }
  let body: { filename?: string; data?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'bad_json' }, 400);
  }
  const filename = String(body.filename || '').trim();
  const data = String(body.data || '').trim();
  if (!filename || !data) {
    return json({ error: 'missing_file' }, 400);
  }
  let buf: Buffer;
  try {
    buf = Buffer.from(data, 'base64');
  } catch {
    return json({ error: 'bad_base64' }, 400);
  }
  if (buf.length === 0 || buf.length > MAX_BYTES) {
    return json({ error: 'file_too_large' }, 413);
  }
  const extMatch = /\.([a-zA-Z0-9]+)$/.exec(filename);
  const ext = extMatch ? extMatch[1].toLowerCase().replace(/[^a-z0-9]/g, '') : 'jpg';
  const contentType = MIME[ext] || 'application/octet-stream';
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return json({ error: 'no_supabase_env' }, 500);
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
    return json({ error: `storage ${up.status}: ${t.slice(0, 200)}` }, 500);
  }
  return json({ url: `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${safeName}` });
};
