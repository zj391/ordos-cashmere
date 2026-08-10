import { defineMiddleware } from 'astro:middleware';

const PUBLIC_ADMIN_PATHS = ['/admin/login/'];

/**
 * Gate every /admin/* path behind an `admin_session` cookie.
 * Public: only /admin/login/. Everything else redirects to login if not authed.
 * /api/admin/* is also gated except login/logout so the form can post and clear.
 */
export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  const pathname = url.pathname;

  // Root URL: render the visitor's language directly (server-side rewrite,
  // no 308 redirect hop). Saves ~580ms on mobile PageSpeed.
  if (pathname === '/') {
    const acceptLanguage = context.request.headers.get('accept-language') || '';
    const langCode = acceptLanguage.split(',')[0]?.split('-')[0]?.toLowerCase() || 'en';
    const localeMap: Record<string, string> = {
      en: 'en', de: 'de', fr: 'fr', ja: 'ja', ko: 'kr', zh: 'cn',
    };
    const target = localeMap[langCode] || 'en';
    return context.rewrite(`/${target}/`);
  }

  // Chinese locale alias normalization: external links + hreflang-standard
  // `zh-CN` / `zh-cn` / `zh` paths → 308 to short-code `/cn/...` URLs.
  // Without this, every such URL returns 404 because Astro i18n only
  // accepts the short codes (en/de/fr/ja/kr/cn). 308 preserves SEO equity.
  const zhAlias = pathname.match(/^\/(zh-CN|zh-cn|zh)(\/.*)?$/);
  if (zhAlias) {
    const rest = zhAlias[2] ?? '';
    return context.redirect(`/cn${rest}`, 308);
  }

  // Only guard /admin/* and /api/admin/*
  if (!pathname.startsWith('/admin') && !pathname.startsWith('/api/admin')) {
    return next();
  }

  // Public endpoints
  if (pathname === '/admin/login/' || pathname === '/api/admin/auth') {
    return next();
  }

  const cookie = context.cookies.get('admin_session');
  if (!cookie) {
    // For API requests return 401 JSON, for page requests redirect
    if (pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return context.redirect('/admin/login/');
  }

  return next();
});
