#!/usr/bin/env node
/**
 * Post-build fix for Astro 5.18 + @astrojs/vercel 9.0.5 bug:
 * TypeScript API endpoints get compiled with the wrong output format.
 *
 * Symptom:
 *   src/pages/api/admin/login.ts → dist/.../pages/api/admin/login.astro.mjs
 *   The compiled module exports `page = () => _page` (Astro page format)
 *   instead of named `GET` / `POST` exports (Astro endpoint format).
 *   At runtime, Astro's renderEndpoint() calls `mod[method]` which is undefined,
 *   so the function returns 404 with `mod[method] ?? mod["ALL"]` falling through.
 *
 * Fix:
 *   For every .astro.mjs file under pages/api/, rewrite the export pattern:
 *     export { page }   →   export { GET, POST, ALL (if exists) }
 *   And delete the _page wrapper.
 *
 * Run: node scripts/fix-endpoint-build.js
 * Wired in package.json: "postbuild": "node scripts/fix-endpoint-build.js"
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const apiDir = join(root, '.vercel/output/functions/_render.func/dist/server/pages/api');

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(p);
    else if (entry.isFile()) yield p;
  }
}

let fixed = 0;
for await (const file of walk(apiDir)) {
  if (!file.endsWith('.astro.mjs')) continue;
  const src = await readFile(file, 'utf8');
  // Skip if already endpoint-form (no page wrapper)
  // But always re-apply if we see _handlers (the previous broken fix) — replace it
  if (src.includes('export { _handlers, page }')) {
    // Re-rewrite: extract names and add named exports
    const handlerNames = [...src.matchAll(/^const ([A-Z]+)\s*=/gm)].map(m => m[1]);
    if (handlerNames.length > 0) {
      let out = src.replace(/export \{ _handlers, page \};/, `export { ${handlerNames.join(', ')}, _handlers, page };`);
      await writeFile(file, out);
      console.log(`[fix-endpoint-build] re-rewrote ${file.replace(root + '/', '')} → adds named exports {${handlerNames.join(', ')}}`);
      fixed++;
      continue;
    }
  }
  if (!src.includes('export { page }')) continue;
  // Extract handler names from const X = ...
  const handlerNames = [...src.matchAll(/^const ([A-Z]+)\s*=/gm)].map(m => m[1]);
  if (handlerNames.length === 0) {
    console.warn(`[fix-endpoint-build] WARN: no handler consts found in ${file}`);
    continue;
  }
  // Rewrite: drop the _page wrapper and `export { page }` line, but
      // re-export page as `() => ({ GET, POST, ... })` so that
      //   1) Astro SSR adapter's mod.page() check passes
      //   2) renderEndpoint()'s mod[method] lookup works
      let out = src
          .replace(/\nconst _page[\s\S]*?\nconst page = \(\) => _page;\n\nexport \{ page \};/m,
                   `\nconst _handlers = { ${handlerNames.join(', ')} };\nconst page = () => _handlers;\nexport { ${handlerNames.join(', ')}, _handlers, page };`);
  // Safety check
  if (!out.includes(`const _handlers`)) {
    console.error(`[fix-endpoint-build] FAILED to rewrite ${file}`);
    continue;
  }
  await writeFile(file, out);
  console.log(`[fix-endpoint-build] rewrote ${file.replace(root + '/', '')} → exports {${handlerNames.join(', ')}}`);
  fixed++;
}
console.log(`[fix-endpoint-build] done. ${fixed} file(s) patched.`);