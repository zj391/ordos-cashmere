#!/usr/bin/env python3
"""Find locale-copy objects that are followed by orphaned duplicate keys.

In color-cards.astro the de/fr/ja/kr blocks each closed with "}," and then
repeated seoTitle / seoDescription / seoKeywords OUTSIDE the object literal.
The repeated lines were dead code, and because they were the last statement
in a block they also leaked implicit globals into the module scope.

The pattern to look for is a line at the same indent as the seo* keys that
comes after the object-closing "}," - it is unreachable as object data and
still looks like part of the object when read top to bottom.

This walks every .astro file and reports the hits.
"""
import os
import re
import sys

ROOT = sys.argv[1] if len(sys.argv) > 1 else "/home/zj/ordos-cashmere/src"

# A seo* key at 4-space indent.
SEO_DECL = re.compile(r"^ {4}seo(Title|Description|Keywords|Content):")
# A locale block opening at 2-space indent.
LOCALE_OPEN = re.compile(r"^ {2}([a-z]{2}(_[A-Za-z]+)?):\s*\{")

hits = []
for root, _dirs, files in os.walk(ROOT):
    for name in files:
        if not name.endswith(".astro"):
            continue
        path = os.path.join(root, name)
        lines = open(path, encoding="utf-8").read().split("\n")

        # Find the line where a locale object's closing "}," sits, then look
        # at the following lines for seo* declarations.
        for i, line in enumerate(lines):
            if not re.match(r"^ {2}[a-z]{2}(_[A-Za-z]+)?:\s*\{", line):
                continue
            # Walk forward to the closing brace of this object.
            depth = 0
            for j in range(i, min(i + 60, len(lines))):
                l = lines[j]
                depth += l.count("{") - l.count("}")
                if depth == 0 and j > i:
                    # Object closed at line j. Any seo* decl after it, before
                    # the next locale block, is an orphan.
                    k = j + 1
                    orphans = []
                    while k < len(lines) and not LOCALE_OPEN.match(lines[k]):
                        if SEO_DECL.match(lines[k]):
                            orphans.append(k + 1)
                        elif lines[k].strip() and not lines[k].strip().startswith("//"):
                            break
                        k += 1
                    if orphans:
                        hits.append((path, orphans))
                    break

if not hits:
    print("no orphaned SEO declarations found")
else:
    for path, orphans in hits:
        print(f"{os.path.relpath(path, ROOT)}: orphan seo* lines {orphans}")
    print(f"\n{len(hits)} file(s) affected")
