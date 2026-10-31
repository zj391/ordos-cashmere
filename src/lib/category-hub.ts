/**
 * The category hub URLs.
 *
 * 2026-10-31: the hubs moved from /[locale]/products/<slug>/ to
 * /[locale]/category/cashmere-<category>/.
 *
 * The old URLs were the ones Google had indexed and the ones other
 * sites had linked to, so they could not simply be dropped - they
 * now redirect. This module is the single place that names the new
 * URL for a category, so the navigation, the catalog footer, the
 * breadcrumb schema and the sitemap cannot drift apart.
 *
 * The old URL for each category, for reference:
 *
 *   hats        /products/hats-accessories/
 *   sweaters    /products/garment-oem/
 *   scarves     /products/scarves/
 *   accessories /products/accessories-cat/
 *   yarn        /products/yarn/
 */
import type { Locale } from '@/lib/i18n';

/** The catalogue categories that have a hub page. */
export type HubCategoryId = 'hats' | 'sweaters' | 'scarves' | 'accessories' | 'yarn' | 'blankets';

/**
 * The hub URL for each category, by locale.
 *
 * The blankets category did not have a legacy hub - the category was
 * added after the move - so it only has the new URL.
 */
export const CATEGORY_HUB_PATH: Record<HubCategoryId, string> = {
  hats: '/category/cashmere-hats/',
  sweaters: '/category/cashmere-sweaters/',
  scarves: '/category/cashmere-scarves/',
  accessories: '/category/cashmere-accessories/',
  yarn: '/category/cashmere-yarn/',
  blankets: '/category/cashmere-blankets/',
};

/** The hub URL for a category in a given locale. */
export function categoryHubHref(locale: Locale, category: HubCategoryId): string {
  return `/${locale}${CATEGORY_HUB_PATH[category]}`;
}
