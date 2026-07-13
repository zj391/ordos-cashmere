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
  const src = await readFile(file, 'utf8');

  if (/^export\s*\{\s*(GET|POST)\s*\}/m.test(src)) continue;

  const pageMatch = src.match(/const\s+(\$\$?[\w]+)\s*=\s*createComponent\(/);
  if (!pageMatch) continue;
  const pageName = pageMatch[1];
  const handlerNames = [...src.matchAll(/^const\s+([A-Z]+)\s*=/gm)].map(m => m[1]).filter(n => n !== pageName);

  const newExports = `export const GET = ${pageName};\n` +
    handlerNames.map(h => `const ${h} = ${pageName};`).join('\n') +
    `\nexport { ${handlerNames.join(', ')} };\n`;

  let out = src;
  if (out.includes('export { renderers };')) {
    out = out.replace(/export \{ renderers \};/, `export { renderers };\n${newExports}`);
  } else if (out.includes('export { page };')) {
    out = out.replace(/export \{ page \};/, `export { page };\n${newExports}`);
  } else {
    out = out + '\n' + newExports;
  }

  await writeFile(file, out);
  console.log(`[fix-endpoint-build] patched ${file.replace(root + '/', '')} -> added GET=${pageName}`);
  fixed++;
}
console.log(`[fix-endpoint-build] done. ${fixed} file(s) patched.`);
