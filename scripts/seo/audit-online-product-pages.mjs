/**
 * Public-site product page audit.
 * Reads the published product sitemap and checks the SEO/JSON-LD contract
 * without modifying the live site. Usage:
 *   node scripts/seo/audit-online-product-pages.mjs
 * Optional:
 *   SITEMAP_URL=https://www.erdosdx.com/sitemap-products.xml CONCURRENCY=8 node ...
 */

const sitemapUrl = process.env.SITEMAP_URL || 'https://www.erdosdx.com/sitemap-products.xml';
const concurrency = Math.max(1, Math.min(Number(process.env.CONCURRENCY || 8), 16));
const siteOrigin = new URL(sitemapUrl).origin;
const localeHreflangs = { en: 'en', cn: 'zh-CN', de: 'de', fr: 'fr', ja: 'ja', kr: 'ko' };
const forbiddenLegacy = /Italian Sant|French NCSI|German STOLL|\bOFDA\b|stock Nm counts|tons\/year|no middleman|Custom Nm counts|Pantone color matching|\+\$0\.50|15-25 day lead|MOQ 50|MOQ 100|2002-[0-9]{4}|cashmere factory China|Ordos cashmere factory/i;

const decode = (value = '') => value
  .replace(/&amp;/g, '&')
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/\s+/g, ' ')
  .trim();

function attr(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, 'i'));
  return match ? decode(match[2]) : '';
}

function tags(html, selector) {
  return [...html.matchAll(selector)].map((match) => match[0]);
}

function metaContent(html, name) {
  const metaTags = tags(html, /<meta\b[^>]*>/gi);
  return metaTags.find((tag) => attr(tag, 'name').toLowerCase() === name.toLowerCase())
    ? attr(metaTags.find((tag) => attr(tag, 'name').toLowerCase() === name.toLowerCase()), 'content')
    : '';
}

function linkTags(html) {
  return tags(html, /<link\b[^>]*>/gi).map((tag) => ({
    rel: attr(tag, 'rel').toLowerCase(),
    href: attr(tag, 'href'),
    hreflang: attr(tag, 'hreflang'),
  }));
}

function jsonLdObjects(html) {
  const entries = [];
  for (const match of html.matchAll(/<script\b[^>]*type\s*=\s*(["'])application\/ld\+json\1[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      entries.push(JSON.parse(match[2].trim()));
    } catch {
      entries.push({ __parseError: true });
    }
  }
  return entries;
}

function hasType(value, expected) {
  const types = Array.isArray(value?.['@type']) ? value['@type'] : [value?.['@type']];
  return types.includes(expected);
}

function walkObjects(value, out = []) {
  if (Array.isArray(value)) {
    value.forEach((item) => walkObjects(item, out));
  } else if (value && typeof value === 'object') {
    out.push(value);
    Object.values(value).forEach((item) => walkObjects(item, out));
  }
  return out;
}

function hasForbiddenStructuredField(value) {
  const objects = walkObjects(value);
  return objects.some((item) => hasType(item, 'Offer') || 'offers' in item || 'priceCurrency' in item || 'availability' in item || 'InStock' in item);
}

function pageIdentity(url) {
  const parts = new URL(url).pathname.split('/').filter(Boolean);
  return { locale: parts[0], id: parts[2] };
}

async function fetchText(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'user-agent': 'DONGXIAO-SEO-Audit/1.0 (+public-site-validation)' },
    });
    return { status: response.status, url: response.url, html: await response.text() };
  } finally {
    clearTimeout(timer);
  }
}

function auditPage(requestedUrl, response) {
  const failures = [];
  const { locale, id } = pageIdentity(requestedUrl);
  if (response.status !== 200) return { requestedUrl, locale, id, failures: [`http:${response.status}`] };
  if (response.url !== requestedUrl) failures.push(`redirect:${response.url}`);

  const html = response.html;
  const title = decode((html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i) || [])[1]);
  const description = metaContent(html, 'description');
  const robots = metaContent(html, 'robots').toLowerCase();
  const links = linkTags(html);
  const canonical = links.find((link) => link.rel.split(/\s+/).includes('canonical'))?.href || '';
  const alternates = links.filter((link) => link.rel.split(/\s+/).includes('alternate') && link.hreflang);
  const h1 = decode((html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i) || [])[1]?.replace(/<[^>]+>/g, ' '));
  const schemas = jsonLdObjects(html);
  const objects = schemas.flatMap((schema) => walkObjects(schema));
  const products = objects.filter((schema) => hasType(schema, 'Product'));
  const breadcrumbs = objects.filter((schema) => hasType(schema, 'BreadcrumbList'));

  if (!title) failures.push('title:missing');
  else if (title.length > 132) failures.push(`title:length:${title.length}`);
  if (!description) failures.push('description:missing');
  else if (description.length > 160) failures.push(`description:length:${description.length}`);
  if (canonical !== requestedUrl) failures.push(`canonical:${canonical || 'missing'}`);
  if (robots.includes('noindex')) failures.push(`robots:${robots}`);
  if (!h1) failures.push('h1:missing');
  if (schemas.some((schema) => schema.__parseError)) failures.push('jsonld:parse-error');
  if (products.length !== 1) failures.push(`product-schema:${products.length}`);
  if (breadcrumbs.length !== 1) failures.push(`breadcrumb-schema:${breadcrumbs.length}`);

  const expectedHreflangs = Object.entries(localeHreflangs).map(([expectedLocale, hreflang]) => ({
    hreflang,
    href: `${siteOrigin}/${expectedLocale}/products/${id}/`,
  }));
  expectedHreflangs.push({ hreflang: 'x-default', href: `${siteOrigin}/en/products/${id}/` });
  for (const expected of expectedHreflangs) {
    if (!alternates.some((alternate) => alternate.hreflang === expected.hreflang && alternate.href === expected.href)) {
      failures.push(`hreflang:${expected.hreflang}`);
    }
  }

  const product = products[0];
  if (product) {
    if (!decode(product.name)) failures.push('product-name:missing');
    else if (decode(product.name) !== h1) failures.push('product-name:h1-mismatch');
    if (hasForbiddenStructuredField(product)) failures.push('product-schema:offer-or-price-field');
  }
  if (forbiddenLegacy.test(html)) failures.push('legacy-claim');

  return { requestedUrl, locale, id, titleLength: title.length, descriptionLength: description.length, failures };
}

const sitemap = await fetchText(sitemapUrl);
if (sitemap.status !== 200) throw new Error(`Cannot load sitemap: HTTP ${sitemap.status}`);
const urls = [...new Set([...sitemap.html.matchAll(/<loc>(https:\/\/www\.erdosdx\.com\/(?:en|cn|de|fr|ja|kr)\/products\/[^<]+)<\/loc>/g)].map((match) => match[1]))].sort();
if (!urls.length) throw new Error('No product URLs found in sitemap');

const reports = [];
let cursor = 0;
async function worker() {
  while (cursor < urls.length) {
    const index = cursor++;
    const requestedUrl = urls[index];
    try {
      reports[index] = auditPage(requestedUrl, await fetchText(requestedUrl));
    } catch (error) {
      const { locale, id } = pageIdentity(requestedUrl);
      reports[index] = { requestedUrl, locale, id, failures: [`fetch:${error.name || 'error'}`] };
    }
  }
}
await Promise.all(Array.from({ length: concurrency }, worker));

const count = (predicate) => reports.filter(predicate).length;
const issueTypes = {};
for (const report of reports) {
  for (const failure of report.failures) issueTypes[failure] = (issueTypes[failure] || 0) + 1;
}
const byLocale = Object.fromEntries(Object.keys(localeHreflangs).map((locale) => [locale, {
  total: count((report) => report.locale === locale),
  clean: count((report) => report.locale === locale && report.failures.length === 0),
}]));

console.log(JSON.stringify({
  sitemapUrl,
  sitemapUrls: urls.length,
  concurrency,
  cleanPages: count((report) => report.failures.length === 0),
  pagesWithIssues: count((report) => report.failures.length > 0),
  byLocale,
  issueTypes,
  examples: reports.filter((report) => report.failures.length > 0).slice(0, 20),
}, null, 2));
