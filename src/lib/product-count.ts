/**
 * Product count helper.
 *
 * The catalogue size used to be hardcoded as "591" in half a dozen places
 * (llms-full.txt generator, the 404 page, the chat knowledge base).  Every
 * product batch made those numbers wrong, and a wrong product count in a
 * meta description is worse than no number at all: it tells Google the
 * catalogue is smaller than it is, and it looks stale to a buyer.
 *
 * The count is derived from the catalogue JSON at build time, so it stays
 * correct no matter how many batches land.
 */
import productsJson from '@/data/products.json';

/** Total number of products across every category in the catalogue. */
export const PRODUCT_COUNT: number = (() => {
  const categories = (productsJson as { categories?: { products?: unknown[] }[] }).categories ?? [];
  return categories.reduce((total, category) => total + (category.products?.length ?? 0), 0);
})();

/** Number of categories in the catalogue. */
export const CATEGORY_COUNT: number = (
  (productsJson as { categories?: unknown[] }).categories ?? []
).length;

/**
 * The count formatted for a sentence, e.g. "1,340 products".
 * English uses a thousands separator; other locales in the site copy use a
 * plain integer, so the separator is opt-in.
 */
export function formatProductCount(count: number = PRODUCT_COUNT, thousandsSeparator = true): string {
  if (!thousandsSeparator) return String(count);
  return count.toLocaleString('en-US');
}
