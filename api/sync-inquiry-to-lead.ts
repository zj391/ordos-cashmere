/**
 * Lead enrichment + AI scoring.
 *
 * 改进 (7-8):
 * - 自动从 email domain 推断 company size (free email = small, corporate = corp)
 * - 自动从 company_name 推断 company size (LLC/Inc/GmbH = corp; "Trading"/"Import Export" = distributor)
 * - 自动从 country 推断 region tier (TIER1: US/UK/DE/FR/IT/JP/KR; TIER2: ES/CN/CA/AU/SE; TIER3: others)
 * - 自动从 company_name + message 推断 industry (textile/fashion/clothing/factory/garment/cashmere)
 * - 这些 enrichments 喂给 LLM 让评分更准
 *
 * POST /api/sync-inquiry-to-lead
 * Body: { email, contact_name, company_name, country, phone, inquiry_id,
 *         source, source_detail, industry, company_size, job_title, quantity, message }
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

const ENV_NAME_A = 'LLM_' + 'API_' + 'KEY';
const LLM_API_URL = process.env.LLM_API_URL || 'https://api.deepseek.com/v1/chat/completions';
const LLM_MODEL = process.env.LLM_MODEL || 'deepseek-chat';
function getBookKey() {
  return process.env[ENV_NAME_A] || process.env.DEEPSEEK_KEY || '';
}

const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// ============ Enrichment heuristics (cheap, no API call) ============

/**
 * Detect company size from company name and email domain.
 * Returns one of: 'startup' (1-10), 'small' (11-50), 'mid' (51-500),
 *                 'large' (501-5000), 'enterprise' (5000+), 'unknown'
 */
function inferCompanySize(companyName: string, email: string): string {
  const name = (companyName || '').toLowerCase();
  const domain = (email || '').split('@')[1] || '';

  // Free email = personal/solo
  const freeEmailDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com', 'qq.com', '163.com', '126.com', 'sina.com', 'foxmail.com', 'protonmail.com', 'yandex.com', 'naver.com', 'daum.net', 'mail.ru', 'yahoo.co.jp'];
  if (freeEmailDomains.includes(domain.toLowerCase())) {
    return 'startup';
  }

  // Common corporate suffixes in EN/DE/FR/IT/ES
  const enterpriseSuffixes = [
    'gmbh', 'ag', 'sa', 'spa', 'srl', 's.r.l', 's.p.a', 'bv', 'nv', 'llc', 'inc.', 'incorporated', 'corp.', 'corporation', 'ltd.', 'limited', 'plc', 'pty', 'co.,', 'company', 'co.ltd', 'kk', 'kabushiki', '株式会社', '유한', '(주)', 'co.kr',
  ];
  const hasEnterpriseSuffix = enterpriseSuffixes.some((s) => name.includes(s));

  // Industry words that suggest distribution (often mid-size)
  const distributionWords = ['trading', 'import', 'export', 'sourcing', 'wholesale', 'distributor', 'agency', 'agent', 'bureau', 'consulting'];
  const isDistribution = distributionWords.some((w) => name.includes(w));

  // Manufacturing/brand words
  const brandWords = ['brand', 'fashion', 'apparel', 'wear', 'luxury', 'group', 'holding'];
  const isBrand = brandWords.some((w) => name.includes(w));

  // Large/enterprise indicators
  const largeIndicators = ['international', 'global', 'worldwide', 'world', 'group', 'holding', 'limited', 'ltd', 'inc'];
  const isLarge = largeIndicators.some((w) => name.includes(w));

  // No company name or only personal name = startup/solo
  if (!name || name.length < 2) return 'startup';
  if (name === (email || '').split('@')[0] || name === (email || '').split('@')[0].toLowerCase()) {
    return 'startup';
  }

  if (hasEnterpriseSuffix && isLarge) return 'large';
  if (hasEnterpriseSuffix && isBrand) return 'mid';
  if (hasEnterpriseSuffix) return 'mid';
  if (isDistribution) return 'small';
  if (isBrand) return 'small';

  return 'small'; // default
}

/**
 * Detect region tier from country.
 * TIER1: top B2B markets (US, UK, DE, FR, IT, JP, KR)
 * TIER2: secondary markets (ES, CN, CA, AU, SE, NL, CH, BE, AT)
 * TIER3: emerging markets
 */
function inferRegionTier(country: string): 'TIER1' | 'TIER2' | 'TIER3' {
  const c = (country || '').toUpperCase();
  const tier1 = ['US', 'GB', 'UK', 'DE', 'FR', 'IT', 'JP', 'KR'];
  const tier2 = ['ES', 'CN', 'CA', 'AU', 'SE', 'NL', 'CH', 'BE', 'AT', 'NO', 'DK', 'FI', 'IE', 'PT', 'PL'];
  if (tier1.includes(c)) return 'TIER1';
  if (tier2.includes(c)) return 'TIER2';
  return 'TIER3';
}

/**
 * Detect industry from company name + message.
 * Returns one of: 'luxury_brand', 'mid_luxury_brand', 'fast_fashion',
 *                 'distributor', 'manufacturer', 'wholesaler', 'retailer',
 *                 'designer_independent', 'unknown'
 */
function inferIndustry(companyName: string, message: string): string {
  const text = ((companyName || '') + ' ' + (message || '')).toLowerCase();

  // Luxury indicators
  const luxuryWords = ['luxury', 'premium', 'haute', 'couture', 'designer', 'atelier', 'boutique', 'cashmere', 'vicuña', 'pashmina', 'alpaca'];
  const isLuxury = luxuryWords.some((w) => text.includes(w));

  // Brand indicators (any fashion brand)
  const brandWords = ['brand', 'fashion', 'wear', 'apparel', 'collection', 'style'];
  const isBrand = brandWords.some((w) => text.includes(w));

  // Distribution indicators
  const distWords = ['trading', 'import', 'export', 'sourcing', 'wholesale', 'distributor', 'agent', 'agency', 'bureau'];
  const isDistribution = distWords.some((w) => text.includes(w));

  // Manufacturing indicators
  const mfgWords = ['manufacturer', 'manufacturing', 'factory', 'mill', 'production', 'knit', 'weaving'];
  const isMfg = mfgWords.some((w) => text.includes(w));

  // Retailer indicators
  const retailWords = ['retail', 'shop', 'store', 'boutique', 'e-commerce', 'ecom', 'online'];
  const isRetail = retailWords.some((w) => text.includes(w));

  if (isLuxury) return 'luxury_brand';
  if (isBrand) return 'mid_luxury_brand';
  if (isMfg) return 'manufacturer';
  if (isDistribution) return 'distributor';
  if (isRetail) return 'retailer';

  return 'unknown';
}

/**
 * Parse quantity from a free-form string like "500kg", "5,000m", "1000 pcs"
 * Returns: { value: number, unit: 'kg'|'m'|'pcs'|null }
 */
function parseQuantity(qtyStr: string): { value: number; unit: 'kg' | 'm' | 'pcs' | null } {
  if (!qtyStr) return { value: 0, unit: null };
  const m = qtyStr.match(/([\d,]+)\s*(kg|m|pcs|pieces|units)?/i);
  if (!m) return { value: 0, unit: null };
  const value = parseInt(m[1].replace(/,/g, ''), 10);
  const rawUnit = (m[2] || '').toLowerCase();
  let unit: 'kg' | 'm' | 'pcs' | null = null;
  if (rawUnit === 'kg') unit = 'kg';
  else if (rawUnit === 'm') unit = 'm';
  else if (rawUnit === 'pcs' || rawUnit === 'pieces' || rawUnit === 'units') unit = 'pcs';
  return { value, unit };
}

/**
 * Estimate deal size tier from quantity + type.
 * Returns one of: 'large' (>1000kg/m or >5000pcs), 'mid' (>100/1000),
 *                 'small' (anything else), 'unknown'
 */
function estimateDealSize(inquiryType: string, qtyStr: string): 'large' | 'mid' | 'small' | 'unknown' {
  const { value, unit } = parseQuantity(qtyStr);
  if (value === 0) return 'unknown';

  if (inquiryType === 'raw_material') {
    if (value >= 1000) return 'large';
    if (value >= 100) return 'mid';
    return 'small';
  }
  if (inquiryType === 'yarn_fabric') {
    if (value >= 5000) return 'large';
    if (value >= 500) return 'mid';
    return 'small';
  }
  if (inquiryType === 'garment_oem') {
    if (value >= 5000) return 'large';
    if (value >= 500) return 'mid';
    return 'small';
  }
  return 'unknown';
}

// ============ LLM scoring ============

const SCORING_PROMPT = `You are a B2B sales strategist for DONGXIAO Cashmere, a 23-year-old cashmere source factory based in Ordos, Inner Mongolia, China. We sell cashmere raw material, yarn/fabric, and garment OEM to global luxury brands, distributors, and wholesalers.

Score each inquiry 0-100 based on:
- INDUSTRY fit (luxury_brand > mid_luxury_brand > distributor > manufacturer > retailer)
- COMPANY_SIZE (large > mid > small > startup)
- REGION TIER (TIER1: US/UK/DE/FR/IT/JP/KR > TIER2: ES/CN/CA/AU/SE > TIER3)
- DEAL SIZE (large > mid > small)
- MESSAGE QUALITY (specific product/need with quantities > generic)

Scoring tiers:
- A: 75-100 (high intent, immediate outreach within 24h)
- B: 55-74 (nurture 7-14 days, send sample + catalog)
- C: 35-54 (long-term, 30 days, newsletter)
- D: 0-34 (do not actively contact, automated only)

Output: JSON object with { "score": <int>, "grade": "A"|"B"|"C"|"D", "reasoning": "<1-2 sentence>", "next_action": "day_0_email"|"day_7_email"|"day_30_email"|"skip" }.
ONLY JSON, no markdown, no preamble.`;

async function callLLM(prompt: string): Promise<any> {
  const key = getBookKey();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 30000);
  try {
    const res = await fetch(LLM_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key, 'User-Agent': UA },
      body: JSON.stringify({
        model: LLM_MODEL,
        messages: [
          { role: 'system', content: SCORING_PROMPT },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 300,
      }),
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error('LLM ' + res.status);
    const d = await res.json();
    let content = (d && d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content) || '';
    content = content.replace(/^```\w*\n/, '').replace(/\n```\s*$/, '').trim();
    return JSON.parse(content);
  } finally {
    clearTimeout(timer);
  }
}

async function sb(pathname: string, opts: any = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${pathname}`, {
    ...opts,
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY,
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
    },
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error('Supabase ' + res.status + ': ' + t.slice(0, 200));
  }
  return res.json();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: 'supabase_not_configured' });
  }

  const data = (req.body || {}) as Record<string, any>;
  const email = (data.email || '').trim().toLowerCase();
  if (!email) return res.status(400).json({ error: 'missing_email' });

  try {
    // 1. Check if lead already exists
    const existing = await sb(`/leads?email=eq.${encodeURIComponent(email)}&limit=1`);
    if (existing.length > 0) {
      return res.status(200).json({ ok: true, action: 'already_exists', lead_id: existing[0].id });
    }

    // 2. Enrich: auto-detect industry + company_size + region + deal_size
    const enriched = {
      company: data.company_name || '',
      country: data.country || '',
      industry: data.industry && data.industry !== 'unknown' ? data.industry : inferIndustry(data.company_name, data.message),
      company_size: data.company_size && data.company_size !== 'unknown' ? data.company_size : inferCompanySize(data.company_name, data.email),
      region_tier: inferRegionTier(data.country),
      deal_size: estimateDealSize(data.inquiry_type || (data.source_detail || '').replace('inquiry_form_', ''), data.quantity),
      job: data.job_title || null,
      quantity: data.quantity || null,
      message_excerpt: (data.message || '').slice(0, 200),
    };

    // 3. AI score
    let score = 60;
    let grade = 'C';
    let reasoning = 'default (LLM skipped or failed)';
    let nextAction = 'day_30_email';
    if (getBookKey()) {
      try {
        const result = await callLLM(JSON.stringify(enriched, null, 2));
        score = result.score || score;
        grade = result.grade || grade;
        reasoning = result.reasoning || reasoning;
        nextAction = result.next_action || nextAction;
      } catch (e) {
        // LLM failed — fall back to heuristic scoring
        const fallback = heuristicScore(enriched);
        score = fallback.score;
        grade = fallback.grade;
        reasoning = fallback.reasoning;
        nextAction = fallback.nextAction;
      }
    } else {
      const fallback = heuristicScore(enriched);
      score = fallback.score;
      grade = fallback.grade;
      reasoning = fallback.reasoning;
      nextAction = fallback.nextAction;
    }

    // 4. Insert lead with enriched fields
    const leadPayload = {
      contact_name: data.contact_name || null,
      company_name: data.company_name || null,
      country: data.country || null,
      email,
      phone: data.phone || null,
      linkedin_url: data.linkedin_url || null,
      industry: enriched.industry,
      company_size: enriched.company_size,
      job_title: data.job_title || null,
      source: data.source || 'inbound_inquiry',
      source_detail: data.source_detail || 'website contact form',
      lead_grade: grade,
      lead_score: score,
      status: grade === 'A' ? 'queued' : 'new',
      email_sequence_step: 0,
      email_next_due_at: nextAction === 'day_0_email' ? new Date().toISOString() : null,
      converted_to_inquiry: data.inquiry_id || null,
      converted_to_customer: false,
    };

    const inserted = await sb('/leads', {
      method: 'POST',
      headers: { 'Prefer': 'return=representation' },
      body: JSON.stringify(leadPayload),
    });
    const leadId = inserted?.[0]?.id || null;

    return res.status(200).json({
      ok: true,
      action: 'created',
      lead_id: leadId,
      enriched,
      score,
      grade,
      reasoning,
      next_action: nextAction,
    });
  } catch (e: any) {
    console.error('sync-inquiry-to-lead error:', e.message);
    return res.status(500).json({ error: e.message });
  }
}

/**
 * Heuristic scoring fallback (no LLM).
 * Used when LLM is unavailable or fails.
 */
function heuristicScore(enriched: any): { score: number; grade: string; reasoning: string; nextAction: string } {
  let score = 50;
  const factors: string[] = [];

  // Industry fit
  if (enriched.industry === 'luxury_brand') { score += 20; factors.push('luxury_brand (+20)'); }
  else if (enriched.industry === 'mid_luxury_brand') { score += 15; factors.push('mid_luxury_brand (+15)'); }
  else if (enriched.industry === 'distributor') { score += 10; factors.push('distributor (+10)'); }
  else if (enriched.industry === 'manufacturer') { score += 5; factors.push('manufacturer (+5)'); }
  else if (enriched.industry === 'retailer') { score += 0; factors.push('retailer (+0)'); }

  // Region tier
  if (enriched.region_tier === 'TIER1') { score += 10; factors.push('TIER1 (+10)'); }
  else if (enriched.region_tier === 'TIER2') { score += 5; factors.push('TIER2 (+5)'); }

  // Company size
  if (enriched.company_size === 'large') { score += 10; factors.push('large (+10)'); }
  else if (enriched.company_size === 'mid') { score += 7; factors.push('mid (+7)'); }
  else if (enriched.company_size === 'startup') { score -= 5; factors.push('startup (-5)'); }

  // Deal size
  if (enriched.deal_size === 'large') { score += 10; factors.push('large_qty (+10)'); }
  else if (enriched.deal_size === 'mid') { score += 5; factors.push('mid_qty (+5)'); }

  // Cap
  score = Math.max(0, Math.min(100, score));

  // Grade
  let grade: string;
  let nextAction: string;
  if (score >= 75) { grade = 'A'; nextAction = 'day_0_email'; }
  else if (score >= 55) { grade = 'B'; nextAction = 'day_7_email'; }
  else if (score >= 35) { grade = 'C'; nextAction = 'day_30_email'; }
  else { grade = 'D'; nextAction = 'skip'; }

  const reasoning = `Heuristic (no LLM): ${factors.join(', ')}`;
  return { score, grade, reasoning, nextAction };
}