/**
 * 原料批量询盘 endpoint
 * POST /api/inquiry/raw
 * 流程：IP/UA 识别 → Supabase 存档 → n8n 转发 → Hermes 双向同步
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const N8N_URL = process.env.N8N_WEBHOOK_URL;
const HERMES_URL = process.env.HERMES_API_URL;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'method_not_allowed' });
  }

  try {
    const data = (req.body || {}) as Record<string, unknown>;
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket?.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';
    const country = req.headers['x-vercel-ip-country'] || req.headers['cf-ipcountry'] || 'unknown';

    const lead = {
      ...data,
      ip,
      country,
      user_agent: userAgent,
      inquiry_type: 'raw_material',
      source: 'product_page_raw_material',
      created_at: new Date().toISOString(),
    };

    const tasks: Promise<unknown>[] = [];

    if (SUPABASE_URL && SUPABASE_KEY) {
      tasks.push(
        fetch(`${SUPABASE_URL}/rest/v1/inquiries`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(lead),
        }).catch(() => null),
      );
    }

    if (N8N_URL) {
      tasks.push(
        fetch(N8N_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(lead),
        }).catch(() => null),
      );
    }

    if (HERMES_URL) {
      tasks.push(
        fetch(`${HERMES_URL}/inquiry`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(lead),
        }).catch(() => null),
      );
    }

    await Promise.allSettled(tasks);

    return res.status(200).json({
      success: true,
      inquiry_type: 'raw_material',
      archived_to: ['supabase', 'n8n', 'hermes'].filter((t) => {
        if (t === 'supabase') return !!(SUPABASE_URL && SUPABASE_KEY);
        if (t === 'n8n') return !!N8N_URL;
        if (t === 'hermes') return !!HERMES_URL;
        return false;
      }),
    });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'internal_error' });
  }
}
