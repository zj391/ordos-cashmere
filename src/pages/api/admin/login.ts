import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const form = await request.formData();
  const password = form.get('password')?.toString() || '';
  const expected = process.env.ADMIN_PASSWORD || 'erdosdx2026';

  if (password !== expected) {
    return redirect('/admin/login?error=1');
  }

  // 7-day httpOnly session cookie
  cookies.set('admin_session', '1', {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return redirect('/admin/inquiries');
};

export const GET: APIRoute = async ({ redirect }) => {
  return redirect('/admin/login');
};
