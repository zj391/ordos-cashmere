import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DIST = path.join(ROOT, 'dist/client');
const LOCALES = ['en', 'de', 'fr', 'ja', 'kr', 'cn'];

function decodeText(value) {
  return value
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function duplicateCount(values) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) || 0) + 1);
  return [...counts.values()].filter((count) => count > 1).reduce((sum, count) => sum + count, 0);
}

async function productPages(locale) {
  const dir = path.join(DIST, locale, 'products');
  const slugs = await fs.readdir(dir, { withFileTypes: true });
  return slugs.filter((entry) => entry.isDirectory()).map((entry) => path.join(dir, entry.name, 'index.html'));
}

const report = {};
for (const locale of LOCALES) {
  const files = await productPages(locale);
  const rows = await Promise.all(files.map(async (file) => {
    const html = await fs.readFile(file, 'utf8');
    const title = decodeText(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || '');
    const h1 = decodeText(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || '');
    const productSchemaPresent = /"@type":"Product"/.test(html);
    const canonicalCount = (html.match(/rel="canonical"/g) || []).length;
    return { title, h1, productSchemaPresent, canonicalCount };
  }));
  const titleLengths = rows.map((row) => row.title.length);
  report[locale] = {
    pages: rows.length,
    missingTitle: rows.filter((row) => !row.title).length,
    missingH1: rows.filter((row) => !row.h1).length,
    duplicateTitles: duplicateCount(rows.map((row) => row.title).filter(Boolean)),
    duplicateH1: duplicateCount(rows.map((row) => row.h1).filter(Boolean)),
    missingProductSchema: rows.filter((row) => !row.productSchemaPresent).length,
    incorrectCanonicalCount: rows.filter((row) => row.canonicalCount !== 1).length,
    titleLength: {
      min: Math.min(...titleLengths),
      max: Math.max(...titleLengths),
      average: Number((titleLengths.reduce((sum, length) => sum + length, 0) / titleLengths.length).toFixed(1)),
    },
    samples: rows.slice(0, 2).map((row) => ({ title: row.title, h1: row.h1 })),
  };
}

console.log(JSON.stringify(report, null, 2));
