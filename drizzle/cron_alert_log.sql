-- Migration: create cron_alert_log table
-- Used by daily-tick Phase 3 (actions-monitor) to track last_alert_at per
-- alert_type, preventing alert spam when workflows fail for extended periods.
--
-- Run via Supabase Studio SQL Editor, OR via psql/postgres client with:
--   psql "$DATABASE_URL" -f drizzle/migrations/cron_alert_log.sql
--
-- Schema:
--   id            - serial PK
--   alert_type    - unique string identifier (e.g. 'actions_monitor_failed')
--   last_alert_at - timestamptz, when the last alert of this type was sent

create table if not exists cron_alert_log (
  id serial primary key,
  alert_type text not null unique,
  last_alert_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Index for fast lookup (already covered by unique constraint, but explicit)
create index if not exists idx_cron_alert_log_alert_type
  on cron_alert_log(alert_type);

-- Comment for future maintainers
comment on table cron_alert_log is
  'Tracks last_alert_at per alert_type for cron-driven email/webhook alerts. Used by /api/cron/daily-tick Phase 3 (actions-monitor) to enforce 48h cooldown on repeated blog.yml failure notifications. Without this table, alerts still fire but cooldown check is skipped (graceful degradation).';
comment on column cron_alert_log.alert_type is
  'Stable string identifier, e.g. actions_monitor_failed. Add new types as new monitor phases are added.';