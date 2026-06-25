/**
 * Hermes inbound webhook receiver (Vercel Function)
 * Receives inquiry payloads from api/inquiry.ts on the same project.
 * Stores them in Supabase `inquiries` table (same row as inquiry.ts writes)
 * so the "Hermes-side" log is just a view on the same data.
 *
 * Why: WSL network can't expose local ports. Running on Vercel gives a
 * stable public URL with zero tunnel setup. The "Hermes private system"
 * gets the data via Supabase (which Hermes can read directly), and this
 * endpoint acts as a verification hook + audit log.
 *
 * POST /api/hermes-inbound
 *   Body: { source, event, data: { ...inquiry fields... } }
 *   Optional header: X-Hermes-Token (must match HERMES_INBOUND_TOKEN env)
 *     If env var is set, the token is required; otherwise dev mode.
 *
 * Environment:
 *   SUPABASE_URL                - required
 *   SUPABASE_SERVICE_KEY        - required
 *   HERMES_INBOUND_TOKEN        - optional; if set, request must include matching X-Hermes-Token
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
const EXPECTED_TOKEN = process.env.HERMES_INBOUND_TOKEN;

const supabase = (SUPABASE_URL && SUPABASE_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } })
  : null;

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Health check
  if (req.method === 'GET') {
    return res.status(200).json({
      ok: true,
      service: 'hermes-inbound',
      mode: EXPECTED_TOKEN ? 'token-protected' : 'dev-open',
      supabase: !!supabase,
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'method_not_allowed' });
  }

  // Optional token check
  if (EXPECTED_TOKEN) {
    const token = (req.headers['x-hermes-token'] as string) || '';
    if (!timingSafeEqual(token, EXPECTED_TOKEN)) {
      return res.status(401).json({ success: false, error: 'unauthorized' });
    }
  }

  if (!supabase) {
    return res.status(503).json({
      success: false,
      error: 'supabase_not_configured',
      message: 'Set SUPABASE_URL and SUPABASE_SERVICE_KEY in Vercel env.',
    });
  }

  const body = (req.body || {}) as {
    source?: string;
    event?: string;
    data?: Record<string, any>;
  };

  const data = body.data || {};
  const email = data.email;
  const company = data.company || data.company_name;
  const name = data.name || data.contact_name;

  if (!email || !company || !name) {
    return res.status(400).json({
      success: false,
      error: 'missing_fields',
      required: ['data.email', 'data.company (or company_name)', 'data.name (or contact_name)'],
    });
  }

  // Look up existing known_customer to attach lead_grade
  let knownGrade: string | null = null;
  try {
    const { data: known } = await supabase
      .from('known_customers')
      .select('grade, contact_name, company_name, lifetime_value_usd, tags, notes')
      .eq('contact_email', email)
      .maybeSingle();
    if (known) {
      knownGrade = known.grade || null;
    }
  } catch (e) {
    // Non-fatal: continue without known-customer enrichment
  }

  // Upsert into inquiries as a "hermes-mirror" row (so we have a separate audit trail
  // that's distinguishable from api/inquiry.ts's own write)
  // Using a different `source` field pattern: api/inquiry.ts writes ip_address etc.
  // Here we add a `notes` or use product_interest to mark "via hermes"
  const inquiryType =
    data.inquiry_type ||
    (data.type === 'raw' ? 'raw_material' :
     data.type === 'yarn' ? 'yarn_fabric' :
     data.type === 'garment' ? 'garment_oem' : null);

  const insertPayload = {
    inquiry_type: inquiryType,
    locale: data.locale || 'en',
    contact_name: name,
    company_name: company,
    country: data.country || 'unknown',
    email,
    phone: data.phone || null,
    product_interest: data.product_interest || inquiryType,
    quantity_kg: data.quantity_kg ?? null,
    quantity_m: data.quantity_m ?? null,
    quantity_pcs: data.quantity_pcs ?? null,
    message: data.message || null,
    lead_grade: knownGrade,
    status: 'hermes-mirror',
    utm_source: data.utm_source || 'hermes-inbound',
    utm_medium: data.utm_medium || null,
    utm_campaign: data.utm_campaign || null,
    referrer: data.referrer || null,
    ga_client_id: data.ga_client_id || null,
    ip_address: null,
    user_agent: null,
  };

  const { data: inserted, error: insErr } = await supabase
    .from('inquiries')
    .insert(insertPayload)
    .select('id')
    .single();

  if (insErr) {
    return res.status(500).json({
      success: false,
      error: 'insert_failed',
      detail: insErr.message,
    });
  }

  return res.status(200).json({
    success: true,
    stored: true,
    inquiry_id: inserted?.id,
    known_customer_grade: knownGrade,
    source: body.source || 'unknown',
    event: body.event || 'inquiry',
    received_at: new Date().toISOString(),
  });
}
