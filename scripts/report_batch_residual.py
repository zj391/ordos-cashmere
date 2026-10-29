#!/usr/bin/env python3
"""Report which on-disk images of a converted batch are leftovers.

The photo archive is re-shot and re-converted when the gallery conventions
change (e.g. the marketing slide "新主图" got dropped).  Re-converting with
the same --start-index writes the new files over the old ones, but any file
the new run did not produce stays behind with a stale name.  Those leftovers
would be uploaded to Vercel and counted against the monthly file quota, so
they need to be listed before they are removed.

Usage:
    python3 scripts/report_batch_residual.py <manifest.json> <image_dir>
"""
import collections
import json
import os
import re
import subprocess
import sys

manifest_path = sys.argv[1]
image_dir = sys.argv[2]
repo = sys.argv[3] if len(sys.argv) > 3 else "/home/zj/ordos-cashmere"

manifest = json.load(open(manifest_path, encoding="utf-8"))

keep = set()
for style in manifest["styles"]:
    keep.update(style["images"])

tracked = set(
    subprocess.run(
        ["git", "ls-files", "public/products/mic/"],
        cwd=repo, capture_output=True, text=True,
    ).stdout.split()
)

# The batch occupies a contiguous index block; only look inside it.
indexes = {s["prod_index"] for s in manifest["styles"]}
lo, hi = min(indexes), max(indexes)

residual = []
for name in sorted(os.listdir(image_dir)):
    m = re.match(r"^prod_(\d+)_(\d+)\.webp$", name)
    if not m:
        continue
    idx = int(m.group(1))
    if lo <= idx <= hi and name not in keep:
        residual.append(name)

by_index = collections.defaultdict(list)
for name in residual:
    by_index[int(re.match(r"prod_(\d+)_", name).group(1))].append(name)

tracked_residual = [n for n in residual if f"public/products/mic/{n}" in tracked]
untracked_residual = [n for n in residual if f"public/products/mic/{n}" not in tracked]

print(f"batch index block : {lo}..{hi}  ({len(indexes)} styles)")
print(f"new files wanted  : {len(keep)}")
print(f"leftover on disk  : {len(residual)}")
print(f"  tracked (git)   : {len(tracked_residual)}")
print(f"  untracked       : {len(untracked_residual)}")
print(f"styles affected   : {len(by_index)}")
for idx in sorted(by_index):
    print(f"  prod_{idx:04d}: {', '.join(by_index[idx])}")

with open("/tmp/batch-residual.txt", "w", encoding="utf-8") as f:
    for name in residual:
        f.write(f"public/products/mic/{name}\n")
print("\nlist written to /tmp/batch-residual.txt")
