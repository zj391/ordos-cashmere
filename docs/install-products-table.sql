-- DONGXIAO Cashmere — full products + categories schema (idempotent).
--
-- 在 Supabase SQL Editor 一键跑。包含:
--   1. categories 表 + 5 行种子数据
--   2. products 表 + 索引
--   3. RLS + policies (公开读, service role 写)
--   4. 自动 updated_at 触发器
--
-- 如果表已存在,所有 create / alter 都用 if not exists / 兼容语法,不会报错。
-- 多次跑也安全。

-- ============================================================
-- 1. categories
-- ============================================================
create table if not exists public.categories (
  id    text primary key,
  name  text not null,
  created_at timestamptz default now()
);

insert into public.categories (id, name) values
  ('hats',        'Cashmere Hats & Beanies'),
  ('sweaters',    'Cashmere Sweaters'),
  ('scarves',     'Cashmere Scarves & Shawls'),
  ('accessories', 'Cashmere Accessories'),
  ('yarn',        'Cashmere Yarn')
on conflict (id) do nothing;

-- ============================================================
-- 2. products
-- ============================================================
create table if not exists public.products (
  id                text primary key,
  category_id       text not null references public.categories(id),
  code              text,
  name              text not null,
  moq               integer,
  price             text,
  currency          text default 'USD',
  material          text,
  micron            text,
  lead              text,
  description       text,
  colors            text[]         default array[]::text[],
  images            text[]         default array[]::text[],
  tags              text[]         default array[]::text[],
  weight            text,
  sample_time       text,
  created_at        timestamptz    default now(),
  updated_at        timestamptz    default now()
);

create index if not exists products_category_id_idx on public.products (category_id);
create index if not exists products_updated_at_idx on public.products (updated_at desc);

-- updated_at trigger: 任何 UPDATE 自动写 updated_at = now()
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ============================================================
-- 3. RLS + policies
-- ============================================================
alter table public.products    enable row level security;
alter table public.categories enable row level security;

-- 公开读 (anon + authenticated)
drop policy if exists products_read_all    on public.products;
drop policy if exists categories_read_all on public.categories;
create policy products_read_all    on public.products    for select using (true);
create policy categories_read_all on public.categories for select using (true);

-- 写操作 (insert/update/delete) 通过 service_role key 走, 跳过 RLS, 无需
-- per-user policies。如果以后要做 admin role 区分, 再加 policy。

-- ============================================================
-- 4. 完成 — 自检 (在 SQL Editor 的 Results tab 看输出)
-- ============================================================
select 'categories:' as section, count(*)::text || ' rows' as info from public.categories
union all
select 'products:', case when exists (select 1 from information_schema.tables where table_schema='public' and table_name='products') then 'table exists' else 'MISSING' end;

-- 期望看到:
--   categories: | 5 rows
--   products:   | table exists