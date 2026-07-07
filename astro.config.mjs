import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
// No adapter needed for output: 'static' (all pages static-rendered)

export default defineConfig({
  site: 'https://erdosdx.com',
  output: 'static',
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
});
