// jevseo 2026-10-23 JEV-008: mirrors the three small inline catalog
// datasets on /[locale]/products/ out to /data/<locale>/*.json.
//
// Scope narrowed from five datasets to three on 2026-10-23. products.json
// (322 KB) and products-tags.json (86 KB) were the two large blocks; they
// are now produced directly by Astro endpoints during the build
// (src/pages/data/[locale]/products.json.ts and products-tags.json.ts) and
// this script no longer touches them — overwriting the endpoint output
// here would silently revert to whatever was in the HTML at scrape time.
//
// What remains inline is under 10 KB total, which is not worth a network
// round trip on first paint, so it stays inline for the page and is
// mirrored here purely so AI/agentic crawlers that prefer .json over
// <script type="application/json"> have a stable URL for it.
//
// Input : .vercel/output/static/<locale>/products/index.html
// Output: .vercel/output/static/data/<locale>/products-sub-labels.json
//         .vercel/output/static/data/<locale>/products-categories.json
//         .vercel/output/static/data/<locale>/products-labels.json
//
// Idempotent. Runs after the Astro + fix-endpoint-build pipeline so
// prerendered HTML exists, before generate-sitemaps.

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';

const ROOT = process.cwd();
const STATIC = join(ROOT, '.vercel/output/static');
const OUT = join(STATIC, 'data');
const LOCALES = ['en','de','fr','ja','kr','cn'];

if (!existsSync(STATIC)) {
  console.log('[extract-product-data] no .vercel/output/static — skipped');
  process.exit(0);
}

mkdirSync(OUT, { recursive: true });

// Match inline JSON in the prerendered HTML. Astro emits exactly one
// `<script id="X" type="application/json">PAYLOAD</script>` per data
// block. The body may include HTML-escaped characters (e.g. the
// SUB_LABELS dictionary uses &quot; and &amp;).
const SCRIPT_RE = new RegExp(
  '<script id="(sub-labels-data|categories-data|labels-data)" type="application/json">([\\s\\S]*?)</script>',
  'g',
);
// Astro escapes the payload; undo the four characters we expect.
function unescapeJson(s) {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&#34;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'");
}

// Same payload per locale, so compute once from /en/products/ then write
// to all locale data dirs. (The client fetch selects the JSON by URL
// regardless of locale; Astro just emits copies.)
const EN_PAGE = join(STATIC, 'en/products/index.html');
if (!existsSync(EN_PAGE)) {
  console.log('[extract-product-data] /en/products/index.html missing — skipped');
  process.exit(0);
}

const html = readFileSync(EN_PAGE, 'utf8');
const tagsPayload = [];
const subLabelsPayload = [];
const productsPayload = [];
const categoriesPayload = [];
const labelsPayload = [];
for (const m of html.matchAll(SCRIPT_RE)) {
  const body = unescapeJson(m[2]);
  if (m[1] === 'product-tags-data') tagsPayload.push(body);
  else if (m[1] === 'sub-labels-data') subLabelsPayload.push(body);
  else if (m[1] === 'products-data') productsPayload.push(body);
  else if (m[1] === 'categories-data') categoriesPayload.push(body);
  else if (m[1] === 'labels-data') labelsPayload.push(body);
}

// Tolerate missing inline blocks for products/categories/labels: as
// of 2026-10-20 (JEV-008 round 4) those three are NOT inlined — they
// live only in /data/. The script still extracts whatever is inline
// (tags + sub-labels today). Empty payload for a key means "skip that
// file" rather than failing the postbuild.
if (tagsPayload.length > 1 || subLabelsPayload.length > 1 ||
    productsPayload.length > 1 || categoriesPayload.length > 1 ||
    labelsPayload.length > 1) {
  console.error(
    `[extract-product-data] expected at most one of each block in ` +
    `/en/products/index.html, got tags=${tagsPayload.length} sub=${subLabelsPayload.length} ` +
    `products=${productsPayload.length} categories=${categoriesPayload.length} labels=${labelsPayload.length}`,
  );
  process.exit(1);
}

const TAG_OUT = [];
if (subLabelsPayload.length) TAG_OUT.push(['products-sub-labels.json', JSON.parse(subLabelsPayload[0])]);
if (categoriesPayload.length) TAG_OUT.push(['products-categories.json', JSON.parse(categoriesPayload[0])]);
if (labelsPayload.length) TAG_OUT.push(['products-labels.json', JSON.parse(labelsPayload[0])]);

for (const locale of LOCALES) {
  const dir = join(OUT, locale);
  mkdirSync(dir, { recursive: true });
  for (const [filename, payload] of TAG_OUT) {
    writeFileSync(join(dir, filename), JSON.stringify(payload));
  }
}

if (TAG_OUT.length === 0) {
  console.log('[extract-product-data] no inline blocks found — nothing to extract.');
} else {
  const names = TAG_OUT.map(([n]) => n).join(', ');
  console.log(`[extract-product-data] wrote ${TAG_OUT.length} JSONs per locale from inline blocks: ${names}.`);
}
