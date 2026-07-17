/**
 * Admin inquiries — combined update + CSV export.
 *
 *   POST /api/admin/inquiries?id=123    (form data: status, lead_grade, notes)
 *   GET  /api/admin/inquiries?action=export[&grade=&status=&country=&q=]
 *
 * Previously two endpoints: [id].js (update) + export.js (CSV).
 * Merged to save a Vercel function slot (Hobby plan limit = 12).
 */
const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

export const POST = async ({ request, redirect, url }) => {
  const id = new URL(url).searchParams.get('id');
  if (!id) return new Response('Missing id', { status: 400 });

  const form = await request.formData();
  const status = form.get('status')?.toString();
  const lead_grade = form.get('lead_grade')?.toString() || null;
  const notes = form.get('notes')?.toString();

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return new Response('Supabase not configured', { status: 500 });
  }

  const update = {};
  if (status) update.status = status;
  if (lead_grade !== null) update.lead_grade = lead_grade || null;

  const r1 = await fetch(`${SUPABASE_URL}/rest/v1/inquiries?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify(update),
  });
  if (!r1.ok) {
    return new Response('Inquiry update failed: ' + (await r1.text()), { status: 500 });
  }

  if (notes !== undefined && notes !== null) {
    const r2 = await fetch(`${SUPABASE_URL}/rest/v1/inquiries?id=eq.${id}&select=email`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY },
    });
    if (r2.ok) {
      const [inq] = await r2.json();
      if (inq?.email) {
        await fetch(`${SUPABASE_URL}/rest/v1/leads?email=eq.${encodeURIComponent(inq.email)}`, {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': 'Bearer ' + SUPABASE_KEY,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({ notes, lead_grade: lead_grade || undefined }),
        });
      }
    }
  }

  return redirect(`/admin/inquiries/${id}`);
};

export const GET = async ({ url }) => {
  const u = new URL(url);
  if (u.searchParams.get('action') !== 'export') {
    return new Response('Use ?action=export or POST with ?id=', { status: 400 });
  }

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return new Response('Supabase not configured', { status: 500 });
  }

  const grade = u.searchParams.get('grade') || '';
  const status = u.searchParams.get('status') || '';
  const country = u.searchParams.get('country') || '';
  const search = u.searchParams.get('q') || '';

  let q = '/rest/v1/inquiries?order=created_at.desc&limit=1000';
  const filters = [];
  if (grade) filters.push(`lead_grade=eq.${grade}`);
  if (status) filters.push(`status=eq.${status}`);
  if (country) filters.push(`country=eq.${country}`);
  if (search) filters.push(`or=(contact_name.ilike.*${search}*,company_name.ilike.*${search}*,email.ilike.*${search}*)`);
  if (filters.length) q += '&' + filters.join('&');

  const res = await fetch(SUPABASE_URL + q, {
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY },
  });
  if (!res.ok) {
    return new Response('Supabase error: ' + (await res.text()), { status: 500 });
  }
  const rows = await res.json();

  const headers = ['id', 'created_at', 'contact_name', 'company_name', 'email', 'phone', 'country', 'locale', 'inquiry_type', 'product_interest', 'quantity_kg', 'quantity_m', 'quantity_pcs', 'lead_grade', 'status', 'message', 'utm_source', 'utm_medium', 'utm_campaign', 'referrer'];
  const esc = (v) => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  };
  const lines = [headers.join(',')];
  for (const r of rows) {
    lines.push(headers.map((h) => esc(r[h])).join(','));
  }
  const csv = lines.join('\n');

  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="inquiries-${stamp}.csv"`,
    },
  });
};