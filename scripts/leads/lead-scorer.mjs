#!/usr/bin/env node
// AI lead scoring for B2B cashmere sales
// Usage:
//   LLM_API_KEY=*** LLM_MODEL=deepseek-chat node scripts/leads/lead-scorer.mjs '{"contact_name":"John",...}'
//   echo '[{...}, {...}]' | node scripts/leads/lead-scorer.mjs --stdin
//   node scripts/leads/lead-scorer.mjs --from-file scripts/leads/test-data.json

import fs from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(new URL('.', import.meta.url).pathname, '../..');
const SCRIPT_DIR = path.resolve(new URL('.', import.meta.url).pathname);

// Load .env.local
try {
  const c = readFileSync(path.join(ROOT, '.env.local'), 'utf-8');
  for (const line of c.split('\n')) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.+?)\s*$/);
    if (!m) continue;
    let v = m[2];
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    process.env[m[1]] = v;
  }
} catch {}

const LLM_API_URL = process.env.LLM_API_URL || 'https://api.deepseek.com/v1/chat/completions';
const KEY_NAME = 'LLM_' + 'API_' + 'KEY';
const LLM_API_KEY = process.env[KEY_NAME] || process.env.DEEPSEEK_KEY || '';
const LLM_MODEL = process.env.LLM_MODEL || 'deepseek-chat';

if (!LLM_API_KEY) {
  console.error('No LLM key (LLM_API_KEY or DEEPSEEK_KEY) in .env.local');
  process.exit(1);
}

// Read leads from args
async function getLeads() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: lead-scorer.mjs <json> | --stdin | --from-file <path>');
    process.exit(1);
  }
  if (args[0] === '--stdin') {
    return JSON.parse(readFileSync(0, 'utf-8'));
  }
  if (args[0] === '--from-file') {
    const p = path.isAbsolute(args[1]) ? args[1] : path.join(ROOT, args[1]);
    return JSON.parse(readFileSync(p, 'utf-8'));
  }
  if (args[0].startsWith('[')) {
    return JSON.parse(args[0]);
  }
  if (args[0].startsWith('{')) {
    return [JSON.parse(args[0])];
  }
  console.error('First arg must be JSON array, --stdin, or --from-file');
  process.exit(1);
}

const SCORING_PROMPT = `You are a B2B sales strategist for DONGXIAO Cashmere, a 23-year-old source factory in Ordos, Inner Mongolia. We sell cashmere raw material, yarn/fabric, and garment OEM to global luxury brands, distributors, and wholesalers.

Score each lead 0-100 based on:
- INDUSTRY fit (luxury_brand/distributor/wholesaler > manufacturer/retailer)
- COMPANY_SIZE (mid > small > solo; large preferred if luxury/distributor)
- GEOGRAPHY (US/IT/DE/FR/GB/JP/KR > ES/CN/AE/AT/CA/RU)
- JOB_TITLE (CEO/Sourcing Director/Buyer/Procurement > other)
- CONTACT_QUALITY (has email + phone + LinkedIn > just email)

Scoring tiers:
- A: 75-100 (高意向, 主动出击 day 0)
- B: 55-74 (潜力, 培育 7-14 天)
- C: 35-54 (长期培育, 30 天)
- D: 0-34 (不主动接触, 等对方来)

For each lead, return JSON with:
{
  "score": <int 0-100>,
  "grade": "A" | "B" | "C" | "D",
  "reasoning": "<1-2 sentence why this score>",
  "next_action": "day_0_email" | "day_7_email" | "day_30_email" | "skip"
}

Output: a JSON array matching input order. ONLY JSON, no markdown fences, no preamble.`;

async function callLLM(leads) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 120000);
  try {
    const res = await fetch(LLM_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + LLM_API_KEY },
      body: JSON.stringify({
        model: LLM_MODEL,
        messages: [
          { role: 'system', content: SCORING_PROMPT },
          { role: 'user', content: `Score these ${leads.length} leads:\n\n${JSON.stringify(leads, null, 2)}` },
        ],
        temperature: 0.3,
        max_tokens: 4000,
      }),
      signal: ctrl.signal,
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`LLM ${res.status}: ${t.slice(0, 300)}`);
    }
    const d = await res.json();
    const content = d?.choices?.[0]?.message?.content || '';
    const cleaned = content.replace(/^```json?\n?/i, '').replace(/\n?```$/i, '').trim();
    return JSON.parse(cleaned);
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  const leads = await getLeads();
  if (!Array.isArray(leads)) {
    console.error('Leads must be a JSON array');
    process.exit(1);
  }
  console.error(`Scoring ${leads.length} leads via ${LLM_MODEL}...`);
  const t0 = Date.now();
  const scores = await callLLM(leads);
  if (!Array.isArray(scores) || scores.length !== leads.length) {
    console.error('LLM returned wrong shape (not array or length mismatch)');
    process.exit(1);
  }
  // Merge
  const enriched = leads.map((l, i) => ({
    ...l,
    lead_score: scores[i].score,
    lead_grade: scores[i].grade,
    score_reasoning: scores[i].reasoning,
    next_action: scores[i].next_action,
  }));
  // Output to stdout
  console.log(JSON.stringify(enriched, null, 2));
  console.error(`\nDone in ${Date.now() - t0}ms`);
  // Summary
  const byGrade = enriched.reduce((acc, l) => {
    acc[l.lead_grade] = (acc[l.lead_grade] || 0) + 1;
    return acc;
  }, {});
  console.error(`\nGrade distribution: ${Object.entries(byGrade).map(([g, n]) => `${g}=${n}`).join(' ')}`);
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
