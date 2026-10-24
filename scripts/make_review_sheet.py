#!/usr/bin/env python3
"""Contact sheet for the styles that still need a visual classification."""
import json
import os
import sys

from PIL import Image, ImageDraw

manifest_path, out_path = sys.argv[1], sys.argv[2]
wanted = set(sys.argv[3].split(",")) if len(sys.argv) > 3 else None
base = "/home/zj/ordos-cashmere/public/products/mic"

manifest = json.load(open(manifest_path, encoding="utf-8"))
styles = [s for s in manifest["styles"] if not wanted or s["style"] in wanted]
print(f"{len(styles)} styles -> {out_path}")

cols = 6
tw = th = 175
rows = (len(styles) + cols - 1) // cols
sheet = Image.new("RGB", (cols * tw, rows * th), "white")
for i, s in enumerate(styles):
    path = os.path.join(base, s["images"][0])
    im = Image.open(path).convert("RGB").resize((tw, th), Image.LANCZOS)
    d = ImageDraw.Draw(im)
    label = s["style"]
    d.rectangle([0, 0, len(label) * 7 + 6, 15], fill="black")
    d.text((3, 2), label, fill="white")
    sheet.paste(im, ((i % cols) * tw, (i // cols) * th))
sheet.save(out_path, quality=90)
print("saved", sheet.size)
