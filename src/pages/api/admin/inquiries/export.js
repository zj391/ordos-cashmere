

const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

export const GET = async ({ url }) => {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return new Response('Supabase not configured', { status: 500 });
  }

  const grade = url.searchParams.get('grade') || '';
  const status = url.searchParams.get('status') || '';
  const country = url.searchParams.get('country') || '';
  const search = url.searchParams.get('q') || '';

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
    lines.push(headers.map(h => esc(r[h])).join(','));
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

