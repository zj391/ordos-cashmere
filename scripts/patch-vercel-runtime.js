#!/usr/bin/env node
/**
 * Patch the Vercel adapter's auto-generated .vc-config.json to use a runtime
 * that Vercel has NOT discontinued.
 *
 * Background (2026-10-19):
 *   The local Node 20.x runtime writes `nodejs20.x` into
 *   .vercel/output/functions/_render.func/.vc-config.json.
 *   Vercel has discontinued nodejs20.x as a custom Runtime for serverless
 *   functions and the deploy aborts with:
 *     "Error: You are using a custom Runtime that depends on nodejs20.x,
 *      which is discontinued. Please upgrade your Runtime to a more
 *      recent version."
 *   See https://vercel.com/docs/functions/serverless-functions/runtimes
 *
 *   @astrojs/vercel 9.x has no `runtime` option in its public config and
 *   always reads process.version (i.e. the local Node major) to decide
 *   what to write. The cleanest workaround without bumping @astrojs/vercel
 *   across major versions is to patch the .vc-config.json file right after
 *   the Astro build emits it.
 *
 *   nodejs22.x is "available" status per Vercel's runtime matrix — well-
 *   supported, current, and zero behavior change for an Astro SSR app that
 *   doesn't use Node 22-specific APIs.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const vcConfigPath = join(root, '.vercel/output/functions/_render.func/.vc-config.json');

const TARGET_RUNTIME = 'nodejs22.x';

async function main() {
  let raw;
  try {
    raw = await readFile(vcConfigPath, 'utf8');
  } catch (e) {
    // Build output didn't produce this file (e.g. local `astro build`
    // without the Vercel adapter) — silently skip.
    console.log(`[patch-vercel-runtime] no .vc-config.json at ${vcConfigPath} — skip`);
    return;
  }

  // Match any nodejsNN.x runtime — don't blindly overwrite TARGET_RUNTIME
  // (idempotent), and don't touch other config keys.
  const patched = raw.replace(/"runtime":\s*"nodejs\d+\.x"/, `"runtime": "${TARGET_RUNTIME}"`);

  if (patched === raw) {
    console.log(`[patch-vercel-runtime] already up-to-date (or no runtime field) — no change`);
    return;
  }

  await writeFile(vcConfigPath, patched, 'utf8');
  console.log(`[patch-vercel-runtime] patched runtime → ${TARGET_RUNTIME} in ${vcConfigPath}`);
}

main().catch((e) => {
  console.error('[patch-vercel-runtime] error:', e?.message || e);
  // Don't fail the build — if Vercel ever restores nodejs20.x or this
  // script misfires, we want deploy to still attempt and surface Vercel's
  // own error message.
  process.exit(0);
});
