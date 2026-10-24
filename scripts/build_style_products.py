#!/usr/bin/env python3
"""
Generate catalog product records for a converted style batch.

Reads:
  - the manifest produced by convert_style_batch.py
  - src/data/style-classification.json (the visual review of one representative
    shot per style: garment type, neckline, and a style note)

Writes the new products into src/data/products.json under the right category.

Design notes:
  - The product id is the original photo-archive folder name (DXE-A002-2), the
    same convention the 2026-10-18 DXS batch used, so a record can always be
    traced back to the folder it came from.
  - The product name and tags are written so that the automatic tagger in
    src/data/product-tags.ts picks up the right byStyle / byMaterial /
    byAudience buckets: "cardigan", "vest", "v-neck", "crew neck", "zip",
    "women"/"ladies", "men" and so on all appear in the haystack.
  - Everything the archive cannot tell us (micron, MOQ, lead time) is set to
    the same values the existing 841 products carry, so the new records are
    indistinguishable in shape from the rest of the catalog.
"""

import argparse
import json
import os
import re
import sys
from collections import Counter

# --- type code -> (english name fragment, byStyle keyword, extra tag words) ---
TYPE_SPEC = {
    "VEST":     ("Cashmere sleeveless vest",      "vest",     ["Sleeveless"]),
    "CREW":     ("Cashmere crew-neck sweater",   "crew neck", ["Crew Neck"]),
    "V-NECK":   ("Cashmere V-neck sweater",       "v-neck",   ["V-Neck"]),
    "CARDIGAN": ("Cashmere button-front cardigan", "cardigan", ["Cardigan"]),
    "ZIP":      ("Cashmere zip-neck sweater",     "zip",      ["Zip"]),
    "HOOD":     ("Cashmere hooded cardigan",     "hood",     ["Hooded"]),
    "SHORT":    ("Cashmere short-sleeve knit",   "",         ["Short Sleeve"]),
    "DRESS":    ("Cashmere knit dress",           "dress",    ["Dress"]),
    "SKIRT":    ("Cashmere knit skirt",           "skirt",    ["Skirt"]),
    "PANTS":    ("Cashmere knit trousers",        "",         ["Trousers"]),
    "WATERMARK":("Cashmere knit sweater",         "crew neck", ["Crew Neck"]),
}

NECKLINE_WORDS = {
    "V-neck": "V-neck",
    "Crew neck": "crew neck",
    "Mock neck": "mock neck",
    "High neck": "high neck",
    "Notched collar": "notched collar",
    "Hood": "hooded",
    "Shirt collar": "shirt collar",
    "Henley": "henley",
    "Zip neck": "zip neck",
    "Sleeveless": "sleeveless",
    "Waist": "",
    "Long": "",
}

COLOR_WORDS = {
    "black": "Black", "white": "White", "beige": "Beige", "camel": "Camel",
    "grey": "Grey", "navy": "Navy", "blue": "Blue", "red": "Red",
    "pink": "Pink", "green": "Green", "yellow": "Yellow", "purple": "Purple",
    "orange": "Orange",
}

GENDER_WORDS = {
    "women": "Women", "men": "Men", "kids": "Kids", "unisex": "Unisex",
}

BASE_TAGS = [
    "Wholesale", "100% Cashmere", "Ordos Cashmere", "Cashmere Knitwear",
    "Custom Colors", "OEM Service", "Private Label", "B2B Cashmere",
    "Cashmere Manufacturer", "Inner Mongolia Cashmere", "Free Sample",
    "Premium Knit", "Cashmere Garment", "Fashion Knitwear",
    "Cashmere Factory Direct", "Pantone Color Match",
]


def build_name(cls, colors, gender_word):
    """Cashmere <type> — <colour> <note>.

    The colour goes after the garment type, not before it: "Cashmere
    sleeveless vest — Black" reads the way a catalogue line is written, and
    it keeps the type keyword (vest / cardigan / v-neck) adjacent to
    "Cashmere" so the auto-tagger's haystack matches cleanly.
    """
    type_name, _, extra = TYPE_SPEC.get(cls["type"], TYPE_SPEC["CREW"])
    name = type_name
    tail = []
    if colors:
        tail.append(colors[0].title())
    note = cls.get("note")
    if note and note != "WATERMARK":
        tail.append(note)
    if tail:
        name += " — " + " ".join(tail)
    return name


def build_tags(cls, colors, gender):
    tags = list(BASE_TAGS)
    type_name, by_style, extra = TYPE_SPEC.get(cls["type"], TYPE_SPEC["CREW"])
    if by_style:
        tags.insert(4, by_style.title())
    for w in extra:
        tags.append(w)
    nk = NECKLINE_WORDS.get(cls.get("neckline", ""), "")
    if nk and nk not in tags:
        tags.append(nk.title())
    gw = GENDER_WORDS.get(gender, "Unisex")
    tags.append(gw)
    if gender == "women":
        tags.append("Ladies")
    if gender == "men":
        tags.append("Menswear")
    tags.append("Knitwear Wholesale")
    # a couple of colour words so the colour facet has something to match
    for c in colors[:2]:
        w = COLOR_WORDS.get(c)
        if w:
            tags.append(w)
    # de-duplicate, keep order
    seen, out = set(), []
    for t in tags:
        if t not in seen:
            seen.add(t)
            out.append(t)
    return out


def build_description(name, colors, gender, cls):
    colour_txt = ", ".join(colors) if colors else "multiple"
    gw = GENDER_WORDS.get(gender, "Unisex")
    nk = NECKLINE_WORDS.get(cls.get("neckline", ""), "") or "crew neck"
    return (
        f"Wholesale 100% Cashmere knit garment from Ordos factory, {gw.lower()} "
        f"{nk} {cls['type'].lower().replace('-', ' ')} in {colour_txt}, 14–15.5µm Grade A "
        f"Mongolian cashmere, hand-finished, MOQ 30-50pcs, 7-day sample, Pantone color "
        f"match, OEM/private label, FOB Tianjin 30–35 days."
    )


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("manifest")
    ap.add_argument("classification")
    ap.add_argument("--catalog", default="/home/zj/ordos-cashmere/src/data/products.json")
    ap.add_argument("--category", default="sweaters",
                    help="category id to place the new products in")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    manifest = json.load(open(args.manifest, encoding="utf-8"))
    cls_all = json.load(open(args.classification, encoding="utf-8"))

    catalog = json.load(open(args.catalog, encoding="utf-8"))
    cat = next((c for c in catalog["categories"] if c["id"] == args.category), None)
    if cat is None:
        sys.exit(f"category {args.category} not found")
    existing = {p["id"] for p in cat["products"]}

    new_products = []
    skipped = []
    updated = []
    for s in manifest["styles"]:
        style = s["style"]
        if style in existing:
            # The style is already in the catalogue (the 2026-10-18 DXS batch).
            # The 2026-10-23 archive carries a fuller photo set for it, so
            # refresh the image list rather than leaving the older, shorter
            # set in place. Everything else on the record stays as it is.
            target = next(p for p in cat["products"] if p["id"] == style)
            if target.get("images") != s["images"]:
                target["images"] = s["images"]
                target["colors"] = [c.title() for c in s.get("colors", [])] or target.get("colors")
                updated.append(style)
            else:
                skipped.append(style)
            continue
        cls = cls_all.get(style)
        if not cls:
            skipped.append(style)
            continue
        colors = s.get("colors", [])
        gender = s.get("gender", "unisex")
        name = build_name(cls, colors, gender)
        tags = build_tags(cls, colors, gender)
        desc = build_description(name, colors, gender, cls)
        new_products.append({
            "id": style,
            "name": name,
            "price": "38.5-58.0",
            "currency": "USD",
            "moq": 30,
            "material": "100% Cashmere",
            "micron": "14–15.5µm",
            "colors": [c.title() for c in colors] or ["Assorted"],
            "description": desc,
            "images": s["images"],
            "weight": "Variable by size",
            "lead": "30–35 days",
            "sample_time": "7-10 days",
            "tags": tags,
            "detailedDescription": desc,
            "knittingTechnology": "Knit",
            "collar": cls.get("neckline", "Crew neck"),
        })

    if args.dry_run:
        print(f"would add {len(new_products)} to {args.category} "
              f"(refresh {len(updated)} existing, skip {len(skipped)})")
        for p in new_products[:8]:
            print(f"  {p['id']:16s} {p['name'][:58]}")
            print(f"      tags: {p['tags'][:8]}")
        return

    cat["products"].extend(new_products)
    with open(args.catalog, "w", encoding="utf-8") as f:
        json.dump(catalog, f, ensure_ascii=False, indent=2)

    print(f"added {len(new_products)} products to {args.category} "
          f"(refreshed {len(updated)} existing, skipped {len(skipped)})")
    print(f"category now has {len(cat['products'])} products")
    if skipped:
        print(f"skipped: {skipped[:10]}{'...' if len(skipped) > 10 else ''}")
    print("\ntype distribution:",
          dict(Counter(p["collar"] for p in new_products).most_common()))


if __name__ == "__main__":
    main()
