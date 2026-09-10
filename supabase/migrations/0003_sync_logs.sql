-- ordos-cashmere-site migration 0003: sync_logs (阶段 1.5)
-- 目的：sync runner.ts 之前用内存 Map，Vercel serverless 重启即丢。
--        改成 Supabase 持久化，weekly-report 才能算真实失败率。
--
-- 在 Supabase SQL Editor 跑这个文件。
--
-- Schema 兼容现有的 ChannelResult shape:
--   channel: linkedin / alibaba / xiaohongshu
--   status: pending / pushed / manual_ready / skipped / error
--
-- 设计权衡：
-- - 一行 = 一次单 channel push（不是一行 = 一次 syncOne 调用），这样聚合失败率直接 count
-- - product_id / product_name 冗余存储（products.json 内容可能变，但我们要历史快照）
-- - triggered_by 区分 admin 手动 vs cron 自动（'admin:zj' / 'cron:nightly' 等）
-- - 不加外键到 products 表——products 是 JSON 文件不是表

create table if not exists public.sync_logs (
  id bigserial primary key,
  created_at timestamp with time zone default now(),

  -- 哪个 syncOne 调用 (runId 来自 runner.ts 的 sl_xxx 格式)
  run_id text not null,

  -- 推送对象
  product_id text not null,
  product_name text,
  channel text not null,                -- linkedin / alibaba / xiaohongshu
  status text not null,                 -- pending / pushed / manual_ready / skipped / error

  -- 平台回执
  external_id text,                     -- 平台返回的 post id
  external_url text,                    -- 发布后的公开 URL
  preview_url text,                     -- manual_ready 模板预览链接
  error_message text,

  -- 调用方
  triggered_by text,                    -- 'admin:zj' / 'cron:nightly'

  -- 时间
  started_at bigint,                    -- epoch ms (runner.ts 用)
  finished_at bigint,
  pushed_at bigint
);

create index if not exists idx_sync_logs_created on public.sync_logs(created_at desc);
create index if not exists idx_sync_logs_run on public.sync_logs(run_id);
create index if not exists idx_sync_logs_channel on public.sync_logs(channel, created_at desc);
create index if not exists idx_sync_logs_status on public.sync_logs(status, created_at desc);

-- ========== 视图：上周同步失败率（weekly-report 用） ==========
create or replace view public.v_sync_weekly_stats as
select
  channel,
  count(*) filter (where status = 'pushed') as pushed_count,
  count(*) filter (where status = 'manual_ready') as manual_ready_count,
  count(*) filter (where status = 'skipped') as skipped_count,
  count(*) filter (where status = 'error') as error_count,
  count(*) as total_count,
  round(
    100.0 * count(*) filter (where status = 'error')::numeric
    / nullif(count(*) filter (where status in ('pushed', 'error')), 0)::numeric,
    1
  ) as error_rate_pct
from public.sync_logs
where created_at >= now() - interval '7 days'
group by channel;

comment on table public.sync_logs is '阶段 1.5 (2026-09-10): sync runner 持久化日志，weekly-report 失败率来源';
