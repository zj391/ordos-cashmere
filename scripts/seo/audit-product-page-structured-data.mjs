/**
 * Static product-route SEO and JSON-LD audit.
 * Run after `astro build` and sitemap generation:
 *   node scripts/seo/audit-product-page-structured-data.mjs
 */

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = join(process.cwd(), 'dist/client');
const locales = ['en', 'cn', 'de', 'fr', 'ja', 'kr'];
const hubs = new Set(['hats-accessories', 'garment-oem', 'scarves', 'accessories-cat', 'yarn']);
const hreflang = { en: 'en', cn: 'zh-CN', de: 'de', fr: 'fr', ja: 'ja', kr: 'ko' };
const legacy = /Italian Sant|French NCSI|German STOLL|\bOFDA\b|stock Nm counts|tons\/year|no middleman|Custom Nm counts|Pantone color matching|\+\$0\.50|15-25 day lead|MOQ 50|MOQ 100|2002-[0-9]{4}|cashmere factory China|Ordos cashmere factory/i;

const attr = (tag, name) => (tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, 'i')) || [])[2] || '';
const tags = (html, re) => [...html.matchAll(re)].map((match) => match[0]);
const count = (html, text) => html.split(text).length - 1;
const decode = (value = '') => value
  .replace(/&amp;/g, '&')
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>');
const textContent = (html) => decode((html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());

function jsonLdObjects(html) {
  const parsed = [];
  for (const match of html.matchAll(/<script\b[^>]*type\s*=\s*(["'])application\/ld\+json\1[^>]*>([\s\S]*?)<\/script>/gi)) {
    try { parsed.push(JSON.parse(match[2].trim())); } catch { parsed.push({ __parseError: true }); }
  }
  const walk = (value, output = []) => {
    if (Array.isArray(value)) value.forEach((item) => walk(item, output));
    else if (value && typeof value === 'object') {
      output.push(value);
      Object.values(value).forEach((item) => walk(item, output));
    }
    return output;
  };
  return parsed.flatMap((entry) => walk(entry));
}

const hasType = (value, expected) => (Array.isArray(value?.['@type']) ? value['@type'] : [value?.['@type']]).includes(expected);

const sitemap = await readFile(join(root, 'sitemap-products.xml'), 'utf8');
const routes = [...new Set([...sitemap.matchAll(/<loc>https:\/\/www\.erdosdx\.com\/(en|cn|de|fr|ja|kr)\/products\/([^<\/]+)\/<\/loc>/g)]
  .map((match) => ({ locale: match[1], id: match[2] })))];
const reports = [];
for (const { locale, id } of routes) {
    const html = await readFile(join(root, locale, 'products', id, 'index.html'), 'utf8');
    const url = `https://www.erdosdx.com/${locale}/products/${id}/`;
    const links = tags(html, /<link\b[^>]*>/gi).map((tag) => ({ rel: attr(tag, 'rel'), href: attr(tag, 'href'), lang: attr(tag, 'hreflang') }));
    const canonical = links.find((link) => link.rel.toLowerCase().split(/\s+/).includes('canonical'))?.href || '';
    const alternates = links.filter((link) => link.rel.toLowerCase().split(/\s+/).includes('alternate') && link.lang);
    const title = textContent((html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i) || [])[1]);
    const descriptionTag = tags(html, /<meta\b[^>]*>/gi).find((tag) => attr(tag, 'name').toLowerCase() === 'description');
    const description = descriptionTag ? attr(descriptionTag, 'content') : '';
    const h1 = textContent((html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i) || [])[1]);
    const schemas = jsonLdObjects(html);
    const products = schemas.filter((schema) => hasType(schema, 'Product'));
    const breadcrumbs = schemas.filter((schema) => hasType(schema, 'BreadcrumbList'));
    const isHub = hubs.has(id);
    const failures = [];

    if (!title) failures.push('title:missing');
    else if (title.length > 132) failures.push(`title:length:${title.length}`);
    if (!description) failures.push('description:missing');
    else if (description.length > 160) failures.push(`description:length:${description.length}`);
    if (canonical !== url) failures.push('canonical');
    if (count(html, 'noindex') > 0) failures.push('robots:noindex');
    if (!h1) failures.push('h1:missing');
    if (schemas.some((schema) => schema.__parseError)) failures.push('jsonld:parse-error');
    if (breadcrumbs.length !== 1) failures.push(`breadcrumb:${breadcrumbs.length}`);
    if (isHub ? products.length !== 0 : products.length !== 1) failures.push(`product:${products.length}`);
    if (!isHub && products[0]?.name !== h1) failures.push('product-name:h1-mismatch');
    if (!isHub && schemas.some((schema) => hasType(schema, 'Offer') || 'offers' in schema || 'priceCurrency' in schema || 'availability' in schema)) failures.push('offer-or-stock-schema');
    if (!isHub && legacy.test(html)) failures.push('legacy-claim');
    for (const [alternateLocale, language] of Object.entries(hreflang)) {
      const expectedHref = `https://www.erdosdx.com/${alternateLocale}/products/${id}/`;
      if (!alternates.some((item) => item.lang === language && item.href === expectedHref)) failures.push(`hreflang:${language}`);
    }
    if (!alternates.some((item) => item.lang === 'x-default' && item.href === `https://www.erdosdx.com/en/products/${id}/`)) failures.push('hreflang:x-default');

    reports.push({ locale, id, isHub, titleLength: title.length, descriptionLength: description.length, failures });
}

const summary = {
  total: reports.length,
  detailPages: reports.filter((report) => !report.isHub).length,
  hubs: reports.filter((report) => report.isHub).length,
  clean: reports.filter((report) => report.failures.length === 0).length,
  pagesWithIssues: reports.filter((report) => report.failures.length > 0).length,
  issueTypes: Object.fromEntries(
    [...new Set(reports.flatMap((report) => report.failures))]
      .sort()
      .map((failure) => [failure, reports.filter((report) => report.failures.includes(failure)).length]),
  ),
  examples: reports.filter((report) => report.failures.length > 0).slice(0, 20),
};

console.log(JSON.stringify(summary, null, 2));
process.exitCode = summary.pagesWithIssues ? 1 : 0;
