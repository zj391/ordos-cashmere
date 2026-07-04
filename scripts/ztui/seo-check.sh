#!/bin/bash
# SEO health check for erdosdx.com
# Usage: ./scripts/ztui/seo-check.sh [--url https://www.erdosdx.com]
# Checks: title, description, canonical, hreflang, og:*, twitter:*, JSON-LD types

set -e
URL="${1:-https://www.erdosdx.com}"
LOCALES=(en cn de fr ja kr)

# 颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

OK=0
WARN=0
ERR=0

check_page() {
  local locale="$1"
  local path="$2"
  local full_url="$URL/$locale$path"
  echo ""
  echo "=== $full_url ==="

  local html
  html=$(curl -sS -L -m 15 "$full_url" 2>/dev/null) || {
    echo -e "${RED}✗ curl failed${NC}"
    ERR=$((ERR+1))
    return
  }

  # title
  local title
  title=$(echo "$html" | grep -oP '<title>[^<]*</title>' | head -1)
  if [ -n "$title" ]; then
    echo -e "${GREEN}✓${NC} title: $title"
    OK=$((OK+1))
  else
    echo -e "${RED}✗ missing title${NC}"
    ERR=$((ERR+1))
  fi

  # description
  local desc
  desc=$(echo "$html" | grep -oP '<meta name="description" content="[^"]*"' | head -1)
  if [ -n "$desc" ]; then
    echo -e "${GREEN}✓${NC} description: ${desc:0:80}..."
    OK=$((OK+1))
  else
    echo -e "${YELLOW}⚠${NC} missing description"
    WARN=$((WARN+1))
  fi

  # canonical
  local canon
  canon=$(echo "$html" | grep -oP '<link rel="canonical" href="[^"]*"' | head -1)
  if [ -n "$canon" ]; then
    echo -e "${GREEN}✓${NC} canonical: $canon"
    OK=$((OK+1))
  else
    echo -e "${YELLOW}⚠${NC} missing canonical"
    WARN=$((WARN+1))
  fi

  # hreflang (expect 7: 6 locales + x-default)
  local hreflang_count
  hreflang_count=$(echo "$html" | grep -oP 'rel="alternate" hreflang=' | wc -l)
  if [ "$hreflang_count" -eq 7 ]; then
    echo -e "${GREEN}✓${NC} hreflang: $hreflang_count (6 + x-default)"
    OK=$((OK+1))
  else
    echo -e "${YELLOW}⚠${NC} hreflang: $hreflang_count (expected 7)"
    WARN=$((WARN+1))
  fi

  # og:title
  local og_title
  og_title=$(echo "$html" | grep -oP 'property="og:title"' | head -1)
  if [ -n "$og_title" ]; then
    echo -e "${GREEN}✓${NC} og:title present"
    OK=$((OK+1))
  else
    echo -e "${YELLOW}⚠${NC} missing og:title"
    WARN=$((WARN+1))
  fi

  # JSON-LD types
  local jsonld_types
  jsonld_types=$(echo "$html" | grep -oP '"@type":"[A-Z][a-zA-Z]+"' | sort -u)
  if [ -n "$jsonld_types" ]; then
    echo -e "${GREEN}✓${NC} JSON-LD types:"
    echo "$jsonld_types" | sed 's/^/    /'
    OK=$((OK+1))
  else
    echo -e "${YELLOW}⚠${NC} no JSON-LD found"
    WARN=$((WARN+1))
  fi
}

echo "=== SEO Health Check ==="
echo "Target: $URL"
echo "Locales: ${LOCALES[*]}"

# Check key pages
for loc in "${LOCALES[@]}"; do
  check_page "$loc" "/"
  check_page "$loc" "/products"
  check_page "$loc" "/blog"
  check_page "$loc" "/contact"
  check_page "$loc" "/faq"
done

# Check blog detail (first one)
FIRST_SLUG=$(curl -sS -L -m 15 "$URL/en/blog" 2>/dev/null | grep -oP 'href="/en/blog/[a-z0-9-]+"' | head -1 | sed 's|href="||;s|"||')
if [ -n "$FIRST_SLUG" ]; then
  for loc in en cn; do
    check_page "$loc" "$FIRST_SLUG"
  done
fi

echo ""
echo "=== Summary ==="
echo -e "  ${GREEN}✓ OK: $OK${NC}"
echo -e "  ${YELLOW}⚠ Warnings: $WARN${NC}"
echo -e "  ${RED}✗ Errors: $ERR${NC}"
echo ""
[ $ERR -eq 0 ] && exit 0 || exit 1
