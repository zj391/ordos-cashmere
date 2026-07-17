/**
 * Admin auth — combined login + logout to save a Vercel function slot.
 *
 *   POST /api/admin/auth?action=login   (form data: password)
 *   POST /api/admin/auth?action=logout
 *   GET  /api/admin/auth?action=logout  (convenience: GET also logs out)
 *   GET  /api/admin/auth                → redirect to /admin/login
 */
const isLogout = (req) => {
  if (req.method === 'POST') return true; // form posts here without query
  const url = new URL(req.url);
  return url.searchParams.get('action') === 'logout';
};

export const POST = async ({ request, cookies, redirect, url }) => {
  const action = new URL(url).searchParams.get('action') || 'login';
  if (action === 'logout') {
    cookies.delete('admin_session', { path: '/' });
    return redirect('/admin/login');
  }
  // login
  const form = await request.formData();
  const password = form.get('password')?.toString() || '';
  const expected = process.env.ADMIN_PASSWORD || 'erdosdx2026';
  if (password !== expected) return redirect('/admin/login?error=1');
  cookies.set('admin_session', '1', { httpOnly: true, sameSite: 'lax', secure: true, path: '/', maxAge: 60 * 60 * 24 * 7 });
  return redirect('/admin/inquiries');
};

export const GET = async ({ cookies, redirect, url }) => {
  if (isLogout({ url })) {
    cookies.delete('admin_session', { path: '/' });
    return redirect('/admin/login');
  }
  return redirect('/admin/login');
};