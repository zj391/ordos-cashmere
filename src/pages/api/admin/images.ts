/**
 * Admin image library: list + delete.
 *
 * GET   /api/admin/images  — list files in product-images bucket (JSON)
 * POST  /api/admin/images  — same, returns view-model for /admin/images page
 * DELETE /api/admin/images?name=<file>  — delete one file from the bucket
 *
 * Requires admin session cookie. Files are in the public bucket
 * `product-images` so deletion is irreversible and visible to anyone who
 * had the URL cached. Front-end should warn the admin before deletion.
 */
import { verifySession, getSecret } from '../../../server/admin/admin-session.js';
import { verifyCsrfOrReject } from '../../../server/admin/csrf-check.js';
import { toAstroApiRoute, type VercelLikeRequest, type VercelLikeResponse } from '../../../lib/api/vercel-shim';

const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY || '';
const BUCKET = 'product-images';

function authed(req: any): boolean {
  const cookie = String(req.headers?.cookie || '');
  const m = cookie.match(/(?:^|;\s*)admin_session=([^;]+)/);
  return verifySession(m ? m[1] : '', getSecret());
}

async function listImages(): Promise<Array<{ name: string; size?: number; mimetype?: string; updated_at?: string }>> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return [];
  const r = await fetch(`${SUPABASE_URL}/storage/v1/object/list/${BUCKET}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: 'Bearer ' + SUPABASE_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prefix: '', limit: 500, offset: 0, sortBy: { column: 'updated_at', order: 'desc' } }),
  });
  if (!r.ok) return [];
  const rows = (await r.json()) as Array<{ name: string; metadata?: { size?: number; mimetype?: string } }>;
  return rows.map((row) => ({
    name: row.name,
    size: row.metadata?.size,
    mimetype: row.metadata?.mimetype,
    updated_at: undefined,
  }));
}

async function deleteImage(name: string): Promise<{ ok: boolean; status?: number; text?: string }> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return { ok: false, status: 500, text: 'no_supabase_env' };
  if (!name || /[\/\\]/.test(name) || name.includes('..')) {
    return { ok: false, status: 400, text: 'invalid_name' };
  }
  const r = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${encodeURIComponent(name)}`, {
    method: 'DELETE',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: 'Bearer ' + SUPABASE_KEY,
    },
  });
  if (!r.ok) {
    return { ok: false, status: r.status, text: (await r.text()).slice(0, 200) };
  }
  return { ok: true };
}

async function _internalHandler(req: VercelLikeRequest, res: VercelLikeResponse) {
  if (!authed(req)) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  // 2026-09-23 — CSRF check on every mutating method. POST and DELETE
  // both modify storage; GET stays CSRF-free.
  if (req.method === 'POST' || req.method === 'DELETE') {
    const denied = verifyCsrfOrReject(req, res);
    if (denied) return denied;
  }

  if (req.method === 'GET' || req.method === 'POST') {
    const images = await listImages();
    res.status(200).json({ images });
    return;
  }

  if (req.method === 'DELETE') {
    const url = new URL(req.url || '', 'http://localhost');
    const name = url.searchParams.get('name') || '';
    const result = await deleteImage(name);
    if (!result.ok) {
      res.status(result.status || 500).json({ error: 'delete_failed', ...result });
      return;
    }
    res.status(200).json({ ok: true, deleted: name });
    return;
  }

  res.status(405).json({ error: 'method_not_allowed' });
}

export const prerender = false;
const handler = async (req: any, res: any) => { await _internalHandler(req, res); };
export const GET = toAstroApiRoute(handler);
export const POST = toAstroApiRoute(handler);
export const DELETE = toAstroApiRoute(handler);
