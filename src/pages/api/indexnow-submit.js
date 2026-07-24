/**
 * /api/indexnow-submit — POST endpoint to submit URLs to IndexNow.
 *
 * IndexNow (https://www.indexnow.org/) pings Bing, Yandex, DuckDuckGo, Seznam,
 * Naver. The shared key lives at /indexnow-key.txt and is embedded in
 * src/lib/indexnow.ts. Free, no API key, but key must be hosted at
 * `${HOST}/indexnow-key.txt` for validation.
 *
 * Request body (JSON):
 *   { "urls": ["https://www.erdosdx.com/en/products/foo/", ...] }
 *   or omit urls to submit the full sitemap.
 *
 * Optional query param ?full=1 also submits the full sitemap.
 *
 * Auth: simple shared-secret header `x-admin-token` must match env
 * `PUBLIC_ADMIN_TOKEN` if defined, otherwise open (dev only).
 */
import { submitToIndexNow, submitFullSitemap } from '@/lib/indexnow.ts';

export const prerender = false;

export async function POST({ request }) {
  const expected = (typeof process !== 'undefined' && process.env && process.env.PUBLIC_ADMIN_TOKEN) || '';
  if (expected) {
    const got = request.headers.get('x-admin-token') || '';
    if (got !== expected) {
      return new Response(JSON.stringify({ ok: false, error: 'unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  let body = {};
  try {
    const text = await request.text();
    if (text) body = JSON.parse(text);
  } catch {
    // ignore: empty body is OK
  }

  const wantFull = request.url.includes('?full=1') || body.full === true;
  if (wantFull) {
    const result = await submitFullSitemap();
    return new Response(JSON.stringify(result), {
      status: result.ok ? 200 : 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const urls = body.urls || [];
  if (!Array.isArray(urls) || urls.length === 0) {
    return new Response(JSON.stringify({ ok: false, error: 'urls array required (or pass {full:true})' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  if (urls.length > 10000) {
    return new Response(JSON.stringify({ ok: false, error: 'max 10000 urls per request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const result = await submitToIndexNow(urls);
  return new Response(JSON.stringify(result), {
    status: result.ok ? 200 : 500,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function GET() {
  return new Response(JSON.stringify({
    ok: true,
    endpoint: '/api/indexnow-submit',
    usage: {
      'POST {urls:["..."]}': 'submit specific URLs',
      'POST {full:true}': 'submit entire sitemap',
      'POST /api/indexnow-submit?full=1': 'submit entire sitemap (alt)',
    },
    maxUrls: 10000,
    auth: 'x-admin-token header (matches PUBLIC_ADMIN_TOKEN env)',
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
