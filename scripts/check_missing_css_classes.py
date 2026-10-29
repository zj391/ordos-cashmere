#!/usr/bin/env python3
"""Report utility classes a page uses that the served CSS does not define.

Tailwind escapes special characters inside a class selector (a colon becomes
\\:, a slash becomes \\/, brackets become \\[ \\]), so a naive "is the class
name in the CSS text" check produces false positives for every variant and
arbitrary-value class. This escapes the class the way Tailwind does before
looking it up.

A class that is genuinely missing means the browser drops that declaration,
which is how a grid stops laying out in columns and the text collapses into a
narrow strip next to the image.

Usage:
    python3 scripts/check_missing_css_classes.py [url]
"""
import re
import subprocess
import sys

URL = sys.argv[1] if len(sys.argv) > 1 else "https://www.erdosdx.com/en/"

html = subprocess.run(
    ["curl", "-sL", "--max-time", "40", URL], capture_output=True, text=True
).stdout

# Every stylesheet the page pulls in.
css = ""
for href in re.findall(r'<link[^>]*rel="stylesheet"[^>]*href="([^"]*)"', html):
    url = href if href.startswith("http") else "https://www.erdosdx.com" + href
    css += subprocess.run(
        ["curl", "-s", "--max-time", "40", url], capture_output=True, text=True
    ).stdout

# Tailwind's CSS.escape equivalent for the characters that actually appear
# in utility class names.
ESCAPE = {
    "\\": "\\\\",
    "!": "\\!",
    '"': '\\"',
    "#": "\\#",
    "$": "\\$",
    "%": "\\%",
    "&": "\\&",
    "'": "\\'",
    "(": "\\(",
    ")": "\\)",
    "*": "\\*",
    "+": "\\+",
    ",": "\\,",
    ".": "\\.",
    "/": "\\/",
    ":": "\\:",
    ";": "\\;",
    "<": "\\<",
    "=": "\\=",
    ">": "\\>",
    "?": "\\?",
    "@": "\\@",
    "[": "\\[",
    "]": "\\]",
    "^": "\\^",
    "{": "\\{",
    "|": "\\|",
    "}": "\\}",
    "~": "\\~",
    "`": "\\`",
}


def tailwind_escape(name: str) -> str:
    return "".join(ESCAPE.get(ch, ch) for ch in name)


used = set()
for m in re.findall(r'class="([^"]*)"', html):
    used.update(m.split())

missing = []
for cls in sorted(used):
    if cls in (".", ""):
        continue
    esc = tailwind_escape(cls)
    # The class may be part of a multi-class selector, so look for the
    # escaped name followed by a non-class character.
    if re.search(r"\.%s(?![A-Za-z0-9_-])" % re.escape(esc), css):
        continue
    missing.append(cls)

print(f"url: {URL}")
print(f"css bytes: {len(css)//1024} KB")
print(f"distinct classes used: {len(used)}")
print(f"classes with no rule in the served CSS: {len(missing)}")
for cls in missing:
    print(f"   {cls}")
