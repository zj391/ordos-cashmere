# SEO Audit & Optimization Log

> Single source of truth for every SEO change that touches the rendered
> output of the site (HTML, meta, sitemap, redirects, etc.). New SEO
> changes should reference the relevant commit SHA so we can roll back
> individual fixes without touching the rest.

## Quick Reference: Production-Impacting SEO Issues, Fixed

| # | Issue | Impact | Commit | Date |
|---|-------|--------|--------|------|
| 1 | 404 page rendered as 0-byte body (Astro 5 + Vercel adapter bug) | Google soft-404 = duplicate-content penalty | `81d7c08` | 2026-08-26 |
| 2 | 404 page passed `noindex={true}` to BaseLayout (camelCase mismatch) | Google indexed every 404 URL | `51472a6` | 2026-08-26 |
| 3 | 7 marketing pages had `noIndex={true}` (factory, yarn-fabric, ordos-origin, color-cards, cashmere-yarn-types, dehaired-cashmere, certifications) | 7 pages × 6 locales = 42 URLs not indexed | `2401716` | 2026-08-26 |
| 4 | WhatsApp fallback placeholder `+861****3999` in seo.ts and inquiry.ts (production rendered right number only via env var) | Local dev / future deploys would show broken wa.me link | `51472a6` | 2026-08-26 |
| 5 | Product title was `{Name} — 100% Cashmere · ...` (clipped at ~80c) | Missing audience/season facet from SERP | `5b5c1fd` (pushed earlier) | 2026-08-25 |
| 6 | Three category alias URLs (sweaters, hats, accessories) used Astro meta-refresh shell (status 200) | Link equity lost — Google doesn't transfer PageRank across meta-refresh | `822ed1c`, `3bcc351` | 2026-08-27 |
| 7 | `/cart` (no locale) returned 404 instead of 308 → `/en/cart/` | Direct 404s on email CTAs and shared links | `2401716` | 2026-08-26 |
| 8 | 95 inline `bg-[#XXX]` / `text-[#XXX]` hex values across 27 files | No design-system enforcement, palette tweaks required multi-file edit | `2401716` | 2026-08-26 |
| 9 | 6 inline hex `[#...]` not covered by Tailwind tokens | Same as #8 | `2401716` | 2026-08-26 |
| 10 | Navigation + Footer inline `<style>` blocks (~3 KB each per page) | 3546 pages × 3 KB = 10 MB wasted (browser re-downloads per page) | `5479270` | 2026-08-27 |
| 11 | Navigation header CTA "Get Quote" inconsistent with homepage "Request a Quote" | B2B CTA confuses procurement teams | `464fd2c` | 2026-08-27 |
| 12 | All product pages sitemap priority = 0.5 | No signal to Googlebot to re-crawl flagship SKUs more often | pending | (next deploy) |
| 13 | og:image missing width/height metadata | Social platforms re-fetch + crop inconsistently | `2401716` | 2026-08-26 |
| 14 | theme-color missing | Mobile browser chrome uses default | `2401716` | 2026-08-26 |

## Architecture Notes (for next person working on SEO)

### How `BaseLayout` handles noindex
`BaseLayout.astro` line 367 emits:
```html
<meta name="robots" content={noIndex ? "noindex,nofollow" : "index,follow,..."} />
```

Prop name is **camelCase `noIndex`** (not `noindex`). All page files must
use `<BaseLayout ... noIndex={true}>` — case mismatch silently drops the
prop in Astro 5 components and the page renders with `index,follow`,
getting indexed. Always verify with `curl /path/ | grep robots`.

### How `BaseLayout` handles hreflang
`BaseLayout.astro` line 136 emits hreflang. When `noIndex={true}` (404
page, cart, privacy, certifications), we collapse to a single self-
referential hreflang (no 6-language variants of a URL that doesn't
exist or shouldn't be indexed). For all other pages, full 6-language
hreflang block.

### How 404 page is served
`src/pages/404.astro` has `export const prerender = true`. Vercel
adapter emits `/404.html` at build time and wires it as the catch-
all 404 destination (see `.vercel/output/config.json` route #25:
`{"src":"^/.*$","dest":"/404.html","status":404}`). The page itself
serves `noindex,nofollow` + canonical=/en/404/, so Googlebot sees a
proper 404 signal source.

**Don't** try to make 404.astro `Astro.url.pathname`-aware — it gets
prerendered once, the path is always `/404` at build time. The
canonical URL is statically `/en/404/`.

### Sitemap pipeline
`scripts/generate-sitemaps.mjs` runs in `postbuild` (package.json
line 9). It walks `dist/client/{locale}/...` looking for `index.html`
files, filters out any whose HTML contains `<meta name="robots"
content="...noindex...">`, classifies into 3 buckets (static / blog /
products), and writes 3 sitemaps + an index.

After write, it copies the sitemaps into `.vercel/output/static/`
because the Vercel adapter snapshots `dist/client/` BEFORE the
postbuild script runs.

`pageMeta()` is the priority/changefreq function. Product pages are
now tiered by ID range:
- `id <= 50` → flagship, priority 0.8, weekly
- `id <= 150` → popular, priority 0.6, weekly
- `id <= 250` → standard, priority 0.5, monthly
- `id > 250` → long-tail, priority 0.4, monthly

### Redirect ordering
`vercel.json` redirects are matched in **declaration order** (first
match wins). Exact-string sources must be declared BEFORE wildcard
sources. Currently:
1. `/zh*` → `/cn*` (i18n fallbacks)
2. **`/products/{sweaters,hats,accessories}/`** (exact match → final URL)
3. `/products/:id/` (wildcard → adds locale prefix only)
4. `/products/` (canonicalize trailing slash)
5. `/blog/`, `/contact/`, `/faq/`, `/download/`, etc. (legacy URL aliases)
6. `/cart/` (locale canonicalization)

If you add a new category alias, place it BEFORE line 73 (the
`/products/:id/` wildcard).

### Tailwind brand tokens
`tailwind.config.mjs` extends `theme.colors.brand` with:
- Standard palette: `cream, sand, camel, chocolate, ink, gold, red`
- Extracted from inline hex (2026-08-26 audit): `sandwarm (#F5F0E7),
  shell (#F8F5EF), mist (#FBF8F2), bone (#F4EFE6), goldhi (#D8B787),
  sandhi (#E8DFD0)`
- Channel brand colors: `whatsapp (#25D366), wechat (#07C160)`

When adding new colors, prefer tokens over inline hex. Run this search
to find any remaining inline hex:
```bash
grep -rE 'bg-\[#[A-Fa-f0-9]{3,8}\]|text-\[#[A-Fa-f0-9]{3,8}\]' src/
```

### Where `noIndex={true}` is correct (intentionally)
- `src/pages/[locale]/cart.astro` — inquiry list is private to visitor
- `src/pages/[locale]/privacy-policy.astro` — GDPR low-value
- `src/pages/404.astro` — see Architecture Notes

### `Astro.url.pathname` in prerender mode
When a page has `export const prerender = true`, `Astro.url.pathname`
at build time is always the page's own path (e.g. `/404` for 404.astro,
`/en/products/sweaters-100` for the product page). Don't use it for
request-time logic. Use it only for cases where the value is constant
per route (canonical path, internal links).

## Things I Considered But Did NOT Change

- **`<lastmod>` per product in sitemap** — Sitemap lastmod is the same
  for all URLs (build time). Per-product lastmod would require either
  (a) per-product mtime (Vercel rebuilds without content changes would
  drift the timestamp falsely) or (b) tracking product-add dates in
  products.json. Both add complexity for marginal SEO gain. Skipped.

- **LLMS.txt (public/llms-full.txt)** — Already generated, AI crawlers
  (GPTBot, ClaudeBot, PerplexityBot) allowed in robots.txt. No changes
  needed.

- **SearchAction schema for sitelinks searchbox** — Would require a
  working on-site search endpoint. Out of scope.

- **Multilingual product-by-product translation tracking** — hreflang
  filters out missing locales correctly. zh-CN (cn) has fewer
  translations but Google handles that via hreflang fallbacks.

- **CN fallback routing** — Currently `cn → en` for translations that
  aren't translated. Tested; works correctly. No change.

## How to Verify Any SEO Change in Production

After pushing a commit, wait 5-10 minutes for Vercel deploy + edge
cache refresh, then test:

```bash
# Check a page's robots directive
curl -sL https://www.erdosdx.com/en/factory/ | grep -oP 'name="robots"[^>]+content="[^"]+"'

# Check canonical
curl -sL https://www.erdosdx.com/en/factory/ | grep -oP 'rel="canonical"[^>]+href="[^"]+"'

# Check hreflang
curl -sL https://www.erdosdx.com/en/factory/ | grep -oP 'hreflang="[^"]+"'

# Check 404 page
curl -sL -o /dev/null -w '%{http_code}\n' https://www.erdosdx.com/en/bogus-xyz/

# Check redirect chain
curl -sL -o /dev/null -w '%{url_effective}\n%{http_code}\n' https://www.erdosdx.com/products/sweaters/

# Test category page priority
curl -s https://www.erdosdx.com/sitemap-products.xml | grep -oP 'products/(sweaters|hats|scarves|accessories|yarn)-(\d+)[^/]*/' | head -10
```

## Open Audit Items (Not Yet Implemented)

These are SEO opportunities I noticed but did not implement. Listed so
they're tracked and can be picked up later without re-discovering:

1. **Product page H1 has no text query opportunity for buyers**
   - Currently H1 is product name (e.g. "Wholesale Pure Cashmere V
     Neck Cardigan Men")
   - Could be enriched to "Wholesale Pure Cashmere V Neck Cardigan
     Men — MOQ 100, FOB Tianjin, 14-15.5μm, Ordos Factory Direct"
   - Trade-off: longer H1 may look more spammy to some users. Test
     before rolling out.

2. **Hreflang x-default points to `/en/`** — could be geographic
   instead (e.g. x-default → /us/ for US, /cn/ for CN). Requires
   IP-based locale detection, which is currently a single-language
   fallback in middleware.

3. **Blog post hreflang filtering** — script already filters missing
   locales, but the source data (i18n/translation.json) doesn't track
   per-blog-post translation availability. If a blog post is added in
   EN but not translated, the hreflang block omits other locales
   silently. Could add a "translation status" tag in the markdown
   frontmatter to surface the gap.

4. **Image sitemap** — Google Image Search indexes separately. Adding
   `image:image` elements to product sitemap entries would surface
   product images in Google Images search.

5. **Video sitemap** — If any future product video tours are added,
   a separate `sitemap-video.xml` would be needed.

6. **Preconnect to product image CDN** — Images are served from
   /images/ on the same origin. If they're ever moved to a CDN,
   add `<link rel="preconnect" href="https://cdn.example.com">`.

7. **Reduce duplicate H1 between Navigation menu and page H1** —
   Some pages have nav submenus that visually replicate the page H1.
   Could be confusing for crawlers parsing semantic structure. Not
   currently a confirmed issue but worth a manual review.
