/**
 * GA4 事件代理 + IP 识别 + 访客画像（Vercel Function）
 * 客户端 fetch /api/track-event → 写入 Supabase + 转发 n8n
 *
 * 支持的事件：
 * - page_view: 页面浏览（含 locale / path / referrer / title）
 * - dwell_tick: 15s 心跳（含 dwell_seconds）
 * - page_unload: 离开页（含最终 dwell_seconds）
 * - scroll_depth: 滚动深度（25/50/75/100%）
 * - whatsapp_click / wechat_click: 双按钮点击（GA4 端独立事件，这里做归档）
 * - inquiry_submit / contact_submit: 表单提交（带 product_type / inquiry_type）
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const N8N_URL = process.env.N8N_WEBHOOK_URL;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false });
  }

  try {
    const data = (req.body || {}) as Record<string, unknown>;
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket?.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';
    // Vercel 自动注入真实 IP 国家 header（CDN 边缘识别，比 navigator.language 准）
    const country = (req.headers['x-vercel-ip-country'] as string) || (req.headers['cf-ipcountry'] as string) || 'unknown';
    const city = (req.headers['x-vercel-ip-city'] as string) || (req.headers['cf-ipcity'] as string) || '';
    const region = (req.headers['x-vercel-ip-country-region'] as string) || '';

    const event = {
      ...data,
      ip,
      country,
      city,
      region,
      user_agent: userAgent,
      created_at: new Date().toISOString(),
    };

    const tasks: Promise<unknown>[] = [];

    if (SUPABASE_URL && SUPABASE_KEY) {
      // 表名 visitor_events（如不存在见 supabase/migrations/0001_init.sql）
      tasks.push(
        fetch(`${SUPABASE_URL}/rest/v1/visitor_events`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        }).catch(() => null),
      );
    }

    // 询盘提交事件转发到 n8n（让 Hermes 流水线收到）
    if (N8N_URL && (data.event_name === 'inquiry_submit' || data.event_name === 'contact_submit')) {
      tasks.push(
        fetch(N8N_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event),
        }).catch(() => null),
      );
    }

    await Promise.allSettled(tasks);

    return res.status(200).json({ success: true });
  } catch {
    return res.status(500).json({ success: false });
  }
}
