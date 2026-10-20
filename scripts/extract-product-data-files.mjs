// jevseo 2026-10-19 JEV-008 (P3, round 2): productTagsJson + subLabelsJson
// in src/pages/[locale]/products.astro are 88 KB + 9.7 KB inline JSON
// blobs. After build we visit each prerendered HTML page and pull those
// two script bodies back out into /data/*.json so the client can fetch
// them (preload + crossorigin) instead of fetching them as part of the
// HTML itself.
//
// Input : .vercel/output/static/<locale>/products/index.html
// Output: .vercel/output/static/data/<locale>/products-tags.json
//         .vercel/output/static/data/<locale>/products-sub-labels.json
//
// Idempotent. Runs after the Astro + fix-endpoint-build pipeline so
// prerendered HTML exists, before generate-sitemaps so sitemaps can
// include the static data URLs if desired.

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
// block; we only need two of them. The body may include HTML-escaped
// characters (e.g. the SUB_LABELS dictionary uses &quot; and &amp;).
const SCRIPT_RE = new RegExp(
  '<script id="(product-tags-data|sub-labels-data)" type="application/json">([\\s\\S]*?)<\\/script>',
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
for (const m of html.matchAll(SCRIPT_RE)) {
  if (m[1] === 'product-tags-data') tagsPayload.push(unescapeJson(m[2]));
  else if (m[1] === 'sub-labels-data') subLabelsPayload.push(unescapeJson(m[2]));
}

if (tagsPayload.length !== 1 || subLabelsPayload.length !== 1) {
  console.error(
    `[extract-product-data] expected exactly one tags + one sub-labels ` +
    `block in /en/products/index.html, got ${tagsPayload.length} / ${subLabelsPayload.length}`,
  );
  process.exit(1);
}

const tagsJson = JSON.parse(tagsPayload[0]);
const subLabelsJson = JSON.parse(subLabelsPayload[0]);

for (const locale of LOCALES) {
  const dir = join(OUT, locale);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'products-tags.json'), JSON.stringify(tagsJson));
  writeFileSync(join(dir, 'products-sub-labels.json'), JSON.stringify(subLabelsJson));
}

const tagsSize = statSync(join(OUT, 'en/products-tags.json')).size;
const subSize = statSync(join(OUT, 'en/products-sub-labels.json')).size;
console.log(
  `[extract-product-data] wrote products-tags.json (${(tagsSize/1024).toFixed(1)} KB) ` +
  `+ products-sub-labels.json (${(subSize/1024).toFixed(1)} KB) for ${LOCALES.length} locales ` +
  `(previously inline: ${tagsJson ? '88' : '0'} + 9.7 KB each).`,
);
