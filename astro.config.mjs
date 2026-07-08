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
  site: 'https://erdosdx.com',
  output: 'server',
  adapter: vercel({
    edgeMiddleware: false,
    webAnalytics: { enabled: false },
  }),
  integrations: [
    react(),
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en', de: 'de', fr: 'fr', ja: 'ja', kr: 'ko', cn: 'zh' },
      },
      // Exclude admin/API routes from sitemap (already disallowed in robots.txt).
      filter: (page) => !page.includes('/admin') && !page.includes('/api/'),
      // Add lastmod + per-page priority for better SEO signals.
      // Static pages get higher priority; blog posts get 0.7; category hub pages
      // and product detail pages get 0.8 (high value for B2B keywords).
      serialize: (item) => {
        const url = item.url;
        const path = url.replace(/^https?:\/\/[^/]+/, '');
        let priority = 0.5;
        let changefreq = 'monthly';
        if (path === '/' || /^\/(en|cn|de|fr|ja|kr)?\/?$/.test(path)) {
          priority = 1.0; changefreq = 'weekly';
        } else if (path.includes('/blog/')) {
          priority = 0.7; changefreq = 'monthly';
        } else if (path.match(/\/(scarves|hats-accessories|yarn|garment-oem|fabric|raw-material|products)\//)) {
          priority = 0.8; changefreq = 'weekly';
        } else if (path.match(/^\/(en|cn|de|fr|ja|kr)\/(scarves|hats-accessories|yarn|garment-oem|fabric|raw-material|products)/)) {
          priority = 0.8; changefreq = 'weekly';
        } else if (path.match(/^\/(en|cn|de|fr|ja|kr)\/products\/[a-z0-9-]+/)) {
          priority = 0.8; changefreq = 'weekly';
        } else if (path.match(/^\/(en|cn|de|fr|ja|kr)\/blog\/[a-z0-9-]+/)) {
          priority = 0.7; changefreq = 'monthly';
        } else {
          priority = 0.6; changefreq = 'monthly';
        }
        return {
          ...item,
          lastmod: new Date(),
          changefreq,
          priority,
        };
      },
    }),
    tailwind({ applyBaseStyles: false }),
  ],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'de', 'fr', 'ja', 'kr', 'cn'],
    routing: { prefixDefaultLocale: true },
    fallback: { 'cn': 'en', 'ja': 'en', 'kr': 'en', 'de': 'en', 'fr': 'en' },
  },
  vite: { ssr: { noExternal: ['react-i18next', 'react-helmet-async'] } },
  build: { inlineStylesheets: 'auto', compressHTML: true },
  compressJS: true,
  // Disable Astro 5's built-in CSRF check that blocks cross-origin form POSTs.
  // The admin login form posts from the same origin, but curl/browser tests
  // from external origins get 403 without this disabled.
  security: { checkOrigin: false },
});
