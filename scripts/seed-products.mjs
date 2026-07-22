#!/usr/bin/env node
/**
 * Seed products from src/data/products.json into Supabase.
 *
 * Usage:
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_KEY=ey... \
 *   node scripts/seed-products.mjs
 *
 * Idempotent: re-running is safe. Uses Prefer: resolution=ignore-duplicates
 * to skip rows that already exist (matched on PK id). To REPLACE existing
 * rows instead, set UPSERT=1.
 *
 * The script reads:
 *   - SUPABASE_URL          (defaults to PUBLIC_SUPABASE_URL)
 *   - SUPABASE_SERVICE_KEY  (no anon fallback — writes need service role)
 *
 * Exits non-zero on any failed row, prints a summary at the end.
 */
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL || '';
const KEY = process.env.SUPABASE_SERVICE_KEY || '';
const UPSERT = process.env.UPSERT === '1';

if (!SUPABASE_URL || !KEY) {
  console.error('Missing env vars. Set SUPABASE_URL and SUPABASE_SERVICE_KEY.');
  process.exit(2);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataPath = join(__dirname, '..', 'src', 'data', 'products.json');
const raw = await readFile(dataPath, 'utf8');
const data = JSON.parse(raw);

function pick(p) {
  // Map JSON product → Supabase row. Drop fields that don't have a column
  // (detailedDescription, knittingTechnology, sizes, etc). Trim strings,
  // dedupe array fields, coerce MOQ to integer.
  const trimArr = (v) => Array.isArray(v) ? Array.from(new Set(v.map((s) => String(s ?? '').trim()).filter(Boolean))) : [];
  const str = (v) => (v == null ? null : String(v).trim() || null);
  const intOrNull = (v) => {
    if (v == null || v === '') return null;
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : null;
  };
  return {
    id: String(p.id),
    category_id: p.category_id || p._category_id, // set by caller below
    code: str(p.code),
    name: str(p.name),
    moq: intOrNull(p.moq),
    price: str(p.price),
    currency: str(p.currency) || 'USD',
    material: str(p.material),
    micron: str(p.micron),
    lead: str(p.lead),
    description: str(p.description),
    colors: trimArr(p.colors),
    images: trimArr(p.images),
    tags: trimArr(p.tags),
    weight: str(p.weight),
    sample_time: str(p.sample_time),
  };
}

const rows = [];
for (const cat of data.categories || []) {
  for (const p of cat.products || []) {
    rows.push(pick({ ...p, _category_id: cat.id }));
  }
}
console.log(`Parsed ${rows.length} products from ${dataPath}`);

// Batch insert in chunks of 100 (PostgREST handles up to ~1000 fine but we
// keep it small for clearer progress logs).
const BATCH = 100;
const results = { inserted: 0, skipped: 0, failed: 0, errors: [] };

for (let i = 0; i < rows.length; i += BATCH) {
  const batch = rows.slice(i, i + BATCH);
  const headers = {
    apikey: KEY,
    Authorization: `Bearer ${KEY}`,
    'Content-Type': 'application/json',
    Prefer: UPSERT ? 'resolution=merge-duplicates' : 'resolution=ignore-duplicates,return=minimal',
  };
  const r = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
    method: 'POST',
    headers,
    body: JSON.stringify(batch),
  });
  if (r.ok) {
    const text = await r.text();
    // ignore-duplicates returns no rows; merge-duplicates returns the updated rows
    if (text && text !== '[]' && text !== '') {
      try {
        const arr = JSON.parse(text);
        results.inserted += Array.isArray(arr) ? arr.length : batch.length;
      } catch {
        results.inserted += batch.length;
      }
    } else {
      results.skipped += batch.length;
    }
    console.log(`  batch ${i / BATCH + 1}/${Math.ceil(rows.length / BATCH)}: ${r.status} (${batch.length} rows)`);
  } else {
    results.failed += batch.length;
    const err = `${r.status} ${await r.text()}`;
    results.errors.push(`batch ${i / BATCH + 1}: ${err}`);
    console.error(`  batch ${i / BATCH + 1} FAILED: ${err}`);
  }
}

console.log();
console.log('Summary:');
console.log(`  inserted/updated: ${results.inserted}`);
console.log(`  skipped (duplicate): ${results.skipped}`);
console.log(`  failed: ${results.failed}`);
if (results.errors.length) {
  console.log('  errors:');
  for (const e of results.errors) console.log(`    - ${e}`);
}

// Verify final row count
const verify = await fetch(`${SUPABASE_URL}/rest/v1/products?select=id`, {
  headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
});
if (verify.ok) {
  const final = await verify.json();
  console.log(`\nFinal row count in Supabase products table: ${final.length}`);
}

process.exit(results.failed > 0 ? 1 : 0);