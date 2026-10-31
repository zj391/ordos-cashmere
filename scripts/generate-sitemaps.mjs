#!/usr/bin/env node
/**
 * Custom sitemap generator (replaces @astrojs/sitemap).
 *
 * Reads dist/client/ to discover indexable built URLs, classifies them
 * into 3 buckets, and writes 3 sitemaps + an index. Pages whose rendered
 * HTML contains a robots noindex directive are deliberately excluded.
 *
 * Run via `postbuild` in package.json (after astro build).
 */
import { readFileSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE_URL = 'https://www.erdosdx.com';
const LOCALES = ['en', 'de', 'fr', 'ja', 'kr', 'cn'];
const LOCALE_HREFLANG = { en: 'en', de: 'de', fr: 'fr', ja: 'ja', kr: 'ko', cn: 'zh-CN' };
const DIST_DIR = path.join(ROOT, 'dist/client');
const OUTPUT_DIR = DIST_DIR; // write back into dist/
const I18N_LINK = (path) => LOCALES.map((loc) => ({ lang: LOCALE_HREFLANG[loc], locale: loc, url: `${SITE_URL}/${loc}${path}` }));

// 收集真实且可索引的 build URL path（包括各 locale），用于在生成
// hreflang alt link 时过滤掉不存在或 noindex 的 locale 变体。之前版本
// 不做这层过滤 → 10.1% 的 blog hreflang 指向 404（sitemap 软 404 是
// Google 公认的 SEO 毒药,会拉低整个 sitemap 信任度)。
const BUILT_PATHS = new Set();

// 2026-10-31: the real lastmod of each page, read from the built HTML.
//
// The sitemap used to stamp every URL with the build time. That is
// accurate for a prerendered page that has no content of its own, but
// it tells Google the same thing about 9,000 pages on every deploy -
// and the site deploys several times a week. A lastmod that changes on
// every build regardless of the content is a lastmod Google learns to
// ignore, which costs the signal it is supposed to carry.
//
// A blog post states when it was last changed in its own markup
// (article:modified_time, which the template renders from the
// frontmatter's updatedDate). Everything else falls back to the build
// time, because a static page's only real change point is the deploy.
const PAGE_LASTMOD = new Map();

function readPageLastmod(html) {
  const m = html.match(/property="article:modified_time"\s+content="([^"]+)"/);
  if (!m) return null;
  const d = new Date(m[1]);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function hasNoIndexRobots(html) {
  return /<meta\b(?=[^>]*\bname=["']robots["'])(?=[^>]*\bcontent=["'][^"']*\bnoindex\b[^"']*["'])[^>]*>/i.test(html);
}

// 2026-10-30: percent-encode each path segment.
//
// Four product IDs carry a Chinese suffix or a space ("DXS-R040-3 精纺",
// "儿童"). Their build directories hold the raw UTF-8 name, so the path
// this script walks has a literal space and Chinese characters in it.
// Writing that straight into <loc> produced URLs that are not valid -
// a raw space is not allowed in a URL, and Google has to guess at the
// encoding. The pages themselves are reachable at the encoded form, so
// the sitemap has to list the encoded form too.
//
// Only the segments are encoded; the slashes stay as they are.
function encodePath(p) {
  return p
    .split('/')
    .map((seg) => encodeURIComponent(seg))
    .join('/');
}

// Recursively walk dist/client/{locale}/<path>/index.html and return only indexable URL paths.
async function walkBuiltPages() {
  const out = [];
  const noIndexPaths = [];
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
          const html = await fs.readFile(full, 'utf8');
          if (hasNoIndexRobots(html)) {
            noIndexPaths.push(urlPath);
            continue;
          }
          out.push(urlPath);
          BUILT_PATHS.add(urlPath);
          const lm = readPageLastmod(html);
          if (lm) PAGE_LASTMOD.set(urlPath, lm);
        }
      }
    }
  }
  return { paths: out, noIndexPaths };
}

function classify(path) {
  // 2026-10-18: 新增 DXS-* 系列 ID (大写字母+数字+短横线, e.g. DXS-A003-1)
  // 之前 [a-z0-9-]+ 不允许大写, 导致 48 个新产品 PDP 落到 static bucket.
  //
  // 2026-10-30: four product IDs carry a Chinese suffix or a space
  // ("DXS-R040-3 精纺", "儿童"). Their directories on disk hold the raw
  // UTF-8 name, so the path passed in here has a literal space and
  // Chinese characters, not percent escapes. The class has to accept
  // both forms, otherwise those pages fall into the static bucket.
  if (path.match(/^\/(en|de|fr|ja|kr|cn)\/products\/[^/]+\/?$/)) return 'products';
  if (path.match(/^\/(en|de|fr|ja|kr|cn)\/blog\/[^/]+\/?$/)) return 'blog';
  return 'static';
}

function pageMeta(path) {
  let priority = 0.5;
  let changefreq = 'monthly';

  // 2026-08-27: tier product page priority by ID range. Lower ID numbers
  // are flagship SKUs (added first, linked from category pages and
  // blog posts) and deserve higher crawl frequency. Higher ID numbers
  // are long-tail products that convert less often and need fewer
  // re-crawls. Without this tier, all 3492 product pages had priority
  // 0.5 and Googlebot had no signal to re-crawl flagship SKUs more
  // often than the tail.
  //
  // Tier ranges are calibrated to the actual product data (582 products
  // with IDs 100-307, 5 categories × ~120 each). The flagship tier
  // is the first ~50 IDs per category, where the brand's hero SKUs
  // and most-linked products live. Long-tail is everything past 250
  // (the highest-ID 30% of each category's stock).
  // 2026-10-18: also support DXS-* prefixed IDs (e.g. DXS-A003-1).
  // 2026-10-30: the id may also carry a Chinese suffix or a space
  // ("DXS-R040-3 精纺"), so the numeric part is read from the front of
  // the id rather than from the whole match.
  const productId = path.match(/\/products\/([A-Za-z]+)-([0-9]+)/);
  if (productId) {
    const id = parseInt(productId[2], 10);
    if (Number.isFinite(id) && id <= 150) {
      // Flagship: re-crawl weekly, 0.8 priority
      priority = 0.8;
      changefreq = 'weekly';
    } else if (Number.isFinite(id) && id <= 200) {
      // Popular: bi-weekly, 0.6
      priority = 0.6;
      changefreq = 'weekly';
    } else if (Number.isFinite(id) && id <= 250) {
      // Standard: monthly, 0.5 (default)
      priority = 0.5;
      changefreq = 'monthly';
    } else {
      // Long-tail: monthly, 0.4 — Googlebot re-crawls less often
      priority = 0.4;
      changefreq = 'monthly';
    }
  } else if (path === '/' || /^\/(en|cn|de|fr|ja|kr)?\/?$/.test(path)) {
    priority = 1.0;
    changefreq = 'weekly';
  } else if (path.match(/^\/(en|cn|de|fr|ja|kr)\/blog\/[^/]+\/?$/)) {
    priority = 0.8;
  } else if (path.match(/^\/(en|cn|de|fr|ja|kr)\/(scarves|hats-accessories|yarn|garment-oem|fabric|raw-material|products|private-label-cashmere)\/?$/)) {
    priority = 0.9;
    changefreq = 'weekly';
  } else if (path.match(/^\/(en|cn|de|fr|ja|kr)\/products\/(scarves|hats-accessories|yarn|garment-oem|accessories-cat)\/?$/)) {
    priority = 0.9;
    changefreq = 'weekly';
  } else if (path.match(/^\/(en|cn|de|fr|ja|kr)\/(factory|yarn-fabric|garment-oem|raw-material|ordos-origin|color-cards)\/?$/)) {
    priority = 0.9;
    changefreq = 'weekly';
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
  //
  // 2026-08-27: also emit <image:image> entries for product pages so
  // Google Images can index the catalog photos. Cashmere is a visual
  // product category — buyers search 'cashmere hat beige' / 'cashmere
  // scarf red' on Google Images and we want our catalog to appear. Each
  // product page typically has 5-7 <img> tags; we emit up to 6 to keep
  // the sitemap entry size manageable (Google's limit is 1000 image
  // entries per sitemap, so 6 per URL × 3492 = 20,952 images fits
  // comfortably in a single sitemap-image.xml).
  const lines = ['<?xml version="1.0" encoding="UTF-8"?>'];
  lines.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
  lines.push('        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"');
  lines.push('        xmlns:xhtml="http://www.w3.org/1999/xhtml"');
  lines.push('        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"');
  lines.push('        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">');
  for (const path of urls) {
    const url = SITE_URL + encodePath(path);
    const { priority, changefreq } = pageMeta(path);
    // The page's own lastmod when it has one (a blog post states when
    // it was last edited); the build time otherwise.
    const lastmod = PAGE_LASTMOD.get(path) || now;
    lines.push('  <url>');
    lines.push(`    <loc>${url}</loc>`);
    lines.push(`    <lastmod>${lastmod}</lastmod>`);
    lines.push(`    <changefreq>${changefreq}</changefreq>`);
    lines.push(`    <priority>${priority.toFixed(1)}</priority>`);
    const pathWithoutLocale = path.replace(/^\/(en|de|fr|ja|kr|cn)/, '');
    // 8-20: 过滤掉不存在的 locale 变体 hreflang + x-default，避免 sitemap
    // 软 404（指向不存在 HTML，Google 视 sitemap 为低质信号）。
    //
    // The lookup uses the raw path (that is how the pages sit on disk)
    // and the emitted href uses the encoded path (that is the form a
    // crawler will request). `new URL()` on its own would encode the
    // href for us but would also encode the lookup key, and the key has
    // to match the raw name in BUILT_PATHS.
    for (const alt of I18N_LINK(pathWithoutLocale)) {
      const altRawPath = `/${alt.locale}${pathWithoutLocale}`;
      if (BUILT_PATHS.has(altRawPath)) {
        lines.push(`    <xhtml:link rel="alternate" hreflang="${alt.lang}" href="${SITE_URL}${encodePath(altRawPath)}"/>`);
      }
    }
    const xDefaultRawPath = `/en${pathWithoutLocale}`;
    if (BUILT_PATHS.has(xDefaultRawPath)) {
      lines.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}${encodePath(xDefaultRawPath)}"/>`);
    }
    // 2026-08-27: emit <image:image> entries for product pages so Google
    // Images indexes our catalog photos. We do this for ALL 6 locale
    // variants of each product URL (not just /en/) because:
    //   1. Product photos are language-neutral (same .webp file for
    //      all locales) — Google Images can serve the same image
    //      under any locale-specific URL without duplication
    //   2. Sitemap entries are URL-scoped, not image-scoped; each
    //      /<locale>/products/<id>/ page is a different URL that
    //      deserves its own image entries
    //   3. Google Images index separates by URL, so omitting
    //      non-EN URLs would skip those images for non-EN searches
    // Reading the EN HTML file once per product (582 reads total)
    // takes ~1s and reuses cached results.
    // 2026-10-18: also support DXS-* prefixed IDs.
    // 2026-10-30: the id may carry a Chinese suffix or a space, so the
    // segment is matched loosely rather than by an explicit character
    // class.
    if (path.match(/^\/(en|de|fr|ja|kr|cn)\/products\/[^/]+\/$/)) {
      // All locales share the same product page HTML structure, so
      // extract images from the EN version regardless of which
      // locale we're emitting for.
      const enPath = path.replace(/^\/(de|fr|ja|kr|cn)\//, '/en/');
      const imageEntries = extractProductImages(enPath);
      for (const img of imageEntries) {
        lines.push(`    <image:image>`);
        lines.push(`      <image:loc>${SITE_URL}${img}</image:loc>`);
        lines.push(`      <image:title>${pathWithoutLocale.replace(/^\//, '').replace(/\/$/, '').replace(/-/g, ' ')}</image:title>`);
        lines.push(`    </image:image>`);
      }
    }
    lines.push('  </url>');
  }
  lines.push('</urlset>');
  return lines.join('\n') + '\n';
}

/**
 * Extract up to 6 product image paths from a built /en/products/{id}/
 * HTML file. Returns relative paths like '/products/mic/prod_077_00.webp'
 * — the caller prepends SITE_URL when emitting <image:loc>.
 *
 * Filtering rules:
 *   - /products/ paths only (skip Navigation mega-menu editorial images
 *     which would inflate the image sitemap with off-product content)
 *   - Dedupe by exact path
 *   - Cap at 6 per URL (Google's recommended max for product pages)
 */
const IMG_PATH_RE = /<img[^>]+src="(\/products\/[^"]+\.(?:webp|jpg|jpeg|png))"/g;
const IMG_PATH_PER_PRODUCT_CACHE = new Map();
function extractProductImages(htmlPath) {
  if (IMG_PATH_PER_PRODUCT_CACHE.has(htmlPath)) {
    return IMG_PATH_PER_PRODUCT_CACHE.get(htmlPath);
  }
  try {
    // htmlPath is like '/en/products/sweaters-100/' — strip the trailing
    // slash before joining so path.join inserts its own separator.
    const cleaned = htmlPath.replace(/\/$/, '');
    const fullPath = path.join(DIST_DIR, cleaned, 'index.html');
    const html = readFileSync(fullPath, 'utf8');
    const seen = new Set();
    const out = [];
    let m;
    IMG_PATH_RE.lastIndex = 0;
    while ((m = IMG_PATH_RE.exec(html)) !== null) {
      if (!seen.has(m[1]) && out.length < 6) {
        seen.add(m[1]);
        out.push(m[1]);
      }
    }
    IMG_PATH_PER_PRODUCT_CACHE.set(htmlPath, out);
    return out;
  } catch {
    IMG_PATH_PER_PRODUCT_CACHE.set(htmlPath, []);
    return [];
  }
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
const { paths: allPaths, noIndexPaths } = await walkBuiltPages();
console.log(`Found ${allPaths.length} indexable built pages`);
if (noIndexPaths.length) {
  console.log(`Excluded ${noIndexPaths.length} noindex pages from sitemap and IndexNow`);
}

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
