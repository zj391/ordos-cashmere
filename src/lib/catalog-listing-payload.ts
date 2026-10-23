/**
 * jevseo 2026-10-23 JEV-008: catalog listing payload builders.
 *
 * /[locale]/products/ used to inline both of these as
 * <script type="application/json"> blocks, which made the document 635 KB
 * (322 KB products + 86 KB tags = 66% payload). scripts/extract-product-data-files.mjs
 * scraped them into /data/<locale>/*.json, but once the inline copies were
 * removed the scraper had nothing left to read.
 *
 * Both the page and the /data/<locale>/*.json endpoints import from here, so
 * the two payloads are produced by identical code and cannot drift.
 */
import { tagAllProducts } from '@/data/product-tags';
import type { Product } from '@/data/products';

/**
 * jevseo 2026-10-19 JEV-008: inline products-data had grown to 518 KB raw /
 * ~90 KB gzipped because each product carried a flat `tags` array of 30+
 * marketing strings ("Wholesale", "Custom Colors", "Mongolian Cashmere", …)
 * that the listing JS never reads in full. The only consumers are the card
 * subtitle and the compare modal, which need ~5 tags per product.
 */
export const LISTING_FIELDS = [
  'id', 'name', 'categoryId', 'categoryName',
  'material', 'micron', 'moq', 'price', 'lead',
  'images', 'tags',
] as const;

/**
 * jevseo 2026-10-19: also patched the silent missing-field bug where the
 * compare modal read product.moq / product.price / product.lead but those
 * were never serialised in LISTING_FIELDS, so the column always rendered `—`.
 */
const LISTING_TAG_KEEP =
  /women|men|kids|unisex|ladies|girls|boys|outerwear|winter|spring|summer|fall|autumn|FW|AW|SS|year[- ]round|reversible|houndstooth|cable|herringbone|solid|chunky|jacquard|fisherman|custom|color|logo|oem|odm|private label|bespoke/i;

export function pickListFields<T extends Record<string, any>>(p: T): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of LISTING_FIELDS) out[k] = p[k];
  if (Array.isArray(out.tags)) {
    out.tags = (out.tags as string[]).filter((t) => LISTING_TAG_KEEP.test(t));
  }
  return out;
}

/** The curated product list the listing grid and the compare modal read. */
export function buildListingProducts(allProducts: readonly Product[]): Array<Record<string, unknown>> {
  return allProducts.map(pickListFields);
}

/**
 * Serializable tags index: { productId: ["byStyle=beanies", "byMaterial=100pct-cashmere", …] }
 * Pre-tagged once at build time so URL params (e.g. ?byStyle=beanies) from the
 * mega menu can filter the grid client-side.
 */
export function buildListingTagsIndex(
  allProducts: readonly Product[]
): Record<string, string[]> {
  const tagsMap = tagAllProducts();
  return Object.fromEntries(
    allProducts.map((product) => [product.id, Array.from(tagsMap.get(product.id) || [])])
  );
}