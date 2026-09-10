/**
 * Vercel Cron: 每周一 09:00 推一份询盘/lead/sync 运营周报
 *
 * 内容:
 *  1. 上周询盘数量（按 inquiry_type / country 聚合）
 *  2. 上周新 lead（按 grade 分布）
 *  3. nurture 邮件上周发出/打开/点击数（从 lead_activities 聚合）
 *  4. 同步 (LinkedIn/1688/小红书) 上周失败率
 *  5. 当前 7 天内最热门询盘产品
 *
 * 推送:
 *  - Resend 给 NOTIFICATION_EMAIL (HTML 周报)
 *  - 企业微信 WECHAT_WEBHOOK_URL (短摘要)
 *
 * 触发:
 *  vercel.json crons: [{ path: '/api/cron/weekly-report', schedule: '0 9 * * 1' }]
 */

import { toAstroApiRoute, type VercelLikeRequest, type VercelLikeResponse } from '../../../lib/api/vercel-shim';
import { sendEmail } from '../../../lib/email-sender';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '';
const CRON_SECRET=process.env.CRON_SECRET || '';
const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || '';
const WECHAT_WEBHOOK_URL = process.env.WECHAT_WEBHOOK_URL || '';

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

interface InquiryRow {
  id: number;
  created_at: string;
  inquiry_type: string;
  country: string;
  product_interest: string | null;
  lead_grade: string | null;
  status: string;
}

interface LeadRow {
  id: number;
  created_at: string;
  lead_grade: string | null;
  country: string;
  industry: string | null;
}

interface ActivityRow {
  lead_id: number;
  channel: string;
  direction: string;
  status: string;
  campaign: string | null;
  created_at: string;
}

interface SyncLogRow {
  channel: string;
  status: string;
}

function fmtPct(num: number, denom: number): string {
  if (denom === 0) return '0%';
  return `${Math.round((num / denom) * 100)}%`;
}

function bucketBy<T>(arr: T[], keyFn: (t: T) => string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const item of arr) {
    const k = keyFn(item);
    if (!k) continue;
    out[k] = (out[k] || 0) + 1;
  }
  return out;
}

function topN(record: Record<string, number>, n = 5): Array<[string, number]> {
  return Object.entries(record).sort((a, b) => b[1] - a[1]).slice(0, n);
}

function renderHtml(data: {
  generatedAt: string;
  weekStart: string;
  weekEnd: string;
  inquiries: { total: number; byType: Array<[string, number]>; byCountry: Array<[string, number]>; hotProducts: Array<[string, number]> };
  leads: { total: number; byGrade: Record<string, number>; byCountry: Array<[string, number]> };
  emails: { sent: number; failed: number; opened: number; clicked: number; replied: number; openRate: string; clickRate: string; replyRate: string };
  syncs: { total: number; failed: number; failureRate: string; byChannel: Record<string, { ok: number; failed: number }> };
}): string {
  const e = data.emails;
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: Inter, system-ui, 'Helvetica Neue', Arial, sans-serif; line-height: 1.55; color: #1c1917; max-width: 640px; margin: 0 auto; padding: 24px; }
  h1 { font-size: 22px; letter-spacing: -0.01em; font-weight: 600; }
  h2 { font-size: 15px; font-weight: 600; margin-top: 32px; letter-spacing: 0.02em; text-transform: uppercase; color: #57534e; }
  table { border-collapse: collapse; width: 100%; margin-top: 12px; }
  td, th { border-bottom: 1px solid #e7e5e4; padding: 6px 0; text-align: left; font-size: 14px; }
  th { color: #78716c; font-weight: 500; }
  .num { font-variant-numeric: tabular-nums; }
  .big { font-size: 28px; font-weight: 600; letter-spacing: -0.02em; }
  .label { font-size: 12px; color: #78716c; text-transform: uppercase; letter-spacing: 0.04em; }
  .row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 16px; }
</style></head>
<body>
<p style="font-size: 12px; color: #78716c; letter-spacing: 0.04em; text-transform: uppercase;">DONGXIAO Cashmere · Weekly Operations</p>
<h1>上周询盘 & 运营周报</h1>
<p style="color: #57534e; font-size: 14px;">${data.weekStart} → ${data.weekEnd} (UTC+8)<br/>生成于 ${data.generatedAt}</p>

<h2>询盘</h2>
<div class="row">
  <div><div class="big">${data.inquiries.total}</div><div class="label">总询盘</div></div>
  <div></div>
</div>
<p style="margin-top: 12px;"><strong>按类型</strong></p>
<table>${data.inquiries.byType.map(([t, n]) => `<tr><td>${t || '(empty)'}</td><td class="num" style="text-align:right;">${n}</td></tr>`).join('')}</table>
<p style="margin-top: 12px;"><strong>按国家 (Top 5)</strong></p>
<table>${data.inquiries.byCountry.map(([c, n]) => `<tr><td>${c || '(empty)'}</td><td class="num" style="text-align:right;">${n}</td></tr>`).join('')}</table>
<p style="margin-top: 12px;"><strong>热门产品 (Top 5)</strong></p>
<table>${data.inquiries.hotProducts.map(([p, n]) => `<tr><td>${p || '(empty)'}</td><td class="num" style="text-align:right;">${n}</td></tr>`).join('')}</table>

<h2>新 lead</h2>
<div class="row">
  <div><div class="big">${data.leads.total}</div><div class="label">新 lead</div></div>
  <div></div>
</div>
<p style="margin-top: 12px;"><strong>按 grade</strong></p>
<table>${Object.entries(data.leads.byGrade).map(([g, n]) => `<tr><td>${g || '(none)'}</td><td class="num" style="text-align:right;">${n}</td></tr>`).join('')}</table>
<p style="margin-top: 12px;"><strong>按国家 (Top 5)</strong></p>
<table>${data.leads.byCountry.map(([c, n]) => `<tr><td>${c || '(empty)'}</td><td class="num" style="text-align:right;">${n}</td></tr>`).join('')}</table>

<h2>Nurture 邮件序列</h2>
<table>
  <tr><td>已发</td><td class="num" style="text-align:right;">${e.sent}</td></tr>
  <tr><td>失败</td><td class="num" style="text-align:right;">${e.failed}</td></tr>
  <tr><td>打开</td><td class="num" style="text-align:right;">${e.opened} (${e.openRate})</td></tr>
  <tr><td>点击</td><td class="num" style="text-align:right;">${e.clicked} (${e.clickRate})</td></tr>
  <tr><td>回复</td><td class="num" style="text-align:right;">${e.replied} (${e.replyRate})</td></tr>
</table>

<h2>社媒同步</h2>
<table>
  <tr><td>总推送</td><td class="num" style="text-align:right;">${data.syncs.total}</td></tr>
  <tr><td>失败</td><td class="num" style="text-align:right;">${data.syncs.failed} (${data.syncs.failureRate})</td></tr>
</table>
<p style="margin-top: 12px;"><strong>按渠道</strong></p>
<table>
  <tr><th>渠道</th><th style="text-align:right;">成功</th><th style="text-align:right;">失败</th></tr>
  ${Object.entries(data.syncs.byChannel).map(([c, s]) => `<tr><td>${c}</td><td class="num" style="text-align:right;">${s.ok}</td><td class="num" style="text-align:right;">${s.failed}</td></tr>`).join('')}
</table>

<hr style="margin-top: 32px; border: 0; border-top: 1px solid #e7e5e4;">
<p style="font-size: 12px; color: #78716c;">DONGXIAO® Cashmere · Ordos · Since 2002<br/>本邮件由 /api/cron/weekly-report 自动生成</p>
</body>
</html>
  `.trim();
}

function renderWeChatSummary(data: any): string {
  const e = data.emails;
  return `📊 询盘周报 ${data.weekStart} → ${data.weekEnd}

📥 询盘 ${data.inquiries.total} 条
  按类型: ${data.inquiries.byType.slice(0, 3).map((x: any) => `${x[0]}=${x[1]}`).join(' / ')}
  按国家: ${data.inquiries.byCountry.slice(0, 3).map((x: any) => `${x[0]}=${x[1]}`).join(' / ')}

🆕 新 lead ${data.leads.total} (A=${data.leads.byGrade.A || 0} B=${data.leads.byGrade.B || 0} C=${data.leads.byGrade.C || 0})

📧 nurture: 发 ${e.sent} 失败 ${e.failed} 打开率 ${e.openRate} 回复 ${e.replied}

🔗 同步: ${data.syncs.total} 次 (失败 ${data.syncs.failureRate})`;
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

  try {
    const now = new Date();
    const weekEnd = new Date(now);
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // 1. 上周询盘
    const inquiries: InquiryRow[] = await sb(
      `/inquiries?created_at=gte.${weekStart.toISOString()}&order=created_at.desc&limit=500`,
    );

    // 2. 上周新 lead
    const leads: LeadRow[] = await sb(
      `/leads?created_at=gte.${weekStart.toISOString()}&order=created_at.desc&limit=500`,
    );

    // 3. 上周 nurture 邮件
    const activities: ActivityRow[] = await sb(
      `/lead_activities?created_at=gte.${weekStart.toISOString()}&channel=eq.email&limit=2000`,
    );

    // 4. 同步 — 从 sync_logs 表聚合上周推送统计 (阶段 1.5)
    const syncStats: SyncLogRow[] = await sb(
      `/sync_logs?created_at=gte.${weekStart.toISOString()}&select=channel,status&limit=5000`,
    );
    const syncs: { total: number; failed: number; failureRate: string; byChannel: Record<string, { ok: number; failed: number }> } = (() => {
      const byChannel: Record<string, { ok: number; failed: number }> = { linkedin: { ok: 0, failed: 0 }, alibaba: { ok: 0, failed: 0 }, xiaohongshu: { ok: 0, failed: 0 } };
      let total = 0;
      let failed = 0;
      for (const row of syncStats) {
        const ch = row.channel;
        const st = row.status;
        if (!byChannel[ch]) byChannel[ch] = { ok: 0, failed: 0 };
        // 计入 'pushed' 和 'manual_ready' 都算 ok；'error' 算 failed；'skipped' 不计入 (env 没配不算失败)
        if (st === 'pushed' || st === 'manual_ready') {
          byChannel[ch].ok += 1;
          total += 1;
        } else if (st === 'error') {
          byChannel[ch].failed += 1;
          total += 1;
          failed += 1;
        }
      }
      return {
        total,
        failed,
        failureRate: total === 0 ? 'N/A' : `${Math.round((failed / total) * 100)}%`,
        byChannel,
      };
    })();

    // 聚合
    const inquiriesByType = bucketBy(inquiries, (i) => i.inquiry_type);
    const inquiriesByCountry = bucketBy(inquiries, (i) => i.country);
    const inquiriesByProduct = bucketBy(inquiries, (i) => i.product_interest || '');
    const leadsByGrade = bucketBy(leads, (l) => l.lead_grade || '');
    const leadsByCountry = bucketBy(leads, (l) => l.country);

    const emailsSent = activities.filter(a => a.direction === 'out' && a.status === 'sent').length;
    const emailsFailed = activities.filter(a => a.direction === 'out' && a.status === 'failed').length;
    const emailsOpened = activities.filter(a => a.status === 'opened').length;
    const emailsClicked = activities.filter(a => a.status === 'clicked').length;
    const emailsReplied = activities.filter(a => a.direction === 'in' && a.status === 'replied').length;

    const data = {
      generatedAt: now.toISOString(),
      weekStart: weekStart.toISOString().slice(0, 10),
      weekEnd: weekEnd.toISOString().slice(0, 10),
      inquiries: {
        total: inquiries.length,
        byType: topN(inquiriesByType),
        byCountry: topN(inquiriesByCountry, 5),
        hotProducts: topN(inquiriesByProduct, 5),
      },
      leads: {
        total: leads.length,
        byGrade: leadsByGrade,
        byCountry: topN(leadsByCountry, 5),
      },
      emails: {
        sent: emailsSent,
        failed: emailsFailed,
        opened: emailsOpened,
        clicked: emailsClicked,
        replied: emailsReplied,
        openRate: fmtPct(emailsOpened, emailsSent),
        clickRate: fmtPct(emailsClicked, emailsSent),
        replyRate: fmtPct(emailsReplied, emailsSent),
      },
      syncs,
    };

    const html = renderHtml(data);
    const wechatMsg = renderWeChatSummary(data);

    let emailSent = false;
    let wechatSent = false;
    let emailError: string | null = null;

    if (NOTIFICATION_EMAIL) {
      const r = await sendEmail({
        to: NOTIFICATION_EMAIL,
        subject: `📊 询盘周报 ${data.weekStart} → ${data.weekEnd} (${data.inquiries.total} 询盘 / ${data.leads.total} 新 lead)`,
        html,
        tag: 'weekly-report',
      });
      emailSent = r.ok;
      if (!r.ok) emailError = r.error || null;
    }

    if (WECHAT_WEBHOOK_URL) {
      try {
        const wechatRes = await fetch(WECHAT_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ msgtype: 'text', text: { content: wechatMsg } }),
        });
        wechatSent = wechatRes.ok;
      } catch (e) {
        // 失败不阻塞
      }
    }

    return res.status(200).json({
      ok: true,
      summary: {
        inquiries_total: data.inquiries.total,
        leads_total: data.leads.total,
        emails_sent: data.emails.sent,
        emails_failed: data.emails.failed,
        syncs_failed: data.syncs.failed,
      },
      channels: {
        email_sent: emailSent,
        email_error: emailError,
        wechat_sent: wechatSent,
      },
      generated_at: data.generatedAt,
    });
  } catch (e: any) {
    console.error('weekly-report fatal:', e);
    return res.status(500).json({ error: 'fatal', message: String(e?.message || e) });
  }
}

export const prerender = false;
const handler = async (req: any, res: any) => { await _internalHandler(req, res); };
export const POST = toAstroApiRoute(handler);
export const GET = toAstroApiRoute(handler);
export const OPTIONS = toAstroApiRoute(handler);
