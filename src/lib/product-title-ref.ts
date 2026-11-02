/**
 * Which product pages need a catalogue reference in their title.
 *
 * 2026-10-31: the catalogue has 1,340 products and 506 of them share
 * their `name` with another product - the name is a category plus a
 * colour ("Cashmere crew-neck sweater - Grey"), and 92 different SKUs
 * carry exactly that one name. The title builder assembles the title
 * from the catalogue fields, so all 92 produced the same title.
 *
 * 1,788 indexable pages shipped with a title that another page also used.
 * That is the classic thin-duplicate signal: Google can only pick one of
 * them for a query, and the rest compete with it for the same terms.
 *
 * The reference is the only field that tells two catalogue entries apart
 * in the groups where no other field does - and it is already on the
 * page under "Reference" and in the Product schema as sku and mpn, so
 * appending it states nothing the page does not already show.
 *
 * The reference is expensive though: " - Ref DXE-A011-2" is 18 characters
 * of a 72-character budget, and the pages that need it are the ones whose
 * titles are tightest. So it is added to the pages whose *title* actually
 * collides with another page's title - not to every page whose *name* is
 * shared.
 *
 * Two products with the same name but a different size ("150x200" vs
 * "140x180") get different titles from the size facet and need no
 * reference at all. That keeps the reference off the pages that do not
 * need it and leaves their budget for the specs that do separate them.
 */
import { getAllProducts } from '@/data/products';
import { buildProductSeoTitle } from '@/lib/product-seo-title';
import { productTitleBrand, productTitleCategory, SEO_TITLE_MAX } from '@/lib/product-title-context';

type Locale = keyof typeof SEO_TITLE_MAX;

const LOCALES: Locale[] = ['en', 'cn', 'de', 'fr', 'ja', 'kr'];

/**
 * The ids whose title collides with another page's title.
 *
 * The union over all six locales: a product that collides in German
 * collides in English too, because the catalogue names are English
 * source strings on every locale and the specs are the same. Deciding it
 * per locale would let the reference appear on some language versions of
 * a product and not on others, which is worse than a uniform rule.
 *
 * Memoised, because the answer is asked once per product page and the
 * catalogue does not change during a build. The first call has to happen
 * after the database overlay has landed - the overlay can rename a
 * product and add new ones - so the product route calls
 * primeTitleReferenceCache() right after ensureDbOverlay().
 */
let collidingIds: Set<string> | null = null;

/**
 * The titles each product would have without a reference.
 *
 * Kept for the diagnostics script (scripts/inspect-product-title.ts),
 * which shows what the page would look like with and without.
 */
const builtTitles = new Map<Locale, Map<string, string>>();

function computeCollisions(): Set<string> {
  const products = getAllProducts();
  const ids = new Set<string>();

  for (const locale of LOCALES) {
    const brand = productTitleBrand(locale);
    const budget = SEO_TITLE_MAX[locale];
    const byTitle = new Map<string, string[]>();

    for (const product of products) {
      const category = productTitleCategory(product.categoryId, locale, product.categoryName ?? '');
      const title = buildProductSeoTitle(product as never, category, brand, budget, locale);
      const list = byTitle.get(title) ?? [];
      list.push(product.id);
      byTitle.set(title, list);
    }

    const titles = new Map<string, string>();
    for (const product of products) {
      const category = productTitleCategory(product.categoryId, locale, product.categoryName ?? '');
      titles.set(
        product.id,
        buildProductSeoTitle(product as never, category, brand, budget, locale),
      );
    }
    builtTitles.set(locale, titles);

    for (const list of byTitle.values()) {
      if (list.length > 1) {
        for (const id of list) ids.add(id);
      }
    }
  }

  return ids;
}

/**
 * Build the cache from the current catalogue.
 *
 * Call this once the catalogue is final - after the database overlay has
 * been applied - so the set reflects the products the pages will render.
 */
export function primeTitleReferenceCache(): void {
  collidingIds = computeCollisions();
}

/** True when this product's title collides with another page's title. */
export function needsTitleReference(productId: string, locale: string = 'en'): boolean {
  if (!collidingIds) collidingIds = computeCollisions();
  return collidingIds.has(productId);
}

/** The title this product would have without a reference. Diagnostics only. */
export function titleWithoutReference(productId: string, locale: string = 'en'): string {
  const key = (['en', 'de', 'fr', 'ja', 'kr', 'cn'].includes(locale) ? locale : 'en') as Locale;
  let map = builtTitles.get(key);
  if (!map) {
    if (!collidingIds) collidingIds = computeCollisions();
    map = builtTitles.get(key)!;
  }
  return map.get(productId) ?? '';
}
