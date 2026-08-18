#!/usr/bin/env node
/**
 * Custom sitemap generator (replaces @astrojs/sitemap).
 *
 * Reads dist/client/ to discover all built URLs, classifies them
 * into 3 buckets, and writes 3 sitemaps + an index.
 *
 * Run via `postbuild` in package.json (after astro build).
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE_URL = 'https://www.erdosdx.com';
const LOCALES = ['en', 'de', 'fr', 'ja', 'kr', 'cn'];
const DIST_DIR = path.join(ROOT, 'dist/client');
const OUTPUT_DIR = DIST_DIR; // write back into dist/

const I18N_LINK = (path) => LOCALES.map((loc) => ({ lang: loc, url: `${SITE_URL}/${loc}${path}` }));

// Recursively walk dist/client/{locale}/<path>/index.html and return the URL paths.
async function walkBuiltPages() {
  const out = [];
  for (const loc of LOCALES) {
    const locDir = path.join(DIST_DIR, loc);
    try {
      await fs.access(locDir);
    } catch {
      console.warn(`Locale dir missing: ${locDir}`);
      continue;
    }
    const stack = [locDir];
    while (stack.length) {
      const cur = stack.pop();
      const entries = await fs.readdir(cur, { withFileTypes: true });
      for (const e of entries) {
        const full = path.join(cur, e.name);
        if (e.isDirectory()) {
          stack.push(full);
        } else if (e.name === 'index.html') {
          // path is like dist/client/{loc}/foo/bar/index.html -> /{loc}/foo/bar/
          const rel = path.relative(DIST_DIR, cur).replace(/\\/g, '/');
          let urlPath = '/' + rel + '/';
          if (rel === '') urlPath = '/';
          out.push(urlPath);
        }
      }
    }
  }
  return out;
}

function classify(path) {
  if (path.match(/^\/(en|de|fr|ja|kr|cn)\/products\/[a-z0-9-]+\/?$/)) return 'products';
  if (path.match(/^\/(en|de|fr|ja|kr|cn)\/blog\/[a-z0-9-]+\/?$/)) return 'blog';
  return 'static';
}

function pageMeta(path) {
  let priority = 0.5;
  let changefreq = 'monthly';
  if (path === '/' || /^\/(en|cn|de|fr|ja|kr)?\/?$/.test(path)) {
    priority = 1.0; changefreq = 'weekly';
  } else if (path.match(/^\/(en|cn|de|fr|ja|kr)\/blog\/[a-z0-9-]+\/?$/)) {
    priority = 0.8;
  } else if (path.match(/^\/(en|cn|de|fr|ja|kr)\/(scarves|hats-accessories|yarn|garment-oem|fabric|raw-material|products|private-label-cashmere)\/?$/)) {
    priority = 0.9; changefreq = 'weekly';
  } else if (path.match(/^\/(en|cn|de|fr|ja|kr)\/products\/(scarves|hats-accessories|yarn|garment-oem|accessories-cat)\/?$/)) {
    priority = 0.9; changefreq = 'weekly';
  } else if (path.match(/^\/(en|cn|de|fr|ja|kr)\/(factory|yarn-fabric|garment-oem|raw-material|ordos-origin|color-cards)\/?$/)) {
    priority = 0.9; changefreq = 'weekly';
  } else if (path.match(/^\/(en|cn|de|fr|ja|kr)\/products\/[a-z0-9-]+\/?$/)) {
    priority = 0.5;
  } else {
    priority = 0.6;
  }
  return { priority, changefreq };
}

function productLastmod(path) {
  const m = path.match(/\/products\/([a-z]+)-(\d+)\/?$/);
  if (m) {
    const numericId = parseInt(m[2], 10);
    const baseDate = new Date('2025-04-01T00:00:00Z');
    baseDate.setUTCDate(baseDate.getUTCDate() + (numericId % 540));
    return baseDate;
  }
  return new Date();
}

function buildSitemapXml(urls) {
  const lines = ['<?xml version="1.0" encoding="UTF-8"?>'];
  lines.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
  lines.push('        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"');
  lines.push('        xmlns:xhtml="http://www.w3.org/1999/xhtml"');
  lines.push('        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"');
  lines.push('        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">');
  for (const path of urls) {
    const url = SITE_URL + path;
    const { priority, changefreq } = pageMeta(path);
    const lastmod = productLastmod(path).toISOString();
    lines.push('  <url>');
    lines.push(`    <loc>${url}</loc>`);
    lines.push(`    <lastmod>${lastmod}</lastmod>`);
    lines.push(`    <changefreq>${changefreq}</changefreq>`);
    lines.push(`    <priority>${priority.toFixed(1)}</priority>`);
    const pathWithoutLocale = path.replace(/^\/(en|de|fr|ja|kr|cn)/, '');
    for (const alt of I18N_LINK(pathWithoutLocale)) {
      lines.push(`    <xhtml:link rel="alternate" hreflang="${alt.lang}" href="${alt.url}"/>`);
    }
    lines.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}/en${pathWithoutLocale}"/>`);
    lines.push('  </url>');
  }
  lines.push('</urlset>');
  return lines.join('\n') + '\n';
}

function buildSitemapIndex(entries) {
  const lines = ['<?xml version="1.0" encoding="UTF-8"?>'];
  lines.push('<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
  for (const { filename, lastmod } of entries) {
    lines.push('  <sitemap>');
    lines.push(`    <loc>${SITE_URL}/${filename}</loc>`);
    lines.push(`    <lastmod>${lastmod}</lastmod>`);
    lines.push('  </sitemap>');
  }
  lines.push('</sitemapindex>');
  return lines.join('\n') + '\n';
}

// main
console.log('Discovering built pages in dist/client/...');
const allPaths = await walkBuiltPages();
console.log(`Found ${allPaths.length} built pages`);

const buckets = { static: [], blog: [], products: [] };
for (const p of allPaths) {
  const k = classify(p);
  if (buckets[k]) buckets[k].push(p);
  else buckets.static.push(p); // fallback
}

console.log(`Buckets: static=${buckets.static.length}, blog=${buckets.blog.length}, products=${buckets.products.length}`);

const now = new Date().toISOString();

for (const [name, urls] of Object.entries(buckets)) {
  if (!urls.length) continue;
  const filename = `sitemap-${name}.xml`;
  await fs.writeFile(path.join(OUTPUT_DIR, filename), buildSitemapXml(urls));
  console.log(`Wrote ${filename} (${urls.length} URLs)`);
}

await fs.writeFile(path.join(OUTPUT_DIR, 'sitemap-index.xml'),
  buildSitemapIndex([
    { filename: 'sitemap-static.xml', lastmod: now },
    { filename: 'sitemap-blog.xml', lastmod: now },
    { filename: 'sitemap-products.xml', lastmod: now },
  ]));
console.log('Wrote sitemap-index.xml');

// Also remove the old single sitemap-0.xml if present
try {
  await fs.unlink(path.join(OUTPUT_DIR, 'sitemap-0.xml'));
  console.log('Removed old sitemap-0.xml');
} catch {}

console.log('\nDone.');