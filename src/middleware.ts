import { defineMiddleware } from 'astro:middleware';

// Protect /admin/* paths (except /admin/login) with simple cookie session
export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  if (!url.pathname.startsWith('/admin/')) {
    return next();
  }
  if (url.pathname === '/admin/login') {
    return next();
  }
  // API logout allowed without session
  if (url.pathname === '/api/admin/logout') {
    return next();
  }

  const cookie = context.request.headers.get('cookie') || '';
  if (!cookie.includes('admin_session=1')) {
    return context.redirect('/admin/login');
  }

  return next();
});
