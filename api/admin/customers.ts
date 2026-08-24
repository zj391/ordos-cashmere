/** Protected customer-success profile updates for linked sales leads. */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { customerSuccessSummary, isAccountTier, isCustomerDate, isServiceCadence, stripCustomerSuccessSummary } from '../../src/lib/customer-success';
import { extractWorkflowSummary } from '../../src/lib/deal-workflow';

const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

function parseBody(req: VercelRequest): Record<string, string> {
  if (typeof req.body === 'object' && req.body && !Buffer.isBuffer(req.body)) return req.body as Record<string, string>;
  const raw = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : typeof req.body === 'string' ? req.body : '';
  return Object.fromEntries(new URLSearchParams(raw));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');
  const url = new URL(req.url || '/', `https://${req.headers.host || 'erdosdx.com'}`);
  const id = url.searchParams.get('id');
  if (!id) return res.status(400).send('Missing lead id');
  if (!SUPABASE_URL || !SUPABASE_KEY) return res.status(500).send('Supabase not configured');

  const body = parseBody(req);
  if (!isAccountTier(body.account_tier) || !isServiceCadence(body.service_cadence) || !isCustomerDate(body.next_review_date)) {
    return res.status(400).send('Invalid customer success profile');
  }
  if ((body.catalog_version || '').length > 120 || (body.color_card_version || '').length > 120 || (body.notes || '').length > 6000) {
    return res.status(400).send('Customer success fields are too long');
  }

  const headers = { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY, 'Content-Type': 'application/json', Prefer: 'return=minimal' };
  const current = await fetch(`${SUPABASE_URL}/rest/v1/leads?id=eq.${encodeURIComponent(id)}&select=notes&limit=1`, { headers });
  if (!current.ok) return res.status(500).send('Lead lookup failed');
  const rows = await current.json();
  if (!rows?.[0]) return res.status(404).send('Lead not found');

  const currentNotes = String(rows[0].notes || '');
  const preservedWorkflow = extractWorkflowSummary(currentNotes);
  const base = body.notes !== undefined
    ? [String(body.notes).trim(), preservedWorkflow].filter(Boolean).join('\n\n')
    : stripCustomerSuccessSummary(currentNotes);
  const notes = [stripCustomerSuccessSummary(base), customerSuccessSummary(body)].filter(Boolean).join('\n\n');
  const updated = await fetch(`${SUPABASE_URL}/rest/v1/leads?id=eq.${encodeURIComponent(id)}`, { method: 'PATCH', headers, body: JSON.stringify({ notes }) });
  if (!updated.ok) return res.status(500).send('Customer success profile update failed');

  res.setHeader('Location', `/admin/customers/${id}/`);
  return res.status(303).end();
}
