-- ordos-cashmere 阶段 1 (2026-09-10) — 一次性回填
-- 目的: 让现有的 leads 立即进入 nurture 邮件序列
-- 触发时机: 在 src/pages/api/cron/nurture-tick.ts 部署之后
-- 运行位置: Supabase SQL Editor
-- 预期影响:
--   - 现有 A/B/C 级 lead 立即有 email_next_due_at = now()
--   - 下一次 nurture-tick cron 触发时，会发 day-0 intro 邮件
--   - 已回复 / 已退订 / 已完成 / D 级 lead 不受影响
--
-- 安全:
--   - 两条 UPDATE 都是幂等的（条件限定了 step=0 / status in (...) 才会改）
--   - 不会覆盖 cron 已经排好的未来 due_at
--   - 失败时不会影响其他 lead（每行独立 update）

update public.leads
set
  email_sequence_step = 1,
  email_next_due_at = now()
where
  email_replied_at is null
  and is_blacklisted = false
  and coalesce(status, 'new') != 'unsubscribed'
  and coalesce(email_sequence_step, 0) = 0
  and lead_grade in ('A', 'B', 'C')
  and (email_next_due_at is null or email_next_due_at < now());

-- 把符合资格的 lead 标到 queued 状态（cron 只扫 queued/contacting）
update public.leads
set status = 'queued'
where
  email_replied_at is null
  and is_blacklisted = false
  and coalesce(status, 'new') in ('new', 'contacting', '')
  and lead_grade in ('A', 'B', 'C');

-- 验证
select
  lead_grade,
  status,
  count(*) as leads,
  count(*) filter (where email_next_due_at is not null) as queued_to_send,
  count(*) filter (where email_replied_at is not null) as replied
from public.leads
group by lead_grade, status
order by lead_grade, status;
