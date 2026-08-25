/**
 * Admin product update/delete (Vercel Node API endpoint).
 *   POST   /api/admin/products/[id] — PATCH one product row in Supabase.
 *   DELETE /api/admin/products/[id] — delete the row.
 *
 * Both require a valid admin_session cookie (signed token, see ../_session.js).
 * Rewritten to the Vercel default-export handler style (the previous
 * Astro-style `export const POST` returned BAD_CONTENT in production).
 */
import { verifySession, getSecret } from '../../admin/admin-session.js';

const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

function authed(req) {
  const cookie = String(req.headers.cookie || '');
  const m = cookie.match(/(?:^|;\s*)admin_session=([^;]+)/);
  return verifySession(m ? m[1] : '', getSecret());
}

function readForm(req) {
  const out = new Map();
  const ct = String(req.headers['content-type'] || '');
  if (typeof req.body === 'object' && req.body && !Buffer.isBuffer(req.body)) {
    for (const [k, v] of Object.entries(req.body)) out.set(k, v);
    return out;
  }
  if (typeof req.body === 'string' && ct.includes('application/x-www-form-urlencoded')) {
    for (const [k, v] of new URLSearchParams(req.body)) out.set(k, v);
  }
  return out;
}

const strOrNull = (v) => {
  const s = String(v ?? '').toString().trim();
  return s.length ? s : null;
};
const numOrNull = (v) => {
  const s = String(v ?? '').toString().trim();
  if (!s.length) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};

async function patchSupabaseProduct(id, update) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  const r = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: 'Bearer ' + SUPABASE_KEY,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(update),
  });
  if (!r.ok) {
    return { ok: false, status: r.status, text: await r.text() };
  }
  return { ok: true };
}

async function deleteSupabaseProduct(id) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  const r = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: 'Bearer ' + SUPABASE_KEY,
      Prefer: 'return=minimal',
    },
  });
  if (!r.ok) {
    return { ok: false, status: r.status, text: await r.text() };
  }
  return { ok: true };
}

export default async function handler(req, res) {
  if (!authed(req)) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  const id = req.query && req.query.id ? String(req.query.id) : '';
  if (!id) {
    res.status(400).json({ error: 'missing_id' });
    return;
  }

  if (req.method === 'POST') {
    const form = readForm(req);
    const update = {
      name: strOrNull(form.get('name')),
      code: strOrNull(form.get('code')),
      moq: numOrNull(form.get('moq')),
      price: strOrNull(form.get('price')),
      currency: strOrNull(form.get('currency')),
      material: strOrNull(form.get('material')),
      micron: strOrNull(form.get('micron')),
      lead: strOrNull(form.get('lead')),
      description: strOrNull(form.get('description')),
      updated_at: new Date().toISOString(),
    };
    for (const k of Object.keys(update)) {
      if (update[k] === null || update[k] === '') delete update[k];
    }

    const result = await patchSupabaseProduct(id, update);
    if (result === null) {
      return res.redirect(303, `/admin/products/${id}/edit?saved=preview&notice=no_supabase`);
    }
    if (!result.ok) {
      return res.redirect(
        303,
        `/admin/products/${id}/edit?error=${encodeURIComponent(`DB ${result.status}: ${result.text.slice(0, 200)}`)}`
      );
    }
    return res.redirect(303, `/admin/products/${id}/edit?saved=1`);
  }

  if (req.method === 'DELETE') {
    const result = await deleteSupabaseProduct(id);
    if (result === null) {
      return res.redirect(303, '/admin/products/?deleted=preview&notice=no_supabase');
    }
    if (!result.ok) {
      return res.redirect(
        303,
        `/admin/products/?error=${encodeURIComponent(`DB ${result.status}: ${result.text.slice(0, 200)}`)}`
      );
    }
    return res.redirect(303, '/admin/products/?deleted=1');
  }

  res.status(405).json({ error: 'method_not_allowed' });
}
