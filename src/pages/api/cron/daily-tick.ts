/**
 * Vercel Cron: 每天 00:00 UTC 跑一次 — 同时执行 nurture 邮件 + WhatsApp 触达
 *
 * 设计原因:
 *   Vercel Hobby plan 限制 max 2 cron jobs。把 nurture + WA 合并到 daily-tick
 *   一个端点,既省 quota,又给 nurture 邮件先发完(00:00-00:30)、WA 后发(00:30-01:00)
 *   的两阶段执行流。
 *
 * 触发:
 *   vercel.json crons: [{ path: '/api/cron/daily-tick', schedule: '0 0 * * *' }]
 *
 * 执行流:
 *   Phase 1 (nurture, ~30s): 扫 v_today_email_queue, 发邮件, 推进 step
 *   Phase 2 (whatsapp, ~30s): 扫 v_whatsapp_outbound_candidates, 发 WA template
 *   每个 lead 单 phase try/catch 隔离, 一个失败不影响整体
 *   总超时控制在 Vercel Hobby 60s 上限内
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
import { sendWhatsAppTemplate, WHATSAPP_DEFAULTS } from '../../../lib/whatsapp-sender';
import { broadcast } from '../../../lib/n8n-broadcast';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '';
const CRON_SECRET = process.env.CRON_SECRET || '';
const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || '';
const WECHAT_WEBHOOK_URL = process.env.WECHAT_WEBHOOK_URL || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'sales@erdosdx.com';
const SITE_BASE_URL = process.env.PUBLIC_SITE_URL || 'https://www.erdosdx.com';

const MAX_NURTURE_PER_TICK = 50;
const MAX_WA_PER_TICK = 30;
const STEP_TO_INDEX: Record<number, number> = {
  1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6, 8: 7,
};

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
  if (!CRON_SECRET) return false;
  return getCronAuthHeader(req) === `Bearer ${CRON_SECRET}`;
}

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

interface WACandidate {
  id: number;
  contact_name: string | null;
  phone: string;
  company_name: string | null;
  country: string | null;
  lead_grade: string;
  email_sequence_step: number;
  email_replied_at: string | null;
  wa_opted_in: boolean;
  last_wa_sent_at: string;
}

function inquiryTypeLabel(industry: string | null): string {
  const i = (industry || '').toLowerCase();
  if (i.includes('luxury')) return 'cashmere';
  if (i.includes('distributor') || i.includes('wholesale')) return 'cashmere';
  if (i.includes('manufacturer') || i.includes('factory')) return 'cashmere';
  return 'cashmere';
}

function planNextDue(grade: LeadGrade, currentStep: number, sentAt: Date, previousOpened: boolean = false, previousClicked: boolean = false): Date | null {
  const STEPS_DAYS = [0, 3, 4, 7, 7, 9, 15, 15];
  const A_STEPS = [0, 1, 2, 3, 4, 5, 6, 7];
  const B_STEPS = [0, 2, 3, 5, 7];
  const C_STEPS = [0, 5, 7];
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
  const currentDays = STEPS_DAYS[currentStep - 1];
  const deltaDays = daysAfter - currentDays;
  if (deltaDays < 0) return null;

  // 阶段 4 P1 (2026-09-10): engagement-driven cadence
  // 上一步邮件被 clicked → 立即推下一步 (0.3x)
  // 被 opened 但没 clicked → 加速 (0.5x)
  // 没 opened → 拉长间隔 (1.5x, 让营销疲劳感消散)
  let multiplier = 1.0;
  if (previousClicked) multiplier = 0.3;
  else if (previousOpened) multiplier = 0.5;
  else multiplier = 1.5;

  const adjustedDelta = Math.max(1, Math.round(deltaDays * multiplier));
  return new Date(sentAt.getTime() + adjustedDelta * 24 * 60 * 60 * 1000);
}

/**
 * 查询上一封邮件 (sequence_step = currentStep - 1) 的 engagement
 * 返回 { opened, clicked }
 */
async function checkPreviousEngagement(leadId: number, currentStep: number): Promise<{ opened: boolean; clicked: boolean }> {
  if (currentStep <= 1) return { opened: true, clicked: false }; // day-0 总是当做 opened
  try {
    const rows = await sb(
      `/lead_activities?lead_id=eq.${leadId}&sequence_step=eq.${currentStep - 1}&channel=eq.email&direction=eq.out&limit=1`,
    );
    const r = rows?.[0];
    if (!r) return { opened: false, clicked: false };
    const opened = ['opened', 'clicked'].includes(r.status);
    const clicked = r.status === 'clicked';
    return { opened, clicked };
  } catch {
    return { opened: false, clicked: false };
  }
}

async function processNurtureOne(lead: DueLead): Promise<{ ok: boolean; error?: string }> {
  const stepIdx = STEP_TO_INDEX[lead.email_sequence_step];
  if (stepIdx === undefined) return { ok: false, error: 'unknown_step' };

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
  const finalHtml = html.replace(/\{\{unsubscribeUrl\}\}/g, vars.unsubscribeUrl);

  const result = await sendEmail({
    to: lead.email,
    subject,
    html: finalHtml,
    tag: stepDef.campaign,
  });

  if (!result.ok) {
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
    }).catch(() => {});
    // 阶段 6 P0: 推 nurture_email_failed 事件到 n8n
    broadcast({
      event: 'nurture_email_failed',
      data: {
        lead_id: lead.id,
        email: lead.email,
        sequence_step: lead.email_sequence_step,
        campaign: stepDef.campaign,
        error: result.error,
      },
    });
    return { ok: false, error: result.error };
  }

  const sentAt = new Date();
  const nextStep = lead.email_sequence_step + 1;
  const grade = (lead.lead_grade || 'D') as LeadGrade;
  const A_STEPS = [1, 2, 3, 4, 5, 6, 7, 8];
  const B_STEPS = [1, 3, 4, 6, 8];
  const C_STEPS = [1, 6, 8];
  let validSteps: number[];
  if (grade === 'A') validSteps = A_STEPS;
  else if (grade === 'B') validSteps = B_STEPS;
  else if (grade === 'C') validSteps = C_STEPS;
  else validSteps = [];

  const isSequenceDone = !validSteps.includes(nextStep);

  const statusUpdate: Record<string, any> = {
    email_sequence_step: isSequenceDone ? 9 : nextStep,
    email_last_sent_at: sentAt.toISOString(),
    email_next_due_at: null,
    status: isSequenceDone ? 'completed' : (lead.status === 'queued' ? 'contacting' : lead.status),
  };

  if (!isSequenceDone) {
    const engagement = await checkPreviousEngagement(lead.id, lead.email_sequence_step);
    const nextDue = planNextDue(grade, lead.email_sequence_step, sentAt, engagement.opened, engagement.clicked);
    if (nextDue) statusUpdate.email_next_due_at = nextDue.toISOString();
  }

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

  // 阶段 6 P0: 推 nurture_email_sent 事件到 n8n
  broadcast({
    event: 'nurture_email_sent',
    data: {
      lead_id: lead.id,
      email: lead.email,
      sequence_step: lead.email_sequence_step,
      campaign: stepDef.campaign,
      resend_id: result.id,
    },
  });

  return { ok: true };
}

function pickProductLink(inquiryType: string | null): string {
  const t = (inquiryType || '').toLowerCase();
  if (t.includes('raw') || t.includes('material')) return `${SITE_BASE_URL}/en/products/raw-material/`;
  if (t.includes('yarn') || t.includes('fabric')) return `${SITE_BASE_URL}/en/products/yarn/`;
  if (t.includes('garment') || t.includes('oem')) return `${SITE_BASE_URL}/en/products/garment-oem/`;
  if (t.includes('scarf')) return `${SITE_BASE_URL}/en/products/scarves/`;
  if (t.includes('hat')) return `${SITE_BASE_URL}/en/products/hats-accessories/`;
  return `${SITE_BASE_URL}/en/products/`;
}

async function processWAOne(candidate: WACandidate): Promise<{ ok: boolean; error?: string; messageId?: string }> {
  let productLink = `${SITE_BASE_URL}/en/products/`;
  try {
    const leadRows = await sb(`/leads?id=eq.${candidate.id}&select=converted_to_inquiry&limit=1`);
    if (leadRows?.[0]?.converted_to_inquiry) {
      const inqRows = await sb(`/inquiries?id=eq.${leadRows[0].converted_to_inquiry}&select=inquiry_type,product_interest&limit=1`);
      if (inqRows?.[0]) {
        productLink = inqRows[0].product_interest
          ? `${SITE_BASE_URL}/en/products/${encodeURIComponent(inqRows[0].product_interest)}/`
          : pickProductLink(inqRows[0].inquiry_type);
      }
    }
  } catch {
    // ignore — fallback to default link
  }

  const params = [
    candidate.contact_name || 'there',
    candidate.company_name || '',
    productLink,
  ];

  return sendWhatsAppTemplate({
    phone: candidate.phone,
    templateName: 'cashmere_day3_followup',
    templateParams: params,
    templateLanguage: 'en_US',
    leadId: candidate.id,
    campaign: 'wa_nurture_day3_followup',
  });
}

async function runNurturePhase(): Promise<{ processed: number; sent: number; skipped: number; failed: number; errors: any[] }> {
  const result = { processed: 0, sent: 0, skipped: 0, failed: 0, errors: [] as any[] };

  const dueLeads: DueLead[] = await sb(`/v_today_email_queue?limit=${MAX_NURTURE_PER_TICK}`);
  for (const lead of dueLeads) {
    result.processed++;
    if (lead.is_blacklisted || lead.status === 'unsubscribed' || lead.email_replied_at) {
      result.skipped++;
      continue;
    }
    if (!lead.email || lead.email_sequence_step >= 9) {
      result.skipped++;
      continue;
    }
    try {
      const r = await processNurtureOne(lead);
      if (r.ok) result.sent++;
      else { result.failed++; result.errors.push({ lead_id: lead.id, error: r.error }); }
    } catch (e: any) {
      result.failed++;
      result.errors.push({ lead_id: lead.id, error: String(e?.message || e) });
    }
  }
  return result;
}

async function runWAPhase(): Promise<{ processed: number; sent: number; skipped: number; failed: number; errors: any[]; wa_enabled: boolean }> {
  const result = { processed: 0, sent: 0, skipped: 0, failed: 0, errors: [] as any[], wa_enabled: WHATSAPP_DEFAULTS.ENABLED };

  if (!WHATSAPP_DEFAULTS.ENABLED) {
    return result; // WA not configured — skip silently
  }

  const candidates: WACandidate[] = await sb(`/v_whatsapp_outbound_candidates?limit=${MAX_WA_PER_TICK}`);
  for (const c of candidates) {
    result.processed++;
    if (c.last_wa_sent_at && new Date(c.last_wa_sent_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000) {
      result.skipped++;
      continue;
    }
    if (c.email_replied_at || !c.phone) {
      result.skipped++;
      continue;
    }
    try {
      const r = await processWAOne(c);
      if (r.ok) {
        result.sent++;
        // 阶段 6 P0: 推 nurture_wa_sent 事件到 n8n
        broadcast({
          event: 'nurture_wa_sent',
          data: {
            lead_id: c.id,
            phone: c.phone,
            wa_message_id: r.messageId,
            campaign: 'wa_nurture_day3_followup',
          },
        });
      }
      else { result.failed++; result.errors.push({ lead_id: c.id, error: r.error }); }
    } catch (e: any) {
      result.failed++;
      result.errors.push({ lead_id: c.id, error: String(e?.message || e) });
    }
  }
  return result;
}

async function sendAlertIfHighFailure(label: string, processed: number, failed: number, sample_errors: any[]): Promise<void> {
  if (processed < 3 || failed / processed <= 0.3) return;
  const msg = `⚠️ ${label} 高失败率\nprocessed=${processed} failed=${failed}\nrun_at=${new Date().toISOString()}\nerrors: ${sample_errors.slice(0, 3).map(e => JSON.stringify(e)).join(' | ')}`;
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
      subject: `[${label}] High failure rate (${Math.round((failed / processed) * 100)}%)`,
      html: `<pre>${msg}</pre>`,
      tag: 'cron-alert',
    }).catch(() => {});
  }
}

// ============================================================================
// Phase 3: GitHub Actions "Daily GEO Blog" monitor
//
// 背景:
//   ordos-cashmere 的博客自动生成依赖 GitHub Actions workflow
//   .github/workflows/blog.yml (每天 UTC 02:00 跑)。当 LLM_API_KEY 失效 /
//   余额空 / fallback 模型下架时,workflow 会持续失败,但没人会知道——
//   zj 直到 SEO 曝光开始下滑 1-2 周后才发现。
//
//   这个 phase 监控最近 3 次 runs,若连续 3 次失败且最近一次在 36h 内,
//   发邮件提醒 NOTIFICATION_EMAIL(默认只发一次,直到恢复 success)。
//
// 设计:
//   1. 查 GitHub REST API: /repos/{owner}/{repo}/actions/workflows/blog.yml/runs?per_page=3
//      用 GITHUB_REPO_TOKEN(轻量 PAT)鉴权,rate limit 提升到 1000/hr。
//      不需要 secrets:workload 那种细粒度 token。
//   2. 失败判定: 连续 3 次 conclusion == 'failure' AND 至少 1 次在 36h 内
//      (跳过 schedule skip / cancelled / in_progress)
//   3. Anti-spam: Supabase 表 cron_alert_log 记录 last_alert_at
//      同一种 alert 至少 48h 间隔再发一次(避免连续失败 30 天发 30 封)
//
// 注意:
//   - 必须在 GH repo > Settings > Secrets 里设 GITHUB_REPO_TOKEN 和
//     GITHUB_REPO_OWNER + GITHUB_REPO_NAME
//   - 未配置 env vars 时整个 phase 静默跳过,不报错
// ============================================================================

const GH_REPO_OWNER = process.env.GITHUB_REPO_OWNER || '';
const GH_REPO_NAME = process.env.GITHUB_REPO_NAME || '';
const GH_REPO_TOKEN = process.env.GITHUB_REPO_TOKEN || '';
const GH_WORKFLOW_FILE = 'blog.yml';
const ACTIONS_RECENT_HARD_FAIL_THRESHOLD = 3; // 最近 3 runs 都失败
const ACTIONS_RECENT_HOURS_WINDOW = 36;
const ACTIONS_ALERT_COOLDOWN_HOURS = 48;

async function runActionsMonitorPhase(): Promise<{
  enabled: boolean;
  workflow_status: string | null;
  recent_runs: any[];
  alert_sent: boolean;
  alert_skipped_reason: string | null;
  error: string | null;
}> {
  const result = {
    enabled: false,
    workflow_status: null as string | null,
    recent_runs: [] as any[],
    alert_sent: false,
    alert_skipped_reason: null as string | null,
    error: null as string | null,
  };

  // 静默跳过:env vars 没配齐时 — 让没配 GH 的 deploy 也能跑
  if (!GH_REPO_OWNER || !GH_REPO_NAME || !GH_REPO_TOKEN) {
    result.alert_skipped_reason = 'github_actions_env_not_configured';
    return result;
  }
  result.enabled = true;

  // 1. 拉最近 3 runs
  const url = `https://api.github.com/repos/${GH_REPO_OWNER}/${GH_REPO_NAME}/actions/workflows/${GH_WORKFLOW_FILE}/runs?per_page=${ACTIONS_RECENT_HARD_FAIL_THRESHOLD}`;
  let runsRes;
  try {
    const ghRes = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${GH_REPO_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'ordos-cashmere-daily-tick',
      },
    });
    if (!ghRes.ok) {
      const t = await ghRes.text();
      throw new Error(`GitHub API ${ghRes.status}: ${t.slice(0, 200)}`);
    }
    runsRes = await ghRes.json();
  } catch (e: any) {
    result.error = `github_api_failed: ${String(e?.message || e).slice(0, 200)}`;
    return result;
  }

  const runs = (runsRes?.workflow_runs || []).slice(0, ACTIONS_RECENT_HARD_FAIL_THRESHOLD);
  result.recent_runs = runs.map((r: any) => ({
    id: r.id,
    conclusion: r.conclusion,
    status: r.status,
    created_at: r.created_at,
    html_url: r.html_url,
    head_sha: r.head_sha?.slice(0, 7),
  }));
  result.workflow_status = runs[0]?.conclusion || null;

  if (runs.length < ACTIONS_RECENT_HARD_FAIL_THRESHOLD) {
    result.alert_skipped_reason = 'not_enough_runs';
    return result;
  }

  // 2. 判定:连续 3 次都是 failure(必须都是 'failure',不接受 'cancelled')
  const allFailed = runs.every((r: any) => r.conclusion === 'failure');
  if (!allFailed) {
    result.alert_skipped_reason = 'not_all_failed';
    return result;
  }

  // 3. 时间窗口:必须在过去 36h 内至少有一次
  const nowMs = Date.now();
  const windowMs = ACTIONS_RECENT_HOURS_WINDOW * 60 * 60 * 1000;
  const anyInWindow = runs.some((r: any) => {
    const t = new Date(r.created_at).getTime();
    return nowMs - t <= windowMs;
  });
  if (!anyInWindow) {
    result.alert_skipped_reason = 'failures_outside_36h_window';
    return result;
  }

  // 4. Anti-spam:查 Supabase cron_alert_log 表
  // 表 schema 假设 (如果不存在,本 phase 静默跳过 spam check):
  //   create table cron_alert_log (
  //     id serial primary key,
  //     alert_type text not null,
  //     last_alert_at timestamptz not null default now()
  //   );
  //   create unique index idx_cron_alert_log_type on cron_alert_log(alert_type);
  let cooldownOK = true;
  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      const logRows: any = await sb(`/cron_alert_log?alert_type=eq.actions_monitor_failed&limit=1`);
      if (Array.isArray(logRows) && logRows.length > 0) {
        const lastAt = new Date(logRows[0].last_alert_at).getTime();
        const cooldownMs = ACTIONS_ALERT_COOLDOWN_HOURS * 60 * 60 * 1000;
        if (nowMs - lastAt < cooldownMs) {
          cooldownOK = false;
          result.alert_skipped_reason = `cooldown_active_until_${new Date(lastAt + cooldownMs).toISOString()}`;
        }
      }
    } catch (e: any) {
      // 表不存在或权限问题:log warning 但不阻断 alert
      console.warn('actions-monitor: cron_alert_log lookup failed:', String(e?.message || e).slice(0, 100));
    }
  }

  if (!cooldownOK) return result;

  // 5. 发邮件提醒
  const recentLines = result.recent_runs.map((r: any) =>
    `<li><a href="${r.html_url}">run #${r.id}</a> — ${r.conclusion} at ${r.created_at} (commit ${r.head_sha})</li>`
  ).join('');
  const html = `
    <div style="font-family: -apple-system, sans-serif; max-width: 600px;">
      <h2 style="color:#b91c1c;">⚠️ Daily GEO Blog workflow failing</h2>
      <p>GitHub Actions workflow <code>blog.yml</code> has failed <strong>${ACTIONS_RECENT_HARD_FAIL_THRESHOLD} times in a row</strong>.
      This will block daily SEO blog publishing and may cause sitemap lastmod to drift again.</p>
      <p><strong>Likely causes (verified 2026-10-08):</strong></p>
      <ul>
        <li><code>LLM_API_KEY</code> expired or out of credits</li>
        <li><code>LLM_API_URL</code> endpoint changed</li>
        <li>Fallback model (e.g. <code>openrouter/free</code>) deprecated</li>
      </ul>
      <p><strong>Next step:</strong> Open one of the run URLs below to see the exact error in step "Generate blog", then update secrets at:<br>
        <a href="https://github.com/${GH_REPO_OWNER}/${GH_REPO_NAME}/settings/secrets/actions">https://github.com/${GH_REPO_OWNER}/${GH_REPO_NAME}/settings/secrets/actions</a></p>
      <h3>Recent runs</h3>
      <ul>${recentLines}</ul>
      <p style="color:#666;font-size:12px;">Auto-detected by daily-tick Phase 3 (actions-monitor). Cooldown: ${ACTIONS_ALERT_COOLDOWN_HOURS}h per alert type.</p>
    </div>`;

  if (NOTIFICATION_EMAIL) {
    try {
      await sendEmail({
        to: NOTIFICATION_EMAIL,
        subject: `⚠️ [actions-monitor] blog.yml failed ${ACTIONS_RECENT_HARD_FAIL_THRESHOLD}x in a row`,
        html,
        tag: 'actions-monitor',
      });
      result.alert_sent = true;
    } catch (e: any) {
      result.error = `email_send_failed: ${String(e?.message || e).slice(0, 200)}`;
      return result;
    }
  }

  // 6. 写 Supabase log (fire-and-forget,失败不阻断)
  if (SUPABASE_URL && SUPABASE_KEY && result.alert_sent) {
    sb('/cron_alert_log', {
      method: 'POST',
      headers: { 'Prefer': 'return=minimal, resolution=ignore-duplicates' },
      body: JSON.stringify({
        alert_type: 'actions_monitor_failed',
        last_alert_at: new Date().toISOString(),
      }),
    }).catch((e: any) => {
      console.warn('actions-monitor: log write failed:', String(e?.message || e).slice(0, 100));
    });
  }

  return result;
}

async function _internalHandler(req: VercelLikeRequest, res: VercelLikeResponse) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'method_not_allowed' });
  }
  if (!isCronAuthorized(req)) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: 'supabase_not_configured' });
  }

  const tickStart = Date.now();
  try {
    // Phase 1: Nurture emails
    const nurture = await runNurturePhase();

    // Phase 2: WhatsApp (only A grade, only if configured)
    const wa = await runWAPhase();

    // Phase 3: GitHub Actions "Daily GEO Blog" monitor
    // 静默跳过直到配置了 GITHUB_REPO_* env vars
    const actionsMonitor = await runActionsMonitorPhase();

    const summary = {
      ok: true,
      tick_duration_ms: Date.now() - tickStart,
      run_at: new Date().toISOString(),
      nurture,
      whatsapp: wa,
      wa_configured: WHATSAPP_DEFAULTS.ENABLED,
      actions_monitor: actionsMonitor,
    };

    // 高失败率告警
    await sendAlertIfHighFailure('daily-tick/nurture', nurture.processed, nurture.failed, nurture.errors);
    await sendAlertIfHighFailure('daily-tick/whatsapp', wa.processed, wa.failed, wa.errors);

    return res.status(200).json(summary);
  } catch (e: any) {
    console.error('daily-tick fatal:', e);
    return res.status(500).json({ error: 'fatal', message: String(e?.message || e) });
  }
}

export const prerender = false;
const handler = async (req: any, res: any) => { await _internalHandler(req, res); };
export const POST = toAstroApiRoute(handler);
export const GET = toAstroApiRoute(handler);
export const OPTIONS = toAstroApiRoute(handler);
