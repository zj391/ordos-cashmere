"""Convert og-default.svg to og-default.png using Pillow (no rsvg/cairo needed).

Replicates the SVG visually: dark-warm gradient + serif DONGXIAO wordmark +
sans-serif tagline + gold accent line + spaced caps footer.
"""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

OUT = Path(r'C:\Users\zj\Desktop\ordos-cashmere-site\public\images\og-default.png')
W, H = 1200, 630

# Diagonal gradient (top-left dark brown to bottom-right camel)
GRAD_FROM = (26, 22, 18)     # #1A1612
GRAD_MID  = (92, 62, 42)     # #5C3E2A
GRAD_TO   = (168, 135, 94)   # #A8875E
TEXT_CREAM = (245, 241, 234)
GOLD_LINE = (184, 149, 106)

img = Image.new('RGB', (W, H), GRAD_FROM)
draw = ImageDraw.Draw(img)

# Draw diagonal gradient (per-pixel is slow but only 1200x630 = 756k ops)
for y in range(H):
    for x in range(W):
        # Diagonal position 0..1
        t = (x + y) / (W + H)
        if t < 0.5:
            # interpolate from->mid
            f = t / 0.5
            r = int(GRAD_FROM[0] + (GRAD_MID[0] - GRAD_FROM[0]) * f)
            g = int(GRAD_FROM[1] + (GRAD_MID[1] - GRAD_FROM[1]) * f)
            b = int(GRAD_FROM[2] + (GRAD_MID[2] - GRAD_FROM[2]) * f)
        else:
            f = (t - 0.5) / 0.5
            r = int(GRAD_MID[0] + (GRAD_TO[0] - GRAD_MID[0]) * f)
            g = int(GRAD_MID[1] + (GRAD_TO[1] - GRAD_MID[1]) * f)
            b = int(GRAD_MID[2] + (GRAD_TO[2] - GRAD_MID[2]) * f)
        img.putpixel((x, y), (r, g, b))

# Try to load Georgia / Inter fonts; fall back to default
def load_font(size, bold=False):
    candidates = [
        r'C:\Windows\Fonts\georgia.ttf',
        r'C:\Windows\Fonts\segoeui.ttf',
        r'C:\Windows\Fonts\arial.ttf',
    ]
    for path in candidates:
        try:
            return ImageFont.truetype(path, size)
        except (OSError, IOError):
            continue
    return ImageFont.load_default()

font_wordmark = load_font(84)
font_caps     = load_font(32)
font_tagline  = load_font(36)
font_subtitle = load_font(22)
font_footer   = load_font(16)

# Wordmark "DONGXIAO®" (cream, serif, ~84pt)
draw.text((80, 180), "DONGXIAO", fill=TEXT_CREAM, font=font_wordmark)
# Approximate ® superscript at end
try:
    font_sup = load_font(28)
    draw.text((520, 188), "®", fill=TEXT_CREAM, font=font_sup)
except Exception:
    pass

# "CASHMERE" spaced caps
draw.text((80, 270), "CASHMERE", fill=TEXT_CREAM, font=font_caps)

# Gold accent line
draw.line([(80, 320), (200, 320)], fill=GOLD_LINE, width=2)

# Tagline
draw.text((80, 360), "Premium Cashmere from Ordos", fill=TEXT_CREAM, font=font_tagline)

# Subtitle
draw.text((80, 410), "Source Factory  ·  Inner Mongolia  ·  Since 2002", fill=TEXT_CREAM, font=font_subtitle)

# Footer caps
draw.text((80, 555), "23+ YEARS  ·  50+ COUNTRIES  ·  ISO 9001 CERTIFIED", fill=TEXT_CREAM, font=font_footer)

# Save
img.save(OUT, 'PNG', optimize=True)
print(f'OK: {OUT} ({OUT.stat().st_size:,} bytes, {W}x{H})')