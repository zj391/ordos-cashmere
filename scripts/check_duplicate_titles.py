#!/usr/bin/env python3
"""Report indexable pages whose <title> is used by more than one page.

Run after a build:
    python3 scripts/check_duplicate_titles.py

Two kinds of duplicate matter and they need different fixes:

  cross-locale  the same product/category in two languages ships the
                 same title. The localised term is missing, so Google
                 cannot tell the pages apart and neither language gets
                 the signal it should.
  same-locale   two different products in one language ship the same
                 title. The pages compete with each other for one
                 query.

Prints the worst groups and the total count per kind.
"""
import collections
import os
import re
import sys

STATIC = "/home/zj/ordos-cashmere/.vercel/output/static"
LOCALE_RE = re.compile(r"^(en|cn|de|fr|ja|kr)(/|$)")


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
    lengths = []
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
            lengths.append((len(title), os.path.relpath(path, STATIC)))

    dupes = {t: v for t, v in by_title.items() if len(v) > 1}
    cross, same = [], []
    for title, pages in dupes.items():
        locales = set()
        for p in pages:
            m = LOCALE_RE.match(p)
            if m:
                locales.add(m.group(1))
        (cross if len(locales) > 1 else same).append((title, pages))

    lengths.sort(reverse=True)
    ordered = sorted(l for l, _ in lengths)
    mid = len(ordered) // 2
    over = sum(1 for l in ordered if l > 60)

    print(f"indexable pages scanned : {scanned}")
    print(f"duplicate title groups   : {len(dupes)}")
    print(f"  cross-locale groups    : {len(cross)} ({sum(len(p) for _, p in cross)} pages)")
    print(f"  same-locale groups     : {len(same)} ({sum(len(p) for _, p in same)} pages)")
    print(f"title length median      : {ordered[mid]}  max {ordered[-1]}  over 60: {over}")

    for label, rows in (("CROSS-LOCALE", cross), ("SAME-LOCALE", same)):
        if not rows:
            continue
        print(f"\n=== worst {label} groups ===")
        for title, pages in sorted(rows, key=lambda x: -len(x[1]))[:8]:
            print(f"  x{len(pages):4d}  {title[:88]}")
            for p in pages[:4]:
                print(f"          {p}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
