import { defineMiddleware } from 'astro:middleware';

const PUBLIC_ADMIN_PATHS = ['/admin/login'];

/**
 * Gate every /admin/* path behind an `admin_session` cookie.
 * Public: only /admin/login. Everything else redirects to login if not authed.
 * /api/admin/* is also gated except login/logout so the form can post and clear.
 */
export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  const pathname = url.pathname;

  // Only guard /admin/* and /api/admin/*
  if (!pathname.startsWith('/admin') && !pathname.startsWith('/api/admin')) {
    return next();
  }

  // Public endpoints
  if (pathname === '/admin/login' || pathname === '/api/admin/login' || pathname === '/api/admin/logout') {
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
    return context.redirect('/admin/login');
  }

  return next();
});
