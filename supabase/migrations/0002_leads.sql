-- ordos-cashmere-site migration 0002: leads + lead_activities
-- 阶段 1.1 主动获客基础设施
-- 在 Supabase SQL Editor 跑这个文件

-- ========== 表 1：leads（潜在客户，主动外发 + 评分） ==========
create table if not exists public.leads (
  id bigserial primary key,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),

  -- 基础信息
  contact_name text,
  company_name text,
  country text,                          -- 国家代码 US/IT/DE/JP/KR/CN 或国家名
  email text,
  phone text,
  linkedin_url text,

  -- 来源
  source text not null default 'manual', -- manual/linkedin/rss/sales_nav/inbound_inquiry/import
  source_detail text,                    -- 比如 RSS 链接 / Sales Nav 列表名

  -- 客户画像
  industry text,                         -- luxury_brand/distributor/manufacturer/retailer
  company_size text,                     -- solo / small (1-50) / mid (51-500) / large (500+)
  job_title text,                        -- CEO/Buyer/Sourcing Manager/Design Director

  -- 评分与状态
  lead_grade text,                       -- A (高意向) / B (潜力) / C (培育) / D (放弃)
  lead_score int default 0,              -- 0-100 数值化评分
  status text default 'new',             -- new / queued / contacting / replied / qualified / won / lost / unsubscribed

  -- 外发进度（邮件 8 轮时序）
  email_sequence_step int default 0,     -- 0=未发 / 1-8=第 N 轮 / 9=完成
  email_last_sent_at timestamp with time zone,
  email_next_due_at timestamp with time zone,  -- 下次应该发的时间
  email_replied_at timestamp with time zone,    -- 用户已回复

  -- 渠道状态
  wa_opted_in boolean default false,     -- 是否 WhatsApp 同意接收（GDPR）
  wa_last_sent_at timestamp with time zone,
  li_connection_sent_at timestamp with time zone,  -- LinkedIn connection request 已发
  li_connected_at timestamp with time zone,           -- LinkedIn 已连接
  li_last_message_at timestamp with time zone,

  -- 转化为询盘/客户
  converted_to_inquiry bigint,            -- 指向 inquiries.id
  converted_to_customer boolean default false,

  -- 黑名单
  is_blacklisted boolean default false,
  blacklist_reason text,

  -- 备注
  notes text,
  tags text[]                             -- ['seasonal_q4', 'luxury_brand', 'eu_buyer']
);

create index if not exists idx_leads_email on public.leads(lower(email));
create index if not exists idx_leads_company on public.leads(lower(company_name));
create index if not exists idx_leads_country on public.leads(country);
create index if not exists idx_leads_grade on public.leads(lead_grade);
create index if not exists idx_leads_status on public.leads(status);
create index if not exists idx_leads_score on public.leads(lead_score desc);
create index if not exists idx_leads_email_due on public.leads(email_next_due_at) where status in ('queued', 'contacting');
create index if not exists idx_leads_source on public.leads(source);

-- ========== 表 2：lead_activities（互动日志：邮件/WhatsApp/LinkedIn/手动） ==========
create table if not exists public.lead_activities (
  id bigserial primary key,
  created_at timestamp with time zone default now(),

  lead_id bigint not null references public.leads(id) on delete cascade,

  -- 互动类型
  channel text not null,                 -- email / whatsapp / linkedin / manual_note / system
  direction text not null,               -- out (我们发) / in (客户回)

  -- 内容
  subject text,                          -- 邮件主题 / WA/LinkedIn 消息标题
  body text,                             -- 完整内容（脱敏后）
  body_excerpt text,                     -- 前 200 字符

  -- 状态
  status text default 'sent',            -- sent / delivered / opened / clicked / replied / bounced / failed
  external_id text,                      -- Resend message id / WA message id / LinkedIn activity id

  -- 上下文
  sequence_step int,                     -- 邮件是第几轮 (1-8)
  campaign text,                         -- 比如 'cold_outreach_v1' / 'followup_day3'
  metadata jsonb                          -- 额外数据（device / location / link 点击等）
);

create index if not exists idx_lead_activities_lead on public.lead_activities(lead_id, created_at desc);
create index if not exists idx_lead_activities_channel on public.lead_activities(channel, created_at desc);
create index if not exists idx_lead_activities_external on public.lead_activities(external_id);

-- ========== RLS ==========
alter table public.leads enable row level security;
alter table public.lead_activities enable row level security;

-- anon 不能读 leads（私人数据）— 仅 service_role 完整访问
-- service_role 自动 bypass RLS

-- 触发器：updated_at 自动更新
create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_leads_touch on public.leads;
create trigger trg_leads_touch
  before update on public.leads
  for each row execute function public.touch_updated_at();

-- ========== 视图：今天的发信队列 ==========
create or replace view public.v_today_email_queue as
select
  l.id,
  l.contact_name,
  l.email,
  l.company_name,
  l.country,
  l.lead_grade,
  l.email_sequence_step,
  l.email_next_due_at,
  l.lead_score
from public.leads l
where
  l.is_blacklisted = false
  and l.status in ('queued', 'contacting')
  and l.email_next_due_at is not null
  and l.email_next_due_at <= now()
order by
  l.lead_grade asc,        -- A 优先
  l.email_next_due_at asc;

-- ========== 视图：A 级 + 24h 内没互动（WhatsApp 触达候选） ==========
create or replace view public.v_whatsapp_candidates as
select
  l.id,
  l.contact_name,
  l.phone,
  l.company_name,
  l.country,
  l.email_replied_at,
  l.wa_opted_in
from public.leads l
where
  l.is_blacklisted = false
  and l.lead_grade = 'A'
  and l.wa_opted_in = true
  and l.phone is not null
  and (l.wa_last_sent_at is null or l.wa_last_sent_at < now() - interval '7 days')
order by l.email_replied_at desc nulls last;

comment on table public.leads is '阶段 1.1：所有主动外发的潜在客户（邮件 8 轮 + WhatsApp + LinkedIn）';
comment on table public.lead_activities is '阶段 1.1：所有与 lead 的互动日志（邮件/WhatsApp/LinkedIn/手动）';
