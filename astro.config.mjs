import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: 'https://erdosdx.com',
  output: 'static',
  integrations: [
    react(),
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en',
          de: 'de',
          fr: 'fr',
          ja: 'ja',
          kr: 'ko',
          cn: 'zh',
        },
      },
    }),
    tailwind({ applyBaseStyles: false }),
  ],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'de', 'fr', 'ja', 'kr', 'cn'],
    routing: {
      prefixDefaultLocale: true,
    },
    fallback: {
      'cn': 'en',
      'ja': 'en',
      'kr': 'en',
      'de': 'en',
      'fr': 'en',
    },
  },
  vite: {
    ssr: {
      noExternal: ['react-i18next', 'react-helmet-async'],
    },
  },
  build: {
    inlineStylesheets: 'auto',
    // Astro 5: 压缩 HTML 序列化（缩短 island props 体积）
    // 配合 fetch-based 详情加载，可把 1.1MB HTML 压到 200KB 以内
    compressHTML: true,
  },
  compressJS: true,
});
