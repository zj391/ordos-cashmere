#!/usr/bin/env python3
"""Generate src/data/image-dimensions.json — the real pixel size of every
image the site renders.

The pages hardcoded width/height on their <img> tags. On the homepage the
category samples were all declared 750x750 while the assets are 543x550,
489x550, 400x400 or 750x750; on the product pages every gallery image was
declared 750x750 while the real sizes range from 271x400 to 750x750. A
browser reserving a square box for a portrait image is what made the
pictures and the text beside them sit out of alignment.

Rather than trusting hand-written numbers, this reads the actual assets
from disk and writes the truth, keyed by the site-relative path. The
pages then look the size up instead of guessing.

Usage:
    python3 scripts/generate_image_dimensions.py
"""
import json
import os

from PIL import Image

REPO = "/home/zj/ordos-cashmere"
PUBLIC = os.path.join(REPO, "public")
OUT = os.path.join(REPO, "src/data/image-dimensions.json")

# Directories whose images the site renders.
# The image directories the site serves from. "products" covers every
# per-category folder (mic, hznzcn, and the legacy per-category dirs the
# old /products/<slug>/ hub pages still use).
SCAN_DIRS = ["images", "products"]

out = {}
missing = []
scanned = 0

for sub in SCAN_DIRS:
    root = os.path.join(PUBLIC, sub)
    if not os.path.isdir(root):
        continue
    for dirpath, _dirs, files in os.walk(root):
        for name in files:
            if not name.lower().endswith((".webp", ".jpg", ".jpeg", ".png")):
                continue
            path = os.path.join(dirpath, name)
            rel = "/" + os.path.relpath(path, PUBLIC).replace(os.sep, "/")
            try:
                with Image.open(path) as im:
                    out[rel] = {"w": im.size[0], "h": im.size[1]}
                    scanned += 1
            except Exception as exc:
                missing.append(f"{rel}: {exc}")

with open(OUT, "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, indent=0, sort_keys=True)

size_kb = os.path.getsize(OUT) / 1024
print(f"wrote {OUT}")
print(f"  images: {scanned}")
print(f"  size:   {size_kb:.0f} KB")
if missing:
    print(f"  unreadable: {len(missing)}")
    for m in missing[:10]:
        print(f"    {m}")
