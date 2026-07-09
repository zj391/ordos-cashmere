#!/usr/bin/env node
/**
 * Google Search Console sitemap submitter.
 *
 * 用法:
 *   1. Service account 方式（推荐 - 长期 token）:
 *      - 把 key JSON 放到 ~/.gsc-key.json 或 ~/ordos-cashmere-site/gsc-key.json
 *      - 在 GSC 把 service account email 加为 Owner
 *      - node scripts/seo/gsc-submit.mjs
 *
 *   2. OAuth access token 方式（30 分钟有效 - 临时）:
 *      - 浏览器登录 GSC → DevTools → Network → 找 Authorization: Bearer xxx
 *      - TOKEN=ya29.xxx node scripts/seo/gsc-submit.mjs
 *
 *   3. 手动（无需 key）:
 *      - 打开 https://search.google.com/search-console/sitemaps?resource_id=...
 *      - 粘贴 https://www.erdosdx.com/sitemap-index.xml → Submit
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const SITE_URL = 'sc-domain:erdosdx.com';  // Domain property format
// For URL prefix property use: 'https://www.erdosdx.com/'
const SITEMAP_URL = 'https://www.erdosdx.com/sitemap-index.xml';

async function getTokenFromServiceAccount(keyPath) {
  // Minimal JWT signing for service account OAuth without external deps.
  // We import google-auth-library lazily so the script can also use TOKEN.
  let auth;
  try {
    auth = await import('google-auth-library');
  } catch {
    throw new Error('google-auth-library not installed. Run: npm install google-auth-library');
  }
  const key = JSON.parse(readFileSync(keyPath, 'utf8'));
  const jwtClient = new auth.JWT({
    email: key.client_email,
    key: key.private_key,
    scopes: ['https://www.googleapis.com/auth/webmasters'],
  });
  const tokens = await jwtClient.authorize();
  return tokens.access_token;
}

async function getTokenFromEnv() {
  const token = process.env.TOKEN;
  if (!token) {
    throw new Error('TOKEN env var not set');
  }
  return token;
}

async function findServiceAccountKey() {
  const candidates = [
    join(homedir(), 'gsc-key.json'),
    join(homedir(), '.gsc-key.json'),
    join(process.cwd(), 'gsc-key.json'),
    join(process.cwd(), '.gsc-key.json'),
  ];
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  return null;
}

async function submitSitemap(token, siteUrl, feedUrl) {
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/sitemaps/${encodeURIComponent(feedUrl)}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  const text = await res.text();
  return { status: res.status, body: text };
}

async function listSitemaps(token, siteUrl) {
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/sitemaps`;
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return { status: res.status, body: await res.text() };
}

async function main() {
  // 1. Get access token
  let token;
  if (process.env.TOKEN) {
    console.log('Using TOKEN env var (OAuth access token)');
    token = await getTokenFromEnv();
  } else {
    const keyPath = process.env.KEY_PATH || await findServiceAccountKey();
    if (!keyPath) {
      console.error('No service account key found. Set TOKEN=ya29.xxx or place gsc-key.json in ~/, ./.');
      console.error('See: scripts/seo/gsc-submit.mjs for instructions');
      process.exit(1);
    }
    console.log(`Using service account key: ${keyPath}`);
    token = await getTokenFromServiceAccount(keyPath);
  }
  console.log('✓ Got access token');

  // 2. List existing sitemaps
  console.log('\n--- Current sitemaps ---');
  const list = await listSitemaps(token, SITE_URL);
  console.log(`Status: ${list.status}`);
  if (list.status === 200) {
    const data = JSON.parse(list.body);
    if (data.sitemap?.length === 0) {
      console.log('  (none)');
    } else {
      for (const s of data.sitemap || []) {
        console.log(`  - ${s.path}  (last submitted: ${s.lastSubmitted || 'never'})`);
      }
    }
  } else {
    console.log(list.body.slice(0, 500));
  }

  // 3. Submit sitemap
  console.log(`\n--- Submitting ${SITEMAP_URL} ---`);
  const result = await submitSitemap(token, SITE_URL, SITEMAP_URL);
  console.log(`Status: ${result.status}`);
  if (result.status === 200 || result.status === 204) {
    console.log('✓ Sitemap submitted successfully');
  } else {
    console.log('Response:', result.body.slice(0, 500));
  }
}

main().catch((e) => {
  console.error('Error:', e.message);
  if (e.stack) console.error(e.stack);
  process.exit(1);
});