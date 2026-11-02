/**
 * The locale-specific inputs for a product's SERP title.
 *
 * The title itself is built in product-seo-title.ts. What lives here is
 * everything that has to be the *same* for the build and for the
 * collision check in product-title-ref.ts: the budget per locale, the
 * localised category term, the buyer-intent prefix and the brand.
 *
 * Keeping them in one module is what makes the offline title simulation
 * (scripts/simulate-product-titles.ts) reproduce the real build - if
 * the two drift apart, the simulation optimises a title that never ships.
 */
export type TitleLocale = 'en' | 'cn' | 'de' | 'fr' | 'ja' | 'kr';

export const TITLE_LOCALES: TitleLocale[] = ['en', 'cn', 'de', 'fr', 'ja', 'kr'];

/**
 * The SERP title budget per locale.
 *
 * 2026-11-02: raised from 72/78 to 84/90 after measuring what the
 * parts actually cost.
 *
 * The title carries four things - the product name, the catalogue
 * reference, the localised category term and the brand - and the middle
 * two are not optional. The catalogue reference is the only field that
 * tells two catalogue entries with the same name apart (506 of the
 * 1,340 products share a name), and the localised category term is the
 * only part that differs between the six language versions of one
 * product (the catalogue names are English source strings on every
 * locale). The brand is 11 characters.
 *
 * Measuring the real catalogue: the reference is 18 characters, the
 * category term 21-28 in the Latin locales, the brand 11. That is
 * 50-57 characters of non-negotiable content, and at a 72-character
 * budget it left 15-22 for the product name - which cut "crew-neck
 * sweater" down to "crew-neck…" on 6,056 of the 8,040 product pages.
 *
 * 84 (Latin) / 90 (CJK) is the point where the product name survives
 * on the overwhelming majority of pages while the reference and the
 * category term still fit:
 *
 *   budget  name clipped   titles over 60   duplicate groups
 *   72/78        5,165            7,433              0
 *   84/90          809            8,046              0
 *   96/102         184            8,046              0
 *
 * 96/102 was not taken: it buys 625 fewer clipped names but pushes the
 * category term past the 60 characters a search result shows on 543
 * pages, and the category term is the part that keeps the language
 * versions of a product from competing with each other. 84/90 keeps
 * the category term inside the visible window on 95% of the pages.
 */
export const SEO_TITLE_MAX: Record<TitleLocale, number> = {
  en: 84, de: 84, fr: 84, cn: 90, ja: 90, kr: 90,
};

/**
 * The short form of the category term, used in the SERP title.
 *
 * The full names are right for the visible category label ("Cashmere
 * Sweaters & Knitwear") but too long for a title. These keep the fibre
 * and the product type and drop the second synonym and the trailing
 * qualifier.
 *
 * The localised term is the only part of the title that differs
 * between the language versions of one product - the catalogue names
 * are English source strings on every locale - so it is what keeps
 * those pages from competing with each other. It is therefore never
 * clipped: when the budget runs out, the product name gives way.
 */
export const LOCALE_CATEGORY_SHORT_NAMES: Record<TitleLocale, Record<string, string>> = {
  en: { hats: 'Cashmere Hats', sweaters: 'Cashmere Sweaters', scarves: 'Cashmere Scarves', accessories: 'Cashmere Accessories', yarn: 'Cashmere Yarn', blankets: 'Cashmere Blankets' },
  de: { hats: 'Kaschmir-Mützen', sweaters: 'Kaschmir-Pullover', scarves: 'Kaschmir-Schals', accessories: 'Kaschmir-Accessoires', yarn: 'Kaschmir-Garn', blankets: 'Kaschmir-Decken' },
  fr: { hats: 'Bonnets Cachemire', sweaters: 'Pulls Cachemire', scarves: 'Écharpes Cachemire', accessories: 'Accessoires Cachemire', yarn: 'Fil de Cachemire', blankets: 'Couvertures Cachemire' },
  ja: { hats: 'カシミアハット', sweaters: 'カシミアニット', scarves: 'カシミアスカーフ', accessories: 'カシミアアクセサリー', yarn: 'カシミアヤーン', blankets: 'カシミアブランケット' },
  kr: { hats: '캐시미어 모자', sweaters: '캐시미어 스웨터', scarves: '캐시미어 스카프', accessories: '캐시미어 액세서리', yarn: '캐시미어 원사', blankets: '캐시미어 담요' },
  cn: { hats: '羊绒帽', sweaters: '羊绒衫', scarves: '羊绒围巾', accessories: '羊绒配饰', yarn: '羊绒纱线', blankets: '羊绒毯' },
};

/**
 * The buyer-intent word for a category, per locale.
 *
 * "Wholesale" / "Großhandel" / "批发" is the modifier the B2B
 * buyers search with. It is a category-level term, so it is the same
 * for every product in the category and it does not need to be unique.
 *
 * 2026-10-31: it is NOT part of the product title any more. The title
 * has to carry four things - the product name, the catalogue reference,
 * the localised category term and the brand - and the buyer-intent word
 * was the one part that added no information to a product page: every
 * product page is a wholesale offer, and the word is already on the
 * category pages and the homepage. Spending 10 characters of the
 * product budget on it meant the catalogue reference fell outside the
 * 60 characters a search result shows.
 *
 * The word stays on the category pages, where it is what the page is
 * about.
 */
export const BUYER_INTENT_PREFIX: Record<TitleLocale, Record<string, string>> = {
  en: { hats: 'Wholesale', sweaters: 'Wholesale', scarves: 'Wholesale', accessories: 'Wholesale', yarn: 'Wholesale', blankets: 'Wholesale' },
  de: { hats: 'Großhandel', sweaters: 'Großhandel', scarves: 'Großhandel', accessories: 'Großhandel', yarn: 'Großhandel', blankets: 'Großhandel' },
  fr: { hats: 'Grossiste', sweaters: 'Grossiste', scarves: 'Grossiste', accessories: 'Grossiste', yarn: 'Grossiste', blankets: 'Grossiste' },
  ja: { hats: '卸売り', sweaters: '卸売り', scarves: '卸売り', accessories: '卸売り', yarn: '卸売り', blankets: '卸売り' },
  kr: { hats: '도매', sweaters: '도매', scarves: '도매', accessories: '도매', yarn: '도매', blankets: '도매' },
  cn: { hats: '批发', sweaters: '批发', scarves: '批发', accessories: '批发', yarn: '批发', blankets: '批发' },
};

/** The brand suffix per locale. */
export function productTitleBrand(locale: string): string {
  return locale === 'cn' ? '东霄羊绒' : 'DONGXIAO';
}

/** The short localised category term, with a fallback for unknown categories. */
export function shortLocalizedCategory(categoryId: string, locale: string, fallback: string): string {
  const map = LOCALE_CATEGORY_SHORT_NAMES[locale as TitleLocale];
  if (map && map[categoryId]) return map[categoryId];
  return fallback;
}

/**
 * The category term with the buyer-intent word in front.
 *
 * The prefix is skipped when the base already carries a wholesale-style
 * word, so "Wholesale Cashmere Sweaters" never becomes "Wholesale
 * Wholesale Cashmere Sweaters".
 */
export function buyerModifiedCategory(categoryId: string, locale: string, base: string): string {
  const prefix = BUYER_INTENT_PREFIX[locale as TitleLocale]?.[categoryId];
  if (!prefix) return base;
  if (/(wholesale|grossist|großhandel|卸売|도매|批发)/i.test(base)) return base;
  return `${prefix} ${base}`;
}

/**
 * The localised category term that goes into the title.
 *
 * 2026-10-31: no buyer-intent prefix. The prefix cost 10 characters of
 * a 72-character budget and told the buyer nothing they could not see
 * on the category page they came from - every product page is a
 * wholesale offer. The term is what separates the language versions of
 * one product, so it is the one part that never gets clipped.
 */
export function productTitleCategory(categoryId: string, locale: string, fallback: string): string {
  return shortLocalizedCategory(categoryId, locale, fallback);
}
