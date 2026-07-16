/**
 * IndexNow submission helper.
 * https://www.indexnow.org/
 *
 * IndexNow pings Bing, Yandex, DuckDuckGo, Seznam, and Naver all in one POST.
 * Free, no API key required, but the host needs to be verified by an
 * IndexNow key (we host the key at /indexnow-key.txt and submit() embeds it).
 *
 * Usage from a build/SSR hook:
 *   import { submitToIndexNow } from '@/lib/indexnow';
 *   await submitToIndexNow('https://erdosdx.com/en/products/hats-100/');
 *
 * Usage in a GitHub Action cron after publishing a blog post:
 *   node -e "import('./src/lib/indexnow.ts').then(m => m.submitToIndexNow('https://erdosdx.com/en/blog/my-post/'))"
 *
 * Notes:
 * - IndexNow allows up to 10,000 URLs per request.
 * - Returning Promise<void>; the caller can `await` if they want to confirm
 *   the submission succeeded, or fire-and-forget for non-blocking.
 * - On Vercel the function times out at 10s; Bing's IndexNow endpoint
 *   typically responds in 200-500ms so this is safe.
 */

const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
// Key file lives in /public/indexnow-key.txt (Vercel serves it as a static file).
// The key is also embedded here for direct POSTs (Bing validates either path).
const INDEXNOW_KEY = 'erdosdx-indexnow-key-2026';
const HOST = 'erdosdx.com';

interface SubmitResult {
  ok: boolean;
  status?: number;
  body?: string;
  error?: string;
}

export async function submitToIndexNow(
  urlOrUrls: string | string[],
  options: { key?: string; dryRun?: boolean } = {}
): Promise<SubmitResult> {
  const urls = Array.isArray(urlOrUrls) ? urlOrUrls : [urlOrUrls];
  const key = options.key || INDEXNOW_KEY;
  const body = {
    host: HOST,
    key,
    keyLocation: `https://${HOST}/indexnow-key.txt`,
    urlList: urls,
  };

  if (options.dryRun) {
    return { ok: true, body: JSON.stringify(body, null, 2) };
  }

  try {
    const res = await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    // IndexNow returns 200 (queued), 202 (received, will validate), 400 (bad format).
    return { ok: res.ok, status: res.status, body: text };
  } catch (e: any) {
    return { ok: false, error: e?.message || String(e) };
  }
}

/**
 * Convenience: submit the full sitemap (all 3781 URLs) in one shot.
 * Called from a manual `pnpm run submit-indexnow` script.
 */
export async function submitFullSitemap(): Promise<SubmitResult> {
  try {
    const sitemapRes = await fetch(`https://${HOST}/sitemap-index.xml`);
    if (!sitemapRes.ok) {
      return { ok: false, error: `sitemap fetch ${sitemapRes.status}` };
    }
    const sitemapIndex = await sitemapRes.text();
    // Extract child sitemap URLs from sitemap-index.xml
    const childSitemapUrls = Array.from(
      sitemapIndex.matchAll(/<loc>([^<]+sitemap-\d+\.xml)<\/loc>/g),
      (m) => m[1]
    );

    const allUrls: string[] = [];
    for (const child of childSitemapUrls) {
      const r = await fetch(child);
      if (!r.ok) continue;
      const xml = await r.text();
      for (const m of Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g))) {
        allUrls.push(m[1]);
      }
    }
    if (allUrls.length === 0) {
      return { ok: false, error: 'no URLs found in sitemap' };
    }
    // IndexNow accepts up to 10,000 per request — chunk just in case.
    const chunks: string[][] = [];
    for (let i = 0; i < allUrls.length; i += 10000) {
      chunks.push(allUrls.slice(i, i + 10000));
    }
    const results: SubmitResult[] = [];
    for (const chunk of chunks) {
      results.push(await submitToIndexNow(chunk));
    }
    return {
      ok: results.every((r) => r.ok),
      body: `submitted ${allUrls.length} URLs in ${chunks.length} chunk(s); ` +
        `statuses: ${results.map((r) => r.status || r.error).join(', ')}`,
    };
  } catch (e: any) {
    return { ok: false, error: e?.message || String(e) };
  }
}
