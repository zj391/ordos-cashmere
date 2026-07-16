/**
 * POST /api/admin/products/[id]  —  update one product row.
 *
 * Phase 2 backend: writes to Supabase when SUPABASE_URL + SUPABASE_SERVICE_KEY env vars are
 * set AND a `products` table exists with the schema documented in
 * docs/products-table.sql. Falls back to "preview only" when no DB is reachable,
 * returning a 200 with a `saved=preview` query param. This lets admins verify
 * the admin flow even before the Supabase migration is run.
 *
 * Form fields handled:
 *   name, code, moq, price, currency, material, micron, lead, description
 *
 * Image uploads are NOT handled here yet — that requires a separate multipart
 * endpoint or Supabase Storage signed URL flow. See ModulePlaceholder TODO.
 */
const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

/** Patch one row in the `products` table. Returns null if Supabase unreachable. */
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

export const POST = async ({ params, request, redirect }) => {
  const { id } = params;
  const form = await request.formData();

  // Build the update payload from the editable fields. Empty strings get normalized
  // to null where the column is optional (moq, currency), so the row stays clean.
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
  // Drop empty optional keys so we don't write empty strings into non-nullable cols
  for (const k of Object.keys(update)) {
    if (update[k] === null || update[k] === '') delete update[k];
  }

  const result = await patchSupabaseProduct(id, update);
  if (result === null) {
    // Phase 2 stub: no Supabase or table missing. Acknowledge so admins can verify
    // the form wiring without errors, and append a clear notice in the URL.
    return redirect(`/admin/products/${id}/edit?saved=preview&notice=no_supabase`);
  }
  if (!result.ok) {
    return redirect(
      `/admin/products/${id}/edit?error=${encodeURIComponent(`DB ${result.status}: ${result.text.slice(0, 200)}`)}`
    );
  }
  return redirect(`/admin/products/${id}/edit?saved=1`);
};

// Use POST so we can render a JSON 405 if a future GET is mistakenly added.
export const GET = async () =>
  new Response('Use POST to update product fields.', { status: 405 });
