#!/usr/bin/env node
// 单次翻译测试：只跑 cn，串行，看耗时
import fs from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(new URL('.', import.meta.url).pathname, '..');
const loadEnv = () => {
  try {
    const c = readFileSync(path.join(ROOT, '.env.local'), 'utf-8');
    for (const line of c.split('\n')) {
      if (!line.trim() || line.trim().startsWith('#')) continue;
      const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.+?)\s*$/);
      if (!m) continue;
      let v = m[2];
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      process.env[m[1]] = v;
    }
  } catch {}
};
loadEnv();

const LLM_API_URL = process.env.LLM_API_URL;
const LLM_API_KEY = process.env.LLM_API_KEY;
const LLM_MODEL = process.env.LLM_MODEL || 'deepseek-chat';

console.log('URL:', LLM_API_URL);
console.log('Model:', LLM_MODEL);
console.log('Key set:', LLM_API_KEY ? 'yes (len=' + LLM_API_KEY.length + ')' : 'NO');

const sys = 'You are a translator. Translate the following JSON from English to Chinese (Simplified). Return ONLY the translated JSON object with the same field structure. Field names must not be translated. Slug stays the same English kebab-case.';
const user = JSON.stringify({
  title: 'From Pasture to Garment: 23 Steps',
  excerpt: 'A walkthrough of how raw fiber becomes finished garment inside one vertical source factory.',
  slug: 'from-pasture-to-garment-23-steps-ordos-cashmere',
  content: 'Most buyers see a finished cashmere sweater on a shop rail. Few ever see what it took to get there. A single 250-gram pullover carries, hidden inside its soft twist, a year-long journey: combed from a goat on the Albas plateau, sorted in a Mongolian grading room, spun on Italian frames, knitted on a German STOLL machine, washed, mended, pressed, and packed.'
});

const t0 = Date.now();
const ctrl = new AbortController();
const timer = setTimeout(() => { console.log('!! 60s timeout'); ctrl.abort(); }, 60000);
try {
  const r = await fetch(LLM_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + LLM_API_KEY },
    body: JSON.stringify({ model: LLM_MODEL, messages: [{role:'system',content:sys},{role:'user',content:user}], temperature: 0.3, max_tokens: 500 }),
    signal: ctrl.signal,
  });
  console.log('HTTP', r.status, '(' + (Date.now()-t0) + 'ms)');
  const d = await r.json();
  console.log('Content preview:', d?.choices?.[0]?.message?.content?.slice(0, 200));
  console.log('Usage:', JSON.stringify(d?.usage));
} catch (e) {
  console.log('ERR:', e.message, '(' + (Date.now()-t0) + 'ms)');
} finally {
  clearTimeout(timer);
}
