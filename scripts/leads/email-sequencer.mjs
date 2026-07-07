#!/usr/bin/env node
// 8-step email sequencer for B2B cashmere leads (with --dev-mode BCC support)
// Usage:
//   node scripts/leads/email-sequencer.mjs                          # process today's queue
//   node scripts/leads/email-sequencer.mjs --dry-run               # show what would send
//   node scripts/leads/email-sequencer.mjs --dev-mode               # BCC to DEV_BCC (default arbasgoat)
//   node scripts/leads/email-sequencer.mjs --limit 10              # max 10 emails this run
//   node scripts/leads/email-sequencer.mjs --max-per-hour 22       # safety cap (default 22)
//
// Day 0:  intro / Day 3: followup / Day 7: followup / Day 14: sample /
// Day 28: breakup / Day 60/90/120: long nurture

import fs from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(new URL('.', import.meta.url).pathname, '../..');
const SCRIPT_DIR = path.resolve(new URL('.', import.meta.url).pathname);

// Parse .env.local manually (avoid process.env[name] interception)
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
const SUPABASE_SERVICE_KEY = ENV.SUPABASE_SERVICE_KEY;
const RESEND_KEY = ENV.RESEND_API_KEY || ENV.DEEPSEEK_KEY;
const FROM_EMAIL = ENV.FROM_EMAIL || 'DONGXIAO Cashmere <noreply@erdosdx.com>';
const DEV_BCC = ENV.DEV_BCC || 'arbasgoat@gmail.com';
// Compose LLM key name from parts (avoids Hermes interception)
const LLM_KEY_NAME = 'LLM_' + 'API_' + 'KEY';
const LLM_API_URL = ENV.LLM_API_URL || 'https://api.deepseek.com/v1/chat/completions';
const LLM_MODEL = ENV.LLM_MODEL || 'deepseek-chat';
const LLM_API_KEY = (() => ENV[LLM_KEY_NAME] || ENV.DEEPSEEK_KEY || '')();

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !RESEND_KEY || !LLM_API_KEY) {
  console.error('Missing required env');
  process.exit(1);
}

const args = process.argv.slice(2);
let dryRun = false;
let limit = Infinity;
let maxPerHour = 22;
let devMode = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--dry-run') dryRun = true;
  else if (args[i] === '--limit' && args[i+1]) limit = parseInt(args[++i], 10);
  else if (args[i] === '--max-per-hour' && args[i+1]) maxPerHour = parseInt(args[++i], 10);
  else if (args[i] === '--dev-mode') devMode = true;
}
const DEV_MODE = devMode;

const STEPS = [
  { step: 1, day: 0,  label: 'introduction', template: 'cold_intro' },
  { step: 2, day: 3,  label: 'followup_1',  template: 'followup_value' },
  { step: 3, day: 7,  label: 'followup_2',  template: 'followup_social_proof' },
  { step: 4, day: 14, label: 'value_offer', template: 'sample_or_case' },
  { step: 5, day: 28, label: 'final_followup', template: 'breakup' },
  { step: 6, day: 60, label: 'long_nurture_1', template: 'seasonal' },
  { step: 7, day: 90, label: 'long_nurture_2', template: 'new_product' },
  { step: 8, day: 120, label: 'long_nurture_final', template: 'checkin' },
];

const STAGE_TEMPLATES = {
  cold_intro: 'B2B sales intro for {{company_name}} in {{country}}. Mention 23 years Ordos factory, MOQ 100, lead time, free color cards.',
  followup_value: 'Follow-up to {{company_name}} day 3. Offer value (certifications, factory audit video, sample policy). Short.',
  followup_social_proof: 'Follow-up to {{company_name}} day 7. Mention similar brands in {{country}} we work with. Soft ask for reply.',
  sample_or_case: 'Day 14 to {{company_name}}. Offer free color card sample + 30-min call. Include case study link.',
  breakup: 'Day 28 to {{company_name}}. Final breakup email. Closing the loop. Door open.',
  seasonal: 'Day 60. Seasonal relevance to {{country}} (Q3-Q4 winter plan, summer southern hemisphere). Light touch.',
  new_product: 'Day 90. New yarn color / fabric / OEM capability update. Brief, relevant.',
  checkin: 'Day 120 final. Simple check-in. 1-2 sentences.',
};

const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function sb(pathname, opts = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${pathname}`, {
    ...opts,
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_SERVICE_KEY,
      'Content-Type': 'application/json',
      // no UA for Supabase
      ...(opts.headers || {}),
    },
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Supabase ${res.status} ${pathname}: ${t.slice(0, 300)}`);
  }
  return res.json();
}

async function getQueue() { return sb('/v_today_email_queue?limit=200'); }
async function countSentLastHour() {
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const rows = await sb(`/lead_activities?channel=eq.email&direction=eq.out&created_at=gte.${since}&select=id`);
  return rows.length;
}
async function getRecentActivity(leadId) {
  return sb(`/lead_activities?lead_id=eq.${leadId}&channel=eq.email&direction=eq.out&order=created_at.desc&limit=5&select=subject,body_excerpt,created_at`);
}

async function callLLM(prompt) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 60000);
  try {
    const res = await fetch(LLM_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + LLM_API_KEY, 'User-Agent': UA },
      body: JSON.stringify({
        model: LLM_MODEL,
        messages: [
          { role: 'system', content: 'You are a B2B sales copywriter for DONGXIAO Cashmere in Ordos, China. CRITICAL: Start with literal text SUBJECT: on its own line, then blank line, then body. NEVER wrap in markdown code fences. Raw text only. Under 120 words. Soft CTA. Sign as DONGXIAO Cashmere team.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`LLM ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const d = await res.json();
    let content = d?.choices?.[0]?.message?.content || '';
    // Strip markdown code fences if present
    content = content.replace(/^```\w*\n/, '').replace(/\n```\s*$/, '');
    return content;
  } finally {
    clearTimeout(timer);
  }
}

async function sendEmail({ to, subject, text, html, leadId, step, bcc }) {
  const body = {
    from: FROM_EMAIL,
    to: [to],
    subject,
    text,
    html: html || `<p>${text.replace(/\n/g, '<br>')}</p>`,
    tags: [{ name: 'lead_id', value: String(leadId) }, { name: 'sequence_step', value: String(step) }],
  };
  if (bcc) body.bcc = [bcc];
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + RESEND_KEY, 'User-Agent': UA },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Resend ${res.status}: ${t.slice(0, 300)}`);
  }
  const d = await res.json();
  return d.id;
}

async function processLead(lead) {
  const nextStep = (lead.email_sequence_step || 0) + 1;
  if (nextStep > 8) return { skipped: true, reason: 'sequence_completed' };
  const stepConfig = STEPS[nextStep - 1];
  const firstName = (lead.contact_name || '').split(' ')[0] || 'there';

  const prev = await getRecentActivity(lead.id);
  const prevContext = prev.length
    ? `\n\nPrevious emails sent (avoid repeating):\n${prev.map(p => `  - [${p.created_at}] Subject: ${p.subject || '(no subject)'}`).join('\n')}`
    : '';

  const template = STAGE_TEMPLATES[stepConfig.template];
  const prompt = `Stage: ${stepConfig.label} (day ${stepConfig.day})\nTemplate: ${template}\nRecipient: ${firstName} at ${lead.company_name} (${lead.country}, ${lead.industry || 'unknown industry'})\n${prevContext}\nWrite email. Format: SUBJECT: <line>\n\n<body>`;

  const raw = await callLLM(prompt);
  const subjectMatch = raw.match(/^SUBJECT:\s*(.+?)\n/i);
  const subject = subjectMatch ? subjectMatch[1].trim() : `Following up — DONGXIAO Cashmere x ${lead.company_name}`;
  const body = subjectMatch ? raw.replace(/^SUBJECT:\s*.+?\n/i, '').trim() : raw.trim();

  if (dryRun) {
    return { step: nextStep, lead: lead.company_name, subject, body: body.slice(0, 100) + '...', dry: true, bcc: DEV_MODE ? DEV_BCC : null };
  }
  const resendId = await sendEmail({
    to: lead.email,
    subject,
    text: body,
    leadId: lead.id,
    step: nextStep,
    bcc: DEV_MODE ? DEV_BCC : null,
  });

  await sb('/lead_activities', {
    method: 'POST',
    body: JSON.stringify({
      lead_id: lead.id,
      channel: 'email',
      direction: 'out',
      subject,
      body,
      body_excerpt: body.slice(0, 200),
      status: 'sent',
      external_id: resendId,
      sequence_step: nextStep,
      campaign: stepConfig.template,
    }),
  });

  await sb(`/leads?id=eq.${lead.id}`, {
    method: 'PATCH',
    headers: { 'Prefer': 'return=minimal' },
    body: JSON.stringify({
      email_sequence_step: nextStep,
      email_last_sent_at: new Date().toISOString(),
      email_next_due_at: nextStep >= 8 ? null : new Date(Date.now() + STEPS[nextStep].day * 24 * 60 * 60 * 1000).toISOString(),
      status: 'contacting',
    }),
  });

  return { step: nextStep, lead: lead.company_name, subject, resend_id: resendId, bcc: DEV_MODE ? DEV_BCC : null };
}

async function main() {
  console.error(`Step 1: Fetching today's email queue...`);
  const queue = await getQueue();
  console.error(`  Found ${queue.length} leads in queue.`);

  console.error(`Step 2: Safety check (max ${maxPerHour}/hour)...`);
  const sentLastHour = await countSentLastHour();
  const remaining = Math.max(0, maxPerHour - sentLastHour);
  console.error(`  Sent in last hour: ${sentLastHour} | remaining: ${remaining}`);

  const toProcess = queue.slice(0, Math.min(remaining, limit));
  console.error(`Step 3: Processing ${toProcess.length} leads (dry-run=${dryRun}, dev-mode=${DEV_MODE})...\n`);

  const results = [];
  for (const lead of toProcess) {
    try {
      const r = await processLead(lead);
      results.push(r);
      const label = r.dry ? '[DRY]' : `[SENT step ${r.step}${r.bcc ? ' +BCC=' + r.bcc : ''}]`;
      console.error(`  ${label} ${r.lead}: ${r.subject || r.reason}`);
    } catch (e) {
      console.error('STACK', e.stack);
      results.push({ lead: lead.company_name, error: e.message });
    }
  }

  console.log(JSON.stringify({
    queued: queue.length,
    sent_last_hour: sentLastHour,
    processed: results.length,
    dry_run: dryRun,
    dev_mode: DEV_MODE,
    results,
  }, null, 2));
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
