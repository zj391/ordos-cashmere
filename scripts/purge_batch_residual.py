#!/usr/bin/env python3
"""Delete the leftover images of a re-converted batch.

When a batch is re-shot or the gallery conventions change, re-converting with
the same --start-index overwrites the files it produces but leaves behind the
ones it does not.  Those leftovers are dead weight: nothing references them and
they still count against the monthly Vercel file quota.

The file list is produced by report_batch_residual.py and verified against
src/data/products.json before anything is removed.

Usage:
    python3 scripts/purge_batch_residual.py [list.txt]
"""
import json
import os
import sys

REPO = "/home/zj/ordos-cashmere"
LIST = sys.argv[1] if len(sys.argv) > 1 else "/tmp/batch-residual.txt"
CATALOG = os.path.join(REPO, "src/data/products.json")

with open(CATALOG, encoding="utf-8") as f:
    catalog = json.load(f)

referenced = set()
for cat in catalog["categories"]:
    for product in cat.get("products", []):
        referenced.update(product.get("images", []))

removed, skipped = [], []
with open(LIST, encoding="utf-8") as f:
    for line in f:
        rel = line.strip()
        if not rel:
            continue
        name = os.path.basename(rel)
        if name in referenced:
            skipped.append(name)
            continue
        path = os.path.join(REPO, rel)
        if os.path.exists(path):
            os.remove(path)
            removed.append(rel)
        else:
            skipped.append(name)

print(f"removed   : {len(removed)}")
print(f"skipped   : {len(skipped)} (referenced by catalog or already gone)")
if skipped:
    print("  " + ", ".join(skipped[:10]))
print(f"remaining in batch dir:", len([f for f in os.listdir(
    os.path.join(REPO, 'public/products/mic')) if f.startswith('prod_')]))
