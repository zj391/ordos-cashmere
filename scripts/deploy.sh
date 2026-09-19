#!/usr/bin/env bash
#
# scripts/deploy.sh — one-shot deploy + alias to www.erdosdx.com
#
# Usage:  bash scripts/deploy.sh
#
# Wraps the Vercel deploy flow so production alias to the custom domain
# is always set after the new deployment is built. Without this, vercel
# deploy creates a new deployment URL but www.erdosdx.com keeps aliasing
# the previous one (silent stale production state).
#
# Strategy for discovering the new deployment URL:
#   1. PRIMARY: parse the URL from `vercel deploy --prod` stdout, which
#      always prints the new canonical URL on its final lines.
#   2. FALLBACK: `vercel alias ls` to find whatever URL is currently
#      bound to ${DOMAIN} (handles the case where vercel deploy output
#      is parsed-incompatible across CLI versions).
#
# Requires: vercel CLI logged in (run `vercel login` once).
# Side effects: pushes to Vercel production; rebinds www.erdosdx.com alias.
#
# Env:
#   PROD_DOMAIN  override the production domain (default: www.erdosdx.com)
#
set -euo pipefail

DOMAIN="${PROD_DOMAIN:-www.erdosdx.com}"

echo "==> Building & deploying to Vercel production"
# Capture deploy stdout so we can extract the new canonical URL from its
# final lines. Example vercel deploy --prod output:
#   Production  https://ordos-cashmere-<hash>-dongxiao-s-projects.vercel.app
#   Completing… ▲ Aliased     https://ordos-cashmere.vercel.app
DEPLOY_OUTPUT=$(vercel deploy --prod --yes --archive=tgz 2>&1)
echo "${DEPLOY_OUTPUT}"

echo
echo "==> Extracting the newly-created deployment URL"
# Grab the first https://ordos-cashmere-<hash>-*.vercel.app line. This is
# the canonical production URL Vercel just created. Avoid the bare
# ordos-cashmere.vercel.app which is a pre-existing alias.
LATEST_URL=$(echo "${DEPLOY_OUTPUT}" | grep -oE 'https://ordos-cashmere-[a-z0-9]+-dongxiao-s-projects\.vercel\.app' | head -1 || true)

if [ -z "${LATEST_URL}" ]; then
  echo "WARN: deploy stdout did not yield a new URL — falling back to 'vercel alias ls'." >&2
  # vercel alias ls is fast. The output is a 3-column table; the source
  # column is the bare vercel.app hostname (no https:// prefix).
  LATEST_RAW=$(vercel alias ls 2>&1 | awk -v d="${DOMAIN}" '$NF == d || $(NF-1) == d { print $1; exit }')
  if [ -z "${LATEST_RAW}" ]; then
    echo "ERROR: could not determine any deployment URL." >&2
    exit 1
  fi
  case "${LATEST_RAW}" in
    https://*) LATEST_URL="${LATEST_RAW}" ;;
    http://*)  LATEST_URL="${LATEST_RAW}" ;;
    *)         LATEST_URL="https://${LATEST_RAW}" ;;
  esac
  echo "    Fallback: current alias source for ${DOMAIN} is ${LATEST_URL}"
fi

# Strip any trailing whitespace or CR
LATEST_URL=$(echo "${LATEST_URL}" | tr -d ' \r')

echo "    Latest production deployment: ${LATEST_URL}"

echo
echo "==> Aliasing ${LATEST_URL} → ${DOMAIN}"
vercel alias set "${LATEST_URL}" "${DOMAIN}"

echo
echo "==> Done. Production is now ${LATEST_URL} (alias: ${DOMAIN})"
echo "    Tip: curl -sS \"https://${DOMAIN}/<path>?nocache=\$(date +%s%N)\" to verify"
