/**
 * Resend email sender — single canonical entry point.
 *
 * 抽出原因 (2026-09-10):
 *   阶段 1 询盘自动化需要 cron 调度器调用 Resend 发 nurture 邮件,
 *   原 sendEmail() 是 src/pages/api/inquiry.ts 文件内私有函数,
 *   抽到 lib 共享给 inquiry.ts / cron/nurture-tick / cron/weekly-report.
 *
 * 设计原则:
 *   - 不返回 Web Response,返回结构化 {ok, id?, error?}
 *   - failure 抛错而非吞掉(让调用方决定 fire-and-forget 还是阻塞)
 *   - attachment 接受 dataUrl (data:<mime>;base64,<payload>) — 自动剥前缀
 *
 * 调用示例:
 *   import { sendEmail } from '../../lib/email-sender';
 *   const r = await sendEmail({ to, subject, html, tag: 'nurture-day7' });
 *   if (!r.ok) console.error('send failed:', r.error);
 */

export interface SendEmailAttachment {
  name: string;
  type: string;
  dataUrl: string;
}

export interface SendEmailPayload {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  tag?: string;
  attachments?: SendEmailAttachment[];
}

export interface SendEmailResult {
  ok: boolean;
  id?: string;
  error?: string;
}

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const GMAIL_USER = process.env.GMAIL_USER || '';
const FROM_EMAIL = process.env.FROM_EMAIL || (GMAIL_USER ? `DONGXIAO Cashmere <${GMAIL_USER}>` : 'sales@erdosdx.com');
const REPLY_TO = process.env.REPLY_TO || 'dongxiaocashmere@erdosdx.com';

export async function sendEmail(payload: SendEmailPayload): Promise<SendEmailResult> {
  if (!RESEND_API_KEY) return { ok: false, error: 'no_api_key' };
  try {
    const resendAttachments = (payload.attachments || []).map((a) => {
      const base64 = a.dataUrl.includes('base64,')
        ? a.dataUrl.split('base64,')[1]
        : a.dataUrl;
      return { filename: a.name, content: base64 };
    });
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
        attachments: resendAttachments.length > 0 ? resendAttachments : undefined,
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
    return { ok: false, error: String(e?.message || e) };
  }
}

export const EMAIL_DEFAULTS = {
  FROM_EMAIL,
  REPLY_TO,
  HAS_RESEND: !!RESEND_API_KEY,
};
