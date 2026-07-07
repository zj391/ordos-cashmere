export const POST = async ({ request, cookies, redirect }) => {
  const form = await request.formData();
  const password = form.get('password')?.toString() || '';
  const expected = process.env.ADMIN_PASSWORD || 'erdosdx2026';
  if (password !== expected) return redirect('/admin/login?error=1');
  cookies.set('admin_session', '1', { httpOnly: true, sameSite: 'lax', secure: true, path: '/', maxAge: 60*60*24*7 });
  return redirect('/admin/inquiries');
};
export const GET = async ({ redirect }) => redirect('/admin/login');