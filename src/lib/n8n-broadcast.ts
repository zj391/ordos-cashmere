/**
 * n8n event broadcaster — 让 zj 在 n8n workflow 可视化界面看到完整 lead lifecycle
 *
 * 阶段 6 P0 (2026-09-10): 统一事件推送层
 *
 * 设计:
 *   - 各 webhook / cron 调用 broadcast(event, data)
 *   - 自动注入 IP / UA / 时间戳 metadata
 *   - 失败静默 (fire-and-forget) — n8n 挂了不影响主流程
 *   - 不阻塞 HTTP 响应
 *
 * 事件清单 (zj 可以在 n8n 里画对应 workflow):
 *   inquiry_submitted         - 询盘表单提交 (inquiry.ts 已对接)
 *   inquiry_contact_submitted - contact 页面提交 (inquiry.ts ?action=event)
 *   lead_replied              - 客户回信 (resend-inbound)
 *   lead_unsubscribed         - 客户 STOP 退订 (resend-inbound / wa-inbound)
 *   lead_wa_replied           - 客户 WhatsApp 回复 (wa-inbound)
 *   nurture_email_sent        - nurture 邮件发出 (daily-tick)
 *   nurture_email_failed      - nurture 邮件失败 (daily-tick)
 *   nurture_wa_sent           - WhatsApp 触达发出 (daily-tick)
 *   email_opened              - 邮件打开 (resend-events)
 *   email_clicked             - 邮件点击 (resend-events)
 *   email_bounced             - 邮件退回 (resend-events)
 *   email_complained          - 邮件投诉 (resend-events)
 *
 * 行为:
 *   - fetch N8N_WEBHOOK_URL (主 url)
 *   - 也 fetch N8N_WEBHOOK_EVENTS_URL (可选, 事件专用 url, 跟主 url 分流)
 *     适合主 n8n workflow 处理 inquiry, 事件专用 n8n 处理 lead lifecycle
 */

const N8N_MAIN = process.env.N8N_WEBHOOK_URL || '';
const N8N_EVENTS = process.env.N8N_WEBHOOK_EVENTS_URL || '';
const N8N_ENABLED = !!(N8N_MAIN || N8N_EVENTS);

export interface BroadcastEvent {
  event: string;
  data: Record<string, any>;
  /** 来源标识, 用于 n8n workflow 路由 */
  source?: string;
}

/**
 * Fire-and-forget n8n 推送
 * - 不抛异常
 * - 不阻塞调用方
 * - 多个 url 串行 push (主 url + events url)
 */
export function broadcast(event: BroadcastEvent): void {
  if (!N8N_ENABLED) return;

  const payload = {
    ...event,
    source: event.source || 'ordos-cashmere',
    received_at: new Date().toISOString(),
  };

  if (N8N_MAIN) {
    fetch(N8N_MAIN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(err => console.error('[n8n-broadcast] main error:', err?.message || err));
  }

  if (N8N_EVENTS && N8N_EVENTS !== N8N_MAIN) {
    fetch(N8N_EVENTS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(err => console.error('[n8n-broadcast] events error:', err?.message || err));
  }
}

export const N8N_BROADCAST_ENABLED = N8N_ENABLED;
