/**
 * IndexNow submission API.
 * POST /api/indexnow  with JSON body { urls: ["https://...", ...] }
 *
 * Use cases:
 *  1. After publishing a new blog post via GH Action, POST the new URL here.
 *  2. Manual: POST { urls: ["https://erdosdx.com/en/products/hats-100/"] }
 *  3. Bulk: POST { all: true } — re-submits the entire sitemap.
 *
 * Curl examples:
 *   curl -X POST -H "Content-Type: application/json" \
 *        -d '{"urls":["https://erdosdx.com/en/blog/foo/"]}' \
 *        https://erdosdx.com/api/indexnow
 *
 *   curl -X POST -H "Content-Type: application/json" \
 *        -d '{"all":true}' \
 *        https://erdosdx.com/api/indexnow
 *
 * The IndexNow key is embedded in the lib helper. Anyone can call this endpoint
 * because the URL list is not secret; if abuse becomes a problem we'll add a
 * shared-secret header.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { submitToIndexNow, submitFullSitemap } from '../src/lib/indexnow';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }
  try {
    const body = (req.body || {}) as { urls?: string[]; all?: boolean };

    if (body.all) {
      const result = await submitFullSitemap();
      return res.status(result.ok ? 200 : 500).json(result);
    }

    if (!body.urls || !Array.isArray(body.urls) || body.urls.length === 0) {
      return res.status(400).json({ ok: false, error: 'missing_urls_or_all' });
    }

    // Sanity check: only allow our own URLs
    const cleaned = body.urls.filter((u) => typeof u === 'string' && u.startsWith('https://erdosdx.com'));
    if (cleaned.length === 0) {
      return res.status(400).json({ ok: false, error: 'no_erdosdx_urls_in_payload' });
    }

    const result = await submitToIndexNow(cleaned);
    return res.status(result.ok ? 200 : 502).json({
      ok: result.ok,
      submitted: cleaned.length,
      status: result.status,
      body: result.body,
      error: result.error,
    });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
}
