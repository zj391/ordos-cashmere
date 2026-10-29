#!/usr/bin/env python3
"""Generate src/data/image-dimensions.json — the real pixel size of every
image the homepage renders.

The homepage hardcoded width/height on its <img> tags (750x750 for the
category cards, for instance). When the source asset is not square — a
489x550 portrait, say — the browser reserves a square box for a portrait
image, so the picture and the text next to it end up out of alignment
before the image loads, and the layout shifts once it does.

Rather than trusting hand-written numbers, this reads the actual assets
from disk and writes the truth. The page then imports the table.

Usage:
    python3 scripts/generate_image_dimensions.py
"""
import json
import os

from PIL import Image

REPO = "/home/zj/ordos-cashmere"
PUBLIC = os.path.join(REPO, "public")
OUT = os.path.join(REPO, "src/data/image-dimensions.json")

# Every image the homepage can render.
FILES = [
    "/images/editorial-cashmere/editorial-material.webp",
    "/images/editorial-cashmere/editorial-origin.webp",
    "/images/home/mongolia-goat.webp",
    "/images/home/spinning-mill.webp",
    "/images/home/craft-knit-detail.webp",
    "/images/home/yarn-basket.webp",
    "/images/editorial-cashmere/editorial-product-yarn.webp",
    "/images/editorial-cashmere/editorial-scarves.webp",
    "/images/editorial-cashmere/editorial-hero.webp",
    "/images/editorial-cashmere/editorial-origin-card.webp",
    "/images/editorial-cashmere/editorial-product-raw.webp",
    "/images/editorial-cashmere/editorial-cta-fiber.webp",
    "/images/editorial-cashmere/editorial-craft.webp",
    "/images/editorial-cashmere/editorial-hero-landscape.webp",
    "/images/editorial-cashmere/editorial-garment-oem.webp",
    "/images/editorial-cashmere/editorial-journal-origin.webp",
    "/images/editorial-cashmere/editorial-journal-yarn.webp",
    "/images/editorial-cashmere/editorial-blog-knitting.webp",
    "/images/editorial-cashmere/fiber-mark.png",
]

out = {}
missing = []
for rel in FILES:
    path = os.path.join(PUBLIC, rel.lstrip("/"))
    if not os.path.exists(path):
        missing.append(rel)
        continue
    with Image.open(path) as im:
        out[rel] = {"w": im.size[0], "h": im.size[1]}

# The six category-card sample images: the first product image of the
# first product in each category. These are the ones that were declared
# 750x750 regardless of their real shape.
CAT_ORDER = ["hats", "scarves", "sweaters", "accessories", "blankets", "yarn"]
catalog = json.load(
    open(os.path.join(REPO, "src/data/products.json"), encoding="utf-8")
)
cat_samples = {}
for cat in catalog["categories"]:
    if cat["id"] not in CAT_ORDER:
        continue
    products = cat.get("products", [])
    if not products:
        continue
    first = products[0].get("images", [None])[0]
    if not first:
        continue
    rel = "/products/mic/" + first
    path = os.path.join(PUBLIC, "products/mic", first)
    if not os.path.exists(path):
        missing.append(rel)
        continue
    with Image.open(path) as im:
        cat_samples[cat["id"]] = {
            "src": rel,
            "w": im.size[0],
            "h": im.size[1],
            "alt": f"{cat['name']} — sample product",
        }

out["__categorySamples"] = cat_samples

with open(OUT, "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, indent=1)

print(f"wrote {OUT}")
print(f"  static images : {len(out) - 1}")
print(f"  category samples: {len(cat_samples)}")
if missing:
    print("  MISSING:")
    for m in missing:
        print(f"    {m}")
