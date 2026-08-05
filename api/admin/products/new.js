/**
 * Admin product create (Vercel Node API endpoint).
 *   POST /api/admin/products/new — INSERT one product row into Supabase.
 *   GET  /api/admin/products/new — diag self-check (JSON).
 *
 * Both require a valid admin_session cookie (signed token, see ../_session.js).
 * Rewritten to the Vercel default-export handler style (the previous
 * Astro-style `export const POST/GET` returned BAD_CONTENT in production).
 *
 * Fields: id (required, lowercase+digit+hyphen), category_id, name, code,
 * moq, price, currency, material, micron, lead, description.
 * Image uploads live in a separate module (Supabase Storage) — new rows start
 * with empty colors[]/images[]/tags[] and are meant to be edited afterward.
 */
import { verifySession, getSecret } from '../_session.js';

const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY || '';

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

async function insertSupabaseProduct(row) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  const r = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: 'Bearer ' + SUPABASE_KEY,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(row),
  });
  if (!r.ok) {
    const text = await r.text();
    const isDuplicate = r.status === 409 || text.includes('23505') || text.toLowerCase().includes('duplicate key');
    return { ok: false, status: r.status, text, duplicate: isDuplicate };
  }
  return { ok: true };
}

async function diagSupabase() {
  const serviceKey = process.env.SUPABASE_SERVICE_KEY || '';
  const keyAlias = process.env.SUPABASE_KEY || '';
  const resolved = serviceKey || keyAlias;
  const out = {
    supabase_url_set: Boolean(SUPABASE_URL),
    service_key_set: Boolean(serviceKey),
    supabase_key_alias_set: Boolean(keyAlias),
    key_resolved: Boolean(resolved),
    products_table: null,
    error: null,
  };
  if (!SUPABASE_URL || !resolved) {
    out.error = 'missing_env_vars';
    return out;
  }
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/products?select=id&limit=1`, {
      headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY },
    });
    if (!r.ok) {
      const text = await r.text();
      out.products_table = { reachable: false, status: r.status };
      out.error = text.length < 500 ? text : text.slice(0, 500);
      return out;
    }
    const rows = await r.json();
    out.products_table = {
      reachable: true,
      row_count_sample: Array.isArray(rows) ? rows.length : 0,
      sample_id: rows?.[0]?.id ?? null,
    };
    return out;
  } catch (e) {
    out.error = e && e.message ? e.message : String(e);
    return out;
  }
}

export default async function handler(req, res) {
  if (!authed(req)) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  if (req.method === 'GET') {
    res.status(200).json(await diagSupabase());
    return;
  }

  if (req.method === 'POST') {
    const form = readForm(req);
    const id = strOrNull(form.get('id'));
    const categoryId = strOrNull(form.get('category_id'));
    const name = strOrNull(form.get('name'));

    if (!id) return res.redirect(303, '/admin/products/new?error=' + encodeURIComponent('Missing id'));
    if (!categoryId) return res.redirect(303, '/admin/products/new?error=' + encodeURIComponent('Missing category'));
    if (!name) return res.redirect(303, '/admin/products/new?error=' + encodeURIComponent('Missing name'));
    if (!/^[a-z0-9][a-z0-9\-]*$/.test(id)) {
      return res.redirect(
        303,
        '/admin/products/new?error=' +
          encodeURIComponent('id must be lowercase letters / digits / hyphens, starting with a letter or digit')
      );
    }

    const row = {
      id,
      category_id: categoryId,
      name,
      code: strOrNull(form.get('code')),
      moq: numOrNull(form.get('moq')),
      price: strOrNull(form.get('price')),
      currency: strOrNull(form.get('currency')) ?? 'USD',
      material: strOrNull(form.get('material')),
      micron: strOrNull(form.get('micron')),
      lead: strOrNull(form.get('lead')),
      description: strOrNull(form.get('description')),
      colors: [],
      images: [],
      tags: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    for (const k of Object.keys(row)) {
      if (row[k] === null || row[k] === '') delete row[k];
    }

    const result = await insertSupabaseProduct(row);
    if (result === null) {
      return res.redirect(303, '/admin/products/new?saved=preview&notice=no_supabase');
    }
    if (!result.ok) {
      if (result.duplicate) {
        return res.redirect(
          303,
          '/admin/products/new?error_code=duplicate_id&error=' + encodeURIComponent(`ID "${id}" already exists`)
        );
      }
      return res.redirect(
        303,
        '/admin/products/new?error=' + encodeURIComponent(`DB ${result.status}: ${result.text.slice(0, 200)}`)
      );
    }
    return res.redirect(303, `/admin/products/${id}/edit?saved=1`);
  }

  res.status(405).json({ error: 'method_not_allowed' });
}
