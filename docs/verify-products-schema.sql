-- DONGXIAO Cashmere — verify products schema after running products-table.sql.
--
-- Run this in Supabase → SQL Editor after products-table.sql succeeds.
-- Expected output (in "Results" tab):
--   1 row  | hats
--   1 row  | sweaters
--   1 row  | scarves
--   1 row  | accessories
--   1 row  | yarn
--
-- All columns must be present and named as listed below.

-- 1. categories seeded correctly
select id, name from public.categories order by id;

-- 2. products schema columns
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public' and table_name = 'products'
order by ordinal_position;

-- 3. RLS enabled + policy exists
select tablename, rowsecurity
from pg_tables
where schemaname = 'public' and tablename in ('products', 'categories');

select tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

-- 4. Indexes created
select indexname, indexdef
from pg_indexes
where schemaname = 'public' and tablename = 'products';