# Placeholder image credits — 2026 redesign (P0)

This file tracks every placeholder image used in the 2026-07-22 visual
redesign. Each entry records: source URL, license, photographer credit,
the page/section it appears in, and the planned replacement (the real
DONGXIAO® factory photography once available).

> ⚠ All images below are sourced from Wikimedia Commons under CC
> BY-SA 4.0 or Public Domain. Once DONGXIAO supplies real factory
> photography, replace each `<img src="...">` with a local path under
> `/public/images/` and remove the credit entry.

## Image 1: hero-fiber
- **URL:** https://upload.wikimedia.org/wikipedia/commons/6/66/Cashmere_Sweater.jpg
- **License:** CC BY-SA 4.0
- **Subject:** Knitwear detail (cashmere sweater)
- **Used in:** `[locale]/index.astro` hero
- **Replace with:** `/images/hero-cashmere-knitwear.jpg` (factory-shot, lifestyle or
  macro fiber — once photographer delivers)

## Image 2: factory
- **URL:** https://upload.wikimedia.org/wikipedia/commons/c/cc/Cashmere_Factory_Gobi_33_%28cropped%29.JPG
- **License:** Public Domain
- **Subject:** Cashmere factory floor (Mongolia, 2009)
- **Used in:** `[locale]/index.astro` "Supply chain" or "Capacity" section
- **Replace with:** `/images/factory-floor.jpg` (DONGXIAO Ordos workshop)

## Image 3: scarf-detail
- **URL:** https://upload.wikimedia.org/wikipedia/commons/9/95/Pashmina_scarf_with_woven_elephant_design_03.jpg
- **License:** CC BY-SA 4.0
- **Subject:** Woven scarf detail
- **Used in:** `[locale]/index.astro` products grid — scarves card
- **Replace with:** `/images/category-scarves.jpg`

## Image 4: scarves-product
- **URL:** https://upload.wikimedia.org/wikipedia/commons/e/e4/Cashmere_Wool_Scarves.jpg
- **License:** CC BY-SA 4.0
- **Subject:** Folded cashmere scarves on neutral background
- **Used in:** `[locale]/index.astro` products grid — second scarf card
- **Replace with:** `/images/category-shawls.jpg`

## Image 5: shawl
- **URL:** https://upload.wikimedia.org/wikipedia/commons/2/27/Embroidered-pashmina-shawl.jpg
- **License:** CC BY-SA 4.0
- **Subject:** Embroidered pashmina shawl
- **Used in:** `[locale]/index.astro` products grid — accessories or yarn card
- **Replace with:** `/images/category-accessories.jpg`

## Image 6: pashmina-hand
- **URL:** https://upload.wikimedia.org/wikipedia/commons/6/6d/Handwoven-kashmir-pashmina.jpg
- **License:** CC BY-SA 4.0
- **Subject:** Handwoven pashmina (craft close-up)
- **Used in:** `[locale]/index.astro` process / heritage section
- **Replace with:** `/images/process-weaving.jpg`

## Replacement checklist (run when factory photos are ready)

For each image above:
1. Place the real photo under `public/images/` with the planned filename.
2. Update the `<img src="...">` in `src/pages/[locale]/index.astro`.
3. Run `git add public/images/<file> && git commit -m "feat(media): add real factory photography replacing Wikimedia placeholders"`.
4. Delete this credit file once all six replacements land.