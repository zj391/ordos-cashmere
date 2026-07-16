-- DONGXIAO Cashmere — products table for Supabase admin backend.
--
-- Run this in Supabase → SQL Editor → New query.
-- After creating the table, the /admin/products edit form will start writing
-- real PATCH requests (today it returns 200 with ?saved=preview as a safe stub
-- when SUPABASE_URL / SUPABASE_SERVICE_KEY are unset or the table is missing).
--
-- This schema is the canonical one for the Phase 2 admin product edit feature.
-- Columns match the editable form fields in src/pages/admin/products/[id]/edit.astro.
-- Image uploads + multilingual names live in separate tables (see
-- product_images and product_translations) and are out of scope for the
-- current admin UI — file upload requires Supabase Storage, not the SQL schema.

create table if not exists public.products (
  id                text primary key,                              -- matches products.json `id` field, e.g. "hats-100"
  category_id       text not null references public.categories(id),  -- 'hats' | 'sweaters' | 'scarves' | 'accessories' | 'yarn' (categories table not created here; create when needed)
  code              text,                                          -- SKU / product code, e.g. "DX-HA-000"
  name              text not null,                                 -- default English name
  moq               integer,                                       -- minimum order quantity
  price             text,                                          -- free-form range, e.g. "9.2-16.5"
  currency          text default 'USD',
  material          text,                                          -- e.g. "100% Cashmere"
  micron            text,                                          -- e.g. "14–15.5µm"
  lead              text,                                          -- e.g. "30–35 days"
  description       text,
  -- read-only / managed outside the admin UI
  colors            text[]         default array[]::text[],
  images            text[]         default array[]::text[],
  tags              text[]         default array[]::text[],
  weight            text,
  sample_time       text,
  -- audit
  created_at        timestamptz    default now(),
  updated_at        timestamptz    default now()
);

create index if not exists products_category_id_idx on public.products (category_id);
create index if not exists products_updated_at_idx on public.products (updated_at desc);

-- RLS: admin-only writes, public read (the storefront queries the same table via
-- anon key when anon select is granted).
alter table public.products enable row level security;

-- Public catalog read (anon + authenticated)
create policy products_read_all on public.products for select using (true);

-- Writes require service_role; the backend uses the service_role key for PATCH,
-- so no per-user policies are needed for now. Add later when a role-based admin
-- system is introduced.
