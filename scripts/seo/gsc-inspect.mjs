#!/usr/bin/env node
/**
 * GSC URL Inspection monitor.
 *
 * For each URL in sitemap, check if Google has indexed it.
 * Reports indexed vs not-indexed and writes a report.
 *
 * Usage:
 *   TOKEN=*** node scripts/seo/gsc-inspect.mjs
 *   TOKEN=*** node scripts/seo/gsc-inspect.mjs --sample 50  (only 50 random URLs)
 *   TOKEN=*** node scripts/seo/gsc-inspect.mjs --urls file.txt (specific URLs)
 *
 * Requires: OAuth access token from Google OAuth Playground with
 *           scope https://www.googleapis.com/auth/webmasters.readonly
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const SITE_URL = 'https://www.erdosdx.com/';
const SITEMAP_URL = 'https://www.erdosdx.com/sitemap-0.xml';

const args = process.argv.slice(2);
const sampleArg = args.indexOf('--sample');
const urlsArg = args.indexOf('--urls');
const SAMPLE = sampleArg >= 0 ? parseInt(args[sampleArg + 1]) : null;
const URLS_FILE = urlsArg >= 0 ? args[urlsArg + 1] : null;

const TOKEN = process.env.TOKEN;
if (!TOKEN) {
  console.error('TOKEN env var required. Get one from https://developers.google.com/oauthplayground/');
  console.error('Use scope: https://www.googleapis.com/auth/webmasters.readonly');
  process.exit(1);
}

async function fetchSitemapUrls() {
  const res = await fetch(SITEMAP_URL);
  const xml = await res.text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  return urls;
}

async function loadUrlsFromFile(path) {
  return readFileSync(path, 'utf8').split('\n').map(l => l.trim()).filter(Boolean);
}

async function inspectUrl(url) {
  const apiUrl = `https://searchconsole.googleapis.com/v1/urlInspection/index:inspect`;
  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inspectionUrl: url,
      siteUrl: SITE_URL,
    }),
  });
  if (!res.ok) {
    return { url, error: `${res.status} ${await res.text()}` };
  }
  const data = await res.json();
  const r = data.inspectionResult || {};
  return {
    url,
    verdict: r.indexStatusResult?.verdict || 'UNKNOWN',
    coverage: r.indexStatusResult?.coverageState || 'UNKNOWN',
    lastCrawl: r.indexStatusResult?.lastCrawlTime || null,
    pageFetch: r.indexStatusResult?.pageFetchState || null,
    robots: r.indexStatusResult?.robotsTxtState || null,
    mobileUsable: r.mobileUsabilityResult?.verdict || null,
  };
}

function pickRandom(arr, n) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

async function main() {
  let urls;
  if (URLS_FILE) {
    urls = await loadUrlsFromFile(URLS_FILE);
    console.log(`Loaded ${urls.length} URLs from ${URLS_FILE}`);
  } else {
    console.log(`Fetching sitemap ${SITEMAP_URL}...`);
    urls = await fetchSitemapUrls();
    console.log(`Found ${urls.length} URLs in sitemap`);
  }

  if (SAMPLE) {
    urls = pickRandom(urls, SAMPLE);
    console.log(`Sampling ${SAMPLE} random URLs`);
  }

  const results = [];
  const stats = { PASS: 0, FAIL: 0, NEUTRAL: 0, UNKNOWN: 0 };
  const batchSize = 5;
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(inspectUrl));
    for (const r of batchResults) {
      if (r.verdict in stats) stats[r.verdict]++;
      results.push(r);
    }
    process.stdout.write(`\r  ${i + batch.length}/${urls.length} inspected...`);
  }
  process.stdout.write('\n');

  // Write report
  const report = {
    timestamp: new Date().toISOString(),
    total: results.length,
    stats,
    indexed: results.filter(r => r.verdict === 'PASS').length,
    notIndexed: results.filter(r => r.verdict === 'FAIL').length,
    other: results.filter(r => r.verdict !== 'PASS' && r.verdict !== 'FAIL').length,
    results,
  };
  const reportPath = join(process.cwd(), `gsc-inspection-${Date.now()}.json`);
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n=== Summary ===`);
  console.log(`Total inspected: ${report.total}`);
  console.log(`Indexed (PASS): ${report.indexed}`);
  console.log(`Not indexed (FAIL): ${report.notIndexed}`);
  console.log(`Other: ${report.other}`);
  console.log(`\nReport written to: ${reportPath}`);
}

main().catch((e) => {
  console.error('Error:', e.message);
  process.exit(1);
});