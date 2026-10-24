#!/usr/bin/env python3
"""Build a contact sheet of the first image of every style in a manifest.

Used for the visual review that produces src/data/style-classification.json:
each panel is labelled with its style id so the reviewer can read the
garment type straight off the grid.
"""
import json
import os
import sys

from PIL import Image, ImageDraw


def main():
    manifest_path = sys.argv[1]
    out_prefix = sys.argv[2]
    base = sys.argv[3] if len(sys.argv) > 3 else "/home/zj/ordos-cashmere/public/products/mic"
    per_sheet = int(sys.argv[4]) if len(sys.argv) > 4 else 40

    manifest = json.load(open(manifest_path, encoding="utf-8"))
    styles = manifest["styles"]
    print(f"{len(styles)} styles in {manifest_path}")

    for sheet_i in range(0, len(styles), per_sheet):
        chunk = styles[sheet_i:sheet_i + per_sheet]
        cols = 8
        tw = th = 130
        rows = (len(chunk) + cols - 1) // cols
        sheet = Image.new("RGB", (cols * tw, rows * th), "white")
        for i, s in enumerate(chunk):
            path = os.path.join(base, s["images"][0])
            if not os.path.exists(path):
                print("  MISSING", path)
                continue
            im = Image.open(path).convert("RGB").resize((tw, th), Image.LANCZOS)
            d = ImageDraw.Draw(im)
            label = s["style"]
            d.rectangle([0, 0, len(label) * 5 + 4, 11], fill="black")
            d.text((2, 1), label, fill="white")
            sheet.paste(im, ((i % cols) * tw, (i // cols) * th))
        out = f"{out_prefix}_{sheet_i // per_sheet}.jpg"
        sheet.save(out, quality=85)
        print(out, len(chunk))


if __name__ == "__main__":
    main()
