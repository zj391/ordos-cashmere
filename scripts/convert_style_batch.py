#!/usr/bin/env python3
"""
Convert a batch of cashmere style folders into catalog products + WebP images.

Input layout (F:\\产品图片\\产品图20261023):
    <group>/<STYLE-ID>/[optional subdir]/<chinese-filename>.jpg

e.g.  2详情页-女款/DXE-A002-2/正/正.jpg
       5详情页-女款/DXW-A003-4/新主图.jpg

Output:
    public/products/mic/prod_<NNNN>_<II>.webp   (quality 85, resized to <=1200px)
    a JSON manifest on stdout describing every style that was processed

Design notes:
  - The Chinese filenames are a mix of three things: a main shot (正 / 新主图 /
    主图), colour shots (米色, 藏青色, ...) and detail shots (下摆, 背, 袖口,
    领口, 腰部, 裤腿, 口袋, ...). Image order in the product record drives what
    a visitor sees first, so the main shot is sorted to position 0, colour
    shots next, detail shots last.
  - Colour names are extracted from the colour-shot filenames so the product
    can advertise the palette it actually has photos of, instead of a
    placeholder like "100+ colors".
  - Nothing here guesses a garment type from the pixels. The caller supplies a
    type map because the folder names (DXE / DXS / DXS2 / DXW) are product-line
    codes, not categories.

Usage:
    python3 scripts/convert_style_batch.py <source_root> <out_manifest.json> \
        [--group-prefix "2详情页"] [--start-index 2019]
"""

import argparse
import json
import os
import re
import sys
from collections import Counter

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow is required: pip install Pillow")

# Filenames that are a shot of the garment, not a colourway.
DETAIL_SHOTS = {
    "正", "新主图", "主图", "新主图b", "背", "袖口", "领口", "下摆", "腰部",
    "裤腿", "裤腿口", "裤口", "口袋", "肩部", "面料", "细节", "组合", "穗",
    "扣子", "结", "开叉", "蝴蝶结", "蝴蝶", "花纹", "下单", "黑色背",
    "下摆灰", "灰色背", "袖口灰", "领口灰", "绿摆", "绿背", "绿腰",
    "红背", "藏蓝色背", "浅粉背", "浅绿背", "黑绿背",
    "领口2", "深灰厚", "米厚", "深灰色厚",
    "米色厚", "藏蓝色厚", "黑厚", "黑绿",
}
# Colour shots that happen to start with 正 ("front view in colour X").
# These ARE colourways, not detail shots.
FRONT_COLOUR = re.compile(r"^正(白|米|粉|黑|灰|藏蓝|红|绿|蓝)$")

# Filenames that are pure noise (copy-paste suffixes on colour shots).
NOISE = re.compile(r"^\d+$")

# Colour words that appear as a suffix on a colour shot, e.g. "米色厚",
# "藏蓝色背", "正白2" -> the colour is the leading part.
COLOR_SUFFIX = re.compile(r"(厚|背|摆|腰|腿|口)$")

# The palette vocabulary the site already uses.
COLOR_FAMILY = [
    ("black",    ("黑色", "炭黑", "墨黑", "黑")),
    ("white",    ("白色", "米白", "米黄色", "彩白", "浅白")),
    ("beige",    ("米色", "米黄", "杏色", "燕麦")),
    ("camel",    ("驼色", "金驼", "深驼", "浅驼", "中驼", "咖色", "咖啡", "深咖", "浅棕", "棕色", "卡其")),
    ("grey",     ("灰色", "深灰", "浅灰", "炭灰", "砖灰", "烟灰", "鼠灰", "花点灰", "银灰")),
    ("navy",     ("藏蓝", "藏青", "深蓝", "墨蓝")),
    ("blue",     ("蓝色", "天蓝", "湖蓝", "宝蓝", "浅蓝", "雾蓝")),
    ("red",      ("红色", "酒红", "玫红", "紫红", "砖红", "枣红", "暗红", "安可拉红", "洋气红", "中国红", "西瓜红", "柚子红", "咖红", "粉红")),
    ("pink",     ("粉色", "浅粉", "藕粉", "暗粉", "花粉", "香芋紫", "紫色", "深紫", "幽暗紫", "豆沙")),
    ("green",    ("绿色", "深绿", "墨绿", "军绿", "豆绿", "浅豆绿", "牛油果绿", "苍绿", "青本色", "浅绿")),
    ("yellow",   ("黄色", "浅黄", "姜黄", "鹅黄", "芥末黄", "桔黄", "杏黄")),
    ("purple",   ("紫",)),
    ("orange",   ("焦糖色", "橘色")),
]


# ---------------------------------------------------------------------------
# Product-line catalogue.
#
# The folder names encode a product line (DXE / DXS / DXS2 / DXW) and a
# sub-series letter. The line number is the photo-shooting round; the letter
# is the silhouette. The mapping below was established by inspecting one
# representative full-garment shot per (line, letter) pair.
#
#   (line, letter) -> (english product name, neckline, sub-series label)
#
# Anything not in the table falls back to a generic crew-neck cashmere knit,
# which is what the majority of the archive is.
# ---------------------------------------------------------------------------
SERIES = {
    "DXE-A":  ("Cashmere embroidered sleeveless vest", "V-neck", "Embroidered Vest"),
    "DXE-B":  ("Cashmere button-front cardigan", "Notched collar", "Wool-look Cardigan"),
    "DXE-D":  ("Cashmere short-sleeve V-neck knit", "V-neck", "Short Sleeve Knit"),
    "DXE-R":  ("Cashmere dropped-shoulder crew-neck sweater", "Crew neck", "Dropped Shoulder"),
    "DXE-X":  ("Cashmere hooded zip cardigan", "Hood", "Hooded Zip"),
    "DXE-Y":  ("Cashmere crew-neck sweater", "Crew neck", "Fine Gauge Crew"),
    "DXS-A":  ("Cashmere crew-neck sweater", "Crew neck", "Patterned Crew"),
    "DXS-B":  ("Cashmere long V-neck cardigan", "V-neck", "Long Cardigan"),
    "DXS-J":  ("Cashmere single-breasted button cardigan", "V-neck", "Single-Breasted Cardigan"),
    "DXS-R":  ("Cashmere slim-fit crew-neck sweater", "Crew neck", "Slim Fit"),
    "DXS-X":  ("Cashmere button-front cardigan", "Crew neck", "Button Cardigan"),
    "DXS2-A": ("Cashmere jacquard crew-neck sweater", "Crew neck", "Jacquard Crew"),
    "DXS2-B": ("Cashmere cable-knit crew-neck sweater", "Crew neck", "Cable Knit"),
    "DXS2-J": ("Cashmere V-neck cardigan", "V-neck", "Fine Knit Cardigan"),
    "DXS2-R": ("Cashmere notched-collar cardigan", "Notched collar", "Collared Cardigan"),
    "DXS2-X": ("Cashmere button-front cardigan", "Crew neck", "Men's Cardigan"),
    "DXW-A":  ("Cashmere crew-neck sweater", "Crew neck", "Featherweight Crew"),
    "DXW-B":  ("Cashmere V-neck sweater", "V-neck", "V-neck Knit"),
    "DXW-J":  ("Cashmere collared sweater", "Notched collar", "Collared Knit"),
    "DXW-R":  ("Cashmere crew-neck sweater", "Crew neck", "Soft Knit Crew"),
    "DXW-X":  ("Cashmere notched-collar cardigan", "Notched collar", "Men's Collared Knit"),
    "DXY-X":  ("Cashmere crew-neck knit", "Crew neck", "Classic Crew"),
}

DEFAULT_SERIES = ("Cashmere crew-neck sweater", "Crew neck", "Cashmere Knit")

# The photo archive marks the shooting round in the folder name; the round
# tells us which of the two photo conventions applies (2/5 ship a front
# shot, 3/4 only ship colour + detail shots).
GENDER_BY_FOLDER = {"女款": "women", "男款": "men", "儿童": "kids"}


def series_for(style: str):
    """Look up (name, neckline, sub-series) from the style folder name."""
    m = re.match(r"([A-Z]+\d*)-([A-Z])-", style)
    if m:
        key = f"{m.group(1)}-{m.group(2)}"
        if key in SERIES:
            return SERIES[key]
    for key, val in SERIES.items():
        if style.startswith(key + "-"):
            return val
    return DEFAULT_SERIES


def gender_for(group: str) -> str:
    for token, g in GENDER_BY_FOLDER.items():
        if token in group:
            return g
    return "unisex"


def color_family(name: str):
    """Map a Chinese colour-shot filename to one of the site's colour families."""
    n = name
    for suffix in ("厚", "2", "3"):
        if n.endswith(suffix) and len(n) > 1:
            n = n[: -len(suffix)]
    # "正白" / "正米" -> the colour is what follows the 正 prefix
    if n.startswith("正") and len(n) > 1:
        n = n[1:]
    for fam, keys in COLOR_FAMILY:
        for k in keys:
            if k in n:
                return fam
    return None


def is_detail(stem: str) -> bool:
    s = stem.strip()
    if FRONT_COLOUR.match(s):
        return False
    if s in DETAIL_SHOTS:
        return True
    if NOISE.match(s):
        return True
    # "藏蓝色背" / "米色厚" -> detail shot of a colour, not a colourway itself
    if COLOR_SUFFIX.search(s) and color_family(s) is not None:
        base = COLOR_SUFFIX.sub("", s)
        return base != s and color_family(base) is not None and len(base) > 2
    return False


def sort_key(item):
    """Order the shots so the first one a visitor sees shows the garment.

    Two conventions exist in this photo archive:
      * styles that ship a 正 / 新主图 / 主图 front shot  -> that shot is the
        product photo, colour shots follow, detail shots last.
      * styles that ship only colour + detail shots (the 3详情页 and 4详情页
        lines) -> the colour shots ARE the full-garment photos, so they lead.

    A 背面 shot is the back of the garment and a 领口 / 袖口 / 下摆 shot is a
    close-up; neither should be the first image in the gallery.
    """
    stem, path = item
    if stem in ("正", "新主图", "主图", "新主图B"):
        return (0, stem)
    if stem == "背":
        # back view is a real product view, better than a detail crop
        return (1, stem)
    if is_detail(stem):
        return (3, stem)
    return (2, stem)


def collect_images(style_dir: str):
    """Return the style's image files, ordered main -> colour -> detail."""
    found = []
    for root, _dirs, files in os.walk(style_dir):
        for f in files:
            ext = os.path.splitext(f)[1].lower()
            if ext not in (".jpg", ".jpeg", ".png", ".webp"):
                continue
            stem = os.path.splitext(f)[0]
            found.append((stem, os.path.join(root, f)))
    found.sort(key=sort_key)
    return found


def convert(src: str, dst: str, max_side: int, quality: int) -> tuple:
    with Image.open(src) as im:
        im = im.convert("RGB")
        w, h = im.size
        if max(w, h) > max_side:
            scale = max_side / max(w, h)
            im = im.resize((round(w * scale), round(h * scale)), Image.LANCZOS)
        im.save(dst, "WEBP", quality=quality, method=6)
        return im.size


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("source_root")
    ap.add_argument("manifest")
    ap.add_argument("--group-prefix", default="", help="only process groups starting with this")
    ap.add_argument("--out-dir", default="/home/zj/ordos-cashmere/public/products/mic")
    ap.add_argument("--start-index", type=int, default=2019)
    ap.add_argument("--max-side", type=int, default=1200)
    ap.add_argument("--quality", type=int, default=85)
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    root = args.source_root
    groups = sorted(
        g for g in os.listdir(root)
        if os.path.isdir(os.path.join(root, g))
        and (not args.group_prefix or g.startswith(args.group_prefix))
    )

    manifest = []
    next_index = args.start_index
    converted = 0
    total_bytes = 0

    for group in groups:
        gpath = os.path.join(root, group)
        for style in sorted(os.listdir(gpath)):
            spath = os.path.join(gpath, style)
            if not os.path.isdir(spath):
                continue
            images = collect_images(spath)
            if not images:
                print(f"  skip (no images): {group}/{style}")
                continue

            prod_index = next_index
            next_index += 1

            out_names = []
            colors = []
            for i, (stem, src) in enumerate(images):
                out_name = f"prod_{prod_index:04d}_{i:02d}.webp"
                out_names.append(out_name)
                fam = None if is_detail(stem) else color_family(stem)
                if fam and fam not in colors:
                    colors.append(fam)
                if not args.dry_run:
                    dst = os.path.join(args.out_dir, out_name)
                    size = convert(src, dst, args.max_side, args.quality)
                    converted += 1
                    total_bytes += os.path.getsize(dst)
                    if converted % 200 == 0:
                        print(f"  ...{converted} images, {total_bytes/1024/1024:.1f} MB")

            name, neckline, sub_series = series_for(style)
            manifest.append({
                "group": group,
                "style": style,
                "prod_index": prod_index,
                "images": out_names,
                "colors": colors,
                "image_count": len(out_names),
                "gender": gender_for(group),
                "product_name": name,
                "neckline": neckline,
                "sub_series": sub_series,
                "source_images": [os.path.relpath(p, root) for _, p in images],
            })
            print(f"  {group}/{style} -> prod_{prod_index:04d} ({len(out_names)} imgs, colors={colors})")

    os.makedirs(os.path.dirname(args.manifest), exist_ok=True)
    with open(args.manifest, "w", encoding="utf-8") as f:
        json.dump({
            "source_root": root,
            "groups": groups,
            "start_index": args.start_index,
            "end_index": next_index - 1,
            "style_count": len(manifest),
            "image_count": converted,
            "total_bytes": total_bytes,
            "styles": manifest,
        }, f, ensure_ascii=False, indent=2)

    print(f"\n{'DRY RUN' if args.dry_run else 'DONE'}: {len(manifest)} styles, "
          f"{converted} images, {total_bytes/1024/1024:.1f} MB")
    print(f"manifest: {args.manifest}")


if __name__ == "__main__":
    main()
