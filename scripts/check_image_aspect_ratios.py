#!/usr/bin/env python3
"""Check that every <img> on the homepage declares its real pixel size.

A mismatch between the declared width/height and the actual asset's aspect
ratio makes the browser reserve the wrong box before the image loads, which
shows up as text and images jumping into place (or, when object-cover is
combined with a wrong aspect ratio, as a visibly squashed picture).

Usage:
    python3 scripts/check_image_aspect_ratios.py [page_url] [repo]
"""
import os
import re
import subprocess
import sys

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow is required: pip install Pillow")

URL = sys.argv[1] if len(sys.argv) > 1 else "https://www.erdosdx.com/en/"
REPO = sys.argv[2] if len(sys.argv) > 2 else "/home/zj/ordos-cashmere"

html = subprocess.run(
    ["curl", "-sL", "--max-time", "40", URL], capture_output=True, text=True
).stdout

IMG_RE = re.compile(r"<img\b[^>]*>")

problems = []
checked = 0

for tag in IMG_RE.findall(html):
    src = re.search(r'src="([^"]*)"', tag)
    if not src:
        continue
    path = src.group(1)
    w = re.search(r'width="([^"]*)"', tag)
    h = re.search(r'height="([^"]*)"', tag)
    if not (w and h):
        problems.append((path, "no width/height", None, None))
        continue

    dw, dh = int(w.group(1)), int(h.group(1))
    local = os.path.join(REPO, "public", path.lstrip("/")) if path.startswith("/") else None
    if not local or not os.path.exists(local):
        # Remote asset - fetch its header instead of skipping it silently.
        head = subprocess.run(
            ["curl", "-sI", "--max-time", "20", "https://www.erdosdx.com" + path],
            capture_output=True, text=True,
        ).stdout
        continue

    try:
        with Image.open(local) as im:
            rw, rh = im.size
    except Exception as exc:
        problems.append((path, f"unreadable: {exc}", (dw, dh), None))
        continue

    checked += 1
    declared_ratio = dw / dh
    real_ratio = rw / rh
    if abs(declared_ratio - real_ratio) / real_ratio > 0.03:
        problems.append((
            path,
            f"aspect mismatch: declared {dw}x{dh} ({declared_ratio:.3f}) "
            f"vs real {rw}x{rh} ({real_ratio:.3f})",
            (dw, dh),
            (rw, rh),
        ))

print(f"checked {checked} local image(s) on {URL}")
if not problems:
    print("no aspect-ratio problems found")
else:
    print(f"{len(problems)} problem(s):")
    for path, msg, decl, real in problems:
        print(f"  {path}\n      {msg}")
