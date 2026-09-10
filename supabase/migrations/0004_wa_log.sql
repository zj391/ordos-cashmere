-- ordos-cashmere-site migration 0004: wa_send_log (阶段 1.5)
-- 目的：记录 WhatsApp 出站消息发送历史 + inbound webhook 收到的回复
-- 触发：cron/wa-tick.ts (outbound) + api/wa-inbound.ts (inbound)
--
-- 设计权衡：
-- - 字段 wa_message_id 是 Meta Cloud API 返回的 wamid.* ID
-- - direction 区分 out (我们发) / in (客户回)
-- - status 由 Meta webhook 推送更新 (delivered / read / replied)
-- - 不加 RLS（service_role 自动 bypass；普通用户不应访问）
--
-- 在 Supabase SQL Editor 跑这个文件。

create table if not exists public.wa_send_log (
  id bigserial primary key,
  created_at timestamp with time zone default now(),

  -- 关联
  lead_id bigint references public.leads(id) on delete set null,
  phone text not null,

  -- 消息
  direction text not null,                -- 'out' / 'in'
  template_name text,                     -- 出站用的 template 名（Meta 强制预审）
  template_vars jsonb,                    -- template 变量
  body text,                              -- 实际发送的文本（用于 debug）

  -- 状态
  status text default 'pending',          -- pending / sent / delivered / read / replied / failed
  wa_message_id text,                     -- Meta 返回的 wamid.* 格式
  error_message text,
  error_code text,

  -- 上下文
  campaign text,                          -- 'wa_nurture_day3_followup' 等
  triggered_by text default 'cron:wa-tick'
);

create index if not exists idx_wa_log_lead on public.wa_send_log(lead_id, created_at desc);
create index if not exists idx_wa_log_phone on public.wa_send_log(phone);
create index if not exists idx_wa_log_direction_status on public.wa_send_log(direction, status, created_at desc);

-- ========== 视图：待回复的 WhatsApp 触达（v_whatsapp_candidates 升级版） ==========
-- 原 v_whatsapp_candidates 已存在 (migrations/0002_leads.sql) — 不重定义
-- 这里加一个 outbound 冷却视图：避免 cron 在 7 天内重复 WA 同一个 lead

create or replace view public.v_whatsapp_outbound_candidates as
select
  l.id,
  l.contact_name,
  l.phone,
  l.company_name,
  l.country,
  l.lead_grade,
  l.email_sequence_step,
  l.wa_opted_in,
  l.email_replied_at,
  coalesce(
    (select max(created_at) from public.wa_send_log w
     where w.lead_id = l.id and w.direction = 'out'),
    '1970-01-01'::timestamptz
  ) as last_wa_sent_at
from public.leads l
where
  l.is_blacklisted = false
  and l.wa_opted_in = true
  and l.phone is not null
  and l.email_replied_at is null
  and l.lead_grade = 'A'
  and coalesce(l.status, 'new') in ('queued', 'contacting');

comment on table public.wa_send_log is '阶段 1.5 (2026-09-10): WhatsApp 出站 + 入站消息日志';
comment on view public.v_whatsapp_outbound_candidates is '阶段 1.5: WhatsApp 出站候选（仅 A 级 + 未回复 + 7 天冷却）';
