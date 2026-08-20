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

// 8-20: 收集所有真实 build 出来的 URL path（包括各 locale），用于
// 在生成 hreflang alt link 时过滤掉不存在的 locale 变体。之前版本
// 不做这层过滤 → 10.1% 的 blog hreflang 指向 404（sitemap 软 404 是
// Google 公认的 SEO 毒药,会拉低整个 sitemap 信任度)。
const BUILT_PATHS = new Set();

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
          BUILT_PATHS.add(urlPath);
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


function buildSitemapXml(urls) {
  // 2026-08-20 fix: 所有静态页 lastmod = build time (now).
  // 之前 productLastmod 用 numericId % 540 + 2025-04-01 生成伪日期,
  // 导致 3492 个产品 sitemap lastmod 停在 2025-07~2025-09-20 (一年前),
  // Googlebot 据此判定这些页 1 年没更新 -> 降 crawl frequency -> 收录变慢.
  // 静态产品页 prerender=true, 没有"内容修改"概念, 真实变更点就是 build/deploy.
  // blog / hub / static 同理 (之前就已 fallback 到 now).
  const lines = ['<?xml version="1.0" encoding="UTF-8"?>'];
  lines.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
  lines.push('        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"');
  lines.push('        xmlns:xhtml="http://www.w3.org/1999/xhtml"');
  lines.push('        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"');
  lines.push('        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">');
  for (const path of urls) {
    const url = SITE_URL + path;
    const { priority, changefreq } = pageMeta(path);
    const lastmod = now;
    lines.push('  <url>');
    lines.push(`    <loc>${url}</loc>`);
    lines.push(`    <lastmod>${lastmod}</lastmod>`);
    lines.push(`    <changefreq>${changefreq}</changefreq>`);
    lines.push(`    <priority>${priority.toFixed(1)}</priority>`);
    const pathWithoutLocale = path.replace(/^\/(en|de|fr|ja|kr|cn)/, '');
    // 8-20: 过滤掉不存在的 locale 变体 hreflang + x-default，避免 sitemap
    // 软 404（指向不存在 HTML，Google 视 sitemap 为低质信号）。
    for (const alt of I18N_LINK(pathWithoutLocale)) {
      const altPath = new URL(alt.url).pathname;
      if (BUILT_PATHS.has(altPath)) {
        lines.push(`    <xhtml:link rel="alternate" hreflang="${alt.lang}" href="${alt.url}"/>`);
      }
    }
    const xDefaultPath = `${SITE_URL}/en${pathWithoutLocale}`;
    if (BUILT_PATHS.has(new URL(xDefaultPath).pathname)) {
      lines.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${xDefaultPath}"/>`);
    }
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

// CRITICAL: also copy to .vercel/output/static/ because the Vercel adapter
// snapshots dist/client/ BEFORE this postbuild script runs. Without this
// copy, the sitemaps would be missing from the deployed site and search
// engines would get 404 on /sitemap-index.xml — leading to "0 indexed
// pages" in Bing Webmaster Tools / Google Search Console even though
// every page is built and reachable.
const VERCEL_STATIC = path.join(ROOT, '.vercel/output/static');
try {
  await fs.access(VERCEL_STATIC);
  for (const f of ['sitemap-index.xml', 'sitemap-static.xml', 'sitemap-blog.xml', 'sitemap-products.xml']) {
    await fs.copyFile(path.join(OUTPUT_DIR, f), path.join(VERCEL_STATIC, f));
  }
  console.log(`Copied 4 sitemaps to ${VERCEL_STATIC}`);
} catch (e) {
  // .vercel/output/ only exists after Vercel adapter runs in postbuild.
  // If absent (e.g. local `astro build` without adapter), skip silently.
  console.log('.vercel/output/static not present — skipping Vercel copy (local-only build)');
}

// ============================================================================
// IndexNow auto-ping (2026-08-19 增) — 每次 build 完成后自动 ping IndexNow。
// IndexNow 派 Bing/Yandex/DuckDuckGo/Seznam/Naver 来抓所有 URL。
// 仅 Vercel 环境触发 (process.env.VERCEL === '1'), 本地 build 跳过。
// 失败也只 warn, 不 exit 1 - 避免阻塞 deploy。
// ============================================================================
const INDEXNOW_KEY = 'erdosdx-indexnow-key-2026';
const INDEXNOW_HOST = 'www.erdosdx.com';
const INDEXNOW_KEY_LOC = `https://${INDEXNOW_HOST}/indexnow-key.txt`;
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

if (process.env.VERCEL === '1') {
  const seen = new Set();
  for (const list of Object.values(buckets)) {
    for (const p of list) seen.add(`${SITE_URL}${p}`);
  }
  const allUrls = Array.from(seen);
  console.log(`\nIndexNow: ${allUrls.length} unique URLs to submit`);

  const chunks = [];
  for (let i = 0; i < allUrls.length; i += 10000) {
    chunks.push(allUrls.slice(i, i + 10000));
  }

  let submitted = 0;
  let failed = 0;
  for (const chunk of chunks) {
    const body = {
      host: INDEXNOW_HOST,
      key: INDEXNOW_KEY,
      keyLocation: INDEXNOW_KEY_LOC,
      urlList: chunk,
    };
    try {
      const res = await fetch(INDEXNOW_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(body),
      });
      const text = await res.text();
      if (res.status === 200 || res.status === 202) {
        submitted += chunk.length;
        console.log(`  IndexNow POST: ${res.status} OK (${chunk.length} URLs${text ? ' - ' + text.slice(0, 80) : ''})`);
      } else {
        failed += chunk.length;
        console.warn(`  IndexNow POST: ${res.status} (${chunk.length} URLs) - body: ${text.slice(0, 200)}`);
      }
    } catch (e) {
      failed += chunk.length;
      console.warn(`  IndexNow POST failed: ${e?.message || e}`);
    }
  }
  console.log(`IndexNow summary: ${submitted} submitted, ${failed} failed out of ${allUrls.length} total`);
  if (failed > 0) {
    console.warn('(IndexNow ping is non-blocking — deploy will continue)');
  }
} else {
  console.log('\nIndexNow: skipped (not on Vercel — process.env.VERCEL !== "1")');
}

console.log('\nDone.');