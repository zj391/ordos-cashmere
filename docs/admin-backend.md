# Admin backend — Supabase setup

The admin edit / new / CSV endpoints (`/api/admin/products/*`) write to
Supabase when the following environment variables are present on Vercel:

| Variable | Where to find it |
|----------|------------------|
| `SUPABASE_URL` (or `PUBLIC_SUPABASE_URL`) | Supabase project → Settings → API → Project URL |
| `SUPABASE_SERVICE_KEY` | Supabase project → Settings → API → `service_role` (secret) |

Add both in **Vercel → ordos-cashmere-v2 → Settings → Environment Variables**
(Production + Preview). After that, redeploy and the form buttons will
stop falling back to `saved=preview&notice=no_supabase`.

## One-time: create the products + categories tables

1. Open **Supabase → SQL Editor → New query**.
2. Paste the contents of [`products-table.sql`](./products-table.sql).
3. Click **Run** (or `Ctrl+Enter`).
4. You should see: `Success. No rows returned` — that's expected; the
   file uses `CREATE TABLE IF NOT EXISTS …` and `ON CONFLICT DO NOTHING`
   so it's idempotent and safe to re-run.

The schema covers both `/admin/products/[id]/edit` (Phase 2) and
`/admin/products/new` (Phase 3). It also creates `categories` and
seeds the 5 canonical rows (hats / sweaters / scarves / accessories /
yarn) so the FK on `products.category_id` resolves out of the box.

It does **not** include image upload storage — that requires a separate
Supabase Storage bucket and is tracked under `ModulePlaceholder` TODOs
in the admin UI.

## Verifying the wiring

After the table is created and env vars are set:

### 1. Schema check (in Supabase SQL Editor)
Run [`verify-products-schema.sql`](./verify-products-schema.sql). Expected:
- `categories` shows 5 rows (hats / sweaters / scarves / accessories / yarn)
- `products` table has all 16 columns listed
- RLS enabled on both tables, 2 read policies present
- 2 indexes on `products` (category_id, updated_at)

### 2. End-to-end check (in browser)
Hit `https://erdosdx.com/api/admin/_diag`. Expected JSON:

```json
{
  "config": {
    "supabase_url_set": true,
    "supabase_url_prefix": "https://xxxxxxxxxxxxx.supabase",
    "service_key_set": true
  },
  "products_table": {
    "reachable": true,
    "row_count_sample": 0,
    "sample_id": null
  },
  "error": null
}
```

If `error` is `"missing_env_vars"`: Vercel env vars aren't deployed yet
(re-trigger a redeploy after adding them).
If `error` is a SQL string starting with `PGRST…`: the table isn't
created yet, or the schema differs from `products-table.sql`.

### 3. UI round-trip
1. Visit `/admin/products/` → click **Add Product**.
2. Fill the form → click **Create product**.
3. You should be redirected to `/admin/products/{your-id}/edit/?saved=1`
   with a green success banner (not the amber `preview` notice).
4. Re-visit `/admin/products/` — the new row appears in the list.

## Schema mismatch recovery

If you change the table columns and the form starts returning
`DB 400: …`, the SQL in `products-table.sql` is the source of truth.
Either:

- Add the new column to the table manually (Supabase UI table editor),
  then update `docs/products-table.sql` to match, **or**
- Run the SQL again — it's idempotent, so it's safe to re-execute.