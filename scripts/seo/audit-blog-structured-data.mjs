import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DIST = path.join(ROOT, 'dist/client');
const indexabilitySource = await fs.readFile(path.join(ROOT, 'src/lib/blog-indexability.ts'), 'utf8');
const indexableIds = new Set([...indexabilitySource.matchAll(/'([a-z]{2}\/[\w-]+)'/g)].map((match) => match[1]));
const locales = ['en', 'cn', 'de', 'fr', 'ja', 'kr'];
const findings = [];
const metrics = { total: 0, indexable: 0, noindex: 0, blogPosting: 0, breadcrumb: 0, faq: 0 };

function jsonLdNodes(html, file) {
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  return blocks.flatMap((block) => {
    try {
      const parsed = JSON.parse(block[1]);
      return Array.isArray(parsed) ? parsed : parsed['@graph'] || [parsed];
    } catch (error) {
      findings.push(`${file}: invalid JSON-LD (${error.message})`);
      return [];
    }
  });
}

for (const locale of locales) {
  const blogDir = path.join(DIST, locale, 'blog');
  const entries = await fs.readdir(blogDir, { withFileTypes: true });
  for (const entry of entries.filter((item) => item.isDirectory())) {
    const file = path.join(blogDir, entry.name, 'index.html');
    const html = await fs.readFile(file, 'utf8');
    const nodes = jsonLdNodes(html, file);
    const id = `${locale}/${entry.name}`;
    const expectedIndexable = indexableIds.has(id);
    const hasNoindex = html.includes('noindex,nofollow');
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/i)?.[1];
    const blogPosts = nodes.filter((node) => node?.['@type'] === 'BlogPosting');
    const breadcrumbs = nodes.filter((node) => node?.['@type'] === 'BreadcrumbList');
    const faqPages = nodes.filter((node) => node?.['@type'] === 'FAQPage');
    metrics.total += 1;
    metrics.blogPosting += blogPosts.length;
    metrics.breadcrumb += breadcrumbs.length;
    metrics.faq += faqPages.length;

    if (!canonical) findings.push(`${id}: missing canonical`);
    if ((expectedIndexable && hasNoindex) || (!expectedIndexable && !hasNoindex)) findings.push(`${id}: robots does not match indexability allowlist`);
    if (expectedIndexable) {
      metrics.indexable += 1;
      if (blogPosts.length !== 1) findings.push(`${id}: expected one BlogPosting, found ${blogPosts.length}`);
      if (breadcrumbs.length !== 1) findings.push(`${id}: expected one BreadcrumbList, found ${breadcrumbs.length}`);
      if (faqPages.length > 1) findings.push(`${id}: expected at most one FAQPage, found ${faqPages.length}`);
      const article = blogPosts[0];
      if (article && (!article.headline || !article.description || !article.datePublished || !article.dateModified || !article.image?.url)) findings.push(`${id}: BlogPosting has an incomplete required-content field`);
      if (article && canonical && (article.url !== canonical || article.mainEntityOfPage?.['@id'] !== canonical || article['@id'] !== `${canonical}#article`)) findings.push(`${id}: BlogPosting URL identity does not match canonical`);
      if (article && article.inLanguage !== ({ en: 'en', cn: 'zh-CN', de: 'de', fr: 'fr', ja: 'ja', kr: 'ko' })[locale]) findings.push(`${id}: BlogPosting language does not match locale`);
    } else {
      metrics.noindex += 1;
      if (blogPosts.length || breadcrumbs.length || faqPages.length) findings.push(`${id}: noindex article emitted search-enhancement schema`);
    }
  }
}

console.log(JSON.stringify({ ...metrics, findings }, null, 2));
if (findings.length) process.exit(1);
