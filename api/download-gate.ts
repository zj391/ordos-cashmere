/**
 * 下载留资 API（Vercel Function）
 * 用户留资 → 记录 lead → 返回下载链接
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

const N8N_WEBHOOK = process.env.N8N_WEBHOOK_URL;
const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false });
  }

  try {
    const data = (req.body || {}) as Record<string, unknown>;

    if (SUPABASE_URL && SUPABASE_KEY) {
      await fetch(`${SUPABASE_URL}/rest/v1/visitor_events`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_type: 'download_lead',
          event_data: data,
          created_at: new Date().toISOString(),
        }),
      }).catch(err => console.error('Supabase error:', err));
    }

    if (N8N_WEBHOOK) {
      await fetch(N8N_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'download_lead', data }),
      }).catch(err => console.error('n8n error:', err));
    }

    return res.status(200).json({
      success: true,
      downloadUrl: `/downloads/${data.type || 'catalog'}-${data.locale || 'en'}.pdf`,
    });
  } catch (err) {
    return res.status(500).json({ success: false });
  }
}
