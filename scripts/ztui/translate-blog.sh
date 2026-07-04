#!/bin/bash
# Translate a blog post (en source) to 5 locales (cn/de/fr/ja/kr)
# Usage:
#   ./scripts/ztui/translate-blog.sh                      # translate the en-only post from-pasture-to-garment-23-steps
#   ./scripts/ztui/translate-blog.sh my-blog-slug        # translate a specific slug
#   ./scripts/ztui/translate-blog.sh --list              # show en-only posts
#
# Env: DEEPSEEK_KEY must be in .env.local (auto-loaded by translate-blog.mjs)

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$PROJECT_ROOT"

# --list: show en posts that don't have all 6 locales
if [ "$1" == "--list" ]; then
  echo "=== en-only blog posts (need translation) ==="
  for slug in $(ls src/content/blog/en/*.md 2>/dev/null | xargs -n1 basename | sed 's/.md$//'); do
    missing=""
    for loc in cn de fr ja kr; do
      [ ! -f "src/content/blog/$loc/$slug.md" ] && missing="$missing $loc"
    done
    if [ -n "$missing" ]; then
      echo "  $slug  (missing:$missing)"
    fi
  done
  exit 0
fi

SLUG="${1:-from-pasture-to-garment-23-steps-ordos-cashmere}"

# Validate en source exists
if [ ! -f "src/content/blog/en/$SLUG.md" ]; then
  echo "ERROR: en source not found: src/content/blog/en/$SLUG.md"
  echo "Run with --list to see available slugs"
  exit 1
fi

echo "=== Translating: $SLUG ==="
echo "Source: src/content/blog/en/$SLUG.md"
echo ""

# Check if all 5 locales already exist
all_done=true
for loc in cn de fr ja kr; do
  if [ -f "src/content/blog/$loc/$SLUG.md" ]; then
    echo "  ✓ $loc: exists"
  else
    echo "  … $loc: needs translation"
    all_done=false
  fi
done

if [ "$all_done" = "true" ]; then
  echo ""
  echo "All 5 locales already translated. Nothing to do."
  exit 0
fi

echo ""
echo "Running translate-blog.mjs (this takes ~2-3 minutes for 5 locales)..."
echo ""

# Load env and run
set -a
if [ -f .env.local ]; then
  . .env.local
fi
set +a

node scripts/translate-blog.mjs

echo ""
echo "=== Done ==="
echo "Files written:"
for loc in cn de fr ja kr; do
  if [ -f "src/content/blog/$loc/$SLUG.md" ]; then
    size=$(stat -c%s "src/content/blog/$loc/$SLUG.md" 2>/dev/null)
    echo "  $loc: ${size}B"
  fi
done
echo ""
echo "Next: git add + commit + push"
echo "  git add src/content/blog/"
echo "  git commit -m 'feat(blog): translate $SLUG to 5 locales'"
echo "  git push origin master"
