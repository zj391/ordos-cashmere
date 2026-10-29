#!/usr/bin/env python3
"""Merge a classification chunk into src/data/style-classification.json.

The visual review produces one sheet per 40 styles.  Each chunk is written
here as a small JSON file and merged in, so a crash halfway through the review
never loses the classifications already made.

Usage:
    python3 scripts/merge_classification.py <chunk.json> [...]
"""
import json
import sys

TARGET = "/home/zj/ordos-cashmere/src/data/style-classification.json"

merged = 0
data = json.load(open(TARGET, encoding="utf-8"))
for path in sys.argv[1:]:
    chunk = json.load(open(path, encoding="utf-8"))
    for style, cls in chunk.items():
        data[style] = cls
        merged += 1
    print(f"{path}: {len(chunk)} entries")

with open(TARGET, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=1)

print(f"merged {merged} entries -> {len(data)} total in {TARGET}")
