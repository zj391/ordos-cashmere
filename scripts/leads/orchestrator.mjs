#!/usr/bin/env node
// Daily orchestrator: runs full lead pipeline once per day
//   1. Pull RSS news (optional, stub for now)
//   2. Score new leads (if any in staging)
//   3. Run email-sequencer (today's queue)
//   4. Report to arbasgoat@gmail.com via Resend
//
// Usage:
//   node scripts/leads/orchestrator.mjs                   # run full day
//   node scripts/leads/orchestrator.mjs --dry-run        # show what would run
//   node scripts/leads/orchestrator.mjs --no-email        # skip daily report email
//   node scripts/leads/orchestrator.mjs --max-emails 10  # cap email batch
//
// Cron: run every day at 09:00 UTC via GitHub Actions or local cron

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = path.resolve(new URL('.', import.meta.url).pathname, '../..');
const SCRIPT_DIR = path.resolve(new URL('.', import.meta.url).pathname);

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
const RESEND_KEY = ENV.RESEND_API_KEY || ENV.DEEPSEEK_KEY;
const FROM_EMAIL = ENV.FROM_EMAIL || 'DONGXIAO Cashmere <noreply@erdosdx.com>';
const DEV_BCC = ENV.DEV_BCC || 'arbasgoat@gmail.com';
const REPORT_TO = ENV.REPORT_TO || 'arbasgoat@gmail.com';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !RESEND_KEY) {
  console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_KEY / RESEND_API_KEY in .env.local');
  process.exit(1);
}

const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const args = process.argv.slice(2);
let dryRun = false;
let noEmail = false;
let maxEmails = 22;
let devMode = false;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--dry-run') dryRun = true;
  else if (args[i] === '--no-email') noEmail = true;
  else if (args[i] === '--dev-mode') devMode = true;
  else if (args[i] === '--max-emails' && args[i+1]) maxEmails = parseInt(args[++i], 10);
}

const t0 = Date.now();
const log = (msg) => console.log(`[${new Date().toISOString()}] ${msg}`);

// Step 1: query Supabase for stats
async function sb(pathname, opts = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${pathname}`, {
    ...opts,
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_SERVICE_KEY,
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

async function getStats() {
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayIso = todayStart.toISOString();
  const [todayQueue, todaySent, todayReplies, totalLeads, byGrade] = await Promise.all([
    sb('/v_today_email_queue?select=id&limit=100'),
    sb(`/lead_activities?channel=eq.email&direction=eq.out&created_at=gte.${todayIso}&select=id`),
    sb(`/lead_activities?channel=eq.email&direction=eq.in&created_at=gte.${todayIso}&select=id`),
    sb('/leads?select=id&limit=1000'),
    sb('/leads?select=lead_grade&limit=1000'),
  ]);
  const gradeCount = byGrade.reduce((acc, l) => { acc[l.lead_grade || 'unknown'] = (acc[l.lead_grade || 'unknown'] || 0) + 1; return acc; }, {});
  return {
    today_queue: todayQueue.length,
    today_sent: todaySent.length,
    today_replies: todayReplies.length,
    total_leads: totalLeads.length,
    by_grade: gradeCount,
  };
}

async function runSequencer() {
  log('Step 2: Running email-sequencer...');
  const cmd = `node ${path.join(SCRIPT_DIR, 'email-sequencer.mjs')}`;
  const sequencerArgs = [];
  if (dryRun) sequencerArgs.push('--dry-run');
  if (devMode) sequencerArgs.push('--dev-mode');
  sequencerArgs.push('--limit', maxEmails);
  sequencerArgs.push('--max-per-hour', maxEmails);

  const r = spawnSync('node', [path.join(SCRIPT_DIR, 'email-sequencer.mjs'), ...sequencerArgs], {
    encoding: 'utf-8',
    cwd: ROOT,
    timeout: 600000,
  });
  if (r.stdout) process.stdout.write(r.stdout);
  if (r.stderr) process.stderr.write(r.stderr);
  if (r.status !== 0) throw new Error(`email-sequencer exit ${r.status}`);
  // parse last JSON line
  const lines = (r.stdout || '').trim().split('\n');
  const lastLine = lines[lines.length - 1];
  try {
    return JSON.parse(lastLine);
  } catch {
    return { raw: lastLine };
  }
}

async function sendReportEmail(stats, sequencerResult) {
  log('Step 3: Sending daily report email...');
  const subject = `[erdosdx] Daily Lead Report — ${new Date().toISOString().slice(0, 10)}`;
  const text = `
DONGXIAO Cashmere - Daily Lead Orchestrator Report
Generated: ${new Date().toISOString()}
Total runtime: ${((Date.now() - t0) / 1000).toFixed(1)}s

LEAD POOL
  Total leads:           ${stats.total_leads}
  By grade:              ${Object.entries(stats.by_grade).map(([g, n]) => `${g}=${n}`).join(' ') || 'none'}
  Today's queue:         ${stats.today_queue} (ready to email)
  Today's sent:          ${stats.today_sent}
  Today's replies:       ${stats.today_replies}

TODAY'S EMAIL BATCH
  Processed:             ${sequencerResult.processed || 0}
  Sent in last hour:     ${sequencerResult.sent_last_hour || 'n/a'}
  Queued:                ${sequencerResult.queued || 'n/a'}
  Dry run:               ${sequencerResult.dry_run ? 'YES' : 'no'}
  Dev mode:              ${sequencerResult.dev_mode ? 'YES' : 'no'}

NEXT STEPS
  - Run again tomorrow: cron 0 9 * * *
  - Manual override:    cd ~/.../ordos-cashmere-site && node scripts/leads/orchestrator.mjs --max-emails 50

View logs:
  https://resend.com/logs
  https://github.com/zj391/ordos-cashmere/actions
`.trim();
  const body = {
    from: FROM_EMAIL,
    to: [REPORT_TO],
    subject,
    text,
    tags: [{ name: 'source', value: 'orchestrator_daily_report' }],
  };
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + RESEND_KEY, 'User-Agent': UA },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Resend ${res.status}: ${t.slice(0, 300)}`);
  }
  const d = await res.json();
  log(`  Report email sent: ${d.id}`);
  return d.id;
}

async function main() {
  log('=== Daily Orchestrator Start ===');
  log(`Mode: ${dryRun ? 'DRY-RUN' : 'LIVE'} | Dev: ${devMode ? 'on' : 'off'} | Email: ${noEmail ? 'no' : 'yes'} | Max: ${maxEmails}`);

  log('Step 1: Gathering stats...');
  const stats = await getStats();
  log(`  queue=${stats.today_queue} sent=${stats.today_sent} replies=${stats.today_replies} total=${stats.total_leads}`);
  log(`  grade distribution: ${JSON.stringify(stats.by_grade)}`);

  const sequencerResult = await runSequencer();

  if (!noEmail && !dryRun) {
    await sendReportEmail(stats, sequencerResult);
  } else {
    log('Step 3: Skipping report email (dry-run or --no-email)');
  }

  log(`=== Done in ${((Date.now() - t0) / 1000).toFixed(1)}s ===`);
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
