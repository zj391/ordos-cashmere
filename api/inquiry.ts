/**
 * 通用询盘提交 API（Vercel Function）
 * W4 任务：完整数据流
 * 1. 写入 Supabase inquiries
 * 2. 老客户识别（known_customers）
 * 3. 自动英文回执邮件（Resend）
 * 4. 触发 n8n workflow（lead 分层、AI 客服启动）
 * 5. 推送 Hermes 私有化系统
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { renderCustomerEmail } from './email-templates';

const N8N_WEBHOOK = process.env.N8N_WEBHOOK_URL;
const HERMES_INBOUND_TOKEN=process.env.HERMES_INBOUND_TOKEN || '';
const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
// Gmail SMTP (inquiry confirmations + internal notifications)
const GMAIL_USER = process.env.GMAIL_USER || '';
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || '';
const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || GMAIL_USER;
const FROM_EMAIL = process.env.FROM_EMAIL || (GMAIL_USER ? `DONGXIAO Cashmere <${GMAIL_USER}>` : 'sales@erdosdx.com');
const REPLY_TO = process.env.REPLY_TO || 'dongxiaocashmere@erdosdx.com';
const WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER || '+861****3999';
const WECHAT_ID = process.env.WECHAT_ID || 'dongxiaocashmere';

interface InquiryPayload {
  type: 'raw' | 'yarn' | 'garment';
  locale: string;
  name: string;
  company: string;
  country: string;
  email: string;
  phone?: string;
  quantity?: string;
  delivery_date?: string;       // 期望交期
  message?: string;
  attachments?: Array<{ name: string; type: string; dataUrl: string }>;  // base64 inline
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  referrer?: string;
  ga_client_id?: string;
}

const INQUIRY_TYPE_MAP = {
  raw: 'raw_material',
  yarn: 'yarn_fabric',
  garment: 'garment_oem',
} as const;
async function sendEmail(payload: { to: string; subject: string; html: string; replyTo?: string; tag?: string }): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (!RESEND_API_KEY) return { ok: false, error: 'no_api_key' };
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        reply_to: payload.replyTo || REPLY_TO,
        tags: payload.tag ? [{ name: 'category', value: payload.tag }] : undefined,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error('Resend error:', res.status, err);
      return { ok: false, error: err };
    }
    const data = await res.json();
    return { ok: true, id: data.id };
  } catch (e: any) {
    console.error('sendEmail exception:', e);
    return { ok: false, error: String(e) };
  }
}



async function lookupKnownCustomer(email: string, company: string) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  try {
    const url = `${SUPABASE_URL}/rest/v1/known_customers?or=(contact_email.eq.${encodeURIComponent(email)},company_name.eq.${encodeURIComponent(company)})&limit=1`;
    const res = await fetch(url, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.[0] || null;
  } catch {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const data = (req.body || {}) as InquiryPayload;
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket?.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';
    const country = req.headers['x-vercel-ip-country'] || 'unknown';

    // 解析 quantity（兼容数字和字符串 — 前端可能两种都发）
    const qty = data.quantity != null
      ? parseFloat(String(data.quantity).replace(/[^0-9.]/g, '')) || null
      : null;

    const inquiryType = INQUIRY_TYPE_MAP[data.type];

    // 1. 老客户识别
    const known = await lookupKnownCustomer(data.email, data.company);

    // 2. 写入 inquiries
    let inquiryId: number | null = null;
    if (SUPABASE_URL && SUPABASE_KEY) {
      const inquiryPayload = {
        inquiry_type: inquiryType,
        locale: data.locale,
        utm_source: data.utm_source,
        utm_medium: data.utm_medium,
        utm_campaign: data.utm_campaign,
        referrer: data.referrer,
        ga_client_id: data.ga_client_id,
        contact_name: data.name,
        company_name: data.company,
        country: data.country,
        email: data.email,
        phone: data.phone,
        product_interest: inquiryType,
        quantity_kg: inquiryType === 'raw_material' ? qty : null,
        quantity_m: inquiryType === 'yarn_fabric' ? qty : null,
        quantity_pcs: inquiryType === 'garment_oem' ? qty : null,
        message: data.message,
        lead_grade: known ? 'A' : null,
        status: 'new',
        ip_address: ip,
        user_agent: userAgent,
      };

      const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/inquiries?select=id`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(inquiryPayload),
      });

      if (insertRes.ok) {
        const inserted = await insertRes.json();
        inquiryId = inserted?.[0]?.id || null;
      }
    }

    // 2.5 同步 leads 表 + AI 评分
    {
      const protocol = (req.headers && (req.headers["x-forwarded-proto"] || "https")) || "https";
      const host = (req.headers && (req.headers["x-forwarded-host"] || req.headers.host)) || "erdosdx.com";
      fetch(protocol + "://" + host + "/api/sync-inquiry-to-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          contact_name: data.name,
          company_name: data.company,
          country: country,
          phone: data.phone,
          inquiry_id: inquiryId,
          industry: "unknown",
          company_size: "unknown",
          job_title: data.job_title,
          source: "inbound_inquiry",
          source_detail: "inquiry_form_" + (data.inquiry_type || "unknown"),
          quantity: data.quantity,
          message: data.message,
        }),
      }).catch((err) => console.error("sync-inquiry-to-lead error:", err));
    }

    // 3. 触发 n8n（lead 分层、AI 客服启动、风控检查）
    if (N8N_WEBHOOK) {
      fetch(N8N_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'inquiry_submitted',
          data: {
            ...data,
            inquiry_id: inquiryId,
            known_customer: !!known,
            known_customer_grade: known?.grade,
            ip,
            country,
            user_agent: userAgent,
          },
        }),
      }).catch(err => console.error('n8n error:', err));
    }

    // 4. 推送 Hermes 接收端（Vercel 同项目 /api/hermes-inbound；不需公网穿透）
    {
      const hermesPayload = {
        source: 'website',
        event: 'inquiry',
        data: { ...data, inquiry_id: inquiryId, known_customer: known },
      };
      const hermesHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
      if (HERMES_INBOUND_TOKEN) hermesHeaders['X-Hermes-Token'] = HERMES_INBOUND_TOKEN;
      fetch('https://www.erdosdx.com/api/hermes-inbound', {
        method: 'POST',
        headers: hermesHeaders,
        body: JSON.stringify(hermesPayload),
      }).catch(err => console.error('Hermes error:', err));
    }

    // 5. 自动回执邮件（如果配置了 Resend）
    const reply = renderCustomerEmail(data.locale, data);
    const customerEmailResult = sendEmail({ to: data.email, ...reply, tag: 'inquiry-reply' })
      .catch(err => { console.error('Email error:', err); return { ok: false, error: String(err) }; });
    const internalEmailResult = sendEmail({
      to: NOTIFICATION_EMAIL,
      replyTo: data.email,
      tag: 'internal-notification',
      subject: `[New Inquiry] ${data.company} (${data.country}) - ${inquiryType}`,
      html: `
        <h2>New Inquiry Received</h2>
        <p><strong>Type:</strong> ${inquiryType}</p>
        <p><strong>Company:</strong> ${data.company}</p>
        <p><strong>Contact:</strong> ${data.name} &lt;${data.email}&gt;</p>
        <p><strong>Country:</strong> ${data.country}</p>
        <p><strong>Phone:</strong> ${data.phone || 'N/A'}</p>
        <p><strong>Quantity:</strong> ${data.quantity || 'N/A'}</p>
        <p><strong>Known customer:</strong> ${known ? `Yes (${known.grade})` : 'No'}</p>
        <p><strong>Message:</strong> ${data.message || 'N/A'}</p>
        <p><strong>Locale:</strong> ${data.locale}</p>
        <p><strong>Inquiry ID:</strong> ${inquiryId}</p>
      `,
    }).catch(err => { console.error('Internal email error:', err); return { ok: false, error: String(err) }; });



    const customerEmail = await customerEmailResult;
    const internalEmail = await internalEmailResult;
    return res.status(200).json({
      success: true,
      inquiry_id: inquiryId,
      known_customer: !!known,
      emails: {
        customer_reply: { sent: customerEmail.ok, id: customerEmail.id, error: customerEmail.error },
        internal_notification: { sent: internalEmail.ok, id: internalEmail.id, error: internalEmail.error },
      },
    });
  } catch (err) {
    console.error('Inquiry error:', err);
    return res.status(500).json({ success: false, error: String(err) });
  }
}
