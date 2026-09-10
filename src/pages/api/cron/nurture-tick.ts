/**
 * Vercel Cron: 每天扫一次 v_today_email_queue，对每个 due lead
 * 发当前 email_sequence_step 对应的 nurture 邮件，并推进 step。
 *
 * 触发方式：
 *   vercel.json crons: [{ path: '/api/cron/nurture-tick', schedule: '0 0 * * *' }]
 *   也可手动 POST: curl -H 'Authorization: Bearer your-secret' https://www.erdosdx.com/api/cron/nurture-tick'
 *
 * 安全：
 *   Vercel Cron 自动带 Authorization: Bearer xxx 头（Vercel 会注入 secret）
 *   手动调用也必须带这个头，否则 401
 *
 * 设计权衡：
 *   - 24h 粒度：Hobby plan 限制每天最多 1 cron；day-N sequence 实际精度 ±12h
 *   - 单次最多处理 50 个 lead：cron 10s 超时上限，留 buffer
 *   - 失败的邮件不回滚 step：让下次重试（避免双发）
 *   - email_replied_at 已置位的 lead → 跳过整个序列（v_today_email_queue 已经包含这个过滤，但保留二次校验）
 *   - 已 unsubscribed / blacklisted 的 lead → 跳过
 *
 * 阶段 1 完工标志（2026-09-10）：
 *   - vercel.json 配 crons + Vercel Dashboard 配 CRON_SECRET
 *   - 这一文件存在并通过 build
 *   - 第一次手动调用返回 {processed: N, sent: M, skipped: K}
 *   - lead_activities 表出现新行（channel=email, direction=out, campaign=nurture_*）
 */

import { toAstroApiRoute, type VercelLikeRequest, type VercelLikeResponse } from '../../../lib/api/vercel-shim';
import { sendEmail } from '../../../lib/email-sender';
import {
  getLocalePack,
  inferLocaleFromCountry,
  renderStep,
  SALES_NAME,
  SALES_WHATSAPP,
  BLOG_URL,
  type LeadGrade,
} from '../../../lib/email-sequence';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '';
const CRON_SECRET = process.env.CRON_SECRET || '';
const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || '';
const WECHAT_WEBHOOK_URL = process.env.WECHAT_WEBHOOK_URL || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'sales@erdosdx.com';

const MAX_LEADS_PER_TICK = 50;
const STEP_TO_INDEX: Record<number, number> = {
  1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6, 8: 7,
};

interface DueLead {
  id: number;
  contact_name: string | null;
  email: string;
  company_name: string | null;
  country: string | null;
  lead_grade: string;
  email_sequence_step: number;
  email_next_due_at: string;
  email_replied_at: string | null;
  is_blacklisted: boolean;
  status: string;
  industry: string | null;
  converted_to_inquiry: number | null;
  quantity: string | null;
  message: string | null;
}

async function sb(pathname: string, opts: any = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${pathname}`, {
    ...opts,
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
    },
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Supabase ${res.status}: ${t.slice(0, 200)}`);
  }
  return res.json();
}

function setCors(res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Hermes-Token');
}

function getCronAuthHeader(req: VercelLikeRequest): string {
  const h = req.headers['authorization'];
  if (typeof h === 'string') return h;
  if (Array.isArray(h)) return h[0] || '';
  return '';
}

function isCronAuthorized(req: VercelLikeRequest): boolean {
  if (!CRON_SECRET) return false; // 未配 CRON_SECRET = 拒绝所有调用（fail closed）
  const got = getCronAuthHeader(req);
  return got === `Bearer ${CRON_SECRET}`;
}

function inquiryTypeLabel(industry: string | null): string {
  const i = (industry || '').toLowerCase();
  if (i.includes('luxury')) return 'cashmere';
  if (i.includes('distributor') || i.includes('wholesale')) return 'cashmere';
  if (i.includes('manufacturer') || i.includes('factory')) return 'cashmere';
  return 'cashmere';
}

/** 计算下一个 due 时间：A=全 8 轮；B=5 轮；C=3 轮 */
function planNextDue(grade: LeadGrade, currentStep: number, sentAt: Date): Date | null {
  // 已发 step N，下一步该排 day N + daysAfterPrev
  // 简化：从 EN_STEPS 取天数（cn/de/fr/ja/kr/en 共用同一 plan）
  const STEPS_DAYS = [0, 3, 4, 7, 7, 9, 15, 15]; // 1→day0, 2→day3, 3→day7, ...
  const A_STEPS = [0, 1, 2, 3, 4, 5, 6, 7];
  const B_STEPS = [0, 2, 3, 5, 7]; // 1, 3, 4, 6, 8
  const C_STEPS = [0, 5, 7]; // 1, 6, 8
  let plan: number[];
  if (grade === 'A') plan = A_STEPS;
  else if (grade === 'B') plan = B_STEPS;
  else if (grade === 'C') plan = C_STEPS;
  else return null;

  const currentIdx = plan.indexOf(currentStep - 1);
  if (currentIdx === -1 || currentIdx === plan.length - 1) return null;
  const nextStep = plan[currentIdx + 1];
  const daysAfter = STEPS_DAYS[nextStep];
  if (daysAfter === undefined) return null;
  // 第 N 步的 due = 发完第 N 步 + (第 N+1 步相对第 N 步的天数差)
  const currentDays = STEPS_DAYS[currentStep - 1];
  const deltaDays = daysAfter - currentDays;
  if (deltaDays < 0) return null;
  return new Date(sentAt.getTime() + deltaDays * 24 * 60 * 60 * 1000);
}

async function processOne(lead: DueLead): Promise<{ step: number; ok: boolean; error?: string }> {
  const stepIdx = STEP_TO_INDEX[lead.email_sequence_step];
  if (stepIdx === undefined) {
    return { step: lead.email_sequence_step, ok: false, error: 'unknown_step' };
  }

  const locale = inferLocaleFromCountry(lead.country || '');
  const pack = getLocalePack(locale);
  const stepDef = pack.steps[stepIdx];

  const vars: Record<string, string> = {
    name: lead.contact_name || 'there',
    company: lead.company_name || '',
    country: lead.country || '',
    industry: lead.industry || 'cashmere',
    inquiryTypeLabel: inquiryTypeLabel(lead.industry),
    quantity: lead.quantity || 'TBD',
    salesName: SALES_NAME,
    whatsapp: SALES_WHATSAPP,
    blogUrl: BLOG_URL,
    fxRate: '7.18',
    unsubscribeUrl: `https://www.erdosdx.com/api/unsubscribe?lead=${lead.id}`,
  };

  const { subject, html } = renderStep(pack, stepIdx, vars);

  // 替换 unsubscribeUrl 占位（renderStep 把所有 {{var}} 替成 v；unsubscribeUrl 在 renderStep 包邮件外壳时才放，所以这里还要再替换一次）
  const finalHtml = html.replace(/\{\{unsubscribeUrl\}\}/g, vars.unsubscribeUrl);

  const result = await sendEmail({
    to: lead.email,
    subject,
    html: finalHtml,
    tag: stepDef.campaign,
  });

  if (!result.ok) {
    // 写一条 failed 活动
    await sb('/lead_activities', {
      method: 'POST',
      headers: { 'Prefer': 'return=minimal' },
      body: JSON.stringify({
        lead_id: lead.id,
        channel: 'email',
        direction: 'out',
        subject,
        body_excerpt: stepDef.htmlTpl.slice(0, 200),
        status: 'failed',
        sequence_step: lead.email_sequence_step,
        campaign: stepDef.campaign,
        metadata: { error: result.error || 'unknown', sent_at_iso: new Date().toISOString() },
      }),
    }).catch(e => console.error('lead_activities insert failed:', e));

    return { step: lead.email_sequence_step, ok: false, error: result.error };
  }

  // 成功 — 更新 lead 状态 + 写 lead_activities
  const sentAt = new Date();
  const nextStep = lead.email_sequence_step + 1;
  const grade = (lead.lead_grade || 'D') as LeadGrade;
  const isSequenceDone =
    nextStep > 8 ||
    (grade === 'B' && nextStep > 8) ||
    (grade === 'B' && ![1, 3, 4, 6, 8].includes(nextStep)) ||
    (grade === 'C' && nextStep > 8) ||
    (grade === 'C' && ![1, 6, 8].includes(nextStep));

  let nextDueAt: string | null = null;
  let statusUpdate: Record<string, any> = {
    email_sequence_step: isSequenceDone ? 9 : nextStep,
    email_last_sent_at: sentAt.toISOString(),
    email_next_due_at: null,
    status: isSequenceDone ? 'completed' : (lead.status === 'queued' ? 'contacting' : lead.status),
  };

  if (!isSequenceDone) {
    const nextDue = planNextDue(grade, lead.email_sequence_step, sentAt);
    if (nextDue) nextDueAt = nextDue.toISOString();
  }
  statusUpdate.email_next_due_at = nextDueAt;

  await sb(`/leads?id=eq.${lead.id}`, {
    method: 'PATCH',
    headers: { 'Prefer': 'return=minimal' },
    body: JSON.stringify(statusUpdate),
  });

  await sb('/lead_activities', {
    method: 'POST',
    headers: { 'Prefer': 'return=minimal' },
    body: JSON.stringify({
      lead_id: lead.id,
      channel: 'email',
      direction: 'out',
      subject,
      body_excerpt: stepDef.htmlTpl.slice(0, 200),
      status: 'sent',
      external_id: result.id || null,
      sequence_step: lead.email_sequence_step,
      campaign: stepDef.campaign,
      metadata: { sent_at_iso: sentAt.toISOString() },
    }),
  });

  return { step: lead.email_sequence_step, ok: true };
}

async function _internalHandler(req: VercelLikeRequest, res: VercelLikeResponse) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  if (!isCronAuthorized(req)) {
    return res.status(401).json({ error: 'unauthorized', hint: 'send Authorization: Bearer $CRON_SECRET' });
  }
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: 'supabase_not_configured' });
  }

  const tickStart = Date.now();
  let processed = 0;
  let sent = 0;
  let skipped = 0;
  let failed = 0;
  const errors: any[] = [];
  const results: any[] = [];

  try {
    // 用 v_today_email_queue 视图——已经过滤好 due & queued/contacting & !blacklisted
    const dueLeads: DueLead[] = await sb(
      `/v_today_email_queue?limit=${MAX_LEADS_PER_TICK}`,
    );

    for (const lead of dueLeads) {
      processed++;

      // 二次校验（视图已过滤但 cron 跨视图缓存可能 stale）
      if (lead.is_blacklisted || lead.status === 'unsubscribed' || lead.email_replied_at) {
        skipped++;
        continue;
      }
      if (!lead.email || lead.email_sequence_step >= 9) {
        skipped++;
        continue;
      }

      try {
        const r = await processOne(lead);
        if (r.ok) {
          sent++;
          results.push({ lead_id: lead.id, step: r.step, ok: true });
        } else {
          failed++;
          errors.push({ lead_id: lead.id, step: r.step, error: r.error });
        }
      } catch (e: any) {
        failed++;
        errors.push({ lead_id: lead.id, error: String(e?.message || e) });
      }
    }

    const summary = {
      ok: true,
      processed,
      sent,
      skipped,
      failed,
      errors: errors.slice(0, 10),
      tick_duration_ms: Date.now() - tickStart,
      run_at: new Date().toISOString(),
    };

    // 如果失败率高（> 30% 且至少 5 个 processed）→ 推企业微信告警
    if (processed >= 5 && failed / processed > 0.3) {
      const msg = `⚠️ Nurture tick 高失败率
processed=${processed} sent=${sent} failed=${failed} skipped=${skipped}
run_at=${summary.run_at}
errors: ${errors.slice(0, 3).map(e => JSON.stringify(e)).join(' | ')}`;
      if (WECHAT_WEBHOOK_URL) {
        fetch(WECHAT_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ msgtype: 'text', text: { content: msg } }),
        }).catch(() => {});
      }
      if (NOTIFICATION_EMAIL) {
        sendEmail({
          to: NOTIFICATION_EMAIL,
          subject: `[Nurture Cron] High failure rate (${Math.round((failed / processed) * 100)}%)`,
          html: `<pre>${msg}</pre>`,
          tag: 'cron-alert',
        }).catch(() => {});
      }
    }

    return res.status(200).json(summary);
  } catch (e: any) {
    console.error('nurture-tick fatal:', e);
    return res.status(500).json({ error: 'fatal', message: String(e?.message || e) });
  }
}

export const prerender = false;
const handler = async (req: any, res: any) => { await _internalHandler(req, res); };
export const POST = toAstroApiRoute(handler);
export const GET = toAstroApiRoute(handler);
export const OPTIONS = toAstroApiRoute(handler);
