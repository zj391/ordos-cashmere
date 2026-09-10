/**
 * WhatsApp Cloud API sender (Meta direct integration).
 *
 * 阶段 1.5 (2026-09-10): A 级 lead 3 天后未回邮件 → 自动 WhatsApp 触达。
 *
 * 选型说明:
 *   - 直接调 Meta Cloud API (graph.facebook.com),不绕 Twilio/WATI
 *   - 理由: B2B 月均 <100 conversation,直连最便宜 (~$0.04/条 marketing conversation)
 *   - 必须用 Meta 预审通过的 template (24h 客户窗口外只能发 template,不能发自由文本)
 *
 * zj 申请流程:
 *   1. 注册 Meta Business Account (https://business.facebook.com)
 *   2. 在 business.facebook.com → Settings → WhatsApp Manager 申请 API 接入
 *   3. 拿到 Phone Number ID + WhatsApp Business Account ID
 *   4. 在 Meta Business Suite → System Users 建一个 token,勾选 whatsapp_business_messaging 权限
 *   5. 把 Phone Number ID + WABA ID + System User Access Token 配到 Vercel env
 *   6. 在 Meta 创建一个名为 'cashmere_day3_followup' 的 template (审批 1-3 天)
 *
 * 设计权衡:
 *   - phone 格式必须是 E.164 (e.g. +8615661853999) — Meta 要求
 *   - 失败不抛异常,返回 {ok, error} 让 cron 决定是否告警
 *   - 单条 message 出错也不影响 cron 整体 (已在 cron 层用 try/catch 包)
 *
 * 调用示例:
 *   import { sendWhatsAppTemplate } from '../../lib/whatsapp-sender';
 *   const r = await sendWhatsAppTemplate({
 *     phone: '+8615661853999',
 *     templateName: 'cashmere_day3_followup',
 *     templateParams: ['John', 'DONGXIAO Cashmere', 'erin:erfdsfdsf'],
 *     leadId: 123,
 *     campaign: 'wa_nurture_day3_followup',
 *   });
 *   if (!r.ok) console.error('WA send failed:', r.error);
 */

const WA_PHONE_NUMBER_ID = process.env.WA_PHONE_NUMBER_ID || '';
const WA_ACCESS_TOKEN = process.env.WA_ACCESS_TOKEN || '';
const WA_API_VERSION = process.env.WA_API_VERSION || 'v20.0';
const WA_ENABLED = !!(WA_PHONE_NUMBER_ID && WA_ACCESS_TOKEN);

export interface SendWhatsAppPayload {
  phone: string;                 // E.164: +8615661853999
  templateName: string;          // 'cashmere_day3_followup'
  templateParams: string[];      // 按 template 顺序填的变量
  templateLanguage?: string;     // 默认 'en_US'
  leadId?: number;
  campaign?: string;
}

export interface SendWhatsAppResult {
  ok: boolean;
  messageId?: string;
  error?: string;
  errorCode?: string;
}

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '';

function normalizePhone(phone: string): string | null {
  // 接受 '15661853999', '8615661853999', '+8615661853999' — 输出 '+8615661853999'
  const digits = phone.replace(/[^0-9]/g, '');
  if (!digits) return null;
  // 如果是中国号码 (11 位 1开头) 或带 86 前缀
  let normalized: string;
  if (digits.length === 11 && digits.startsWith('1')) {
    normalized = '+86' + digits;
  } else if (digits.length === 13 && digits.startsWith('86')) {
    normalized = '+' + digits;
  } else if (digits.startsWith('+')) {
    normalized = '+' + digits;
  } else {
    normalized = '+' + digits;
  }
  // 基本 E.164 校验: + 1-15 位数字
  if (!/^\+[1-9]\d{7,14}$/.test(normalized)) return null;
  return normalized;
}

/**
 * Fire-and-forget 写 wa_send_log (outbound)
 */
async function _logOutbound(
  phone: string,
  templateName: string,
  templateParams: string[],
  body: string,
  status: 'sent' | 'failed',
  result: { waMessageId?: string; error?: string; errorCode?: string },
  leadId?: number,
  campaign?: string,
): Promise<void> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return;
  const row = {
    lead_id: leadId || null,
    phone,
    direction: 'out',
    template_name: templateName,
    template_vars: templateParams,
    body,
    status,
    wa_message_id: result.waMessageId || null,
    error_message: result.error || null,
    error_code: result.errorCode || null,
    campaign: campaign || null,
    triggered_by: 'cron:wa-tick',
  };
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/wa_send_log`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify(row),
    });
  } catch (e) {
    console.error('[wa-sender] log write failed (non-blocking):', e);
  }
}

export async function sendWhatsAppTemplate(payload: SendWhatsAppPayload): Promise<SendWhatsAppResult> {
  if (!WA_ENABLED) {
    return { ok: false, error: 'whatsapp_not_configured', errorCode: 'env_missing' };
  }

  const phone = normalizePhone(payload.phone);
  if (!phone) {
    return { ok: false, error: 'invalid_phone_format', errorCode: 'phone_e164' };
  }

  const language = payload.templateLanguage || 'en_US';
  const templateComponents = payload.templateParams.length > 0
    ? [{ type: 'body', parameters: payload.templateParams.map(p => ({ type: 'text', text: String(p) })) }]
    : [];

  const body = {
    messaging_product: 'whatsapp',
    to: phone,
    type: 'template',
    template: {
      name: payload.templateName,
      language: { code: language },
      components: templateComponents,
    },
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/${WA_API_VERSION}/${WA_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WA_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      },
    );

    if (!res.ok) {
      const errText = await res.text();
      let errorCode = 'api_error';
      let errorMsg = errText;
      try {
        const parsed = JSON.parse(errText);
        if (parsed.error) {
          errorCode = String(parsed.error.code || parsed.error.type || 'api_error');
          errorMsg = parsed.error.message || errText;
        }
      } catch {
        // ignore parse error
      }
      await _logOutbound(phone, payload.templateName, payload.templateParams,
        payload.templateParams.join(' | '), 'failed',
        { error: errorMsg, errorCode }, payload.leadId, payload.campaign);
      return { ok: false, error: errorMsg, errorCode };
    }

    const data = await res.json();
    const messageId = data.messages?.[0]?.id;
    await _logOutbound(phone, payload.templateName, payload.templateParams,
      payload.templateParams.join(' | '), 'sent',
      { waMessageId: messageId }, payload.leadId, payload.campaign);

    return { ok: true, messageId };
  } catch (e: any) {
    const err = String(e?.message || e);
    await _logOutbound(phone, payload.templateName, payload.templateParams,
      payload.templateParams.join(' | '), 'failed',
      { error: err }, payload.leadId, payload.campaign);
    return { ok: false, error: err, errorCode: 'network' };
  }
}

export const WHATSAPP_DEFAULTS = {
  ENABLED: WA_ENABLED,
  PHONE_NUMBER_ID_SET: !!WA_PHONE_NUMBER_ID,
  ACCESS_TOKEN_SET: !!WA_ACCESS_TOKEN,
};
