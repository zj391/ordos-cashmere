import type { APIRoute } from 'astro';

const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

export const POST: APIRoute = async ({ params, request, redirect }) => {
  const { id } = params;
  const form = await request.formData();
  const status = form.get('status')?.toString();
  const lead_grade = form.get('lead_grade')?.toString() || null;
  const notes = form.get('notes')?.toString();

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return new Response('Supabase not configured', { status: 500 });
  }

  // Update inquiry
  const update: any = {};
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

  // If notes provided, also update matching lead
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
