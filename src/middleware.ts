import { defineMiddleware } from 'astro:middleware';

/**
 * Single request handler that:
 *
 * 1. Root URL `/` → server-side rewrite to the visitor's preferred
 *    locale (no 308 redirect, saves ~580ms on mobile PageSpeed).
 *
 * 2. `/admin/*` and `/api/admin/*` → gated behind `admin_session`
 *    cookie. Public endpoints (`/admin/login/`, `/api/admin/auth`) pass
 *    through. Other admin URLs without a valid session get redirected
 *    to /admin/login/ (or 401 JSON for API endpoints).
 *
 * Note: 404 catch-all is handled by the Vercel adapter routing table
 * (built from src/pages/404.astro with `export const prerender = true`),
 * not in this middleware. The adapter emits /404.html at build time and
 * routes every unmatched URL to it with status 404.
 */
export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  const pathname = url.pathname;

  // (1) Root URL → preferred-locale rewrite
  if (pathname === '/') {
    const acceptLanguage = context.request.headers.get('accept-language') || '';
    const langCode = acceptLanguage.split(',')[0]?.split('-')[0]?.toLowerCase() || 'en';
    const localeMap: Record<string, string> = {
      en: 'en', de: 'de', fr: 'fr', ja: 'ja', ko: 'kr', zh: 'cn',
    };
    const target = localeMap[langCode] || 'en';
    return context.rewrite(`/${target}/`);
  }

  // (2) Admin gating
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    if (pathname === '/admin/login/' || pathname === '/api/admin/auth') {
      return next();
    }
    const cookie = context.cookies.get('admin_session');
    if (!cookie) {
      if (pathname.startsWith('/api/')) {
        return new Response(JSON.stringify({ error: 'unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return context.redirect('/admin/login/');
    }
  }

  return next();
});