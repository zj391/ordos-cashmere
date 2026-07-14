#!/usr/bin/env node
/**
 * Post-build fix for Astro 5.18 + @astrojs/vercel 9.0.5 bugs:
 * 1. Compiled .astro files lack named GET/POST exports.
 * 2. Endpoint files have leftover `const page = () => _page;` wrapper
 *    that confuses Vercel adapter (which calls mod.page() expecting a function
 *    for SSR rendering, but the wrapper returns an Object for endpoints).
 *    For endpoints we must REMOVE the _page wrapper.
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

// Regex to remove the leftover _page wrapper from endpoint files.
// Pattern: const _page = Object.freeze(...Symbol.toStringTag, { value: 'Module' }));
//          const page = () => _page;
// (Multiline content with /*#__PURE__*/ comment marker)
const _PAGE_WRAPPER_RE = /const _page = \/\*#__PURE__\*\/Object\.freeze\([\s\S]*?Symbol\.toStringTag, \{ value: 'Module' \}\)\);[\s]*?const page = \(\) => _page;[\s]*?/g;

let fixed = 0;
for await (const file of walk(pagesDir)) {
  if (!file.endsWith('.astro.mjs')) continue;
  let src = await readFile(file, 'utf8');
  let changed = false;

  // Detect endpoint: has const GET or const POST declaration
  const hasGET = /^\s*const\s+GET\s*=/m.test(src);
  const hasPOST = /^\s*const\s+POST\s*=/m.test(src);

  if (hasGET || hasPOST) {
    // Add named export if missing
    if (!/export\s+(const\s+GET\b|\{\s*[^}]*\bGET\b)/m.test(src)) {
      const names = [];
      if (hasGET) names.push('GET');
      if (hasPOST) names.push('POST');
      const exportLine = '\nexport { ' + names.join(', ') + ' };';
      src = src.trimEnd() + exportLine + '\n';
      changed = true;
    }

    // Remove the leftover _page wrapper (causes Vercel adapter to break)
    const beforeWrapper = src.length;
    src = src.replace(_PAGE_WRAPPER_RE, '');
    if (src.length !== beforeWrapper) {
      changed = true;
    }

    if (changed) {
      await writeFile(file, src);
      console.log('[fix-endpoint-build] patched ' + file.replace(root + '/', '') + ' -> removed _page wrapper' + (hasGET ? ' + GET' : '') + (hasPOST ? ' + POST' : ''));
      fixed++;
    }
    continue;
  }

  // Plain page: has `const page = () => _page;`
  if (src.includes('const page = () => _page;')) {
    if (!/export\s+(const\s+GET\b|\{\s*[^}]*\bGET\b)/m.test(src)) {
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
}
console.log('[fix-endpoint-build] done. ' + fixed + ' file(s) patched.');
