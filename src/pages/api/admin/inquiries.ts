/**
 * Admin inquiries (Vercel Node API endpoint, independent function).
 *   POST /api/admin/inquiries/?id=123    (body: status, lead_grade, notes)
 *   GET  /api/admin/inquiries/?action=export[&grade=&status=&country=&q=]
 */
import { toAstroApiRoute, type VercelLikeRequest, type VercelLikeResponse } from '../../../lib/api/vercel-shim';
import { hasWorkflowInput, isActionDate, isDealStage, isQuoteStatus, isSampleStatus, stripWorkflowSummary, workflowSummary } from '../../../lib/deal-workflow';

const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

async function _internalHandler(req: VercelLikeRequest, res: VercelLikeResponse) {
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
    const workflow = {
      deal_stage: body.deal_stage,
      quote_status: body.quote_status,
      sample_status: body.sample_status,
      next_action_date: body.next_action_date,
    };

    if (workflow.deal_stage && !isDealStage(workflow.deal_stage)) return res.status(400).send('Invalid deal stage');
    if (workflow.quote_status && !isQuoteStatus(workflow.quote_status)) return res.status(400).send('Invalid quote status');
    if (workflow.sample_status && !isSampleStatus(workflow.sample_status)) return res.status(400).send('Invalid sample status');
    if (workflow.next_action_date && !isActionDate(workflow.next_action_date)) return res.status(400).send('Invalid next action date');

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

    // 2026-09-23 — Log the admin's status/lead_grade change to lead_activities
    // so the inquiry detail timeline records who changed what and when.
    // (Same approach as batch-update.) Skip if neither field changed.
    // We log against the actual lead_id (looked up via email) so the existing
    // timeline query on /admin/inquiries/[id] can find the event.
    if (status || (lead_grade !== null && lead_grade !== undefined)) {
      const changed: string[] = [];
      if (status) changed.push(`status=${status}`);
      if (lead_grade !== null && lead_grade !== undefined) {
        changed.push(`grade=${lead_grade || 'ungraded'}`);
      }
      if (changed.length > 0) {
        const actor =
          (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 'admin';
        // Look up the linked lead id (best-effort). Without this, the timeline
        // query by lead_id won't include this event.
        let leadIdForLog: string | null = null;
        try {
          const r0 = await fetch(
            `${SUPABASE_URL}/rest/v1/inquiries?id=eq.${encodeURIComponent(id)}&select=email&limit=1`,
            { headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY } }
          );
          if (r0.ok) {
            const arr = await r0.json();
            const email = arr?.[0]?.email;
            if (email) {
              const rL = await fetch(
                `${SUPABASE_URL}/rest/v1/leads?email=eq.${encodeURIComponent(email)}&select=id&limit=1`,
                { headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY } }
              );
              if (rL.ok) {
                leadIdForLog = (await rL.json())?.[0]?.id || null;
              }
            }
          }
        } catch { /* fall through with null */ }
        if (leadIdForLog) {
          fetch(`${SUPABASE_URL}/rest/v1/lead_activities`, {
            method: 'POST',
            headers: {
              apikey: SUPABASE_KEY,
              Authorization: 'Bearer ' + SUPABASE_KEY,
              'Content-Type': 'application/json',
              Prefer: 'return=minimal',
            },
            body: JSON.stringify({
              lead_id: leadIdForLog,
              channel: 'admin',
              direction: 'in',
              activity_type: 'admin_status_change',
              subject: `Admin update: ${changed.join(', ')}`,
              note: `Updated from inquiry detail page by ${actor}`,
              created_at: new Date().toISOString(),
            }),
          }).catch(() => null);
        }
      }
    }

    if (notes !== undefined || hasWorkflowInput(workflow)) {
      const r2 = await fetch(`${SUPABASE_URL}/rest/v1/inquiries?id=eq.${id}&select=email`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY },
      });
      if (r2.ok) {
        const [inq] = await r2.json();
        if (inq?.email) {
          const currentLead = await fetch(`${SUPABASE_URL}/rest/v1/leads?email=eq.${encodeURIComponent(inq.email)}&select=notes&limit=1`, {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY },
          });
          const existing = currentLead.ok ? (await currentLead.json())?.[0]?.notes || '' : '';
          const baseNotes = notes !== undefined ? String(notes) : stripWorkflowSummary(existing);
          const mergedNotes = hasWorkflowInput(workflow)
            ? [stripWorkflowSummary(baseNotes), workflowSummary(workflow)].filter(Boolean).join('\n\n')
            : baseNotes;
          await fetch(`${SUPABASE_URL}/rest/v1/leads?email=eq.${encodeURIComponent(inq.email)}`, {
            method: 'PATCH',
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': 'Bearer ' + SUPABASE_KEY,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal',
            },
            body: JSON.stringify({ notes: mergedNotes, lead_grade: lead_grade || undefined }),
          });
        }
      }
    }

    res.setHeader('Location', `/admin/inquiries/${id}/`);
    res.status(303).end();
    return;
  }

  // 2026-09-23 — Batch update: apply status (and optional lead_grade) to many
  // inquiries in one click from the list page. Body: ids (CSV or repeated),
  // status (required, one of new/contacted/qualified/won/lost/archived),
  // lead_grade (optional, A/B/C/D/ungraded). Up to 200 ids per request to
  // avoid Supabase PATCH URL length limits.
  if (req.method === 'POST' && action === 'batch-update') {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      res.status(500).send('Supabase not configured');
      return;
    }
    const allowedStatuses = new Set(['new', 'contacted', 'qualified', 'won', 'lost', 'archived']);
    const allowedGrades = new Set(['A', 'B', 'C', 'D', 'ungraded', '']);

    // Accept ids as repeated form field, JSON array, or comma-separated string.
    let ids: string[] = [];
    if (Array.isArray(body.ids)) {
      ids = (body.ids as unknown[]).filter((v) => typeof v === 'string' && v).map(String);
    } else if (typeof body.ids === 'string' && body.ids.trim()) {
      ids = body.ids.split(',').map((s) => s.trim()).filter(Boolean);
    }
    const status = typeof body.status === 'string' ? body.status : '';
    const leadGrade = typeof body.lead_grade === 'string' ? body.lead_grade : '';

    if (ids.length === 0) {
      res.status(400).send('No inquiry ids provided');
      return;
    }
    if (ids.length > 200) {
      res.status(400).send(`Too many ids (${ids.length}); limit is 200 per request`);
      return;
    }
    if (!allowedStatuses.has(status)) {
      res.status(400).send(`Invalid status: ${status}`);
      return;
    }
    if (!allowedGrades.has(leadGrade)) {
      res.status(400).send(`Invalid lead_grade: ${leadGrade}`);
      return;
    }

    // Sanitize each id: must be a UUID-like string (no SQL/URL injection).
    const safeIds = ids.filter((s) => /^[0-9a-f-]{6,64}$/i.test(s));
    if (safeIds.length === 0) {
      res.status(400).send('No valid inquiry ids after sanitization');
      return;
    }

    // Build PATCH payload: only the fields the caller asked to change.
    const patch: Record<string, unknown> = { status };
    if (leadGrade) patch.lead_grade = leadGrade === 'ungraded' ? null : leadGrade;

    // Supabase: filter by id=in.(uuid1,uuid2,...) and PATCH in one request.
    const inList = safeIds.map((id) => `"${id}"`).join(',');
    const url = `${SUPABASE_URL}/rest/v1/inquiries?id=in.(${inList})`;
    const rs = await fetch(url, {
      method: 'PATCH',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(patch),
    });
    if (!rs.ok) {
      res.status(500).send('Supabase error: ' + (await rs.text()).slice(0, 300));
      return;
    }

    // 2026-09-23 — Best-effort activity log per updated inquiry. We log against
    // the inquiry id directly (not lead_id) so each event is reachable from
    // its own inquiry detail page even if no lead record exists yet. The
    // timeline query on /admin/inquiries/[id] falls back to inquiry_id if
    // the lead_id query returns nothing (see admin/inquiries/[id].astro).
    const actor = req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() || 'admin';
    const noteSuffix = leadGrade ? `status→${status}, grade→${leadGrade}` : `status→${status}`;
    // Use inquiry_id as the lead_id foreign key (existing admin pages may
    // treat these as interchangeable for timeline rendering).
    await Promise.allSettled(
      safeIds.map((id) =>
        fetch(`${SUPABASE_URL}/rest/v1/lead_activities`, {
          method: 'POST',
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: 'Bearer ' + SUPABASE_KEY,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          body: JSON.stringify({
            lead_id: id,
            channel: 'admin',
            direction: 'in',
            activity_type: 'bulk_status_change',
            subject: `Bulk update: ${noteSuffix}`,
            note: `Updated from admin list page by ${actor}`,
            created_at: new Date().toISOString(),
          }),
        })
      )
    );

    // Redirect back to the list page with same filters so the user sees
    // their updated results in the same view.
    const back = (typeof body.redirect_to === 'string' && body.redirect_to.startsWith('/admin/inquiries'))
      ? body.redirect_to
      : '/admin/inquiries/';
    res.setHeader('Location', back);
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


export const prerender = false;
const handler = async (req: any, res: any) => { await _internalHandler(req, res); };
export const POST = toAstroApiRoute(handler);
export const GET = toAstroApiRoute(handler);
