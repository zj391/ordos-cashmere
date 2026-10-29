#!/usr/bin/env python3
"""Scan every built page for <img> tags whose declared box does not match
the real pixel size of the asset.

The homepage shipped a whole catalogue of images with hardcoded
width/height values (750x750 for category samples that were actually
489x550). The browser then reserves a box of the wrong shape, so the
picture and the text beside it are out of alignment until the image
loads - and the layout shifts when it does.

This walks the built output and reports every mismatch, so the same
mistake on another page does not go unnoticed.

Usage:
    python3 scripts/scan_site_image_dimensions.py [build_dir] [--limit N]
"""
import json
import os
import re
import sys
from urllib.parse import urlparse

from PIL import Image

BUILD = "/home/zj/ordos-cashmere/.vercel/output/static"
REPO = "/home/zj/ordos-cashmere"
LIMIT = 400

args = sys.argv[1:]
if args and args[0] not in ("--limit",):
    BUILD = args[0]
if "--limit" in args:
    LIMIT = int(args[args.index("--limit") + 1])

IMG_RE = re.compile(r"<img\b[^>]*>")
SRC_RE = re.compile(r'src="([^"]*)"')
W_RE = re.compile(r'width="([^"]*)"')
H_RE = re.compile(r'height="([^"]*)"')

size_cache = {}
problems = []
pages = 0
checked = 0


def real_size(rel: str):
    """Real pixel size of a site-relative asset, or None if not on disk."""
    if rel in size_cache:
        return size_cache[rel]
    path = os.path.join(REPO, "public", rel.lstrip("/"))
    size = None
    if os.path.exists(path):
        try:
            with Image.open(path) as im:
                size = im.size
        except Exception:
            size = None
    size_cache[rel] = size
    return size


for root, _dirs, files in os.walk(BUILD):
    if "index.html" not in files:
        continue
    pages += 1
    if pages > LIMIT:
        break
    path = os.path.join(root, "index.html")
    rel_page = os.path.relpath(path, BUILD)
    try:
        html = open(path, encoding="utf-8").read()
    except OSError:
        continue

    for tag in IMG_RE.findall(html):
        src = SRC_RE.search(tag)
        if not src:
            continue
        rel = src.group(1)
        if not rel.startswith("/"):
            continue
        w = W_RE.search(tag)
        h = H_RE.search(tag)
        if not (w and h):
            problems.append((rel_page, rel, "no width/height", None, None))
            continue
        try:
            dw, dh = int(w.group(1)), int(h.group(1))
        except ValueError:
            continue
        real = real_size(rel)
        if real is None:
            continue
        checked += 1
        rw, rh = real
        if dh and rw and abs((dw / dh) - (rw / rh)) / (rw / rh) > 0.03:
            problems.append((
                rel_page, rel,
                f"declared {dw}x{dh} vs real {rw}x{rh}",
                (dw, dh), (rw, rh),
            ))

print(f"scanned {pages} page(s), checked {checked} local image(s)")
if not problems:
    print("no aspect-ratio mismatches")
    sys.exit(0)

by_page = {}
for page, rel, msg, _d, _r in problems:
    by_page.setdefault(page, []).append((rel, msg))

print(f"{len(problems)} mismatch(es) on {len(by_page)} page(s):\n")
for page in sorted(by_page):
    print(f"  {page}")
    for rel, msg in by_page[page][:6]:
        print(f"      {rel}  {msg}")
    if len(by_page[page]) > 6:
        print(f"      ... and {len(by_page[page]) - 6} more")
