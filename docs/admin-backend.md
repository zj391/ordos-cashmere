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

## One-time: create the products table

1. Open **Supabase → SQL Editor → New query**.
2. Paste the contents of [`products-table.sql`](./products-table.sql).
3. Click **Run** (or `Ctrl+Enter`).
4. You should see: `Success. No rows returned` — that's expected; the
   file is `CREATE TABLE IF NOT EXISTS …` so it's idempotent.

The schema covers both `/admin/products/[id]/edit` (Phase 2) and
`/admin/products/new` (Phase 3, current). It does **not** include image
upload storage — that requires a separate Supabase Storage bucket and
is tracked under `ModulePlaceholder` TODOs in the admin UI.

## Verifying the wiring

After the table is created and env vars are set:

1. Visit `/admin/products` → click **Add Product**.
2. Fill the form → click **Create product**.
3. You should be redirected to `/admin/products/{your-id}/edit?saved=1`
   with a green success banner (not the amber `preview` notice).
4. Re-visit `/admin/products` — the new row appears in the list.

## Schema mismatch recovery

If you change the table columns and the form starts returning
`DB 400: …`, the SQL in `products-table.sql` is the source of truth.
Either:

- Add the new column to the table manually (Supabase UI table editor),
  then update `docs/products-table.sql` to match, **or**
- Run the SQL again — it's idempotent, so it's safe to re-execute.