/**
 * Mapping from the navigation mega-menu entries to the classified
 * landing pages.
 *
 * The mega menu used to render every second level entry as
 *
 *     /[locale]/products?cat=<category>&<group>=<key>
 *
 * a query filter on the single products list page. Every entry
 * therefore landed on the same page, and a buyer who wanted "cashmere
 * V-neck sweaters" got the whole catalogue with a filter applied by
 * JavaScript - which Google does not run, so none of it was indexable
 * and none of it could be linked to.
 *
 * Now that the catalogue is classified (src/data/taxonomy.ts), each
 * menu entry points at a real static page:
 *
 *     /[locale]/category/cashmere-sweaters/v-neck/
 *
 * The key on the left is "<category id>/<menu key>" - the menu key
 * comes from src/data/nav-submenus.json. The value is
 * "cashmere-<category id>/<page slug>" - the page slug is the taxonomy
 * slug, which is not always the same string as the menu key.
 *
 * An entry maps to a page when the taxonomy produces one. Entries with
 * no matching page keep the query-filter link, because a working
 * filtered list beats a 404 - but they are listed here with a null so
 * the gap is visible rather than silent.
 *
 * A page needs at least three products, so an entry with only one or
 * two matching styles has no page to point at. The filter link still
 * resolves on the products page: the tag index carries the matching
 * styles for those keys.
 */
import type { Locale } from '@/lib/i18n';

/**
 * The classified page a menu entry points at.
 *
 * The key is "<category id>/<menu key>"; the value is
 * "cashmere-<category id>/<page slug>", or null when the taxonomy
 * produces no page for that entry.
 */
export const NAV_SUBMENU_PAGE: Record<string, string | null> = {
  // ---- hats ---------------------------------------------------------
  'hats/beanies': 'cashmere-hats/beanies',
  'hats/caps': null,
  'hats/berets': 'cashmere-hats/berets',
  // headbands: one product matches, so there is no page to link to.
  'hats/headbands': null,

  // ---- sweaters -----------------------------------------------------
  'sweaters/cardigan': 'cashmere-sweaters/cardigans',
  'sweaters/pullover': 'cashmere-sweaters/pullovers',
  'sweaters/turtleneck': 'cashmere-sweaters/turtlenecks',
  'sweaters/vneck': 'cashmere-sweaters/v-neck',
  'sweaters/crew': 'cashmere-sweaters/crew-neck',
  'sweaters/vest': 'cashmere-sweaters/vests',
  'sweaters/zip': 'cashmere-sweaters/zip-neck',
  'sweaters/hoodie': 'cashmere-sweaters/hooded',
  'sweaters/polo': 'cashmere-sweaters/polo-collar',
  'sweaters/mock': 'cashmere-sweaters/mock-neck',
  // cowl-neck: one product matches, so there is no page to link to.
  'sweaters/cowl': null,
  'sweaters/high': 'cashmere-sweaters/high-neck',
  // coats: two products match, so there is no page to link to.
  'sweaters/coats': null,
  'sweaters/dresses': 'cashmere-sweaters/dresses',
  'sweaters/pants': 'cashmere-sweaters/pants',
  'sweaters/women': 'cashmere-sweaters/women',
  'sweaters/men': 'cashmere-sweaters/men',
  // unisex: no product carries the field, so there is no page to link to.
  'sweaters/unisex': null,
  'sweaters/winter': 'cashmere-sweaters/autumn-winter',

  // ---- scarves ------------------------------------------------------
  'scarves/scarf': 'cashmere-scarves/scarves',
  'scarves/shawl': 'cashmere-scarves/shawls',
  'scarves/wrap': 'cashmere-scarves/wraps',

  // ---- accessories --------------------------------------------------
  'accessories/gloves': 'cashmere-accessories/gloves',
  'accessories/socks': 'cashmere-accessories/socks',

  // ---- yarn ---------------------------------------------------------
  'yarn/yarn': 'cashmere-yarn/yarn',

  // ---- blankets ------------------------------------------------------
  // The catalogue splits the blankets on material (14 wool, 9 cashmere)
  // and on the baby size, and the menu asks for both.
  'blankets/cashmere-throw': 'cashmere-blankets/pure-cashmere',
  'blankets/wool-blanket': 'cashmere-blankets/pure-wool',
  'blankets/baby-blanket': 'cashmere-blankets/baby-blankets',
  'blankets/travel-blanket': null,
  'blankets/100-cashmere': 'cashmere-blankets/pure-cashmere',
  'blankets/100-wool': 'cashmere-blankets/pure-wool',

  // ---- material -----------------------------------------------------
  // The byMaterial group appears on several categories, and the
  // material pages live under the category that carries them.
  'hats/100pct-cashmere': 'cashmere-sweaters/pure-cashmere',
  'sweaters/100pct-cashmere': 'cashmere-sweaters/pure-cashmere',
  'sweaters/wool-cashmere': 'cashmere-sweaters/cashmere-wool',
  'scarves/100pct-cashmere': 'cashmere-sweaters/pure-cashmere',
  'scarves/wool-cashmere': 'cashmere-sweaters/cashmere-wool',
  'accessories/100pct-cashmere': 'cashmere-sweaters/pure-cashmere',
  'yarn/100pct-cashmere': 'cashmere-yarn/pure-cashmere',
  'yarn/wool-cashmere': 'cashmere-yarn/cashmere-wool',
  'yarn/cashmere-linen': 'cashmere-yarn/cashmere-linen',
  'yarn/cashmere-yak': 'cashmere-yarn/cashmere-yak',
  'yarn/cashmere-silk': 'cashmere-yarn/cashmere-silk',
  'yarn/taiji-stone': 'cashmere-yarn/cashmere-taiji',
};

/**
 * The URL for a mega-menu entry.
 *
 * Falls back to the query-filter link when the taxonomy has no page for
 * that entry.
 */
export function submenuHref(
  locale: Locale,
  categorySlug: string,
  groupKey: string,
  subKey: string,
  fallbackHref: string,
): string {
  const page = NAV_SUBMENU_PAGE[`${categorySlug}/${subKey}`];
  if (page) {
    const [cat, sub] = page.split('/');
    return `/${locale}/category/${cat}/${sub}/`;
  }
  return `${fallbackHref}&${groupKey}=${subKey}`;
}
