#!/usr/bin/env python3
"""Report the real pixel size of every product image used on a page,
next to the size the page declares.

Usage:
    python3 scripts/report_page_image_sizes.py [url]
"""
import json
import os
import re
import subprocess
import sys

from PIL import Image

URL = sys.argv[1] if len(sys.argv) > 1 else "https://www.erdosdx.com/en/"
REPO = "/home/zj/ordos-cashmere"

html = subprocess.run(
    ["curl", "-sL", "--max-time", "40", URL], capture_output=True, text=True
).stdout

for tag in re.findall(r"<img\b[^>]*>", html):
    src = re.search(r'src="([^"]*)"', tag)
    if not src:
        continue
    path = src.group(1)
    w = re.search(r'width="([^"]*)"', tag)
    h = re.search(r'height="([^"]*)"', tag)
    dw = f"{w.group(1)}x{h.group(1)}" if (w and h) else "-"
    local = os.path.join(REPO, "public", path.lstrip("/"))
    if os.path.exists(local):
        try:
            with Image.open(local) as im:
                real = f"{im.size[0]}x{im.size[1]}"
        except Exception as exc:
            real = f"ERR {exc}"
    else:
        real = "?"
    flag = ""
    if w and h and "x" in real:
        dwx, dhx = int(w.group(1)), int(h.group(1))
        rw, rh = map(int, real.split("x"))
        if abs((dwx/dhx) - (rw/rh)) / (rw/rh) > 0.03:
            flag = "   <-- ASPECT MISMATCH"
    print(f"{path.split('/')[-1]:44s} declared={dw:>10s}  real={real:>12s}{flag}")
