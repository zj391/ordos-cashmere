# Placeholder image credits — 2026 redesign (P0 + 7-22 升级)

This file tracks every placeholder image used in the 2026-07-22 visual
redesign. Each entry records: source URL, license, photographer credit,
the page/section it appears in, and the planned replacement (the real
DONGXIAO® factory photography once available).

> ⚠ All images below are sourced from Wikimedia Commons under CC
> BY-SA 4.0 or Public Domain. Once DONGXIAO supplies real factory
> photography, replace each `<img src="...">` with a local path under
> `/public/images/` and remove the credit entry.

> 📅 7-22 升级: 移除了错的 'Cashmere_Factory_Gobi_33'（实际是毛衣店
> 图，跟文件名不符），换成 Otog Qianqi 真实鄂尔多斯风景 + 蒙古山羊
> + 历史工厂外景。

## Image 1: heroFiber
- **URL:** https://upload.wikimedia.org/wikipedia/commons/6/66/Cashmere_Sweater.jpg
- **License:** CC BY-SA 4.0
- **Subject:** Cashmere sweater with goat on display (storefront)
- **Used in:** `[locale]/index.astro` hero (opacity-40 + Ken Burns — content barely visible)
- **Replace with:** `/images/hero-cashmere-knitwear.jpg` (factory-shot, lifestyle or
  macro fiber — once photographer delivers)

## Image 2: ordosLandscape ← NEW 7-22 (replaces factoryFloor)
- **URL:** https://upload.wikimedia.org/wikipedia/commons/d/d3/Otog_Qianqi%2C_Ordos%2C_Inner_Mongolia%2C_China_-_panoramio_%289%29.jpg
- **License:** CC BY-SA 3.0 (creator: panoramio 摩游乐)
- **Subject:** Real Ordos plateau landscape — desert + shrubs + dunes
- **Used in:** `[locale]/index.astro` Origin Story section
- **Replace with:** `/images/origin-ordos-landscape.jpg` (DONGXIAO Ordos plateau)

## Image 3: mongoliaGoat ← NEW 7-22 (replaces abstract SVG)
- **URL:** https://upload.wikimedia.org/wikipedia/commons/b/b1/Goat_in_Mongolia_01.jpg
- **License:** CC BY-SA 4.0
- **Subject:** Real cashmere goat on pasture, with green fiber-combed mark
- **Used in:** `[locale]/index.astro` Why us #1 "Pasture-Owned"
- **Replace with:** `/images/process-pasture-goat.jpg` (DONGXIAO herd)

## Image 4: knittingMill ← NEW 7-22 (replaces abstract SVG)
- **URL:** https://upload.wikimedia.org/wikipedia/commons/5/53/Strutwear_Knitting_Company_Factory_-_DPLA_-_ada8cf1c32797fd4fd2696eaa0b78489.jpg
- **License:** Public Domain (DPLA / Strutwear Knitting Company)
- **Subject:** Heritage knitting mill exterior (historical, snowy)
- **Used in:** `[locale]/index.astro` Why us #4 "Knitting Factory"
- **Replace with:** `/images/factory-knitting-mill.jpg` (DONGXIAO Ordos workshop)

## Image 5: craftHand
- **URL:** https://upload.wikimedia.org/wikipedia/commons/6/6d/Handwoven-kashmir-pashmina.jpg
- **License:** CC BY-SA 4.0
- **Subject:** Handwoven pashmina (craft close-up)
- **Used in:** `[locale]/index.astro` Why us #2 "Dehairing Facility" + Bento card #1
- **Replace with:** `/images/process-dehairing.jpg`

## Image 6: scarfDetail
- **URL:** https://upload.wikimedia.org/wikipedia/commons/9/95/Pashmina_scarf_with_woven_elephant_design_03.jpg
- **License:** CC BY-SA 4.0
- **Subject:** Woven scarf detail
- **Used in:** `[locale]/index.astro` Bento card #2 "Yarn & Fabric"
- **Replace with:** `/images/category-yarn.jpg`

## Image 7: scarvesFolded
- **URL:** https://upload.wikimedia.org/wikipedia/commons/e/e4/Cashmere_Wool_Scarves.jpg
- **License:** CC BY-SA 4.0
- **Subject:** Folded cashmere scarves on neutral background
- **Used in:** `[locale]/index.astro` Bento card #3 "Garment OEM"
- **Replace with:** `/images/category-garment.jpg`

## Image 8: shawlEmbroidered
- **URL:** https://upload.wikimedia.org/wikipedia/commons/2/27/Embroidered-pashmina-shawl.jpg
- **License:** CC BY-SA 4.0
- **Subject:** Embroidered pashmina shawl
- **Used in:** `[locale]/index.astro` Why us #3 "Spinning & Weaving"
- **Replace with:** `/images/process-spinning.jpg`

## Removed 7-22
- ~~factoryFloor~~ (Cashmere_Factory_Gobi_33 — was a storefront photo of
  cashmere store, NOT a factory interior; alt text was misleading)

## Replacement checklist (run when factory photos are ready)

For each image above:
1. Place the real photo under `public/images/` with the planned filename.
2. Update the `<img src="...">` in `src/pages/[locale]/index.astro`.
3. Run `git add public/images/<file> && git commit -m "feat(media): add real factory photography replacing Wikimedia placeholders"`.
4. Delete this credit file once all eight replacements land.