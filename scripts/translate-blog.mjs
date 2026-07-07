#!/usr/bin/env node
// Streaming split translate: en blog -> 5 locales (cn/de/fr/ja/kr).
// Each locale: 1 small meta call + N body chunks (streamed, max_tokens 1500).
// Env: DEEPSEEK_KEY is loaded from .env.local by loadEnv() below.
import fs from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(new URL('.', import.meta.url).pathname, '..');
const BLOG_DIR = path.join(ROOT, 'src/content/blog');

// Load .env.local (gitignored, holds DEEPSEEK_KEY)
try {
  const c = readFileSync(path.join(ROOT, '.env.local'), 'utf-8');
  for (const line of c.split('\n')) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.+?)\s*$/);
    if (!m) continue;
    let v = m[2];
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    process.env[m[1]] = v;
  }
} catch {}

const env = process.env;
const LLM_API_URL = env.LLM_API_URL || 'https://api.deepseek.com/v1/chat/completions';
const API_KEY = env.DEEPSEEK_KEY || '';
const LLM_MODEL = env.LLM_MODEL || 'deepseek-chat';
const SITE_NAME = env.SITE_NAME || 'DONGXIAO Cashmere';
const SOURCE_SLUG = env.SOURCE_SLUG || 'from-pasture-to-garment-23-steps-ordos-cashmere';
const FIRST_ONLY = env.FIRST_ONLY || '';

const TARGET_LOCALES = [
  { code: 'cn', name: 'Chinese (Simplified)' },
  { code: 'de', name: 'German' },
  { code: 'fr', name: 'French' },
  { code: 'ja', name: 'Japanese' },
  { code: 'kr', name: 'Korean' },
].filter(l => !FIRST_ONLY || l.code === FIRST_ONLY);

if (!API_KEY) { console.error('DEEPSEEK_KEY not set in .env.local'); process.exit(1); }

function parseFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error('FM not found');
  const lines = m[1].split('\n');
  const fm = {};
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    const km = line.match(/^([a-zA-Z_]+):\s*(.*)$/);
    if (!km) { i++; continue; }
    const key = km[1]; let val = km[2].trim();
    if (val === '' || val === '|') {
      // 多行 YAML 数组
      i++;
      while (i < lines.length && /^\s+-\s+/.test(lines[i])) {
        if (!fm[key]) fm[key] = [];
        fm[key].push(lines[i].replace(/^\s+-\s+/, '').replace(/^["']|["']$/g, '').trim());
        i++;
      }
    } else if (val.startsWith('[') && val.endsWith(']')) {
      try { fm[key] = JSON.parse(val); } catch { fm[key] = val; }
      i++;
    } else if (val.startsWith('"') && val.endsWith('"')) {
      fm[key] = val.slice(1, -1);
      i++;
    } else {
      fm[key] = val;
      i++;
    }
  }
  return { fm, body: m[2] };
}

function splitBody(body, maxChunk = 2500) {
  const trimmed = body.replace(/^# .*?\n/, '').trim();
  if (trimmed.length <= maxChunk) return [trimmed];
  const parts = trimmed.split(/\n\n+/);
  const out = []; let cur = '';
  for (const p of parts) {
    if (cur.length + p.length + 2 > maxChunk && cur) { out.push(cur); cur = p; }
    else cur = cur ? cur + '\n\n' + p : p;
  }
  if (cur) out.push(cur);
  return out;
}

async function streamLLM(messages, opts = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), opts.timeoutMs ?? 120000);
  try {
    const useStream = opts.stream !== false;  // 默认流式
    const res = await fetch(LLM_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
      body: JSON.stringify({
        model: LLM_MODEL, messages,
        temperature: opts.temperature ?? 0.3,
        max_tokens: opts.max_tokens ?? 1200,
        stream: useStream,
      }),
      signal: ctrl.signal,
    });
    if (!res.ok) { const t = await res.text(); throw new Error(`LLM ${res.status}: ${t.slice(0, 300)}`); }
    if (!useStream) {
      const d = await res.json();
      return d?.choices?.[0]?.message?.content || '';
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let full = ''; let buffer = '';
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();
      for (const line of lines) {
        const t = line.trim();
        if (!t.startsWith('data:')) continue;
        const payload = t.slice(5).trim();
        if (payload === '[DONE]') continue;
        try {
          const j = JSON.parse(payload);
          const delta = j?.choices?.[0]?.delta?.content;
          if (delta) full += delta;
        } catch {}
      }
    }
    return full;
  } finally { clearTimeout(timer); }
}

async function translateMeta(payload, locale) {
  const sys = `You are a B2B translator for ${SITE_NAME} (Ordos cashmere factory). Translate the JSON fields to ${locale.name}.

RULES:
- Field names not translated. slug stays English kebab. geoRegion/relatedProducts stay as English codes.
- Keep proper nouns: Ordos, Inner Mongolia, DONGXIAO, Albas, ISO9001, OEKO-TEX, GOTS, STOLL, Mongolian, Tianjin, Shanghai.
- title: max 80 chars. excerpt: 140-180 chars.
- Escape internal " as \\".
- Return ONLY the translated JSON with: title, excerpt, slug, tags, targetKeywords, geoRegion, relatedProducts.`;
  const out = await streamLLM(
    [{ role: 'system', content: sys }, { role: 'user', content: `English source:\n\n${JSON.stringify(payload)}\n\nTranslate to ${locale.name}. Return only JSON.` }],
    { temperature: 0.3, max_tokens: 600, timeoutMs: 60000 }
  );
  return JSON.parse(out.replace(/^```json?\n?/i, '').replace(/\n?```$/i, '').trim());
}

async function translateChunk(text, locale) {
  const sys = `You are a B2B translator for ${SITE_NAME}. Translate English markdown to ${locale.name}. Keep markdown structure (H2/H3, lists, bold, links). Keep proper nouns unchanged: Ordos, Inner Mongolia, DONGXIAO, Albas, ISO9001, OEKO-TEX, GOTS, STOLL, Mongolian, Tianjin, Shanghai. Keep factual numbers unchanged. Return ONLY translated markdown.`;
  const out = await streamLLM(
    [{ role: 'system', content: sys }, { role: 'user', content: text }],
    { temperature: 0.3, max_tokens: 1200, timeoutMs: 90000 }
  );
  return out.trim();
}

function buildFrontmatter(post, localeCode) {
  const related = Array.isArray(post.relatedProducts)
    ? post.relatedProducts.filter(p => ['raw_material', 'yarn_fabric', 'garment_oem'].includes(p))
    : [];
  const esc = s => String(s).replace(/"/g, '\\"');
  return `---
title: "${esc(post.title || '')}"
excerpt: "${esc(post.excerpt || '')}"
publishDate: "${new Date().toISOString().slice(0, 10)}"
author: "${SITE_NAME} Editorial"
tags: ${JSON.stringify(post.tags || [])}
geoRegion: "${post.geoRegion || 'GLOBAL'}"
targetKeywords: ${JSON.stringify(post.targetKeywords || [])}
relatedProducts: ${JSON.stringify(related)}
aiGenerated: true
sourceTopic: "translated-from-en"
language: "${localeCode}"
---
`;
}

async function writeBlogFile(locale, post, body) {
  const dir = path.join(BLOG_DIR, locale);
  await fs.mkdir(dir, { recursive: true });
  const filePath = path.join(dir, `${SOURCE_SLUG}.md`);
  const fm = buildFrontmatter(post, locale);
  const full = fm + `# ${post.title}\n\n${body}\n`;
  await fs.writeFile(filePath, full, 'utf-8');
  console.log(`  ok ${filePath} (${Buffer.byteLength(full)} bytes)`);
}

async function translateOne(englishPayload, chunks, locale) {
  const t0 = Date.now();
  console.log(`  [${locale.code}] meta...`);
  const meta = await translateMeta(englishPayload, locale);
  console.log(`  [${locale.code}] body x${chunks.length} chunks (stream)...`);
  const translated = [];
  for (let i = 0; i < chunks.length; i++) {
    const t = Date.now();
    process.stdout.write(`  [${locale.code}] chunk ${i+1}/${chunks.length}... `);
    const c = await translateChunk(chunks[i], locale);
    translated.push(c);
    console.log(`done ${Date.now()-t}ms (${c.length} chars)`);
  }
  const body = translated.join('\n\n');
  await writeBlogFile(locale.code, meta, body);
  return { ok: true, dt: Date.now() - t0 };
}

async function main() {
  const enPath = path.join(BLOG_DIR, 'en', `${SOURCE_SLUG}.md`);
  const raw = await fs.readFile(enPath, 'utf-8');
  const { fm, body } = parseFrontmatter(raw);
  const payload = {
    title: fm.title || '',
    excerpt: fm.excerpt || '',
    slug: SOURCE_SLUG,
    tags: fm.tags || [],
    targetKeywords: fm.targetKeywords || [],
    geoRegion: fm.geoRegion || 'GLOBAL',
    relatedProducts: fm.relatedProducts || [],
  };
  const chunks = splitBody(body);
  console.log(`\nStreaming translate: ${SOURCE_SLUG}`);
  console.log(`  Body: ${body.length} chars / ${chunks.length} chunks`);
  console.log(`  Locales: ${TARGET_LOCALES.map(l => l.code).join(', ')}\n`);

  const t0 = Date.now();
  const results = [];
  for (const locale of TARGET_LOCALES) {
    process.stdout.write(`\n-> ${locale.name} (${locale.code}) starting...\n`);
    try {
      const r = await translateOne(payload, chunks, locale);
      results.push({ code: locale.code, ...r });
    } catch (e) {
      process.stdout.write(`  ! ${locale.code} FAILED: ${e.message}\n`);
      process.stdout.write(`  ! Fallback: write English source for ${locale.code}\n`);
      const fallbackBody = body.replace(/^# .*?\n/, '').trim();
      const fallbackPost = { ...payload, language: locale.code };
      await writeBlogFile(locale.code, fallbackPost, fallbackBody);
      results.push({ code: locale.code, ok: false, err: e.message });
    }
  }
  const okCount = results.filter(r => r.ok).length;
  console.log(`\n=== Result: ${okCount}/${results.length} ok. Total ${Date.now() - t0}ms ===`);
  results.forEach(r => console.log(`  ${r.code}: ${r.ok ? r.dt + 'ms' : 'FAIL ' + (r.err || '').slice(0, 80)}`));
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
