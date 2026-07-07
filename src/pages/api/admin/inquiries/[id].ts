import type { APIRoute } from 'astro';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(new URL('.', import.meta.url).pathname, '../..');
export const prerender = false;
const ENV = (() => {
  const out = {};
  try {
    const c = readFileSync(path.join(ROOT, '.env.local'), 'utf-8');
    for (const line of c.split('\n')) {
      if (!line.trim() || line.trim().startsWith('#')) continue;
      const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.+?)\s*$/);
      if (!m) continue;
      let v = m[2];
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      out[m[1]] = v;
    }
  } catch {}
  return out;
})();

const SUPABASE_URL = ENV.SUPABASE_URL;
const SUPABASE_KEY = ENV.SUPABASE_SERVICE_KEY;

export const POST: APIRoute = async ({ params, request, redirect }) => {
  const { id } = params;
  const form = await request.formData();
  const status = form.get('status')?.toString();
  const lead_grade = form.get('lead_grade')?.toString() || null;
  const notes = form.get('notes')?.toString();

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
