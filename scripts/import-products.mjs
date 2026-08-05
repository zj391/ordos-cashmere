/**
 * Import the static catalog (src/data/products.json) into Supabase.
 *
 * Prerequisites:
 *   1. Run docs/install-products-table.sql in the Supabase SQL Editor once.
 *   2. SUPABASE_URL + SUPABASE_SERVICE_KEY must be in .env.local / .env
 *      (they already are for this project).
 *
 * Usage:
 *   node scripts/import-products.mjs
 *
 * Idempotent: categories and products are upserted (on_conflict=id), so
 * re-running just refreshes existing rows and adds new ones.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

// ---- load env (dotenv-lite: .env.local > .env > .env.vercel) ----
function loadEnv(file) {
  const out = {};
  try {
    const raw = readFileSync(file, 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const t = line.trim();
      if (!t || t.startsWith('#')) continue;
      const eq = t.indexOf('=');
      if (eq <= 0) continue;
      const k = t.slice(0, eq).trim();
      let v = t.slice(eq + 1).trim();
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
        v = v.slice(1, -1);
      }
      if (!(k in out)) out[k] = v;
    }
  } catch {
    /* file missing */
  }
  return out;
}

const env = {
  ...loadEnv(path.join(root, '.env.vercel')),
  ...loadEnv(path.join(root, '.env')),
  ...loadEnv(path.join(root, '.env.local')),
  ...process.env,
};

const SUPABASE_URL = (env.SUPABASE_URL || env.PUBLIC_SUPABASE_URL || '').replace(/\/+$/, '');
const SUPABASE_KEY = env.SUPABASE_SERVICE_KEY || env.SUPABASE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_KEY in .env.local or environment.');
  process.exit(1);
}

const HDRS = {
  apikey: SUPABASE_KEY,
  Authorization: 'Bearer ' + SUPABASE_KEY,
  'Content-Type': 'application/json',
};

async function upsert(table, rows, conflictCol) {
  if (!rows.length) return { inserted: 0, failed: 0, errors: [] };
  const url = `${SUPABASE_URL}/rest/v1/${table}?on_conflict=${conflictCol}`;
  const r = await fetch(url, {
    method: 'POST',
    headers: { ...HDRS, Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(rows),
  });
  if (!r.ok) {
    const text = await r.text();
    return { inserted: 0, failed: rows.length, errors: [`${table} chunk -> ${r.status}: ${text.slice(0, 300)}`] };
  }
  return { inserted: rows.length, failed: 0, errors: [] };
}

const data = JSON.parse(readFileSync(path.join(root, 'src', 'data', 'products.json'), 'utf8'));
const categories = data.categories || [];

const catRows = categories.map((c) => ({ id: c.id, name: c.name }));
console.log(`categories: ${catRows.length}`);
const catRes = await upsert('categories', catRows, 'id');
console.log(`  upserted ${catRes.inserted}, failed ${catRes.failed}`);
for (const e of catRes.errors) console.error('  ', e);

const productRows = [];
for (const cat of categories) {
  for (const p of cat.products || []) {
    const moq = Number(p.moq);
    productRows.push({
      id: p.id,
      category_id: cat.id,
      code: p.code || null,
      name: p.name,
      moq: Number.isFinite(moq) ? moq : null,
      price: p.price || null,
      currency: p.currency || 'USD',
      material: p.material || null,
      micron: p.micron || null,
      lead: p.lead || null,
      description: p.description || null,
      colors: Array.isArray(p.colors) ? p.colors : [],
      images: Array.isArray(p.images) ? p.images : [],
      tags: Array.isArray(p.tags) ? p.tags : [],
      weight: p.weight || null,
      sample_time: p.sample_time || null,
      updated_at: new Date().toISOString(),
    });
  }
}

console.log(`products: ${productRows.length}`);
let inserted = 0;
let failed = 0;
const CHUNK = 50;
for (let i = 0; i < productRows.length; i += CHUNK) {
  const res = await upsert('products', productRows.slice(i, i + CHUNK), 'id');
  inserted += res.inserted;
  failed += res.failed;
  for (const e of res.errors) console.error('  ', e);
  process.stdout.write(`  ...${Math.min(i + CHUNK, productRows.length)}/${productRows.length}\r`);
}
console.log(`\nproducts upserted: ${inserted}, failed: ${failed}`);

if (failed > 0) {
  console.error('Some rows failed — check the messages above (usually the products table is missing; run docs/install-products-table.sql first).');
  process.exit(1);
}
console.log('Done. The admin backend and storefront can now read products from Supabase.');
