#!/usr/bin/env node
// Supabase data backup - exports all tables to local JSON files
// Usage:
//   node scripts/leads/backup.mjs                    # backup all tables
//   node scripts/leads/backup.mjs --tables leads      # specific tables
//   node scripts/leads/backup.mjs --out /tmp/backup  # custom output dir
//   node scripts/leads/backup.mjs --keep 30          # only keep last 30 backups
//
// Cron: weekly Sunday 03:00 UTC via GitHub Actions

import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, unlinkSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(new URL('.', import.meta.url).pathname, '../..');

const ENV = (() => {
  const out = {};
  try {
    const c = readFileSync(path.join(ROOT, '.env.local'), 'utf-8');
    for (const line of c.split('\n')) {
      if (!line.trim() || line.trim().startsWith('#')) continue;
      const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.+?)\s*$/);
      if (!m) continue;
      let v = m[2];
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      out[m[1]] = v;
    }
  } catch {}
  return out;
})();

const SUPABASE_URL = ENV.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = ENV.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env.local');
  process.exit(1);
}

const args = process.argv.slice(2);
let tables = ['leads', 'lead_activities', 'inquiries', 'known_customers', 'chat_sessions'];
let outDir = path.join(ROOT, 'backup');
let keep = 0; // 0 = keep all
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--tables' && args[i+1]) tables = args[++i].split(',');
  else if (args[i] === '--out' && args[i+1]) outDir = args[++i];
  else if (args[i] === '--keep' && args[i+1]) keep = parseInt(args[++i], 10);
}

const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function sb(pathname, opts = {}) {
  // Paginate with .range() for large tables
  const PAGE = 1000;
  let allRows = [];
  let from = 0;
  while (true) {
    const sep = pathname.includes('?') ? '&' : '?';
    const res = await fetch(`${SUPABASE_URL}/rest/v1${pathname}${sep}limit=${PAGE}&offset=${from}`, {
      ...opts,
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_SERVICE_KEY,
        'Content-Type': 'application/json',
        'Range-Unit': 'items',
        'Range': `${from}-${from + PAGE - 1}`,
        'Prefer': 'count=exact',
      },
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error('Supabase ' + res.status + ' ' + pathname + ': ' + t.slice(0, 200));
    }
    const rows = await res.json();
    if (!Array.isArray(rows) || rows.length === 0) break;
    allRows = allRows.concat(rows);
    if (rows.length < PAGE) break;
    from += PAGE;
  }
  return allRows;
}

function pruneOldBackups(dir, keepN) {
  if (keepN <= 0) return;
  const files = readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => ({ f, mtime: statSync(path.join(dir, f)).mtime.getTime() }))
    .sort((a, b) => b.mtime - a.mtime);
  while (files.length > keepN) {
    unlinkSync(path.join(dir, files.pop().f));
  }
}

async function main() {
  const stamp = new Date().toISOString().slice(0, 16).replace(/[T:]/g, '-');
  const runDir = path.join(outDir, stamp);
  mkdirSync(runDir, { recursive: true });

  const manifest = {
    backup_at: new Date().toISOString(),
    supabase_url: SUPABASE_URL.replace(/^https?:\/\//, '').replace(/\..*/, ''),
    tables: {},
  };

  console.log('Backing up to ' + runDir);
  for (const t of tables) {
    try {
      const t0 = Date.now();
      const rows = await sb('/' + t + '?select=*');
      const f = path.join(runDir, t + '.json');
      writeFileSync(f, JSON.stringify(rows, null, 2));
      const dt = Date.now() - t0;
      console.log('  ' + t.padEnd(20) + ' ' + String(rows.length).padStart(6) + ' rows  ' + dt + 'ms');
      manifest.tables[t] = { rows: rows.length, ms: dt, file: t + '.json' };
    } catch (e) {
      console.log('  ' + t.padEnd(20) + ' ERROR: ' + e.message);
      manifest.tables[t] = { error: e.message };
    }
  }
  writeFileSync(path.join(runDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

  pruneOldBackups(outDir, keep);

  // Latest symlink
  const latestLink = path.join(outDir, 'latest');
  try { unlinkSync(latestLink); } catch {}
  try {
    const { symlinkSync } = await import('node:fs');
    symlinkSync(runDir, latestLink, 'dir');
  } catch {
    // ignore
  }

  console.log('\nDone. Backup at: ' + runDir);
  console.log('Manifest: ' + path.join(runDir, 'manifest.json'));
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
