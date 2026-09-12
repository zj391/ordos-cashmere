-- ordos-cashmere-site migration 0005: newsletter_subscribers (阶段 7 P0)
-- 目的: Footer 的 trade journal newsletter signup 收件人列表
-- 触发: /api/newsletter/subscribe (Footer form action)
--
-- 在 Supabase SQL Editor 跑这个文件。
--
-- 设计权衡:
-- - email 唯一 (UNIQUE 约束保证幂等)
-- - 含 locale 用于多语言邮件 + unsubscribe link
-- - 含 source / referrer 便于 zj 看转化归因
-- - 含 unsubscribed_at 让真正退订的 row 保留 (合规审计)

create table if not exists public.newsletter_subscribers (
  id bigserial primary key,
  email text not null unique,
  locale text default 'en',
  source text default 'footer',                -- footer / landing_page / blog_cta 等
  referrer text,                              -- 订阅时所在页面 URL
  user_agent text,
  ip_address text,
  subscribed_at timestamp with time zone default now(),
  unsubscribed_at timestamp with time zone,   -- null = active, timestamp = 已退订
  unsubscribe_reason text
);

create index if not exists idx_newsletter_locale on public.newsletter_subscribers(locale);
create index if not exists idx_newsletter_active on public.newsletter_subscribers(subscribed_at desc) where unsubscribed_at is null;

-- ========== 视图：活跃订阅者 ==========
create or replace view public.v_active_newsletter as
select id, email, locale, source, subscribed_at
from public.newsletter_subscribers
where unsubscribed_at is null;

comment on table public.newsletter_subscribers is '阶段 7 P0 (2026-09-10): trade journal newsletter 订阅者表';
comment on view public.v_active_newsletter is '阶段 7 P0: 当前活跃订阅者 (未退订)';
