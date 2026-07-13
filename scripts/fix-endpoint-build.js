#!/usr/bin/env node
/**
 * Post-build fix for Astro 5.18 + @astrojs/vercel 9.0.5 bug:
 * Compiled .astro files lack named GET/POST exports; Vercel adapter
 * calls mod.GET which is undefined and falls through to 404.
 *
 * Simple fix: append `export const GET = page;` near the existing
 * `export { page };` statement (page is already defined).
 * Works for SSR pages where mod.page() === renders the page directly.
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const pagesDir = join(root, '.vercel/output/functions/_render.func/dist/server/pages');

async function* walk(dir) {
  let entries;
  try { entries = await readdir(dir, { withFileTypes: true }); } catch { return; }
  for (const entry of entries) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(p);
    else if (entry.isFile()) yield p;
  }
}

let fixed = 0;
for await (const file of walk(pagesDir)) {
  if (!file.endsWith('.astro.mjs')) continue;
  let src = await readFile(file, 'utf8');

  // Skip if already has named GET export
  if (/^export\s+\{[^}]*\bGET\b[^}]*\}/m.test(src)) {
    continue;
  }

  // Only process files that have `const page = () => _page;`
  // (i.e. real .astro pages, not API endpoints which already have
  // GET/POST/ALL handlers)
  if (!src.includes('const page = () => _page;')) {
    continue;
  }

  // Inject: `export const GET = page;` right after the page declaration
  // (so Vercel adapter's mod.GET lookup resolves to the page function)
  const out = src.replace(
    'const page = () => _page;',
    'const page = () => _page;\nexport const GET = page;'
  );

  if (out === src) continue; // no change

  await writeFile(file, out);
  console.log('[fix-endpoint-build] patched ' + file.replace(root + '/', '') + ' -> added export const GET = page;');
  fixed++;
}
console.log('[fix-endpoint-build] done. ' + fixed + ' file(s) patched.');
