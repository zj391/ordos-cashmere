/**
 * Admin inquiries (Vercel Node API endpoint, independent function).
 *   POST /api/admin/inquiries/?id=123    (body: status, lead_grade, notes)
 *   GET  /api/admin/inquiries/?action=export[&grade=&status=&country=&q=]
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const url = new URL(req.url || '/', `https://${req.headers.host || 'erdosdx.com'}`);
  const action = url.searchParams.get('action');
  const id = url.searchParams.get('id');

  if (req.method === 'POST') {
    if (!id) {
      res.status(400).send('Missing id');
      return;
    }
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      res.status(500).send('Supabase not configured');
      return;
    }
    const ct = String(req.headers['content-type'] || '');
    let body: Record<string, string> = {};
    if (typeof req.body === 'object' && req.body && !Buffer.isBuffer(req.body)) {
      body = req.body as Record<string, string>;
    } else if (typeof req.body === 'string') {
      if (ct.includes('application/x-www-form-urlencoded')) {
        const params = new URLSearchParams(req.body);
        for (const [k, v] of params) body[k] = v;
      } else if (ct.includes('multipart/form-data')) {
        const re = /name="([^"]+)"\r\n\r\n([^\r\n]*)/g;
        let m: RegExpExecArray | null;
        while ((m = re.exec(req.body))) body[m[1]] = decodeURIComponent(m[2].replace(/\+/g, ' '));
      }
    } else if (Buffer.isBuffer(req.body)) {
      const raw = (req.body as Buffer).toString('utf8');
      if (ct.includes('application/x-www-form-urlencoded')) {
        const params = new URLSearchParams(raw);
        for (const [k, v] of params) body[k] = v;
      }
    }
    const status = body.status;
    const lead_grade = body.lead_grade || null;
    const notes = body.notes;

    const update: Record<string, unknown> = {};
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
      res.status(500).send('Inquiry update failed: ' + (await r1.text()));
      return;
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

    res.setHeader('Location', `/admin/inquiries/${id}`);
    res.status(303).end();
    return;
  }

  if (req.method === 'GET' && action === 'export') {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      res.status(500).send('Supabase not configured');
      return;
    }
    const grade = url.searchParams.get('grade') || '';
    const status = url.searchParams.get('status') || '';
    const country = url.searchParams.get('country') || '';
    const search = url.searchParams.get('q') || '';

    let q = '/rest/v1/inquiries?order=created_at.desc&limit=1000';
    const filters: string[] = [];
    if (grade) filters.push(`lead_grade=eq.${grade}`);
    if (status) filters.push(`status=eq.${status}`);
    if (country) filters.push(`country=eq.${country}`);
    if (search) filters.push(`or=(contact_name.ilike.*${search}*,company_name.ilike.*${search}*,email.ilike.*${search}*)`);
    if (filters.length) q += '&' + filters.join('&');

    const rs = await fetch(SUPABASE_URL + q, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY },
    });
    if (!rs.ok) {
      res.status(500).send('Supabase error: ' + (await rs.text()));
      return;
    }
    const rows = await rs.json();

    const headers = ['id', 'created_at', 'contact_name', 'company_name', 'email', 'phone', 'country', 'locale', 'inquiry_type', 'product_interest', 'quantity_kg', 'quantity_m', 'quantity_pcs', 'lead_grade', 'status', 'message', 'utm_source', 'utm_medium', 'utm_campaign', 'referrer'];
    const esc = (v: unknown) => {
      if (v === null || v === undefined) return '';
      const s = String(v);
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return '"' + s.replace(/"/g, '""') + '"';
      }
      return s;
    };
    const lines = [headers.join(',')];
    for (const r of rows) {
      lines.push(headers.map((h) => esc((r as Record<string, unknown>)[h])).join(','));
    }
    const csv = lines.join('\n');

    const stamp = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="inquiries-${stamp}.csv"`);
    res.status(200).send(csv);
    return;
  }

  res.status(400).send('Use ?action=export or POST with ?id=');
}
