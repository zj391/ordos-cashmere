import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BLOG_ROOT = path.join(ROOT, 'src/content/blog');

async function markdownFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return markdownFiles(target);
    return entry.isFile() && entry.name.endsWith('.md') ? [target] : [];
  }));
  return nested.flat();
}

let updated = 0;
let normalized = 0;
let skipped = 0;
for (const file of await markdownFiles(BLOG_ROOT)) {
  let source = await fs.readFile(file, 'utf8');
  const repaired = source
    .replace(/^(publishDate:[^\r\n]*)\r\r\n(updatedDate:)/m, '$1\r\n$2')
    .replace(/^(updatedDate:[^\r\n]*)\r(?=\n)/gm, '$1');
  if (repaired !== source) {
    await fs.writeFile(file, repaired);
    source = repaired;
    normalized += 1;
  }
  const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!frontmatter || /^updatedDate:/m.test(frontmatter[1])) {
    skipped += 1;
    continue;
  }
  const date = frontmatter[1].match(/^publishDate:\s*["']?(\d{4}-\d{2}-\d{2})["']?\s*\r?$/m)?.[1];
  if (!date) throw new Error(`Missing valid publishDate: ${file}`);
  const replacement = frontmatter[0].replace(/^(publishDate:\s*.*)\r?$/m, `$1\nupdatedDate: "${date}"`);
  await fs.writeFile(file, source.replace(frontmatter[0], replacement));
  updated += 1;
}

console.log(JSON.stringify({ updated, normalized, skipped }, null, 2));
