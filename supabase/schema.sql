-- ordos-cashmere-site Supabase schema
-- 在 Supabase SQL Editor 一次性跑完

-- ========== 表 1：inquiries（所有询盘） ==========
create table if not exists public.inquiries (
  id bigserial primary key,
  created_at timestamp with time zone default now(),

  -- 询盘内容
  inquiry_type text not null,           -- raw_material / yarn_fabric / garment_oem
  locale text not null default 'en',     -- en/cn/de/fr/ja/kr
  product_interest text,
  quantity_kg numeric,                   -- 原料用
  quantity_m numeric,                    -- 面料用
  quantity_pcs numeric,                  -- 成衣用
  message text,

  -- 联系信息
  contact_name text not null,
  company_name text not null,
  country text not null,
  email text not null,
  phone text,

  -- 来源追踪
  utm_source text,
  utm_medium text,
  utm_campaign text,
  referrer text,
  ga_client_id text,
  ip_address text,
  user_agent text,

  -- 客户分级
  lead_grade text,                       -- A/B/C/null
  status text default 'new',             -- new/contacted/qualified/won/lost
  inquiry_id bigint                      -- 暂时不用，留位
);

create index if not exists idx_inquiries_email on public.inquiries(email);
create index if not exists idx_inquiries_company on public.inquiries(company_name);
create index if not exists idx_inquiries_created on public.inquiries(created_at desc);
create index if not exists idx_inquiries_lead_grade on public.inquiries(lead_grade);

-- ========== 表 2：known_customers（已知老客户，AI 客服识别用） ==========
create table if not exists public.known_customers (
  id bigserial primary key,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),

  -- 客户唯一标识（用于识别）
  contact_email text not null unique,
  company_name text,
  contact_name text,
  phone text,
  country text,

  -- 客户画像
  grade text default 'C',                -- A/B/C
  total_inquiries int default 0,
  total_orders int default 0,
  lifetime_value_usd numeric default 0,
  first_inquiry_at timestamp with time zone,
  last_inquiry_at timestamp with time zone,
  last_order_at timestamp with time zone,

  -- 偏好 / 备注（AI 客服参考）
  preferred_products text[],             -- ['raw_material', 'garment_oem']
  preferred_locale text default 'en',
  notes text,

  -- 标签
  tags text[]                            -- ['vip', 'cashmere_brand', 'distributor']
);

create index if not exists idx_known_customers_email on public.known_customers(contact_email);
create index if not exists idx_known_customers_company on public.known_customers(company_name);
create index if not exists idx_known_customers_grade on public.known_customers(grade);

-- ========== 表 3：chat_sessions（AI 聊天会话，反向留痕） ==========
create table if not exists public.chat_sessions (
  id bigserial primary key,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),

  session_id text not null unique,       -- UUID，前端生成
  contact_email text,                    -- 用户填了邮箱后写入
  company_name text,
  locale text default 'en',
  visitor_ip text,
  visitor_country text,

  messages jsonb default '[]'::jsonb,    -- [{role, content, ts}]
  is_known_customer boolean default false,
  customer_grade text,

  resolved boolean default false,
  converted_to_inquiry boolean default false,
  inquiry_id bigint
);

create index if not exists idx_chat_sessions_email on public.chat_sessions(contact_email);
create index if not exists idx_chat_sessions_session_id on public.chat_sessions(session_id);
create index if not exists idx_chat_sessions_created on public.chat_sessions(created_at desc);

-- ========== RLS（行级安全）：anon key 可读 known_customers 必要字段 + 写 inquiries + chat_sessions ==========
-- 启用 RLS
alter table public.inquiries enable row level security;
alter table public.known_customers enable row level security;
alter table public.chat_sessions enable row level security;

-- anon 角色：可插入 inquiries
drop policy if exists "anon insert inquiries" on public.inquiries;
create policy "anon insert inquiries" on public.inquiries
  for insert to anon with check (true);

-- anon 角色：可插入 + 更新 chat_sessions
drop policy if exists "anon insert chat_sessions" on public.chat_sessions;
create policy "anon insert chat_sessions" on public.chat_sessions
  for insert to anon with check (true);

drop policy if exists "anon update chat_sessions" on public.chat_sessions;
create policy "anon update chat_sessions" on public.chat_sessions
  for update to anon using (true) with check (true);

-- anon 角色：可读 known_customers 的非敏感字段（用于老客户识别）
drop policy if exists "anon read known_customers basic" on public.known_customers;
create policy "anon read known_customers basic" on public.known_customers
  for select to anon using (true);

-- service_role：完全访问（写入 known_customers、读所有）
-- service_role 自动 bypass RLS，不用额外 policy

-- ========== 种子数据：示例已知客户（你可以手动改） ==========
insert into public.known_customers (contact_email, company_name, contact_name, country, grade, total_inquiries, total_orders, lifetime_value_usd, preferred_products, notes, tags)
values
  ('john@brandxyz.com', 'Brand XYZ Inc', 'John Smith', 'USA', 'A', 5, 3, 85000, ARRAY['garment_oem'], 'VIP - 偏好 100% cashmere 大衣，每年返单', ARRAY['vip', 'us_brand']),
  ('chen@dongfang.cn', '东方贸易', '陈先生', 'CN', 'B', 3, 1, 22000, ARRAY['yarn_fabric'], '需要 OEKO-TEX 认证', ARRAY['china_distributor']),
  ('sophia@italianstyle.it', 'Italian Style SRL', 'Sophia Rossi', 'IT', 'A', 8, 6, 240000, ARRAY['garment_oem', 'yarn_fabric'], '米兰高端品牌供应链，OEM 代工', ARRAY['vip', 'eu_luxury'])
on conflict (contact_email) do nothing;