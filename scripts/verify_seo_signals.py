#!/usr/bin/env python3
"""Verify canonical / hreflang / robots / Product schema on real built pages."""
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
STATIC = ROOT / ".vercel" / "output" / "static"

LOCALES = ["en", "de", "fr", "ja", "kr", "cn"]
LOCALE_SET = set(LOCALES)
# hreflang uses BCP-47 codes that differ from the URL locale segment.
HREFLANG_CODE = {"en": "en", "de": "de", "fr": "fr", "ja": "ja", "kr": "ko", "cn": "zh-CN"}


def strip_tags(html: str) -> str:
    return re.sub(r"<[^>]+>", " ", html)


def iter_html():
    for p in sorted(STATIC.rglob("*.html")):
        yield p, p.read_text(encoding="utf-8", errors="replace")


def rel(html: str, relname: str) -> list[str]:
    out = []
    for m in re.finditer(r"<link[^>]+>", html, re.I):
        tag = m.group(0)
        if re.search(r'rel\s*=\s*["\']?%s' % relname, tag, re.I):
            h = re.search(r'href\s*=\s*["\']([^"\']+)', tag, re.I)
            if h:
                out.append(h.group(1))
    return out


def main() -> int:
    problems = []
    stats = Counter()
    hreflang_self = Counter()
    hreflang_alt = Counter()
    canonical_ok = 0
    canonical_bad = []
    noindex_pages = 0

    # spot-check pages by kind
    samples = defaultdict(list)

    for path, html in iter_html():
        relpath = path.relative_to(STATIC).as_posix()
        parts = relpath.split("/")
        locale = parts[0] if parts and parts[0] in LOCALE_SET else None

        m = re.search(r"<title[^>]*>(.*?)</title>", html, re.I | re.S)
        title = strip_tags(m.group(1)).strip() if m else ""

        # canonical
        cans = rel(html, "canonical")
        if len(cans) > 1:
            canonical_bad.append((relpath, "multiple canonical", cans))
        elif cans:
            c = cans[0]
            stats["canonical_present"] += 1
            if locale:
                expected_prefix = f"/{locale}/"
                # canonical must point at same locale, same path (minus trailing)
                if c.startswith("http"):
                    pass
                if locale and f"/{locale}/" not in c:
                    canonical_bad.append((relpath, "canonical wrong locale", c))
                else:
                    canonical_ok += 1
        else:
            canonical_bad.append((relpath, "no canonical", ""))

        # hreflang
        alts = []
        selfref = None
        for h in rel(html, "alternate"):
            m2 = re.search(r'hreflang\s*=\s*["\']([^"\']+)', html[max(0, html.find(h) - 200):html.find(h) + 200], re.I)
            if h not in alts:
                alts.append(h)
        alts = rel(html, "alternate")
        if alts:
            stats["hreflang_present"] += 1
            hreflang_alt[len(alts)] += 1
        else:
            hreflang_alt[0] += 1

        # hreflang self-reference must exist and must match the canonical URL
        code = HREFLANG_CODE.get(locale)
        selfref = None
        for tag in re.finditer(r"<link[^>]+rel\s*=\s*[\"\']alternate[\"\'][^>]*>", html, re.I):
            t = tag.group(0)
            hl = re.search(r'hreflang\s*=\s*["\']([^"\']+)', t, re.I)
            h = re.search(r'href\s*=\s*["\']([^"\']+)', t, re.I)
            if hl and h and hl.group(1) == code:
                selfref = h.group(1)
                break
        if locale and alts:
            hreflang_self["has_self"] += 1
            if selfref is None:
                hreflang_self["missing_self"] += 1
                problems.append((relpath, "hreflang missing self-reference", code))
            elif cans and selfref.rstrip("/") != cans[0].rstrip("/"):
                hreflang_self["mismatch_canonical"] += 1
                problems.append((relpath, "hreflang self != canonical", f"{selfref} vs {cans[0]}"))

        # robots
        robots = re.findall(r'<meta[^>]+name\s*=\s*["\']robots["\'][^>]*>', html, re.I)
        rtxt = ""
        for rb in robots:
            c2 = re.search(r'content\s*=\s*["\']([^"\']+)', rb, re.I)
            if c2:
                rtxt = c2.group(1).lower()
        if "noindex" in rtxt:
            noindex_pages += 1

        # product schema
        if "/products/" in relpath and relpath.endswith(".html"):
            stats["product_pages"] += 1
            for jm in re.finditer(
                r'<script[^>]+type\s*=\s*["\']application/ld\+json["\'][^>]*>(.*?)</script>',
                html, re.I | re.S,
            ):
                try:
                    data = json.loads(jm.group(1).strip())
                except Exception:
                    stats["jsonld_broken"] += 1
                    continue
                nodes = data if isinstance(data, list) else [data]
                if isinstance(data, dict) and "@graph" in data:
                    nodes = data["@graph"]
                for n in nodes:
                    if isinstance(n, dict) and "Product" in str(n.get("@type", "")):
                        stats["product_schema_found"] += 1
                        if not n.get("sku"):
                            stats["product_schema_no_sku"] += 1
                        if not n.get("name"):
                            stats["product_schema_no_name"] += 1
                        break
            samples["product"].append(relpath)
        elif re.search(r"/(dehaired-cashmere|cashmere-yarn-types)/?$", relpath):
            samples["specialty"].append(relpath)
        elif "/category/" in relpath:
            samples["category"].append(relpath)
        elif re.search(r"/tags?/|/tag/", relpath):
            samples["tag"].append(relpath)

    print("=== canonical ===")
    print("  pages with canonical :", stats["canonical_present"])
    print("  canonical ok          :", canonical_ok)
    print("  canonical problems    :", len(canonical_bad))
    for p in canonical_bad[:10]:
        print("    !", p)

    print("=== hreflang ===")
    print("  pages with hreflang   :", stats["hreflang_present"])
    print("  alt-count histogram   :", dict(sorted(hreflang_alt.items())))
    print("  self-ref stats        :", dict(hreflang_self))

    print("=== robots ===")
    print("  noindex pages         :", noindex_pages)

    print("=== product schema ===")
    print("  product pages         :", stats["product_pages"])
    print("  Product schema found  :", stats["product_schema_found"])
    print("  broken jsonld         :", stats["jsonld_broken"])
    print("  missing sku           :", stats["product_schema_no_sku"])
    print("  missing name          :", stats["product_schema_no_name"])

    print("=== sitemap ===")
    for sm in ["sitemap-index.xml", "sitemap-static.xml", "sitemap-blog.xml", "sitemap-products.xml"]:
        p = STATIC / sm
        if p.exists():
            n = len(re.findall(r"<loc>", p.read_text(encoding="utf-8", errors="replace")))
            print(f"  {sm:24s} {n} loc")
        else:
            print(f"  {sm:24s} MISSING")

    print()
    print("problems total:", len(problems))
    for p in problems[:20]:
        print("  !", p)
    return 0


if __name__ == "__main__":
    sys.exit(main())
