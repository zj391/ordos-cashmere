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
