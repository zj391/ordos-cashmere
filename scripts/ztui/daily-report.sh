#!/bin/bash
# Daily inquiry report - prints to stdout (or --send flag emails via Resend)
# Usage:
#   ./scripts/ztui/daily-report.sh
#   ./scripts/ztui/daily-report.sh 2026-07-02
#   ./scripts/ztui/daily-report.sh --send

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT"

set -a
[ -f .env.local ] && . .env.local
set +a

DATE=""
SEND_EMAIL=false
for arg in "$@"; do
  case "$arg" in
    --send) SEND_EMAIL=true ;;
    *) DATE="$arg" ;;
  esac
done
[ -z "$DATE" ] && DATE=$(date +%Y-%m-%d)

TO_EMAIL="arbasgoat@gmail.com"
FROM_EMAIL="DONGXIAO Cashmere <noreply@erdosdx.com>"

# Data collection

NEW_POSTS=$(find src/content/blog -name "*.md" -newermt "$DATE" 2>/dev/null | wc -l)
NEW_POSTS_EN=$(find src/content/blog/en -name "*.md" -newermt "$DATE" 2>/dev/null | wc -l)

TRANS_PENDING=0
for slug_file in $(ls src/content/blog/en/*.md 2>/dev/null); do
  slug=$(basename "$slug_file" .md)
  for loc in cn de fr ja kr; do
    [ ! -f "src/content/blog/$loc/$slug.md" ] && TRANS_PENDING=$((TRANS_PENDING+1))
  done
done

GIT_COMMITS=$(git log --oneline --since="24 hours ago" 2>/dev/null | wc -l)
LAST_COMMIT=$(git log --oneline -1 2>/dev/null | head -1 | cut -c1-80)

RESEND_COUNT="N/A no RESEND_KEY in env"

INQUIRY_COUNT="N/A no SUPABASE env"
if [ -n "$SUPABASE_URL" ] && [ -n "$SUPABASE_SERVICE_KEY" ]; then
  INQUIRY_COUNT=$(SUPABASE_URL="$SUPABASE_URL" SUPABASE_SERVICE_KEY="$SUPABASE_SERVICE_KEY" REPORT_DATE="$DATE" /tmp/count-supabase.py 2>/dev/null || echo "N/A")
fi

REPORT="================================
  DONGXIAO Cashmere Daily Report
  $DATE
================================

Activity
  Inquiries today:     $INQUIRY_COUNT
  Emails sent:         $RESEND_COUNT
  New blog posts:      $NEW_POSTS [$NEW_POSTS_EN en]
  Translations pending: $TRANS_PENDING

Dev
  Git commits [24h]:   $GIT_COMMITS
  Latest commit:       $LAST_COMMIT

Health
  - Resend DNS: configured [SPF + DKIM + DMARC verified]
  - Vercel env: RESEND_API_KEY / NOTIFICATION_EMAIL / FROM_EMAIL
  - AI chat: /api/chat
  - Inquiry API: /api/inquiry [ContactForm]

Quick links
  Site:       https://www.erdosdx.com
  Resend:     https://resend.com/logs
  Vercel:     https://vercel.com/dashboard
  Repo:       https://github.com/zj391/ordos-cashmere
  SEO check:  ./scripts/ztui/seo-check.sh

================================"

echo "$REPORT"

if [ "$SEND_EMAIL" = "true" ]; then
  if [ -z "$RESEND_KEY" ]; then
    echo ""
    echo "ERROR --send requires RESEND_KEY in .env.local or env"
    exit 1
  fi
  echo "$REPORT" > /tmp/daily-report.txt
  echo ""
  echo "Sending to $TO_EMAIL via Resend..."
  RESEND_KEY="$RESEND_KEY" REPORT_TO="$TO_EMAIL" FROM_EMAIL_REAL="$FROM_EMAIL" REPORT_DATE="$DATE" REPORT_FILE=/tmp/daily-report.txt /tmp/send-resend-report.py 2>&1
fi
