/**
 * /api/indexnow-submit — POST endpoint to submit URLs to IndexNow.
 *
 * Kept as a thin wrapper that forwards to the Vercel Function at /api/indexnow
 * (defined in api/indexnow.ts at the project root). The previous version
 * imported the shared lib directly, which the Vercel Astro build silently
 * failed to resolve, leaving the endpoint missing from dist/server/.
 *
 * Request body (JSON):
 *   { "urls": ["https://www.erdosdx.com/en/products/foo/", ...] }
 *   or omit urls to submit the full sitemap.
 *
 * Optional query param ?full=1 also submits the full sitemap.
 *
 * Auth: x-admin-token header (matches PUBLIC_ADMIN_TOKEN env) is enforced
 * when set; otherwise open (dev only).
 */
export const prerender = false;

export async function POST({ request }) {
  const expected =
    (typeof process !== 'undefined' && process.env && process.env.PUBLIC_ADMIN_TOKEN) || '';
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
    // empty body is OK
  }

  // Forward to the Vercel Function endpoint. Same-origin fetch on Vercel so
  // we can use the full request URL.
  const url = new URL(request.url);
  const target = `${url.origin}/api/indexnow`;
  const fwd = await fetch(target, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body.urls ? { urls: body.urls } : { all: true }),
  });
  const responseBody = await fwd.text();
  return new Response(responseBody, {
    status: fwd.status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function GET() {
  return new Response(
    JSON.stringify({
      ok: true,
      endpoint: '/api/indexnow-submit',
      usage: {
        'POST {urls:["..."]}': 'submit specific URLs',
        'POST ?full=1': 'submit entire sitemap',
        'POST {all: true}': 'submit entire sitemap',
      },
      maxUrls: 10000,
      auth: 'x-admin-token header (matches PUBLIC_ADMIN_TOKEN env)',
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
