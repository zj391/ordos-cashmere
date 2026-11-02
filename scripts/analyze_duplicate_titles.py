#!/usr/bin/env python3
"""Break the duplicate-title report down by page type.

The overall count is not actionable on its own - a duplicate between two
product pages needs a different fix than a duplicate between two
category pages, so the report groups them first.

Run after a build:
    python3 scripts/analyze_duplicate_titles.py
"""
import collections
import os
import re
import sys

STATIC = "/home/zj/ordos-cashmere/.vercel/output/static"
LOCALE_RE = re.compile(r"^(en|cn|de|fr|ja|kr)(/|$)")


def page_kind(rel):
    parts = rel.split("/")
    tail = parts[1:] if parts and LOCALE_RE.match(parts[0] + "/") else parts
    if not tail:
        return "root"
    head = tail[0]
    if head == "products":
        return "product" if len(tail) > 1 else "products-index"
    if head == "category":
        if len(tail) > 3:
            return "category-page"
        if len(tail) > 2:
            return "category-sub-page"
        return "category-hub"
    if head == "tag":
        return "tag"
    if head == "blog":
        return "blog"
    return head


def title_of(path):
    html = open(path, encoding="utf-8", errors="ignore").read()
    if re.search(r'<meta[^>]*name="robots"[^>]*content="[^"]*noindex', html):
        return None
    m = re.search(r"<title>(.*?)</title>", html, re.S)
    if not m:
        return None
    return re.sub(r"\s+", " ", m.group(1)).strip()


def main():
    if not os.path.isdir(STATIC):
        print(f"no build output at {STATIC}", file=sys.stderr)
        return 1

    by_title = collections.defaultdict(list)
    scanned = 0
    for root, _dirs, files in os.walk(STATIC):
        for name in files:
            if not name.endswith(".html"):
                continue
            path = os.path.join(root, name)
            title = title_of(path)
            if not title:
                continue
            scanned += 1
            by_title[title].append(os.path.relpath(path, STATIC))

    dupes = {t: v for t, v in by_title.items() if len(v) > 1}
    cross, same = [], []
    for title, pages in dupes.items():
        locales = {LOCALE_RE.match(p).group(1) for p in pages if LOCALE_RE.match(p)}
        (cross if len(locales) > 1 else same).append((title, pages))

    print(f"scanned {scanned} indexable pages")
    print(f"duplicate groups: {len(dupes)}  (cross-locale {len(cross)}, same-locale {len(same)})")
    for label, rows in (("CROSS-LOCALE", cross), ("SAME-LOCALE", same)):
        kinds = collections.Counter()
        pages_by_kind = collections.Counter()
        for title, pages in rows:
            for p in pages:
                kinds[page_kind(p)] += 1
        print(f"\n=== {label}: {len(rows)} groups ===")
        for kind, count in kinds.most_common():
            print(f"  {kind:20s} {count:5d} pages in {count} group-slots")
        # sample groups per kind
        seen = set()
        for title, pages in sorted(rows, key=lambda x: -len(x[1])):
            k = page_kind(pages[0])
            if k in seen:
                continue
            seen.add(k)
            print(f"  - [{k}] x{len(pages)}  {title[:80]}")
            for p in pages[:3]:
                print(f"        {p}")
            if len(seen) >= 6:
                break
    return 0


if __name__ == "__main__":
    sys.exit(main())
