#!/usr/bin/env node
/**
 * Post-build fix for Astro 5.18 + @astrojs/vercel 9.0.5 bug:
 * Compiled .astro files lack named GET/POST exports.
 *
 * Detect both `const GET` and `const POST` declarations anywhere in the file,
 * accounting for any leading whitespace from Astro's prettier-formatted output,
 * and rewrite to add named exports.
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
  if (/export\s+(const\s+GET\b|\{\s*[^}]*\bGET\b)/m.test(src)) {
    continue;
  }

  // Detect any `const GET = ...` and `const POST = ...` declarations in the file
  // (allowing arbitrary leading whitespace from Astro's formatting)
  const hasGET = /^\s*const\s+GET\s*=/m.test(src);
  const hasPOST = /^\s*const\s+POST\s*=/m.test(src);

  if (hasGET || hasPOST) {
    const names = [];
    if (hasGET) names.push('GET');
    if (hasPOST) names.push('POST');
    // Strip any pre-existing `export { page };` to avoid duplicate page export
    let out = src.replace(/^export\s*\{\s*page\s*\};\s*$/m, '');
    // Drop the bad `export const GET = page;` if it was added in Case A pass
    out = out.replace(/^export\s+const\s+GET\s*=\s*page;\s*$/m, '');
    const exportLine = '\nexport { ' + names.join(', ') + ' };';
    out = out.trimEnd() + exportLine + '\n';
    await writeFile(file, out);
    console.log('[fix-endpoint-build] patched ' + file.replace(root + '/', '') + ' -> added {' + names.join(', ') + '}');
    fixed++;
    continue;
  }

  // Plain page (Case A): has `const page = () => _page;`
  if (src.includes('const page = () => _page;')) {
    const out = src.replace(
      'const page = () => _page;',
      'const page = () => _page;\nexport const GET = page;'
    );
    if (out !== src) {
      await writeFile(file, out);
      console.log('[fix-endpoint-build] patched ' + file.replace(root + '/', '') + ' -> added GET=page');
      fixed++;
    }
  }
}
console.log('[fix-endpoint-build] done. ' + fixed + ' file(s) patched.');
