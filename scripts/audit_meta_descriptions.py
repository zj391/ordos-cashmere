#!/usr/bin/env python3
"""Audit the built meta descriptions across every locale and page kind.

Google renders a meta description in roughly 155-160 characters on a
desktop SERP; anything longer is truncated mid-sentence, and anything much
shorter wastes the whole line. A description that reads like an instruction
to the buyer ("Discuss your requirements with...") instead of the words a
buyer searches for also underperforms, because it has no query terms in it.

This walks the built static output and reports every page whose description
is outside the usable band, grouped by locale, so the copy can be fixed in
one pass instead of one page at a time.

Usage:
    python3 scripts/audit_meta_descriptions.py [build_dir]
"""
import json
import os
import re
import sys
from collections import defaultdict

BUILD = sys.argv[1] if len(sys.argv) > 1 else "/home/zj/ordos-cashmere/.vercel/output/static"

TITLE_RE = re.compile(r"<title>(.*?)</title>", re.S)
DESC_RE = re.compile(r'<meta name="description" content="([^"]*)"')
CANON_RE = re.compile(r'<link rel="canonical" href="([^"]*)"')
H1_RE = re.compile(r"<h1\b[^>]*>(.*?)</h1>", re.S)
TAG_RE = re.compile(r"<[^>]+>")

# Google truncates a meta description by character count, and the limit
# differs by script: roughly 155-160 characters for Latin text, roughly 78
# for Chinese (Chinese glyphs are full-width, so 78 characters already fills
# two Latin lines). Measuring CJK by pixel width against a Latin threshold
# would flag every Chinese page as too short.
MIN_LATIN, MAX_LATIN = 110, 158
MIN_CJK, MAX_CJK = 30, 78

CJK_RANGES = (
    (0x1100, 0x115F), (0x2E80, 0xA4CF), (0xAC00, 0xD7A3),
    (0xF900, 0xFAFF), (0xFE30, 0xFE6F), (0xFF00, 0xFF60),
    (0xFFE0, 0xFFE6),
)


def is_cjk(text: str) -> bool:
    """True when the text is mostly CJK, so it needs the character-based band."""
    cjk = sum(
        1 for ch in text
        if any(lo <= ord(ch) <= hi for lo, hi in CJK_RANGES)
    )
    return cjk * 2 >= len(text)


def display_width(text: str) -> int:
    """Width in Latin-character units, counting CJK glyphs as two."""
    total = 0
    for ch in text:
        code = ord(ch)
        if any(lo <= code <= hi for lo, hi in CJK_RANGES):
            total += 2
        else:
            total += 1
    return total

results = defaultdict(list)

for root, _dirs, files in os.walk(BUILD):
    if "index.html" not in files and "404.html" not in files:
        continue
    name = "404.html" if "404.html" in files else "index.html"
    path = os.path.join(root, name)
    rel = os.path.relpath(path, BUILD)
    try:
        html = open(path, encoding="utf-8").read()
    except OSError:
        continue

    dm = DESC_RE.search(html)
    if not dm:
        continue
    desc = dm.group(1)
    cjk = is_cjk(desc)
    lo, hi = (MIN_CJK, MAX_CJK) if cjk else (MIN_LATIN, MAX_LATIN)
    # For CJK the limit is characters; for Latin it is characters too, but a
    # Latin character is roughly half the width of a CJK one, so the same
    # number of characters covers twice the line.
    measured = len(desc) if cjk else display_width(desc)
    if lo <= measured <= hi:
        continue

    tm = TITLE_RE.search(html)
    h1 = H1_RE.search(html)
    cm = CANON_RE.search(html)
    results[rel].append({
        "path": rel,
        "desc_len": len(desc),
        "desc_width": display_width(desc),
        "measured": measured,
        "script": "cjk" if cjk else "latin",
        "desc": desc,
        "title_len": len(tm.group(1).strip()) if tm else 0,
        "h1": TAG_RE.sub("", h1.group(1)).strip()[:60] if h1 else "",
        "canonical": cm.group(1) if cm else "",
    })

out = []
for rel in sorted(results):
    for r in results[rel]:
        r["page"] = rel
        out.append(r)

# Collapse the per-locale duplicates: the same page kind is usually wrong in
# every language at once, so group by the path with the locale stripped.
groups = defaultdict(list)
for r in out:
    key = re.sub(r"/(en|cn|de|fr|ja|kr)/", "/{loc}/", r["path"])
    groups[key].append(r)

print(f"pages with a description outside the usable band: {len(out)}")
print(f"distinct page kinds affected: {len(groups)}\n")

summary = []
for key in sorted(groups):
    rows = groups[key]
    lens = [r["measured"] for r in rows]
    summary.append({
        "kind": key,
        "locales": len(rows),
        "min": min(lens),
        "max": max(lens),
    })

summary.sort(key=lambda x: (-x["locales"], x["kind"]))
print(f'{"page kind":46s} {"loc":>4s} {"measured":>12s}')
for s in summary[:35]:
    print(f'{s["kind"]:46s} {s["locales"]:>4d} {s["min"]:>5d}-{s["max"]:<6d}')
if len(summary) > 35:
    print(f'... and {len(summary) - 35} more page kinds')

with open("/tmp/meta-description-audit.json", "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, indent=1)
print("\nfull detail -> /tmp/meta-description-audit.json")
