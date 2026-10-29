#!/usr/bin/env python3
"""Check that every style in a manifest has a classification entry.

The visual review writes src/data/style-classification.json one sheet at a
time.  Before the catalogue is generated, a missing entry would silently drop
that style from the batch, so this check runs first.

Usage:
    python3 scripts/check_classification_coverage.py <manifest.json> [classification.json]
"""
import json
import sys

manifest_path = sys.argv[1]
cls_path = sys.argv[2] if len(sys.argv) > 2 else \
    "/home/zj/ordos-cashmere/src/data/style-classification.json"

manifest = json.load(open(manifest_path, encoding="utf-8"))
cls = json.load(open(cls_path, encoding="utf-8"))

styles = [s["style"] for s in manifest["styles"]]
missing = [s for s in styles if s not in cls]
covered = len(styles) - len(missing)

print(f"styles in manifest : {len(styles)}")
print(f"classified         : {covered}")
print(f"missing            : {len(missing)}")
if missing:
    print("  " + ", ".join(missing))
    sys.exit(1)
print("OK - full coverage")
