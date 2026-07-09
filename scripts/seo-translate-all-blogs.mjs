#!/usr/bin/env node
/**
 * Batch translate EN blog posts (7-8) — runs translate-blog.mjs's logic
 * for each EN blog that doesn't yet have a translation in all 5 locales.
 *
 * Usage: node scripts/seo-translate-all-blogs.mjs
 */
import { spawnSync } from 'node:child_process';
import { readdirSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const BLOG_DIR = join(ROOT, 'src/content/blog');
const EN_DIR = join(BLOG_DIR, 'en');
const LOCALES = ['cn', 'de', 'fr', 'ja', 'kr'];

// Find all EN blogs that have at least 1 of our new 7-8 keywords (cheap filter)
const allEn = readdirSync(EN_DIR).filter((f) => f.endsWith('.md'));
const targets = [];
for (const file of allEn) {
  const slug = file.replace(/\.md$/, '');
  // Check if all 5 locales have a translation already
  const allExist = LOCALES.every((l) => existsSync(join(BLOG_DIR, l, file)));
  if (!allExist) {
    targets.push(slug);
  }
}

console.log(`Found ${targets.length} blog(s) missing 5-locale translations:`);
for (const s of targets) console.log('  - ' + s);

if (targets.length === 0) {
  console.log('Nothing to translate.');
  process.exit(0);
}

let okCount = 0;
let failCount = 0;
for (const slug of targets) {
  console.log(`\n=== Translating ${slug} ===`);
  const result = spawnSync('node', ['scripts/translate-blog.mjs'], {
    env: { ...process.env, SOURCE_SLUG: slug },
    stdio: 'inherit',
    cwd: ROOT,
  });
  if (result.status === 0) okCount++;
  else failCount++;
}

console.log(`\n=== Done ===`);
console.log(`OK: ${okCount}, Failed: ${failCount}`);