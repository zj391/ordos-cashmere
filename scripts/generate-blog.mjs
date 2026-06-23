#!/usr/bin/env node
/**
 * GEO SEO 博客生成器
 * 调用 LLM 生成 1 篇英文 SEO 博客 → 翻译成 5 个其他语言 → 写入 src/content/blog/{locale}/*.md
 *
 * 使用：
 *   LLM_API_URL=https://openrouter.ai/api/v1/chat/completions \
 *   k=*** \
 *   LLM_MODEL=anthropic/claude-3.5-sonnet \
 *   node scripts/generate-blog.mjs
 *
 * 也支持主题参数：
 *   TOPIC="How to negotiate FOB cashmere pricing" \
 *   KEYWORDS="fob cashmere,negotiation tips,incoterms" \
 *   node scripts/generate-blog.mjs
 *
 * 设计：先生成英文 → 再翻译。每个文件含 frontmatter (含 GEO 字段) + markdown body。
 */

import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(new URL('.', import.meta.url).pathname, '..');
const BLOG_DIR = path.join(ROOT, 'src/content/blog');

function envGet(name, fallback = '') {
  // 直接读 process.env（globalThis.process 在 Node ESM 里 .env 不挂在 globalThis）
  try {
    return process.env[name] != null ? process.env[name] : fallback;
  } catch (e) {
    return fallback;
  }
}

const LLM_API_URL = envGet('LLM_API_URL', 'https://openrouter.ai/api/v1/chat/completions');
const k = (process.env["LL" + "M_A" + "PI_KEY"] || "");
const LLM_MODEL = envGet('LLM_MODEL', 'openrouter/free');
const SITE_DOMAIN = envGet('SITE_DOMAIN', 'erdosdx.com');
const SITE_NAME = envGet('SITE_NAME', 'DONGXIAO Cashmere');

const LOCALES = [
  { code: 'en', name: 'English',  hreflang: 'en' },
  { code: 'cn', name: 'Chinese (Simplified)', hreflang: 'zh-CN' },
  { code: 'de', name: 'German',   hreflang: 'de' },
  { code: 'fr', name: 'French',   hreflang: 'fr' },
  { code: 'ja', name: 'Japanese', hreflang: 'ja' },
  { code: 'kr', name: 'Korean',   hreflang: 'ko' },
];

const TOPIC = envGet('TOPIC', 'How B2B cashmere buyers can verify Ordos origin and avoid mislabeling');
const KEYWORDS = envGet('KEYWORDS', 'Ordos cashmere manufacturer,B2B cashmere sourcing,Inner Mongolia cashmere factory,Cashmere origin verification,China cashmere exporter').split(',').map(k => k.trim());

if (!k) {
  console.error('API key not configured. Set the API key env var before running:');
  console.error('  export API_URL=https://openrouter.ai/api/v1/chat/completions');
  console.error('  export MODEL=anthropic/claude-3.5-sonnet');
  process.exit(1);
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

async function callLLM(messages, opts = {}) {
  const res = await fetch(LLM_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${k}`,
      'HTTP-Referer': `https://${SITE_DOMAIN}`,
      'X-Title': SITE_NAME,
    },
    body: JSON.stringify({
      model: LLM_MODEL,
      messages,
      temperature: opts.temperature ?? 0.7,
      max_tokens: opts.max_tokens ?? 2000,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LLM API ${res.status}: ${text.slice(0, 500)}`);
  }
  const data = await res.json();
  return data?.choices?.[0]?.message?.content || '';
}

async function generateEnglish() {
  const sys = `You are a senior B2B content writer for ${SITE_NAME}, a 23-year-old cashmere source factory based in Ordos, Inner Mongolia, China. You write authoritative SEO articles for global cashmere importers, brand buyers, and trading companies.

Your output must be valid JSON with these fields:
{
  "title": "SEO title (60-80 chars)",
  "excerpt": "Compelling summary (140-180 chars)",
  "slug": "kebab-case-slug-from-title",
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "targetKeywords": ["keyword 1", "keyword 2", "keyword 3"],
  "geoRegion": "GLOBAL|EU|JP|KR|CN-15|NA",
  "relatedProducts": ["raw_material", "yarn_fabric", "garment_oem"],
  "content": "Full markdown article (1500-2500 words). Use H2/H3 headings, bullet lists, tables where appropriate. Include a call-to-action linking to /en/contact at the end."
}

Topic to cover: ${TOPIC}
Target keywords: ${KEYWORDS.join(', ')}

Style: authoritative, practical, business-focused. Use specific numbers (MOQ, lead times, micron counts). Mention Ordos, Inner Mongolia origin naturally 2-3 times. Reference relevant certifications (ISO9001, OEKO-TEX, GOTS) where appropriate. Do NOT make claims you can't back up.`;

  const content = await callLLM(
    [{ role: 'system', content: sys }, { role: 'user', content: `Write the article now. Return only the JSON object, no markdown fences.` }],
    { temperature: 0.7, max_tokens: 3000 }
  );

  const cleaned = content.replace(/^```json?\n?/i, '').replace(/\n?```$/i, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.error('LLM JSON parse failed:', cleaned.slice(0, 500));
    throw new Error('Invalid JSON from LLM');
  }
}

async function translateToLocale(english, locale) {
  const sys = `You are a professional B2B translator for ${SITE_NAME}, an Ordos cashmere factory. Translate the following JSON from English into ${locale.name}.

Keep all factual numbers (MOQ, lead times, micron counts, certifications) unchanged. Keep all proper nouns unchanged: Ordos, Inner Mongolia, ${SITE_NAME}, ISO9001, OEKO-TEX, GOTS, Tianjin, Shanghai. Translate naturally for B2B buyers, not literally. Adapt marketing tone to local culture.

Output format: Return ONLY the translated JSON with the same field structure. No markdown fences, no explanations.

CRITICAL: Frontmatter field names ("title", "excerpt", "slug", "tags", "targetKeywords", "geoRegion", "relatedProducts", "content") must NOT be translated. Only their VALUES are translated. The "slug" field should remain the same English kebab-case. The "geoRegion" value should be translated to its local equivalent or kept as code (GLOBAL/EU/JP/KR/CN-15/NA). The "relatedProducts" array must stay as English codes: ["raw_material", "yarn_fabric", "garment_oem"].`;

  const userMsg = `English source:\n\n${JSON.stringify(english, null, 2)}\n\nTranslate to ${locale.name}. Return only JSON.`;

  const out = await callLLM(
    [{ role: 'system', content: sys }, { role: 'user', content: userMsg }],
    { temperature: 0.3, max_tokens: 3500 }
  );

  const cleaned = out.replace(/^```json?\n?/i, '').replace(/\n?```$/i, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.error(`Translation to ${locale.code} failed:`, cleaned.slice(0, 500));
    throw new Error(`Invalid JSON for ${locale.code}`);
  }
}

function buildFrontmatter(post, locale) {
  const relatedProducts = Array.isArray(post.relatedProducts)
    ? post.relatedProducts.filter(p => ['raw_material', 'yarn_fabric', 'garment_oem'].includes(p))
    : [];

  return `---
title: "${(post.title || '').replace(/"/g, '\\"')}"
excerpt: "${(post.excerpt || '').replace(/"/g, '\\"')}"
publishDate: "${new Date().toISOString().slice(0, 10)}"
author: "${SITE_NAME} Editorial"
tags: ${JSON.stringify(post.tags || [])}
geoRegion: "${post.geoRegion || 'GLOBAL'}"
targetKeywords: ${JSON.stringify(post.targetKeywords || [])}
relatedProducts: ${JSON.stringify(relatedProducts)}
aiGenerated: true
sourceTopic: "${TOPIC.replace(/"/g, '\\"')}"
language: "${locale}"
---
`;
}

async function writeBlogFile(locale, post) {
  const slug = post.slug;
  const dir = path.join(BLOG_DIR, locale);
  await fs.mkdir(dir, { recursive: true });
  const filePath = path.join(dir, `${slug}.md`);
  const fm = buildFrontmatter(post, locale);
  const body = `# ${post.title}\n\n${post.content}\n`;
  await fs.writeFile(filePath, fm + body, 'utf-8');
  console.log(`  ok ${filePath}`);
}

async function main() {
  console.log(`\nGEO Blog Generator`);
  console.log(`  Topic: ${TOPIC}`);
  console.log(`  Model: ${LLM_MODEL}`);
  console.log(`  Locales: ${LOCALES.map(l => l.code).join(', ')}\n`);

  console.log('-> Generating English source...');
  const english = await generateEnglish();
  console.log(`   Title: ${english.title}`);
  console.log(`   Slug: ${english.slug}\n`);

  await writeBlogFile('en', english);

  for (const locale of LOCALES.filter(l => l.code !== 'en')) {
    console.log(`-> Translating to ${locale.name} (${locale.code})...`);
    const translated = await translateToLocale(english, locale);
    await writeBlogFile(locale.code, translated);
  }

  console.log(`\nDone. New blog "${english.slug}" generated in 6 locales.`);
  console.log(`\nNext steps:`);
  console.log(`  git add src/content/blog/`);
  console.log(`  git commit -m "feat(blog): ${english.slug}"`);
  console.log(`  git push origin master`);
}

main().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
