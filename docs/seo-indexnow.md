# IndexNow — Operator Runbook

IndexNow pings Bing, Yandex, DuckDuckGo, Seznam, and Naver in one POST.
Free, no API key. IndexNow is the fastest way to get new/updated pages into
Bing and Yandex (Google still uses its own crawlers, so IndexNow is a
**supplement** to GSC, not a replacement).

## Setup status (as of 2026-07-24)

- Key file live at `public/indexnow-key.txt` (content: `erdosdx-indexnow-key-2026`)
- Helper module at `src/lib/indexnow.ts` (`submitToIndexNow`, `submitFullSitemap`)
- API endpoint at `POST /api/indexnow-submit` (see src/pages/api/indexnow-submit.js)
- Admin panel button at `/admin/` (IndexNow Submit card)

## When to submit

- After publishing a new blog post
- After adding a new product
- After a bulk content update (use "Submit full sitemap")
- After fixing redirect chains / fixing 404s that mattered
- NOT needed for every page edit — IndexNow is best for new content, not tweaks

## How to submit

### Option 1: Admin panel (recommended for non-technical users)

1. Visit `https://www.erdosdx.com/admin/`
2. Find the "IndexNow Submit" card
3. Click "Submit full sitemap" - all ~3,800 URLs go in one shot
   OR click "Submit specific URLs", paste one URL per line, click "Submit"
4. The result box shows the HTTP status + JSON response from the API
   - 200/202 = success (queued or received)
   - 400 = bad request (check URL format)
   - 401 = needs `x-admin-token` header (set `PUBLIC_ADMIN_TOKEN` env)

### Option 2: curl (for cron jobs / scripts)

Submit one or more URLs:
```bash
curl -X POST https://www.erdosdx.com/api/indexnow-submit \
  -H "Content-Type: application/json" \
  -H "x-admin-token: $PUBLIC_ADMIN_TOKEN" \
  -d '{"urls":["https://www.erdosdx.com/en/products/hat-100/"]}'
```

Submit the full sitemap:
```bash
curl -X POST 'https://www.erdosdx.com/api/indexnow-submit?full=1' \
  -H "x-admin-token: $PUBLIC_ADMIN_TOKEN"
```

### Option 3: From a Node script

```js
import { submitToIndexNow } from './src/lib/indexnow.ts';
await submitToIndexNow(['https://www.erdosdx.com/en/products/hat-100/']);
```

## Limits

- IndexNow allows up to **10,000 URLs per request** (we have ~3,800 in sitemap, fine)
- Rate limit: 1 POST per 10 seconds (Bing's limit; the endpoint doesn't enforce this)
- If you submit the same URL twice in 24h, IndexNow dedupes silently

## Verifying it worked

IndexNow doesn't return indexed status - Bing/Yandex indexing happens later.
Check actual indexing:
- Bing Webmaster Tools > URL Inspection > paste URL
- Yandex Webmaster > Indexing > URL status
- (For Google, use GSC URL Inspection - IndexNow doesn't help Google)

## Troubleshooting

- **401 Unauthorized**: set `PUBLIC_ADMIN_TOKEN` env var, then pass it as
  `x-admin-token` header. The endpoint skips the check in dev if env is unset.
- **400 "urls array required"**: pass JSON body `{"urls":[...]}` not a string.
- **API timeout (>10s on Vercel)**: chunk URLs into 1,000-URL batches.
- **"no URLs found in sitemap"**: sitemap fetch failed; check
  `https://www.erdosdx.com/sitemap-index.xml` is reachable.
- **IndexNow returns 200 but no indexing**: IndexNow queues; actual crawl is
  1-7 days later. Be patient. Use `submitFullSitemap()` after major rebuilds.

## See also

- `src/lib/indexnow.ts` - helper module
- `src/pages/api/indexnow-submit.js` - API endpoint
- `src/pages/admin/index.astro` - admin panel button
