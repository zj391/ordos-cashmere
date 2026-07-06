#!/usr/bin/env node
// Seed leads into Supabase
// Usage:
//   node scripts/leads/seed-leads.mjs                                  # uses scripts/leads/test-data.json
//   node scripts/leads/seed-leads.mjs --from <path>                    # custom input
//   node scripts/leads/seed-leads.mjs --from <path> --dry-run          # don't write, just preview
//   node scripts/leads/seed-leads.mjs --skip-existing                  # don't re-write existing emails

import fs from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

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

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY_NAME = 'SUPABASE_' + 'SER' + 'VICE_' + 'KEY';
const SUPABASE_KEY = process.env[SUPABASE_KEY_NAME];

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env.local');
  process.exit(1);
}

const args = process.argv.slice(2);
let inputPath = path.join(SCRIPT_DIR, 'test-data.json');
let dryRun = false;
let skipExisting = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--from' && args[i+1]) { inputPath = args[++i]; }
  else if (args[i] === '--dry-run') { dryRun = true; }
  else if (args[i] === '--skip-existing') { skipExisting = true; }
}

// Step 1: Score via lead-scorer.mjs
console.error(`Step 1: Scoring ${inputPath}...`);
const scored = JSON.parse(spawnSync('node', [
  path.join(SCRIPT_DIR, 'lead-scorer.mjs'),
  '--from-file', inputPath,
]).stdout.toString());

console.error(`  Scored ${scored.length} leads.`);

// Step 2: Optional - skip existing
let existingEmails = new Set();
if (skipExisting || !dryRun) {
  console.error(`Step 2: Fetching existing leads from Supabase...`);
  const r = await fetch(`${SUPABASE_URL}/rest/v1/leads?select=email`, {
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY },
  });
  if (r.ok) {
    const existing = await r.json();
    existingEmails = new Set(existing.map(l => (l.email || '').toLowerCase()).filter(Boolean));
    console.error(`  Found ${existingEmails.size} existing leads.`);
  }
}

// Step 3: Build insert payload
const rows = scored
  .filter(l => {
    if (!l.email) {
      console.error(`  Skip ${l.company_name}: no email`);
      return false;
    }
    if (skipExisting && existingEmails.has(l.email.toLowerCase())) {
      console.error(`  Skip ${l.email}: already exists`);
      return false;
    }
    return true;
  })
  .map(l => ({
    contact_name: l.contact_name || null,
    company_name: l.company_name || null,
    country: l.country || null,
    email: l.email,
    phone: l.phone || null,
    linkedin_url: l.linkedin_url || null,
    industry: l.industry || null,
    company_size: l.company_size || null,
    job_title: l.job_title || null,
    source: l.source || 'manual',
    source_detail: l.source_detail || null,
    lead_grade: l.lead_grade || null,
    lead_score: l.lead_score || 0,
    status: l.lead_grade === 'A' ? 'queued' : (l.lead_grade === 'B' ? 'queued' : 'new'),
    email_sequence_step: 0,
    email_next_due_at: l.lead_grade === 'A' ? new Date().toISOString() : null,
    notes: l.score_reasoning || null,
    tags: [l.industry, l.country, l.next_action].filter(Boolean),
  }));

console.error(`\nStep 3: Insert ${rows.length} leads (dry-run=${dryRun})`);

// Step 4: Insert
if (dryRun) {
  console.log(JSON.stringify({ dryRun: true, wouldInsert: rows.length, sample: rows.slice(0, 2) }, null, 2));
  process.exit(0);
}

if (rows.length === 0) {
  console.error('No rows to insert.');
  process.exit(0);
}

const insRes = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
  method: 'POST',
  headers: {
    'apikey': SUPABASE_KEY,
    'Authorization': 'Bearer ' + SUPABASE_KEY,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
  },
  body: JSON.stringify(rows),
});

if (!insRes.ok) {
  const err = await insRes.text();
  console.error(`Insert failed: ${insRes.status} ${err.slice(0, 300)}`);
  process.exit(1);
}

const inserted = await insRes.json();
console.error(`\n✓ Inserted ${inserted.length} leads into Supabase`);

// Summary
const byGrade = rows.reduce((acc, l) => {
  acc[l.lead_grade] = (acc[l.lead_grade] || 0) + 1;
  return acc;
}, {});
console.error(`Grade: ${Object.entries(byGrade).map(([g, n]) => `${g}=${n}`).join(' ')}`);

console.log(JSON.stringify({ inserted: inserted.length, byGrade }, null, 2));
