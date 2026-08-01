/**
 * /api/chat-to-crm  —  AI 客服对话触发 CRM 入站
 *
 * 设计目标：让 AI 24h 客服聊完一通对话后，自动沉淀客户画像 + 评分 + 邮件流程。
 * 流程：
 *   1. 前端在每条 AI 客服消息结尾，附带一个"软触发"POST 到本 endpoint
 *      （body: { sessionId, email?, company?, country?, intent?, lastUserMessage, lastAssistantMessage, locale, messages[] }）。
 *   2. endpoint 用 LLM 抽取结构化 lead 字段（如果还没在前端发）。
 *   3. 写 Supabase leads 表（enrichment_data JSON + lead_grade A/B/C/D）。
 *   4. 按 grade 触发不同 Resend 邮件模板：
 *        A — sales 直邮 + 内部通知（你本人邮箱）
 *        B — sales 自动回复 + nurture 序列第 1 封
 *        C — 自动感谢 + nurture 序列第 1 封
 *        D — 纯自动回复（不打扰 sales）
 *   5. 同时去 known_customers 表做一次匹配，老客户 grade 直接升 A。
 *
 * 安全 / 性能：
 *   - 同一个 sessionId + email 在 5 分钟内只入库 1 次（去重）。
 *   - email 缺失就只入 leads 但不评分不邮件。
 *   - LLM 抽取失败 → fallback heuristic（看消息里有没有 @ / 公司关键词）。
 *
 * 这是合并到 api/inquiry.ts 之前预留的独立 fn，因为需要独立的鉴权 + cron 接入面。
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY || '';
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || 'arbasgoat@gmail.com';
const FROM_EMAIL = process.env.FROM_EMAIL || 'DONGXIAO Cashmere <noreply@erdosdx.com>';
const LLM_API_URL = process.env.LLM_API_URL || 'https://api.deepseek.com/v1/chat/completions';
const LLM_API_KEY = process.env.LLM_API_KEY || process.env.DEEPSEEK_KEY || '';
const LLM_EXTRACT_URL = process.env.LLM_EXTRACT_URL || LLM_API_URL;
const LLM_EXTRACT_KEY=proces...EXTRACT_KEY || LLM_API_KEY;
const LLM_EXTRACT_MODEL = process.env.LLM_EXTRACT_MODEL || LLM_MODEL;
const SITE_NAME = 'DONGXIAO Cashmere';
const SITE_DOMAIN = 'erdosdx.com';

// 去重：内存里 5 分钟内的同 sessionId+email 只跑一次。Vercel serverless 内存不持久，
// 极端情况下会重复发邮件 — Supabase leads 表 unique (session_id, email) 作为最终兜底。
const RECENT = new Map<string, number>();
const RECENT_TTL_MS = 5 * 60 * 1000;
function dedup(sessionId: string, email: string): boolean {
  const k = `${sessionId}::${email}`;
  const now = Date.now();
  for (const [key, ts] of RECENT.entries()) {
    if (now - ts > RECENT_TTL_MS) RECENT.delete(key);
  }
  if (RECENT.has(k)) return true;
  RECENT.set(k, now);
  return false;
}

interface LeadExtraction {
  email: string | null;
  company: string | null;
  country: string | null;
  product_type: 'raw' | 'yarn' | 'garment' | 'unknown';
  need_sample: boolean;
  need_visit: boolean;
  quantity_kg: number | null;
  quantity_m: number | null;
  quantity_pcs: number | null;
  delivery_window: string | null;
  industry: string | null;
  message_summary: string;
  intent_score: number; // 0-100，LLM 自评
}

async function extractLeadWithLLM(payload: {
  messages: Array<{ role: string; content: string }>;
  locale: string;
  emailHint?: string;
  companyHint?: string;
}): Promise<LeadExtraction> {
  // Heuristic fallback used when LLM is unavailable or returns invalid JSON.
  const fallback: LeadExtraction = {
    email: payload.emailHint || null,
    company: payload.companyHint || null,
    country: null,
    product_type: 'unknown',
    need_sample: false,
    need_visit: false,
    quantity_kg: null,
    quantity_m: null,
    quantity_pcs: null,
    delivery_window: null,
    industry: null,
    message_summary: '',
    intent_score: 0,
  };

  if (!LLM_API_KEY) {
    // very basic keyword-based fallback
    const text = payload.messages.map((m) => m.content).join(' ').toLowerCase();
    fallback.need_sample = /\b(sample|samples|swatch|样)\b/i.test(text);
    fallback.need_visit = /\b(visit|factory tour|参观|考察)\b/i.test(text);
    if (/\b(raw|fiber|dehaired|原料|分梳)\b/i.test(text)) fallback.product_type = 'raw';
    else if (/\b(yarn|纱线)\b/i.test(text)) fallback.product_type = 'yarn';
    else if (/\b(garment|sweater|oem|成衣)\b/i.test(text)) fallback.product_type = 'garment';
    return fallback;
  }

  const sysPrompt = `You extract structured B2B lead fields from a chat transcript between a website visitor and the ${SITE_NAME} AI assistant (erdosdx.com). Output a SINGLE JSON object with these keys (no commentary, no markdown):
{
  "email": string|null,
  "company": string|null,
  "country": string|null (ISO-2 or full name, whichever the user gave),
  "product_type": "raw"|"yarn"|"garment"|"unknown",
  "need_sample": boolean,
  "need_visit": boolean,
  "quantity_kg": number|null,
  "quantity_m": number|null,
  "quantity_pcs": number|null,
  "delivery_window": string|null (e.g. "Q1 2026"),
  "industry": string|null (e.g. "knitwear brand", "trading company", "boutique retailer"),
  "message_summary": string (1-2 sentence summary of what they want, in English regardless of chat language),
  "intent_score": number 0-100 (your estimate of how serious / close-to-purchase this lead is; 0=no intent, 100=ready to send deposit)
}
Rules:
- email/company may already be hinted (see below); prefer the latest user-provided value.
- quantity: only set if explicitly mentioned. raw=fiber in kg, yarn=fabric in m, garment in pcs.
- need_sample: true if user asks for samples, swatches, or hand-looms.
- need_visit: true if user wants to visit the factory, schedule a tour, or asks "can I come".
- intent_score: weight evidence like order size, deadline, certifications requested, "we are an established brand" signals. 50+ is warm, 75+ is hot.`;

  const userHint = [
    payload.emailHint ? `Hint — email already collected by form: ${payload.emailHint}` : '',
    payload.companyHint ? `Hint — company already collected: ${payload.companyHint}` : '',
    `Locale: ${payload.locale}`,
    'Transcript:',
    ...payload.messages.map((m) => `[${m.role}] ${m.content}`),
  ]
    .filter(Boolean)
    .join('\n');

  try {
    const isOpenAiCompat = LLM_EXTRACT_URL.endsWith('/openai') || !/(googleapis|gemini)/.test(LLM_EXTRACT_URL);
    const r = await fetch(LLM_EXTRACT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LLM_EXTRACT_KEY}`,
      },
      body: JSON.stringify({
        model: LLM_EXTRACT_MODEL,
        messages: [
          { role: 'system', content: sysPrompt },
          { role: 'user', content: userHint },
        ],
        temperature: 0.1,
        max_tokens: 700,
        // response_format: { type: 'json_object' } is OpenAI-only.
        // Gemini's OpenAI-compat endpoint rejects it; we rely on prompt-only
        // JSON instruction + defensive parse below instead.
        ...(isOpenAiCompat ? { response_format: { type: 'json_object' } } : {}),
      }),
    });
    if (!r.ok) {
      const t = await r.text().catch(() => '');
      console.error('[chat-to-crm] LLM extract failed', r.status, t.slice(0, 300));
      return fallback;
    }
    const j = await r.json();
    const txt = j?.choices?.[0]?.message?.content || '';
    try {
      const parsed = JSON.parse(txt);
      return {
        email: parsed.email ?? fallback.email,
        company: parsed.company ?? fallback.company,
        country: parsed.country ?? null,
        product_type: ['raw', 'yarn', 'garment'].includes(parsed.product_type) ? parsed.product_type : 'unknown',
        need_sample: Boolean(parsed.need_sample),
        need_visit: Boolean(parsed.need_visit),
        quantity_kg: typeof parsed.quantity_kg === 'number' ? parsed.quantity_kg : null,
        quantity_m: typeof parsed.quantity_m === 'number' ? parsed.quantity_m : null,
        quantity_pcs: typeof parsed.quantity_pcs === 'number' ? parsed.quantity_pcs : null,
        delivery_window: parsed.delivery_window ?? null,
        industry: parsed.industry ?? null,
        message_summary: String(parsed.message_summary || '').slice(0, 600),
        intent_score: clamp(Number(parsed.intent_score) || 0, 0, 100),
      };
    } catch {
      console.error('[chat-to-crm] LLM JSON parse failed', txt.slice(0, 300));
      return fallback;
    }
  } catch (e) {
    console.error('[chat-to-crm] LLM network error', e);
    return fallback;
  }
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function scoreToGrade(intent: number, hasEmail: boolean, hasCompany: boolean, known: boolean): {
  grade: 'A' | 'B' | 'C' | 'D';
  reason: string;
} {
  if (known) return { grade: 'A', reason: 'known_customer' };
  if (!hasEmail) return { grade: 'D', reason: 'no_email' };
  if (intent >= 75) return { grade: 'A', reason: 'high_intent' };
  if (intent >= 50) return { grade: 'B', reason: 'warm_intent' };
  if (intent >= 25) return { grade: 'C', reason: 'curious' };
  return { grade: 'C', reason: 'low_signal' };
}

async function lookupKnownCustomer(email: string | null, company: string | null) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  if (!email && !company) return null;
  const filters: string[] = [];
  if (email) filters.push(`contact_email=eq.${encodeURIComponent(email)}`);
  if (company) filters.push(`company_name=ilike.${encodeURIComponent(company)}`);
  if (!filters.length) return null;
  const url = `${SUPABASE_URL}/rest/v1/known_customers?or=(${filters.join(',')})&select=grade,company_name,contact_name,lifetime_value_usd,total_orders&limit=1`;
  try {
    const r = await fetch(url, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    });
    if (!r.ok) return null;
    const rows = await r.json();
    return Array.isArray(rows) && rows.length ? rows[0] : null;
  } catch {
    return null;
  }
}

async function upsertLead(
  sessionId: string,
  extraction: LeadExtraction,
  grade: 'A' | 'B' | 'C' | 'D',
  known: Record<string, unknown> | null,
  locale: string,
) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  const payload = {
    session_id: sessionId,
    source: 'ai_chat',
    locale,
    email: extraction.email,
    company: extraction.company,
    country: extraction.country,
    industry: extraction.industry,
    product_type: extraction.product_type,
    quantity_kg: extraction.quantity_kg,
    quantity_m: extraction.quantity_m,
    quantity_pcs: extraction.quantity_pcs,
    delivery_window: extraction.delivery_window,
    need_sample: extraction.need_sample,
    need_visit: extraction.need_visit,
    message_summary: extraction.message_summary,
    intent_score: extraction.intent_score,
    lead_grade: grade,
    known_customer: Boolean(known),
    enrichment_data: {
      extraction,
      known_customer: known,
      captured_at: new Date().toISOString(),
    },
    status: 'new',
  };

  // Upsert by (session_id, email). If email is null, just insert (let dedup be best-effort).
  if (extraction.email) {
    const url = `${SUPABASE_URL}/rest/v1/leads?session_id=eq.${encodeURIComponent(sessionId)}&email=eq.${encodeURIComponent(extraction.email)}`;
    const r = await fetch(url, {
      method: 'PATCH',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(payload),
    });
    if (r.ok) {
      const rows = await r.json().catch(() => []);
      return Array.isArray(rows) && rows.length ? rows[0] : null;
    }
    // fallthrough to insert if PATCH affected 0 rows (e.g. RLS)
  }
  const r = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(payload),
  });
  if (!r.ok) {
    console.error('[chat-to-crm] upsert lead failed', r.status, (await r.text()).slice(0, 300));
    return null;
  }
  const rows = await r.json().catch(() => []);
  return Array.isArray(rows) && rows.length ? rows[0] : null;
}

async function sendResend(
  to: string,
  subject: string,
  html: string,
  replyTo?: string,
): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (!RESEND_API_KEY) return { ok: false, error: 'no_resend_key' };
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject,
        html,
        reply_to: replyTo,
      }),
    });
    if (!r.ok) {
      const t = await r.text().catch(() => '');
      return { ok: false, error: `resend_${r.status}: ${t.slice(0, 200)}` };
    }
    const j = await r.json();
    return { ok: true, id: j?.id };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

function gradeEmailSubject(grade: 'A' | 'B' | 'C' | 'D', extraction: LeadExtraction): { subject: string; body: string } {
  const intro = `Hi${extraction.company ? ` ${extraction.company}` : ''},\n\n`;
  const cta = `\n\n— ${SITE_NAME} team\n${SITE_DOMAIN}\nWhatsApp / WeChat available on the site.`;

  if (grade === 'A') {
    return {
      subject: `${extraction.company || 'B2B inquiry'} — your cashmere request, fast reply`,
      body:
        intro +
        `Thanks for the detailed chat. We've flagged your project for direct review by our sales lead — you'll hear back within 1 business day with samples, a tailored quote, and the next-step checklist.\n\n` +
        `Quick summary of what you shared:\n${extraction.message_summary}\n\n` +
        `If you can share your target quantity + delivery window now, we'll send a draft PI today.` +
        cta,
    };
  }
  if (grade === 'B') {
    return {
      subject: `Your cashmere project — samples + quote this week`,
      body:
        intro +
        `Thanks for reaching out via the chat. Based on what you shared (${extraction.product_type === 'unknown' ? 'cashmere supply' : extraction.product_type}), here's what we'll send next:\n` +
        `  • our latest catalog + price sheet\n` +
        `  • sampling options for your product type\n` +
        `  • factory audit documents on request\n\n` +
        `Reply with your target quantity and we can turn this into a draft PI within 48h.` +
        cta,
    };
  }
  if (grade === 'C') {
    return {
      subject: `Cashmere sourcing — quick guide + samples`,
      body:
        intro +
        `Nice to meet you. Since you're in early research, here are 3 things most buyers find useful at this stage:\n` +
        `  1. Our 90-second factory walkthrough (PDF):  https://${SITE_DOMAIN}/en/download\n` +
        `  2. The 8 checks a real factory can pass:  https://${SITE_DOMAIN}/en/factory#audit\n` +
        `  3. Free hand-loom sample: reply with your target product + quantity and we'll ship in 7-15 days.\n\n` +
        `No rush — when you're ready, the chat stays open 24/7.` +
        cta,
    };
  }
  // D — no email to lead (we only notify sales)
  return { subject: '', body: '' };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'method_not_allowed' });
  }
  res.setHeader('Access-Control-Allow-Origin', '*');

  const body = (req.body || {}) as {
    sessionId?: string;
    email?: string;
    company?: string;
    country?: string;
    intent?: string;
    locale?: string;
    messages?: Array<{ role: string; content: string }>;
  };

  const sessionId = (body.sessionId || '').toString().slice(0, 128);
  if (!sessionId) {
    return res.status(400).json({ success: false, error: 'sessionId_required' });
  }
  const email = (body.email || '').toString().trim().toLowerCase().slice(0, 200) || '';
  const locale = (body.locale || 'en').toString().slice(0, 8);

  if (dedup(sessionId, email || 'anon')) {
    return res.status(200).json({ success: true, deduped: true });
  }

  const messages = Array.isArray(body.messages) ? body.messages.slice(-20) : [];

  // 1. LLM 抽取
  const extraction = await extractLeadWithLLM({
    messages,
    locale,
    emailHint: email || undefined,
    companyHint: body.company || undefined,
  });

  // 2. 老客户识别
  const known = await lookupKnownCustomer(extraction.email, extraction.company);

  // 3. 评分
  const { grade, reason } = scoreToGrade(
    extraction.intent_score,
    Boolean(extraction.email),
    Boolean(extraction.company),
    Boolean(known),
  );

  // 4. 入库
  const lead = await upsertLead(sessionId, extraction, grade, known, locale);

  // 5. 邮件
  let emailToLead: { ok: boolean; id?: string; error?: string } | null = null;
  let emailToSales: { ok: boolean; id?: string; error?: string } | null = null;

  if (extraction.email && grade !== 'D') {
    const { subject, body: html } = gradeEmailSubject(grade, extraction);
    emailToLead = await sendResend(extraction.email, subject, html.replace(/\n/g, '<br/>'));
  }

  if (grade === 'A' || grade === 'B' || known) {
    const subject = `[${grade}] ${extraction.company || extraction.email || 'New lead'} — ${extraction.product_type} (intent ${extraction.intent_score})`;
    const html = `<p>New lead captured from AI chat:</p>
<ul>
  <li><b>Grade:</b> ${grade} (${reason})</li>
  <li><b>Email:</b> ${extraction.email || '-'}</li>
  <li><b>Company:</b> ${extraction.company || '-'}</li>
  <li><b>Country:</b> ${extraction.country || '-'}</li>
  <li><b>Industry:</b> ${extraction.industry || '-'}</li>
  <li><b>Product:</b> ${extraction.product_type}</li>
  <li><b>Need sample:</b> ${extraction.need_sample ? 'yes' : 'no'}</li>
  <li><b>Need visit:</b> ${extraction.need_visit ? 'yes' : 'no'}</li>
  <li><b>Intent score:</b> ${extraction.intent_score}</li>
  <li><b>Session:</b> ${sessionId}</li>
</ul>
<p><b>Summary:</b><br>${(extraction.message_summary || '').replace(/</g, '&lt;')}</p>
<p><a href="https://${SITE_DOMAIN}/admin/leads">Open in admin →</a></p>`;
    emailToSales = await sendResend(NOTIFICATION_EMAIL, subject, html, extraction.email || undefined);
  }

  return res.status(200).json({
    success: true,
    lead_id: lead?.id ?? null,
    grade,
    grade_reason: reason,
    email_to_lead: emailToLead,
    email_to_sales: emailToSales,
  });
}
