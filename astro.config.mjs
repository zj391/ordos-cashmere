import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel';

// output: 'server' = Astro 5 standard (hybrid was deprecated in 5.18+).
// Pages that have `export const prerender = true` are pre-rendered at build time.
// Pages that don't are SSR'd on every request (admin dashboard, root redirect).
// This is the canonical Astro 5 + Vercel setup as of 2026.

export default defineConfig({
  // SEO fix 2026-07-22: use www.erdosdx.com as canonical hostname.
  // Vercel DNS routes the apex (erdosdx.com) to www.erdosdx.com with a 308
  // permanent redirect. Sitemap + canonical URLs were emitting the apex
  // hostname, so every Google crawl hit a redirect before reaching the
  // real page (84 'Redirected' entries in GSC "Why pages aren't indexed").
  // Pinning `site` to the www hostname lets the Astro sitemap plugin,
  // canonical link, hreflang alternates, and JSON-LD schema all emit
  // the final URL directly. Google indexes the page on first fetch with
  // no redirect hop, recovering the wasted crawl budget.
  site: 'https://www.erdosdx.com',
  output: 'server',
  adapter: vercel({
    edgeMiddleware: false,
    webAnalytics: { enabled: false },
  }),
  integrations: [
    react(),
    // sitemap integration removed 2026-08-18: replaced by
    // scripts/generate-sitemaps.mjs (run in postbuild) which produces 3
    // split sitemaps (static / blog / products) + index. Splitting the
    // 3,906-URL corpus lets us target Search Console submission per
    // bucket and treat each segment's crawl priority independently.
    // The old plugin output (single sitemap-0.xml, 3,901 URLs) is
    // overridden postbuild.
    // (sitemap plugin config preserved below for reference / easy revert.)
    // sitemap({
    //   i18n: { defaultLocale: 'en', locales: { en: 'en', de: 'de', fr: 'fr', ja: 'ja', kr: 'ko', cn: 'zh' } },
    //   filter: (page) => !page.includes('/admin') && !page.includes('/api/') && !page.includes('/cart'),
    //   serialize: (item) => { /* full priority/lastmod/i18n logic moved to scripts/generate-sitemaps.mjs */ },
    // }),
    tailwind({ applyBaseStyles: false }),
  ],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'de', 'fr', 'ja', 'kr', 'cn'],
    // routing: 'manual' disables Astro's built-in i18n middleware, which
    // otherwise forces a 404 status on every non-locale-prefixed path
    // (e.g. /admin/* and /api/*). Frontend URLs, localePath(), and the
    // root redirect in index.astro are all implemented manually, so the
    // built-in middleware only caused admin routes to render with 404.
    routing: 'manual',
    fallback: { 'cn': 'en', 'ja': 'en', 'kr': 'en', 'de': 'en', 'fr': 'en' },
  },
  // Force all routes to be emitted WITH a trailing slash. With
  // trailingSlash: 'ignore' (the Astro 5 default) the build emits BOTH
  // /foo and /foo/index.html, and the no-slash version is a meta-refresh
  // HTML pointing back at the slash URL. That shell page gets served
  // by Vercel's static layer and overrides our SSR function — every
  // visit to /admin/login hits a self-redirect. Pinning to 'always'
  // makes the build emit only /admin/login/index.html (no redirect
  // shell) and matches the existing /[locale]/.../{id}/ link patterns
  // across the site.
  trailingSlash: 'always',
  vite: { ssr: { noExternal: ['react-i18next', 'react-helmet-async'] } },
  build: { inlineStylesheets: 'auto', compressHTML: true },
  compressJS: true,
  // Disable Astro 5's built-in CSRF check that blocks cross-origin form POSTs.
  // The admin login form posts from the same origin, but curl/browser tests
  // from external origins get 403 without this disabled.
  security: { checkOrigin: false },
});
