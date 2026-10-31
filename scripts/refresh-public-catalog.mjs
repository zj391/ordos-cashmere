// Refreshes public/data/products.json from src/data/products.json.
//
// The file in public/ is a static snapshot of the catalogue that agents
// and crawlers fetch directly. It was written once in August and had
// fallen 758 products behind the catalogue it was meant to describe:
// the public copy listed 582 styles while the catalogue held 1,340.
//
// Nothing in the build wrote it, so it only ever drifted. This script
// copies the catalogue over it after the build, so the public snapshot
// cannot disagree with the site.
//
// The gzip sibling is refreshed alongside it - a stale .gz next to a
// fresh .json would still be served to anyone who sends
// Accept-Encoding: gzip, which is most of them.
//
// Idempotent. Runs in the postbuild chain, before the sitemap script.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const ROOT = process.cwd();
const SRC = join(ROOT, 'src/data/products.json');
const OUT_DIR = join(ROOT, 'public/data');
const OUT = join(OUT_DIR, 'products.json');
const OUT_GZ = join(OUT_DIR, 'products.json.gz');

if (!existsSync(SRC)) {
  console.log('[refresh-public-catalog] src/data/products.json missing — skipped');
  process.exit(0);
}

const source = readFileSync(SRC);
const catalogue = JSON.parse(source.toString('utf8'));

const products = (catalogue.categories ?? []).reduce((n, c) => n + (c.products?.length ?? 0), 0);
const categories = (catalogue.categories ?? []).length;

mkdirSync(OUT_DIR, { recursive: true });

const before = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : null;
const beforeCount = (before?.categories ?? []).reduce((n, c) => n + (c.products?.length ?? 0), 0);

writeFileSync(OUT, source);
writeFileSync(OUT_GZ, gzipSync(source, { level: 9 }));

// The public/ copy is what the next build picks up, but this build has
// already copied public/ into the deploy output, so the deployed copy
// has to be refreshed here too or the site keeps serving the stale one.
const DEPLOY_DIR = join(ROOT, '.vercel/output/static/data');
if (existsSync(join(ROOT, '.vercel/output/static'))) {
  mkdirSync(DEPLOY_DIR, { recursive: true });
  writeFileSync(join(DEPLOY_DIR, 'products.json'), source);
  writeFileSync(join(DEPLOY_DIR, 'products.json.gz'), gzipSync(source, { level: 9 }));
}

console.log(
  `[refresh-public-catalog] public/data/products.json ← src/data/products.json ` +
  `(${products} products, ${categories} categories)` +
  (beforeCount !== products ? ` — was ${beforeCount}` : ''),
);
