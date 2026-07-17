/**
 * POST /api/admin/products/new  —  create one new product row.
 *
 * Phase 3 backend: INSERT into Supabase when SUPABASE_URL + SUPABASE_KEY env vars are
 * set AND a `products` table exists with the schema documented in
 * docs/products-table.sql. Falls back to "preview only" when no DB is reachable,
 * returning 303 to /admin/products/new?saved=preview&notice=no_supabase so admins can verify
 * the form wiring without 500ing.
 *
 * Form fields handled:
 *   id (required, unique, lowercase+digit+hyphen), category_id, name,
 *   code, moq, price, currency, material, micron, lead, description
 *
 * Image uploads are NOT handled here — Supabase Storage integration is a
 * separate module. The new row starts with empty colors[]/images[]/tags[]
 * arrays and is meant to be edited afterward to attach imagery.
 *
 * Errors:
 *   - Missing id/category_id/name → 400 with reason in redirect
 *   - Duplicate id (Postgres 23505) → redirect with error_code=duplicate_id
 *   - Other DB error → redirect with truncated Supabase error in /edit?error=
 */
const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
// Use the service-role key when available — this is an admin write path and
// the service role bypasses RLS. Fall back to the public/anon key only for
// legacy deployments that haven't provisioned a service role yet.
const KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY || '';

/** Insert one row into the `products` table. Returns null if Supabase unreachable. */
async function insertSupabaseProduct(row) {
  if (!SUPABASE_URL || !KEY) return null;
  const r = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
    method: 'POST',
    headers: {
      apikey: KEY,
      Authorization: 'Bearer ' + KEY,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(row),
  });
  if (!r.ok) {
    const text = await r.text();
    // Postgres unique-violation surfaces as 409 from PostgREST
    const isDuplicate = r.status === 409 || text.includes('23505') || text.toLowerCase().includes('duplicate key');
    return { ok: false, status: r.status, text, duplicate: isDuplicate };
  }
  return { ok: true };
}

export const POST = async ({ request, redirect }) => {
  const form = await request.formData();

  // Reuse the same normalizers as the edit endpoint so empty optionals
  // stay out of the row and don't collide with non-nullable defaults.
  const strOrNull = (v) => {
    const s = (v ?? '').toString().trim();
    return s.length ? s : null;
  };
  const numOrNull = (v) => {
    const s = (v ?? '').toString().trim();
    if (!s.length) return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  };

  const id = strOrNull(form.get('id'));
  const categoryId = strOrNull(form.get('category_id'));
  const name = strOrNull(form.get('name'));

  // Validate required fields up front so we can give a specific reason rather
  // than letting Supabase reject the row with a less helpful error.
  if (!id) return redirect('/admin/products/new?error=' + encodeURIComponent('Missing id'));
  if (!categoryId) return redirect('/admin/products/new?error=' + encodeURIComponent('Missing category'));
  if (!name) return redirect('/admin/products/new?error=' + encodeURIComponent('Missing name'));

  // Match the schema's id constraint visually (Postgres will enforce it strictly
  // via the primary key + collation). Cheap client-side guard prevents the obvious
  // mistakes (uppercase, spaces, punctuation) before we hit the DB.
  if (!/^[a-z0-9][a-z0-9\-]*$/.test(id)) {
    return redirect(
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

  // Strip null optionals so they fall back to the column DEFAULTs defined in
  // docs/products-table.sql. (e.g. currency defaults to 'USD' if omitted.)
  for (const k of Object.keys(row)) {
    if (row[k] === null || row[k] === '') delete row[k];
  }

  const result = await insertSupabaseProduct(row);
  if (result === null) {
    // Phase 3 stub: no Supabase or table missing. Acknowledge so admins can verify
    // the form wiring without errors, and append a clear notice in the URL.
    return redirect('/admin/products/new?saved=preview&notice=no_supabase');
  }
  if (!result.ok) {
    if (result.duplicate) {
      return redirect('/admin/products/new?error_code=duplicate_id&error=' + encodeURIComponent(`ID "${id}" already exists`));
    }
    return redirect(
      '/admin/products/new?error=' + encodeURIComponent(`DB ${result.status}: ${result.text.slice(0, 200)}`)
    );
  }
  // Success — bounce to the edit page for the new id so admins can add imagery /
  // fine-tune details. The "saved=1" flash is identical to the edit page's flow.
  return redirect(`/admin/products/${id}/edit?saved=1`);
};

// Use POST so we can render a JSON 405 if a future GET is mistakenly added.
export const GET = async () =>
  new Response(JSON.stringify({
    note: 'Use POST to create a product. This endpoint also serves as a Supabase self-check.',
    diag: await diagSupabase(),
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

/** Self-check: are SUPABASE_URL + a Supabase key set, and can we read products? */
async function diagSupabase() {
  const serviceKey = process.env.SUPABASE_SERVICE_KEY || '';
  const keyAlias = process.env.SUPABASE_KEY || '';
  const resolved = serviceKey || keyAlias;
  const out = {
    supabase_url_set: Boolean(SUPABASE_URL),
    supabase_url_prefix: SUPABASE_URL ? SUPABASE_URL.slice(0, 30) : null,
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
      headers: {
        apikey: KEY,
        Authorization: 'Bearer ' + KEY,
      },
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
