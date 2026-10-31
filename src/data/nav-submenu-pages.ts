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
  // Audience and use. The gender field on a hat record is empty on 62
  // of the 76 rows, so these pages read the product name instead.
  'hats/women': 'cashmere-hats/women',
  'hats/men': 'cashmere-hats/men',
  'hats/kids': 'cashmere-hats/kids',
  'hats/unisex': 'cashmere-hats/unisex',
  'hats/winter': 'cashmere-hats/winter',
  'hats/100pct-cashmere': 'cashmere-hats/pure-cashmere',
  // sport and fashion: the records do not separate the two, so the
  // entries keep their query filter.
  'hats/sport': null,
  'hats/fashion': null,

  // ---- sweaters -----------------------------------------------------
  'sweaters/cardigan': 'cashmere-sweaters/cardigans',
  'sweaters/pullover': 'cashmere-sweaters/pullovers',
  'sweaters/turtleneck': 'cashmere-sweaters/turtlenecks',
  'sweaters/vneck': 'cashmere-sweaters/v-neck',
  'sweaters/crew': 'cashmere-sweaters/crew-neck',
  'sweaters/vest': 'cashmere-sweaters/vests',
  'sweaters/zip': 'cashmere-sweaters/zip-neck',
  'sweaters/winter': 'cashmere-sweaters/autumn-winter',
  // The material entries. The blend ratio is what the material field
  // states, so the rule selects on the normalised family.
  'sweaters/100pct-cashmere': 'cashmere-sweaters/pure-cashmere',
  'sweaters/wool-cashmere': 'cashmere-sweaters/cashmere-wool',
  // two-ply, the gauge entries and the spring/fall and office entries:
  // the records do not carry enough to separate them, so they keep
  // their query filter. One sweater in 748 mentions a ply count, and
  // six mention a 12gg gauge and two a 16gg - not enough for a page.
  'sweaters/two-ply': null,
  'sweaters/heavy': null,
  'sweaters/gauge-12': null,
  'sweaters/gauge-16': null,
  'sweaters/spring-fall': null,
  'sweaters/office': null,

  // ---- scarves ------------------------------------------------------
  'scarves/scarf': 'cashmere-scarves/scarves',
  'scarves/shawl': 'cashmere-scarves/shawls',
  'scarves/wrap': 'cashmere-scarves/wraps',
  // Pattern. Printed and solid are quoted and sampled differently, so
  // they are separate pages rather than one "patterns" page.
  'scarves/printed': 'cashmere-scarves/printed',
  'scarves/plain': 'cashmere-scarves/solid',
  'scarves/tassel': 'cashmere-scarves/tassel',
  'scarves/100pct-cashmere': 'cashmere-sweaters/pure-cashmere',
  'scarves/wool-cashmere': 'cashmere-sweaters/cashmere-wool',
  // Use. A hijab scarf is bought as a hijab scarf.
  'scarves/hijab': 'cashmere-scarves/hijab',
  'scarves/winter': 'cashmere-scarves/winter',
  // poncho, pashmina, spring/fall, travel and gift: the records do not
  // separate them, so they keep their query filter.
  'scarves/poncho': null,
  'scarves/pashmina': null,
  'scarves/spring-fall': null,
  'scarves/travel': null,
  'scarves/gift': null,

  // ---- accessories --------------------------------------------------
  'accessories/gloves': 'cashmere-accessories/gloves',
  'accessories/socks': 'cashmere-accessories/socks',
  'accessories/100pct-cashmere': 'cashmere-sweaters/pure-cashmere',
  'accessories/women': 'cashmere-accessories/women',
  'accessories/men': 'cashmere-accessories/men',
  'accessories/kids': 'cashmere-accessories/kids',
  'accessories/unisex': 'cashmere-accessories/unisex',
  // leggings, pants, winter and lounge: the records do not separate
  // them, so they keep their query filter.
  'accessories/leggings': null,
  'accessories/pants': null,
  'accessories/winter': null,
  'accessories/lounge': null,

  // ---- yarn ---------------------------------------------------------
  // The count is the first question a knitter asks, and each of these
  // pages carries at least ten styles.
  'yarn/2-26': 'cashmere-yarn/2-26-nm',
  'yarn/2-36': 'cashmere-yarn/2-36-nm',
  'yarn/1-17': 'cashmere-yarn/1-17-nm',
  'yarn/1-43': 'cashmere-yarn/1-4-3-nm',
  'yarn/2-16': 'cashmere-yarn/2-16-nm',
  'yarn/3-68': 'cashmere-yarn/3-68-nm',
  'yarn/2-60': 'cashmere-yarn/2-60-nm',
  'yarn/2-80': 'cashmere-yarn/2-80-nm',
  // 1-65 (1/6.5 Nm) is listed in the menu but no record carries that
  // count, so it keeps its query filter.
  'yarn/1-65': null,
  // A cone and a hank are quoted on different terms - a cone is ready
  // for a machine knitter, a hank for a hand knitter.
  'yarn/cone': 'cashmere-yarn/cone',
  // The material entries. The yarn pages carry the same blend lines as
  // the sweaters.
  'yarn/100pct-cashmere': 'cashmere-yarn/pure-cashmere',
  'yarn/wool-cashmere': 'cashmere-yarn/cashmere-wool',
  'yarn/cashmere-linen': 'cashmere-yarn/cashmere-linen',
  'yarn/cashmere-yak': 'cashmere-yarn/cashmere-yak',
  'yarn/cashmere-silk': 'cashmere-yarn/cashmere-silk',
  'yarn/taiji-stone': 'cashmere-yarn/cashmere-taiji',
  // The application entries (knitting, weaving, sweater, scarf, coat,
  // underwear, sportswear, women's wear) are not a real split: every
  // one of the 169 yarn records carries both the "Machine Knitting"
  // and the "Weaving" tag, so there is nothing to separate. They keep
  // their query filter.
  'yarn/knitting': null,
  'yarn/weaving': null,
  'yarn/sweater': null,
  'yarn/scarf': null,
  'yarn/coat': null,
  'yarn/underwear': null,
  'yarn/sport': null,
  'yarn/womens': null,

  // ---- blankets -----------------------------------------------------
  'blankets/cashmere-throw': 'cashmere-blankets/pure-cashmere',
  'blankets/wool-blanket': 'cashmere-blankets/pure-wool',
  'blankets/baby-blanket': 'cashmere-blankets/baby-blankets',
  'blankets/travel-blanket': null,
  'blankets/100-cashmere': 'cashmere-blankets/pure-cashmere',
  'blankets/100-wool': 'cashmere-blankets/pure-wool',
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
