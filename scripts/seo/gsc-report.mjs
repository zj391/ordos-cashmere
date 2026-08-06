#!/usr/bin/env node
/**
 * GSC Weekly SEO Monitor
 *
 * Pulls Google Search Console data weekly:
 *  - Top 50 queries (clicks, impressions, CTR, position)
 *  - Top 50 pages
 *  - Queries with high impressions but CTR < 2% (content/keyword mismatch)
 *  - Pages with impressions but 0 clicks (orphaned or poor snippet)
 *  - Country/device breakdown
 *
 * Output: Markdown report to stdout (workflow attaches as artifact)
 *
 * Usage:
 *   TOKEN=*** node scripts/seo/gsc-report.mjs
 *   KEY_PATH=./secrets/gsc-key.json node scripts/seo/gsc-report.mjs
 *
 * Env:
 *   TOKEN      - OAuth access token (overrides service account)
 *   KEY_PATH   - path to service account JSON key
 *   SITE_URL   - GSC site identifier (default: sc-domain:erdosdx.com)
 *   DAYS       - lookback window in days (default: 28)
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const SITE_URL = process.env.SITE_URL || 'sc-domain:erdosdx.com';
const DAYS = parseInt(process.env.DAYS || '28', 10);
const GSC_BASE = 'https://www.googleapis.com/webmasters/v3';

async function getTokenFromServiceAccount(keyPath) {
  const auth = await import('google-auth-library');
  const key = JSON.parse(readFileSync(keyPath, 'utf8'));
  const jwtClient = new auth.JWT({
    email: key.client_email,
    key: key.private_key,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });
  const tokens = await jwtClient.authorize();
  return tokens.access_token;
}

async function getTokenFromEnv() {
  const token = process.env.TOKEN;
  if (!token) throw new Error('TOKEN env var not set');
  return token;
}

async function findServiceAccountKey() {
  const candidates = [
    process.env.KEY_PATH,
    join(homedir(), 'gsc-key.json'),
    join(homedir(), '.gsc-key.json'),
    join(process.cwd(), 'gsc-key.json'),
    join(process.cwd(), '.gsc-key.json'),
    join(process.cwd(), 'secrets/gsc-key.json'),
  ].filter(Boolean);
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  return null;
}

async function getToken() {
  if (process.env.TOKEN) {
    return { token: await getTokenFromEnv(), source: 'TOKEN env' };
  }
  const keyPath = await findServiceAccountKey();
  if (!keyPath) {
    throw new Error('No auth. Set TOKEN=ya29.xxx or place gsc-key.json in ~/ or ./secrets/');
  }
  return { token: await getTokenFromServiceAccount(keyPath), source: keyPath };
}

function endDate() {
  const d = new Date();
  d.setDate(d.getDate() - 2);  // GSC data lag is ~2 days
  return d.toISOString().slice(0, 10);
}

function startDate(daysBack) {
  const d = new Date();
  d.setDate(d.getDate() - daysBack);
  return d.toISOString().slice(0, 10);
}

async function gscQuery(token, dimensions, startDate, endDate, rowLimit = 100) {
  const url = `${GSC_BASE}/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query?fields=responseRows()`;
  const body = {
    startDate,
    endDate,
    dimensions,
    rowLimit,
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`GSC ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
  return (await res.json()).rows || [];
}

function fmtNum(n) {
  return n.toLocaleString('en-US');
}

function fmtPct(n) {
  return (n * 100).toFixed(1) + '%';
}

function table(headers, rows, aligns = []) {
  const colW = headers.map((h, i) => {
    const cellLen = String(rows[i] ? rows[i][headers.indexOf(h)] || '' : '').length;
    return Math.max(h.length, cellLen, 10);
  });
  // Actually simpler - compute widths from all rows
  const widths = headers.map((h, idx) => {
    let w = h.length;
    for (const row of rows) {
      const cell = String(row[idx] || '');
      if (cell.length > w) w = cell.length;
    }
    return Math.min(w, 30);
  });
  const fmt = (s, w, align) => {
    const str = String(s).slice(0, w);
    if (align === 'right') return str.padStart(w);
    if (align === 'center') return str.padStart(Math.floor((w + str.length) / 2)).padEnd(w);
    return str.padEnd(w);
  };
  const alignsMap = aligns.length ? aligns : headers.map(() => 'left');
  const lines = [];
  lines.push('| ' + headers.map((h, i) => fmt(h, widths[i], alignsMap[i])).join(' | ') + ' |');
  lines.push('|' + widths.map(w => '-'.repeat(w + 2)).join('|') + '|');
  for (const row of rows) {
    lines.push('| ' + row.map((c, i) => fmt(c, widths[i], alignsMap[i])).join(' | ') + ' |');
  }
  return lines.join('\n');
}

async function main() {
  const { token, source } = await getToken();
  console.log(`# GSC Weekly SEO Report\n`);
  console.log(`Site: ${SITE_URL}`);
  console.log(`Period: ${startDate(DAYS)} → ${endDate()} (${DAYS} days)`);
  console.log(`Auth: ${source}\n`);

  // 1. Top queries
  console.log(`## Top 50 Queries (by clicks)\n`);
  const queries = await gscQuery(token, ['query'], startDate(DAYS), endDate(), 50);
  queries.sort((a, b) => b.clicks - a.clicks);
  const topQueries = queries.slice(0, 50);
  const queryRows = topQueries.map(r => [
    r.keys[0],
    fmtNum(r.clicks),
    fmtNum(r.impressions),
    fmtPct(r.ctr),
    r.position.toFixed(1),
  ]);
  console.log(table(
    ['Query', 'Clicks', 'Impressions', 'CTR', 'Avg Pos'],
    queryRows,
    ['left', 'right', 'right', 'right', 'right']
  ));
  console.log('');

  // 2. Top pages
  console.log(`## Top 50 Pages (by clicks)\n`);
  const pages = await gscQuery(token, ['page'], startDate(DAYS), endDate(), 50);
  pages.sort((a, b) => b.clicks - a.clicks);
  const topPages = pages.slice(0, 50);
  const pageRows = topPages.map(r => [
    r.keys[0].replace('https://www.erdosdx.com', ''),
    fmtNum(r.clicks),
    fmtNum(r.impressions),
    fmtPct(r.ctr),
    r.position.toFixed(1),
  ]);
  console.log(table(
    ['Page', 'Clicks', 'Impressions', 'CTR', 'Avg Pos'],
    pageRows,
    ['left', 'right', 'right', 'right', 'right']
  ));
  console.log('');

  // 3. Low CTR queries (high impressions, low clicks) - 0% CTR or <2%
  console.log(`## ⚠️ Low CTR Queries (impressions > 20, CTR < 2%)\n`);
  console.log(`*High impression + low click = title/description mismatch with search intent*\n`);
  const lowCtr = queries
    .filter(r => r.impressions >= 20 && r.ctr < 0.02)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 30);
  if (lowCtr.length === 0) {
    console.log('  (none — all top queries have CTR ≥ 2%)\n');
  } else {
    const lowCtrRows = lowCtr.map(r => [
      r.keys[0],
      fmtNum(r.clicks),
      fmtNum(r.impressions),
      fmtPct(r.ctr),
      r.position.toFixed(1),
    ]);
    console.log(table(
      ['Query', 'Clicks', 'Impressions', 'CTR', 'Avg Pos'],
      lowCtrRows,
      ['left', 'right', 'right', 'right', 'right']
    ));
    console.log('');
  }

  // 4. Zero-click pages (impressions > 10, 0 clicks)
  console.log(`## ⚠️ Zero-Click Pages (impressions > 10, 0 clicks)\n`);
  console.log(`*Page is indexed but never clicked — likely poor snippet or wrong ranking*\n`);
  const zeroClick = pages
    .filter(r => r.impressions >= 10 && r.clicks === 0)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 30);
  if (zeroClick.length === 0) {
    console.log('  (none)\n');
  } else {
    const zeroClickRows = zeroClick.map(r => [
      r.keys[0].replace('https://www.erdosdx.com', ''),
      fmtNum(r.impressions),
      r.position.toFixed(1),
    ]);
    console.log(table(
      ['Page', 'Impressions', 'Avg Pos'],
      zeroClickRows,
      ['left', 'right', 'right']
    ));
    console.log('');
  }

  // 5. Country breakdown
  console.log(`## Top 20 Countries (by clicks)\n`);
  try {
    const countries = await gscQuery(token, ['country'], startDate(DAYS), endDate(), 20);
    countries.sort((a, b) => b.clicks - a.clicks);
    const countryRows = countries.map(r => [
      r.keys[0],
      fmtNum(r.clicks),
      fmtNum(r.impressions),
      fmtPct(r.ctr),
    ]);
    console.log(table(
      ['Country', 'Clicks', 'Impressions', 'CTR'],
      countryRows,
      ['left', 'right', 'right', 'right']
    ));
    console.log('');
  } catch (e) {
    console.log(`  (country breakdown unavailable: ${e.message})\n`);
  }

  // 6. Device breakdown
  console.log(`## Devices (by clicks)\n`);
  try {
    const devices = await gscQuery(token, ['device'], startDate(DAYS), endDate(), 5);
    const deviceRows = devices.map(r => [
      r.keys[0],
      fmtNum(r.clicks),
      fmtNum(r.impressions),
      fmtPct(r.ctr),
    ]);
    console.log(table(
      ['Device', 'Clicks', 'Impressions', 'CTR'],
      deviceRows,
      ['left', 'right', 'right', 'right']
    ));
    console.log('');
  } catch (e) {
    console.log(`  (device breakdown unavailable: ${e.message})\n`);
  }

  // 7. Summary metrics
  const totalClicks = queries.reduce((s, r) => s + r.clicks, 0);
  const totalImpressions = queries.reduce((s, r) => s + r.impressions, 0);
  const avgCtr = totalClicks / totalImpressions;
  const avgPos = queries.reduce((s, r) => s + r.position * r.impressions, 0) / totalImpressions;
  console.log(`## Summary\n`);
  console.log(`- Total clicks: **${fmtNum(totalClicks)}**`);
  console.log(`- Total impressions: **${fmtNum(totalImpressions)}**`);
  console.log(`- Average CTR: **${fmtPct(avgCtr)}**`);
  console.log(`- Average position: **${avgPos.toFixed(1)}**`);
  console.log(`- Queries with ≥20 impressions and <2% CTR: **${lowCtr.length}**`);
  console.log(`- Pages with ≥10 impressions and 0 clicks: **${zeroClick.length}**\n`);

  console.log(`---\n`);
  console.log(`Generated: ${new Date().toISOString()}`);
}

main().catch((e) => {
  console.error('Error:', e.message);
  if (e.stack) console.error(e.stack);
  process.exit(1);
});