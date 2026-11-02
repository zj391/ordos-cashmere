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
import { toAstroApiRoute, type VercelLikeRequest, type VercelLikeResponse } from '../../lib/api/vercel-shim';
import { submitToIndexNow, submitFullSitemap } from '../../lib/indexnow.js';

async function _internalHandler(req: VercelLikeRequest, res: VercelLikeResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }
  try {
    const body = (req.body || {}) as { urls?: string[]; all?: boolean };

    // 2026-11-02: the admin panel posts to /api/indexnow?full=1, so the
    // query flag has to be honoured as well as the body's "all".
    const wantsFull = body.all === true || req.query?.full === '1' || req.query?.full === 'true';

    if (wantsFull) {
      const result = await submitFullSitemap();
      return res.status(result.ok ? 200 : 500).json(result);
    }

    if (!body.urls || !Array.isArray(body.urls) || body.urls.length === 0) {
      return res.status(400).json({ ok: false, error: 'missing_urls_or_all' });
    }

    // Sanity check: only allow our own URLs.
    // 2026-11-02: this checked for "https://erdosdx.com" (no www), but the
    // canonical host is www.erdosdx.com - Vercel 308-redirects the apex to
    // www, and every URL on the site uses www. So every correctly-formed
    // submission was rejected with no_erdosdx_urls_in_payload and the
    // endpoint had never actually pushed anything. Both hosts are accepted
    // now; the apex is normalised to www before it goes out, because
    // IndexNow validates the submitted URL against the key's host.
    const cleaned = body.urls
      .filter((u) => typeof u === 'string' && /^https:\/\/(www\.)?erdosdx\.com\//.test(u))
      .map((u) => u.replace(/^https:\/\/erdosdx\.com\//, 'https://www.erdosdx.com/'));
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


export const prerender = false;
const handler = async (req: any, res: any) => { await _internalHandler(req, res); };
export const POST = toAstroApiRoute(handler);
export const OPTIONS = toAstroApiRoute(handler);
