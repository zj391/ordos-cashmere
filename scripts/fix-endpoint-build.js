#!/usr/bin/env node
/**
 * Post-build fix for Astro 5.18 + @astrojs/vercel 9.0.5 bug:
 * All .astro page/endpoint modules get compiled WITHOUT the named GET/POST
 * exports Vercel adapter needs. mod.GET is undefined → 404.
 *
 * Symptom:
 *   src/pages/admin/login.astro → dist/.../pages/admin/login.astro.mjs
 *   The compiled module only has `export { page }` and `export { renderers }`.
 *   At runtime, Astro's renderEndpoint() calls `mod.GET` which is undefined,
 *   so the function returns 404.
 *
 * Two issues:
 *   1. Admin pages (not API endpoints) need GET handler too
 *   2. Initial fix wrote `export { GET, _handlers, page }` but renderEndpoint
 *      looks for `mod.GET`, not `mod.handlers.GET`. So we need both.
 *
 * Fix:
 *   Walk every .astro.mjs file under _render.func/dist/server/pages/.
 *   Add a default GET handler that simply invokes the page component.
 *   Astro already routes GET requests to mod.page() via SSR adapter,
 *   so we just need to make sure the module exports named GET handler.
 *
 * Run: node scripts/fix-endpoint-build.js
 * Wired in package.json: "postbuild": "node scripts/fix-endpoint-build.js"
 */
import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
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
  const src = await readFile(file, 'utf8');

  // Already has named GET/POST handlers (after first re-write) — skip
  if (/^export\s*\{\s*(GET|POST)\s*\}/m.test(src)) {
    continue;
  }

  // Find page component name (e.g., $$Login, $$Index, $$Inquiries)
  // Astro emits: const $$Page = createComponent(...)
  const pageMatch = src.match(/const\s+\$\$(\w+)\s*=\s*createComponent\(/);
  if (!pageMatch) {
    // Not a page file (likely endpoints, already handled)
    continue;
  }
  const pageName = '$$' + pageMatch[1];
  const handlerNames = [...src.matchAll(/^const\s+([A-Z]+)\s*=/gm)].map(m => m[1]).filter(n => n !== pageName);

  // Add named GET handler + (optional) POST that defers to page
  // (Astro SSR adapter's mod.page() and mod.GET() both work)
  const exportNames = ['GET', ...handlerNames];
  const newExports = `export const GET = ${pageName};\n` +
    handlerNames.map(h => `const ${h} = ${pageName};`).join('\n') +
    `\nexport { ${handlerNames.join(', ')} };\n`;

  let out = src;
  // Insert before `export { page };` or `export { renderers };`
  if (out.includes('export { renderers };')) {
    out = out.replace(
      /export \{ renderers \};/,
      `export { renderers };\n${newExports}`
    );
  } else if (out.includes('export { page };')) {
    out = out.replace(
      /export \{ page \};/,
      `export { page };\n${newExports}`
    );
  } else {
    // Append at end
    out = out + '\n' + newExports;
  }

  await writeFile(file, out);
  console.log(`[fix-endpoint-build] patched ${file.replace(root + '/', '')} → added ${exportNames.join(', ')}`);
  fixed++;
}
console.log(`[fix-endpoint-build] done. ${fixed} file(s) patched.`);