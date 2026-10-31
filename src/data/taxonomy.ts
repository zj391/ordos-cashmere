/**
 * Product classification taxonomy.
 *
 * The catalogue is organised on three axes:
 *
 *   1. category  - what the product is (hats, sweaters, scarves, ...)
 *   2. subtype   - the style within that category (beanie, cardigan, ...)
 *   3. attribute - a property of the style (neckline, gender, season, ...)
 *
 * Pages exist for the category, for the subtype, and for the
 * category+attribute combination, because those are the three ways a
 * buyer actually searches: "cashmere sweaters" (category), "cashmere
 * cardigans" (subtype), "cashmere V-neck sweaters" (category+neckline).
 *
 * The previous setup only had the five category hubs plus a handful of
 * hand-written tag pages, so every submenu entry landed on the same
 * aggregated listing and a buyer searching for a V-neck sweater could
 * not reach one.
 *
 * Every rule here is a matcher against the product record: the collar
 * field, the name, or the tag list. The data is not perfectly clean -
 * "V-neck", "V-Neck" and "V Neck" all appear - so the matchers
 * normalise before comparing.
 */
import type { Locale } from '@/lib/i18n';

/** The six catalogue categories. */
export type CategoryId =
  | 'hats'
  | 'sweaters'
  | 'scarves'
  | 'accessories'
  | 'yarn'
  | 'blankets';

/** The normalised neckline values the collar field collapses into. */
export type Neckline =
  | 'crew-neck'
  | 'v-neck'
  | 'turtleneck'
  | 'mock-neck'
  | 'cowl-neck'
  | 'high-neck'
  | 'polo-collar'
  | 'zip-neck'
  | 'hood'
  | 'sleeveless'
  | 'boat-neck'
  | 'off-shoulder'
  | 'shawl-collar'
  | 'henley'
  | 'square-neck'
  | 'waistband';

export type AttributeId =
  | 'neckline'
  | 'gender'
  | 'season'
  | 'material'
  | 'count'
  | 'form'
  | 'pattern'
  | 'audience'
  | 'use';

/**
 * Collapse the raw `collar` string into a neckline.
 *
 * Returns null when the value carries no neckline information - the
 * yarn products record "N/A (yarn product)" and many accessories and
 * scarves leave the field empty.
 */
export function normaliseNeckline(raw: unknown): Neckline | null {
  if (raw === null || raw === undefined) return null;
  const s = String(raw).trim().toLowerCase();
  if (!s) return null;
  if (s.startsWith('n/a') || s === 'na' || s === 'none') return null;

  if (s.includes('v-neck') || s.includes('v neck') || s.includes('vneck')) return 'v-neck';
  if (s.includes('crew')) return 'crew-neck';
  if (s.includes('turtle')) return 'turtleneck';
  if (s.includes('mock')) return 'mock-neck';
  if (s.includes('cowl')) return 'cowl-neck';
  if (s.includes('high neck')) return 'high-neck';
  if (s.includes('notch') || s.includes('shirt collar') || s.includes('polo')) return 'polo-collar';
  if (s.includes('stand') || s.includes('half zip') || s.includes('zip')) return 'zip-neck';
  if (s.includes('hood')) return 'hood';
  if (s.includes('sleeveless') || s.includes('tank')) return 'sleeveless';
  if (s.includes('boat')) return 'boat-neck';
  if (s.includes('off-shoulder') || s.includes('off shoulder')) return 'off-shoulder';
  if (s.includes('shawl')) return 'shawl-collar';
  if (s.includes('henley')) return 'henley';
  if (s.includes('square neck')) return 'square-neck';
  if (s.includes('waist') || s.includes('elastic') || s.includes('drawstring')) return 'waistband';

  return null;
}

/** Normalise the gender field. */
export function normaliseGender(raw: unknown): 'women' | 'men' | 'unisex' | null {
  if (raw === null || raw === undefined) return null;
  const s = String(raw).trim().toLowerCase();
  if (!s) return null;
  if (s.includes('women') || s.includes('ladies') || s.includes('womens')) return 'women';
  if (s.includes('men') && !s.includes('women')) return 'men';
  if (s.includes('unisex') || s.includes('all')) return 'unisex';
  return null;
}

/** Normalise the season field into a broad bucket. */
export function normaliseSeason(raw: unknown): 'autumn-winter' | 'spring-summer' | 'all-season' | null {
  if (raw === null || raw === undefined) return null;
  const s = String(raw).trim().toLowerCase();
  if (!s) return null;
  if (s.includes('year') || s.includes('all season')) return 'all-season';
  const cold = ['fw', 'autumn', 'winter', 'fall', '冬'];
  const warm = ['spring', 'summer', '春夏'];
  const hasCold = cold.some((k) => s.includes(k));
  const hasWarm = warm.some((k) => s.includes(k));
  if (hasCold && hasWarm) return 'all-season';
  if (hasCold) return 'autumn-winter';
  if (hasWarm) return 'spring-summer';
  return null;
}

/**
 * The material family of a product.
 *
 * The material field is free text and inconsistent in case and in the
 * order of the blend ("30% Cashmere 70% Wool" against "30% cashmere
 * 70% wool"), so the value is matched on the blend ratio rather than
 * compared as a string.
 */
export type MaterialFamily =
  | 'pure-cashmere'
  | 'cashmere-wool'
  | 'cashmere-silk'
  | 'cashmere-linen'
  | 'cashmere-yak'
  | 'cashmere-taiji'
  | 'pure-wool'
  | 'pure-merino';

export function normaliseMaterial(raw: unknown): MaterialFamily | null {
  if (raw === null || raw === undefined) return null;
  const s = String(raw).trim().toLowerCase();
  if (!s) return null;

  const has = (t: string) => s.includes(t);
  const pct = (t: string) => {
    const m = s.match(new RegExp(`(\\d+(?:\\.\\d+)?)\\s*%\\s*${t}`));
    return m ? parseFloat(m[1]) : 0;
  };

  const cashmerePct = pct('cashmere');
  const woolPct = pct('wool');
  const silkPct = pct('silk');
  const linenPct = pct('linen');
  const yakPct = pct('yak');
  const taijiPct = pct('taiji');

  // The blends are checked most-specific first. A taiji blend also
  // contains cashmere and wool, so checking the two-ingredient
  // families first would swallow it and the taiji page would never
  // fill: "10% Cashmere 40% Wool 50% Taiji Stone Fiber" reads as
  // cashmere-wool before the taiji line is ever looked at.
  if (cashmerePct >= 95) return 'pure-cashmere';
  if (cashmerePct > 0 && taijiPct > 0) return 'cashmere-taiji';
  if (cashmerePct > 0 && yakPct > 0) return 'cashmere-yak';
  if (cashmerePct > 0 && silkPct > 0) return 'cashmere-silk';
  if (cashmerePct > 0 && linenPct > 0) return 'cashmere-linen';
  if (cashmerePct > 0 && woolPct > 0) return 'cashmere-wool';
  if (has('merino')) return 'pure-merino';
  if (woolPct >= 95) return 'pure-wool';

  // Fall back on the wording when no percentages were given.
  if (has('cashmere') && !has('wool') && !has('silk')) return 'pure-cashmere';
  if (has('cashmere') && has('wool')) return 'cashmere-wool';
  return null;
}

/**
 * The yarn count (Nm) of a product.
 *
 * The count is the number a spinner and a knitter order against, and it
 * is the question buyers ask most often about yarn: "2/26 or 2/60?"
 * It appears in the product name ("2/26Nm Cashmere Yarn") and, for the
 * records whose name only states the fibre, in the pattern field
 * ("Single strand; 2-ply twisted") or the tags.
 *
 * The value is returned as it is written - "2/26" - because that is
 * both the URL segment and the way the industry writes it.
 */
export function normaliseCount(raw: unknown): string | null {
  if (raw === null || raw === undefined) return null;
  const s = String(raw).trim().toLowerCase();
  if (!s) return null;
  // 2/26 Nm, 2/26nm, 2/ 26 Nm, 1/4.3 Nm - the denominator is a
  // decimal on some counts, so the number pattern has to allow it.
  const m = s.match(/(\d{1,2})\s*\/\s*(\d{1,3}(?:\.\d+)?)\s*nm/);
  if (m) return `${m[1]}/${m[2]}`;
  return null;
}

/**
 * The physical form of a yarn: cone, hank or skein.
 *
 * A mill quotes a cone and a hank on different terms - a cone is
 * ready for a machine knitter, a hank for a hand knitter - so this is
 * a real buying distinction rather than a synonym list.
 */
export function normaliseForm(raw: unknown): 'cone' | 'hank' | 'skein' | null {
  if (raw === null || raw === undefined) return null;
  const s = String(raw).trim().toLowerCase();
  if (!s) return null;
  if (s.includes('cone')) return 'cone';
  if (s.includes('hank')) return 'hank';
  if (s.includes('skein')) return 'skein';
  return null;
}

/**
 * The pattern of a woven product.
 *
 * Only the patterns that carry a buying decision are recognised:
 * a buyer who wants printed scarves does not want plain ones, and the
 * two are priced and sampled differently.
 */
export function normalisePattern(raw: unknown): 'printed' | 'solid' | 'tassel' | 'plaid' | 'check' | null {
  if (raw === null || raw === undefined) return null;
  const s = String(raw).trim().toLowerCase();
  if (!s) return null;
  if (s.includes('plaid') || s.includes('tartan')) return 'plaid';
  if (s.includes('houndstooth') || s.includes('herringbone')) return 'check';
  if (s.includes('check')) return 'check';
  if (s.includes('tassel') || s.includes('fringe')) return 'tassel';
  if (s.includes('print') || s.includes('jacquard') || s.includes('paisley')) return 'printed';
  if (s.includes('solid') || s.includes('plain')) return 'solid';
  return null;
}

/**
 * The audience a style is aimed at, read from the product name.
 *
 * The gender field on the record is mostly empty - 62 of the 76 hats
 * carry no gender at all - and where it is filled it says "all" or
 * "Women" in a way that does not match the name. The name is what the
 * buyer reads, so it is the field that decides.
 */
export function normaliseAudience(raw: unknown): 'women' | 'men' | 'kids' | 'unisex' | null {
  if (raw === null || raw === undefined) return null;
  const s = String(raw).trim().toLowerCase();
  if (!s) return null;
  if (s.includes('kid') || s.includes('child') || s.includes('baby') || s.includes('infant')) return 'kids';
  if (s.includes('unisex') || s.includes('men and women') || s.includes('women and men')) return 'unisex';
  if (s.includes('men') && !s.includes('women')) return 'men';
  if (s.includes('women') || s.includes('lady') || s.includes('ladies')) return 'women';
  return null;
}

/**
 * The use a style is bought for.
 *
 * This is the scarf and hat equivalent of the season field: a buyer
 * looking for a hijab scarf or a winter hat is asking about use, not
 * about fibre.
 */
export function normaliseUse(raw: unknown): 'hijab' | 'gift' | 'travel' | 'winter' | null {
  if (raw === null || raw === undefined) return null;
  const s = String(raw).trim().toLowerCase();
  if (!s) return null;
  if (s.includes('hijab')) return 'hijab';
  if (s.includes('gift')) return 'gift';
  if (s.includes('travel')) return 'travel';
  if (s.includes('winter') || s.includes('fw') || s.includes('autumn')) return 'winter';
  return null;
}

/** A product subtype: a style within a category. */
export type SubtypeRule = {
  id: string;
  categoryId: CategoryId;
  /** Substring matched against the lowercased name and tag list. */
  match: string[];
  /** Product types that must NOT be in this subtype. */
  exclude?: string[];
};

export type AttributeRule = {
  id: string;
  categoryId: CategoryId;
  attribute: AttributeId;
  /** The normalised value this rule selects. */
  value: string;
};

/**
 * The subtype rules, per category.
 *
 * These are the style-level entries a buyer looks for. They are listed
 * most specific first, because the matcher applies them in order and a
 * product takes the first rule it matches.
 */
export const SUBTYPE_RULES: SubtypeRule[] = [
  // ---- Sweaters -------------------------------------------------------
  { id: 'cardigans', categoryId: 'sweaters', match: ['cardigan', 'cardigan coat'] },
  { id: 'pullovers', categoryId: 'sweaters', match: ['pullover', 'jumper'] },
  { id: 'turtlenecks', categoryId: 'sweaters', match: ['turtleneck', 'turtleneck sweater'] },
  { id: 'hoodies', categoryId: 'sweaters', match: ['hoodie', 'hooded sweater', 'hooded sweatshirt'] },
  { id: 'vests', categoryId: 'sweaters', match: ['vest', 'sleeveless sweater', 'waistcoat'] },
  { id: 'polo-sweaters', categoryId: 'sweaters', match: ['polo sweater', 'polo neck sweater'] },
  { id: 'sweatshirts', categoryId: 'sweaters', match: ['sweatshirt'] },
  { id: 'coats', categoryId: 'sweaters', match: ['coat', 'overcoat', 'duster', 'cape'] },
  { id: 'dresses', categoryId: 'sweaters', match: ['dress', 'skirt'] },
  { id: 'pants', categoryId: 'sweaters', match: ['pants', 'trousers', 'legging'] },
  { id: 'sweaters', categoryId: 'sweaters', match: ['sweater', 'knitwear', 'jumper'] },

  // ---- Hats -----------------------------------------------------------
  { id: 'beanies', categoryId: 'hats', match: ['beanie', 'watch cap'] },
  { id: 'berets', categoryId: 'hats', match: ['beret'] },
  { id: 'fedora-hats', categoryId: 'hats', match: ['fedora', 'trilby', 'wide brim hat', 'bucket hat'] },
  { id: 'headbands', categoryId: 'hats', match: ['headband', 'ear warmer', 'neck warmer'] },
  { id: 'hats', categoryId: 'hats', match: ['hat', 'cap'] },

  // ---- Scarves --------------------------------------------------------
  { id: 'shawls', categoryId: 'scarves', match: ['shawl'], exclude: ['shawl collar', 'shawl coat'] },
  { id: 'wraps', categoryId: 'scarves', match: ['wrap', 'stole', 'poncho', 'cape scarf'] },
  { id: 'scarves', categoryId: 'scarves', match: ['scarf'] },

  // ---- Accessories ----------------------------------------------------
  { id: 'gloves', categoryId: 'accessories', match: ['glove', 'mitten'] },
  { id: 'socks', categoryId: 'accessories', match: ['sock'] },
  { id: 'belts', categoryId: 'accessories', match: ['belt'] },
  { id: 'accessories', categoryId: 'accessories', match: ['accessor', 'gift set', 'set'] },

  // ---- Yarn -----------------------------------------------------------
  { id: 'yarn', categoryId: 'yarn', match: ['yarn', 'worsted', 'thread'] },

  // ---- Blankets -------------------------------------------------------
  { id: 'baby-blankets', categoryId: 'blankets', match: ['baby blanket'] },
  { id: 'blankets', categoryId: 'blankets', match: ['blanket', 'throw', 'bedspread'] },
];

/**
 * The category + attribute rules.
 *
 * A neckline page is only generated for the categories where a neckline
 * is meaningful: a scarf has no neckline, and a page for "scarves with a
 * V-neck" would be nonsense.
 */
export const ATTRIBUTE_RULES: AttributeRule[] = [
  // Sweaters - the neckline pages a buyer actually asks for.
  { id: 'v-neck', categoryId: 'sweaters', attribute: 'neckline', value: 'v-neck' },
  { id: 'crew-neck', categoryId: 'sweaters', attribute: 'neckline', value: 'crew-neck' },
  { id: 'turtlenecks', categoryId: 'sweaters', attribute: 'neckline', value: 'turtleneck' },
  { id: 'mock-neck', categoryId: 'sweaters', attribute: 'neckline', value: 'mock-neck' },
  { id: 'cowl-neck', categoryId: 'sweaters', attribute: 'neckline', value: 'cowl-neck' },
  { id: 'zip-neck', categoryId: 'sweaters', attribute: 'neckline', value: 'zip-neck' },
  { id: 'polo-collar', categoryId: 'sweaters', attribute: 'neckline', value: 'polo-collar' },
  { id: 'hooded', categoryId: 'sweaters', attribute: 'neckline', value: 'hood' },
  { id: 'sleeveless', categoryId: 'sweaters', attribute: 'neckline', value: 'sleeveless' },
  { id: 'high-neck', categoryId: 'sweaters', attribute: 'neckline', value: 'high-neck' },

  // Scarves and hats have no neckline, but the accessories that wrap do.
  { id: 'women', categoryId: 'sweaters', attribute: 'gender', value: 'women' },
  { id: 'men', categoryId: 'sweaters', attribute: 'gender', value: 'men' },
  { id: 'unisex', categoryId: 'sweaters', attribute: 'gender', value: 'unisex' },
  { id: 'autumn-winter', categoryId: 'sweaters', attribute: 'season', value: 'autumn-winter' },

  // Material - the other dimension a buyer filters on. The blend ratio
  // is what the material field actually states, so the rule selects on
  // the normalised family rather than on the raw string.
  { id: 'pure-cashmere', categoryId: 'sweaters', attribute: 'material', value: 'pure-cashmere' },
  { id: 'cashmere-wool', categoryId: 'sweaters', attribute: 'material', value: 'cashmere-wool' },
  { id: 'cashmere-silk', categoryId: 'sweaters', attribute: 'material', value: 'cashmere-silk' },
  { id: 'cashmere-linen', categoryId: 'sweaters', attribute: 'material', value: 'cashmere-linen' },
  { id: 'cashmere-yak', categoryId: 'sweaters', attribute: 'material', value: 'cashmere-yak' },
  { id: 'cashmere-taiji', categoryId: 'sweaters', attribute: 'material', value: 'cashmere-taiji' },

  // Every hat in the catalogue is 100% cashmere, but the page still
  // answers the question a buyer asks ("pure cashmere hats, not a
  // blend") and the other material entries in the menu point at the
  // yarn and scarf equivalents.
  { id: 'pure-cashmere', categoryId: 'hats', attribute: 'material', value: 'pure-cashmere' },

  // Blankets split cleanly on material - 14 wool, 9 cashmere - and
  // that is the question a buyer asks about a blanket.
  { id: 'pure-cashmere', categoryId: 'blankets', attribute: 'material', value: 'pure-cashmere' },
  { id: 'pure-wool', categoryId: 'blankets', attribute: 'material', value: 'pure-wool' },

  // Yarn has its own material lines, and they are the ones a spinner
  // or a knitter buys against.
  { id: 'pure-cashmere', categoryId: 'yarn', attribute: 'material', value: 'pure-cashmere' },
  { id: 'cashmere-wool', categoryId: 'yarn', attribute: 'material', value: 'cashmere-wool' },
  { id: 'cashmere-silk', categoryId: 'yarn', attribute: 'material', value: 'cashmere-silk' },
  { id: 'cashmere-linen', categoryId: 'yarn', attribute: 'material', value: 'cashmere-linen' },
  { id: 'cashmere-yak', categoryId: 'yarn', attribute: 'material', value: 'cashmere-yak' },
  { id: 'cashmere-taiji', categoryId: 'yarn', attribute: 'material', value: 'cashmere-taiji' },
  { id: 'pure-wool', categoryId: 'yarn', attribute: 'material', value: 'pure-wool' },
  { id: 'pure-merino', categoryId: 'yarn', attribute: 'material', value: 'pure-merino' },

  // ---- Yarn count ------------------------------------------------------
  // The count is the first question a knitter asks. Each of these
  // pages carries at least ten styles, so none of them is thin.
  { id: '2-26-nm', categoryId: 'yarn', attribute: 'count', value: '2/26' },
  { id: '2-36-nm', categoryId: 'yarn', attribute: 'count', value: '2/36' },
  { id: '1-17-nm', categoryId: 'yarn', attribute: 'count', value: '1/17' },
  { id: '1-4-3-nm', categoryId: 'yarn', attribute: 'count', value: '1/4.3' },
  { id: '2-16-nm', categoryId: 'yarn', attribute: 'count', value: '2/16' },
  { id: '3-68-nm', categoryId: 'yarn', attribute: 'count', value: '3/68' },
  { id: '2-60-nm', categoryId: 'yarn', attribute: 'count', value: '2/60' },
  { id: '2-80-nm', categoryId: 'yarn', attribute: 'count', value: '2/80' },

  // A cone and a hank are quoted on different terms - a cone is ready
  // for a machine knitter, a hank for a hand knitter.
  { id: 'cone', categoryId: 'yarn', attribute: 'form', value: 'cone' },

  // ---- Scarf pattern ---------------------------------------------------
  // Printed and solid are quoted and sampled differently, so they are
  // separate pages rather than one "patterns" page.
  { id: 'printed', categoryId: 'scarves', attribute: 'pattern', value: 'printed' },
  { id: 'solid', categoryId: 'scarves', attribute: 'pattern', value: 'solid' },
  { id: 'tassel', categoryId: 'scarves', attribute: 'pattern', value: 'tassel' },
  { id: 'plaid', categoryId: 'scarves', attribute: 'pattern', value: 'plaid' },
  { id: 'check', categoryId: 'scarves', attribute: 'pattern', value: 'check' },

  // ---- Audience --------------------------------------------------------
  // The gender field on the record is mostly empty, so these read the
  // product name instead. A buyer shopping "cashmere hats for men" is
  // asking for a page of men's hats, not a filtered catalogue.
  { id: 'women', categoryId: 'hats', attribute: 'audience', value: 'women' },
  { id: 'men', categoryId: 'hats', attribute: 'audience', value: 'men' },
  { id: 'kids', categoryId: 'hats', attribute: 'audience', value: 'kids' },
  { id: 'unisex', categoryId: 'hats', attribute: 'audience', value: 'unisex' },

  { id: 'women', categoryId: 'scarves', attribute: 'audience', value: 'women' },
  { id: 'men', categoryId: 'scarves', attribute: 'audience', value: 'men' },
  { id: 'kids', categoryId: 'scarves', attribute: 'audience', value: 'kids' },
  { id: 'unisex', categoryId: 'scarves', attribute: 'audience', value: 'unisex' },

  { id: 'women', categoryId: 'accessories', attribute: 'audience', value: 'women' },
  { id: 'men', categoryId: 'accessories', attribute: 'audience', value: 'men' },
  { id: 'kids', categoryId: 'accessories', attribute: 'audience', value: 'kids' },
  { id: 'unisex', categoryId: 'accessories', attribute: 'audience', value: 'unisex' },

  // ---- Use -------------------------------------------------------------
  // A hijab scarf is bought as a hijab scarf; it is not a sub-style of
  // the shawl page.
  { id: 'hijab', categoryId: 'scarves', attribute: 'use', value: 'hijab' },
  { id: 'winter', categoryId: 'scarves', attribute: 'use', value: 'winter' },
  { id: 'winter', categoryId: 'hats', attribute: 'use', value: 'winter' },
];

/** Localised names for a neckline. */
export const NECKLINE_LABEL: Record<Neckline, Record<Locale, string>> = {
  'crew-neck': { en: 'Crew Neck', cn: '圆领', de: 'Rundhalsausschnitt', fr: 'Col rond', ja: 'クルーネック', kr: '크루넥' },
  'v-neck': { en: 'V-Neck', cn: 'V领', de: 'V-Ausschnitt', fr: 'Col en V', ja: 'Vネック', kr: '브이넥' },
  turtleneck: { en: 'Turtleneck', cn: '高领', de: 'Turtleneck', fr: 'Col roulé', ja: ' turtleneck', kr: '터틀넥' },
  'mock-neck': { en: 'Mock Neck', cn: '半高领', de: 'Mockneck', fr: 'Col mock', ja: 'モックネック', kr: '목넥' },
  'cowl-neck': { en: 'Cowl Neck', cn: '堆堆领', de: 'Cowlneck', fr: 'Col cowl', ja: 'カウルネック', kr: '카울넥' },
  'high-neck': { en: 'High Neck', cn: '立领', de: 'Hochkragen', fr: 'Col montant', ja: 'ハイネック', kr: '하이넥' },
  'polo-collar': { en: 'Polo Collar', cn: 'polo领', de: 'Polokragen', fr: 'Col polo', ja: 'ポロ襟', kr: '폴로 칼라' },
  'zip-neck': { en: 'Zip Neck', cn: '拉链领', de: 'Reißverschlusskragen', fr: 'Col zippé', ja: 'ジップネック', kr: '지퍼넥' },
  hood: { en: 'Hooded', cn: '连帽', de: 'Kapuzenpullover', fr: 'Capuche', ja: 'フード', kr: '후드' },
  sleeveless: { en: 'Sleeveless', cn: '无袖', de: 'Ärmellos', fr: 'Sans manches', ja: 'ノースリーブ', kr: '민소매' },
  'boat-neck': { en: 'Boat Neck', cn: '船领', de: 'Boat Neck', fr: 'Col bateau', ja: 'ボートネック', kr: '보트넥' },
  'off-shoulder': { en: 'Off Shoulder', cn: '露肩', de: 'Off-Shoulder', fr: 'Buste dénudée', ja: 'オフショルダー', kr: '오프숄더' },
  'shawl-collar': { en: 'Shawl Collar', cn: '披肩领', de: 'Schalkragen', fr: 'Colshawl', ja: 'ショール襟', kr: '숄칼라' },
  henley: { en: 'Henley', cn: '亨利领', de: 'Henleykragen', fr: 'Col henley', ja: 'ヘンリー', kr: '헨리넥' },
  'square-neck': { en: 'Square Neck', cn: '方领', de: 'Quadratischer Ausschnitt', fr: 'Col carré', ja: 'スクウェアネック', kr: '스퀘어넥' },
  waistband: { en: 'Waistband', cn: '腰头', de: 'Bund', fr: 'Taille', ja: 'ウエストバンド', kr: '밴드' },
};

/** Localised names for a gender bucket. */
export const GENDER_LABEL: Record<string, Record<Locale, string>> = {
  women: { en: 'Women', cn: '女装', de: 'Damen', fr: 'Femme', ja: 'ウィメンズ', kr: '여성' },
  men: { en: 'Men', cn: '男装', de: 'Herren', fr: 'Homme', ja: 'メンズ', kr: '남성' },
  unisex: { en: 'Unisex', cn: '男女同款', de: 'Unisex', fr: 'Unisexe', ja: 'ユニセックス', kr: '유니섹스' },
};

/** Localised names for a season bucket. */
export const SEASON_LABEL: Record<string, Record<Locale, string>> = {
  'autumn-winter': { en: 'Autumn / Winter', cn: '秋冬', de: 'Herbst / Winter', fr: 'Automne / Hiver', ja: '秋 / 冬', kr: '가을 / 겨울' },
  'spring-summer': { en: 'Spring / Summer', cn: '春夏', de: 'Frühling / Sommer', fr: 'Printemps / Été', ja: '春 / 夏', kr: '봄 / 여름' },
  'all-season': { en: 'All Season', cn: '四季', de: 'Ganzjährig', fr: 'Toutes saisons', ja: '通年', kr: '사절' },
};

/** Localised names for a subtype. */
export const SUBTYPE_LABEL: Record<string, Record<Locale, string>> = {
  sweaters: { en: 'Sweaters', cn: '羊绒衫', de: 'Pullover', fr: 'Pulls', ja: 'セーター', kr: '스웨터' },
  cardigans: { en: 'Cardigans', cn: '开衫', de: 'Cardigans', fr: 'Cardigans', ja: 'カーディガン', kr: '가디건' },
  pullovers: { en: 'Pullovers', cn: '套头衫', de: 'Pullover', fr: 'Pulls', ja: 'プルオーバー', kr: '풀오버' },
  turtlenecks: { en: 'Turtlenecks', cn: '高领毛衣', de: 'Turtlenecks', fr: 'Col roulé', ja: ' turtleneck', kr: '터틀넥' },
  hoodies: { en: 'Hoodies', cn: '连帽衫', de: 'Kapuzenpullover', fr: 'Sweats à capuche', ja: 'パーカー', kr: '후드티' },
  vests: { en: 'Vests', cn: '马甲', de: 'Westen', fr: 'Gilets', ja: 'ベスト', kr: '조끼' },
  'polo-sweaters': { en: 'Polo Sweaters', cn: 'polo领羊绒衫', de: 'Polo-Pullover', fr: 'Pulls col polo', ja: 'ポロセーター', kr: '폴로 스웨터' },
  sweatshirts: { en: 'Sweatshirts', cn: '卫衣', de: 'Sweatshirts', fr: 'Sweats', ja: 'スウェット', kr: '스웨트셔츠' },
  coats: { en: 'Coats', cn: '大衣', de: 'Mäntel', fr: 'Manteaux', ja: 'コート', kr: '코트' },
  dresses: { en: 'Dresses & Skirts', cn: '连衣裙与半裙', de: 'Kleider & Röcke', fr: 'Robes & Jupes', ja: 'ワンピース & スカート', kr: '원피스 & 스커트' },
  pants: { en: 'Trousers', cn: '裤装', de: 'Hosen', fr: 'Pantalons', ja: 'パンツ', kr: '바지' },
  hats: { en: 'Hats', cn: '帽子', de: 'Mützen', fr: 'Chapeaux', ja: '帽子', kr: '모자' },
  beanies: { en: 'Beanies', cn: '针织帽', de: 'Beanies', fr: 'Bonnets', ja: 'ビーニー', kr: '비니' },
  berets: { en: 'Berets', cn: '贝雷帽', de: 'Barette', fr: 'Bérets', ja: 'ベレー帽', kr: '베레모자' },
  'fedora-hats': { en: 'Fedoras & Brim Hats', cn: '礼帽与宽檐帽', de: 'Fedora & Schirmmützen', fr: 'Fedora & Chapeaux à large bord', ja: 'フェドラ & 広 brim 帽子', kr: '페도라 & 챙 넓은 모자' },
  headbands: { en: 'Headbands & Warmers', cn: '发带与耳罩', de: 'Stirnbänder & Ohrwärmer', fr: 'Bandes & Bandeaux', ja: 'ヘッドバンド & ウォーマー', kr: '헤드밴드 & 워머' },
  scarves: { en: 'Scarves', cn: '围巾', de: 'Schals', fr: 'Écharpes', ja: 'マフラー', kr: '스카프' },
  shawls: { en: 'Shawls', cn: '披肩', de: 'Stolas', fr: 'Châles', ja: 'ショール', kr: '숄' },
  wraps: { en: 'Wraps & Stoles', cn: '披挂与围巾', de: 'Stolen', fr: 'Stoles', ja: 'ストール', kr: '스톨' },
  accessories: { en: 'Accessories', cn: '配饰', de: 'Accessoires', fr: 'Accessoires', ja: 'アクセサリー', kr: '액세서리' },
  gloves: { en: 'Gloves & Mittens', cn: '手套', de: 'Handschuhe', fr: 'Gants', ja: '手袋', kr: '장갑' },
  socks: { en: 'Socks', cn: '袜子', de: 'Socken', fr: 'Chaussettes', ja: '靴下', kr: '양말' },
  belts: { en: 'Belts', cn: '腰带', de: 'Gürtel', fr: 'Ceintures', ja: 'ベルト', kr: '벨트' },
  yarn: { en: 'Yarn & Fiber', cn: '纱线与纤维', de: 'Garn & Faser', fr: 'Fil & Fibre', ja: '糸 & 繊維', kr: '원사 & 섬유' },
  blankets: { en: 'Blankets & Throws', cn: '毯子与盖毯', de: 'Decken & Plaids', fr: 'Couvertures', ja: 'ブランケット', kr: '블랭킷' },
  'baby-blankets': { en: 'Baby Blankets', cn: '婴儿毯', de: 'Babydecken', fr: 'Couvertures bébé', ja: 'ベビーブランケット', kr: '아기 블랭킷' },
};

/** Localised names for a material family. */
export const MATERIAL_LABEL: Record<string, Record<Locale, string>> = {
  'pure-cashmere': { en: '100% Cashmere', cn: '100% 羊绒', de: '100% Kaschmir', fr: '100% cachemire', ja: '100% カシミア', kr: '100% 캐시미어' },
  'cashmere-wool': { en: 'Cashmere / Wool', cn: '羊绒/羊毛混纺', de: 'Kaschmir/Wolle', fr: 'Cachemire/laine', ja: 'カシミア/ウール', kr: '캐시미어/울' },
  'cashmere-silk': { en: 'Cashmere / Silk', cn: '羊绒/真丝混纺', de: 'Kaschmir/Seide', fr: 'Cachemire/soie', ja: 'カシミア/シルク', kr: '캐시미어/실크' },
  'cashmere-linen': { en: 'Cashmere / Linen', cn: '羊绒/亚麻混纺', de: 'Kaschmir/Leinen', fr: 'Cachemire/lin', ja: 'カシミア/リネン', kr: '캐시미어/린넨' },
  'cashmere-yak': { en: 'Cashmere / Yak', cn: '羊绒/牦牛绒混纺', de: 'Kaschmir/Yak', fr: 'Cachemire/yak', ja: 'カシミア/ヤク', kr: '캐시미어/야크' },
  'cashmere-taiji': { en: 'Cashmere / Taiji Stone', cn: '羊绒/太基石纤维混纺', de: 'Kaschmir/Taiji-Stein', fr: 'Cachemire/pierre Taiji', ja: 'カシミア/タイジストーン', kr: '캐시미어/타이지스톤' },
  'pure-wool': { en: '100% Wool', cn: '100% 羊毛', de: '100% Wolle', fr: '100% laine', ja: '100% ウール', kr: '100% 울' },
  'pure-merino': { en: '100% Merino', cn: '100% 美利奴羊毛', de: '100% Merino', fr: '100% mérinos', ja: '100% メリノ', kr: '100% 메리노' },
};

/** Localised names for a yarn count. */
export const COUNT_LABEL: Record<string, Record<Locale, string>> = {
  '2/26': { en: '2/26 Nm', cn: '2/26 Nm', de: '2/26 Nm', fr: '2/26 Nm', ja: '2/26 Nm', kr: '2/26 Nm' },
  '2/36': { en: '2/36 Nm', cn: '2/36 Nm', de: '2/36 Nm', fr: '2/36 Nm', ja: '2/36 Nm', kr: '2/36 Nm' },
  '1/17': { en: '1/17 Nm', cn: '1/17 Nm', de: '1/17 Nm', fr: '1/17 Nm', ja: '1/17 Nm', kr: '1/17 Nm' },
  '1/4.3': { en: '1/4.3 Nm', cn: '1/4.3 Nm', de: '1/4.3 Nm', fr: '1/4.3 Nm', ja: '1/4.3 Nm', kr: '1/4.3 Nm' },
  '2/16': { en: '2/16 Nm', cn: '2/16 Nm', de: '2/16 Nm', fr: '2/16 Nm', ja: '2/16 Nm', kr: '2/16 Nm' },
  '3/68': { en: '3/68 Nm', cn: '3/68 Nm', de: '3/68 Nm', fr: '3/68 Nm', ja: '3/68 Nm', kr: '3/68 Nm' },
  '2/60': { en: '2/60 Nm', cn: '2/60 Nm', de: '2/60 Nm', fr: '2/60 Nm', ja: '2/60 Nm', kr: '2/60 Nm' },
  '2/80': { en: '2/80 Nm', cn: '2/80 Nm', de: '2/80 Nm', fr: '2/80 Nm', ja: '2/80 Nm', kr: '2/80 Nm' },
};

/** Localised names for a yarn form. */
export const FORM_LABEL: Record<string, Record<Locale, string>> = {
  cone: { en: 'Cone Yarn', cn: '筒装纱线', de: 'Kegelgarn', fr: 'Fil en cône', ja: 'コーン糸', kr: '원사 콘' },
  hank: { en: 'Hank Yarn', cn: '绞纱', de: 'Strangengarn', fr: 'Fil en écheve', ja: 'ハンク糸', kr: '원사 환' },
  skein: { en: 'Skein Yarn', cn: '绞卷纱', de: 'Strähnengarn', fr: 'Fil en pelote', ja: 'skein 糸', kr: 'skein 원사' },
};

/** Localised names for a pattern. */
export const PATTERN_LABEL: Record<string, Record<Locale, string>> = {
  printed: { en: 'Printed', cn: '印花', de: 'Bedruckt', fr: 'Imprimé', ja: 'プリント', kr: '프린트' },
  solid: { en: 'Solid Colour', cn: '素色', de: 'Einfarbig', fr: 'Uni', ja: '無地', kr: '단색' },
  tassel: { en: 'Tasselled', cn: '流苏', de: 'Fransen', fr: 'Frangés', ja: '房飾り', kr: '모짜 장식' },
  plaid: { en: 'Plaid', cn: '格纹', de: 'Karo', fr: 'Carreaux', ja: 'チェック', kr: '플레이드' },
  check: { en: 'Checked', cn: '千鸟格', de: 'Karo', fr: 'Damier', ja: '千鳥格子', kr: '체크' },
};

/** Localised names for an audience bucket. */
export const AUDIENCE_LABEL: Record<string, Record<Locale, string>> = {
  women: { en: "Women's", cn: '女装', de: 'Damen', fr: 'Femme', ja: 'ウィメンズ', kr: '여성' },
  men: { en: "Men's", cn: '男装', de: 'Herren', fr: 'Homme', ja: 'メンズ', kr: '남성' },
  kids: { en: "Kids'", cn: '童装', de: 'Kinder', fr: 'Enfant', ja: 'キッズ', kr: '키즈' },
  unisex: { en: 'Unisex', cn: '男女同款', de: 'Unisex', fr: 'Unisexe', ja: 'ユニセックス', kr: '유니섹스' },
};

/** Localised names for a use bucket. */
export const USE_LABEL: Record<string, Record<Locale, string>> = {
  hijab: { en: 'Hijab', cn: '头巾', de: 'Hijab', fr: 'Hijab', ja: 'ヒジャブ', kr: '히자브' },
  gift: { en: 'Gift', cn: '礼品', de: 'Geschenk', fr: 'Cadeau', ja: 'ギフト', kr: '기프트' },
  travel: { en: 'Travel', cn: '旅行', de: 'Reise', fr: 'Voyage', ja: 'トラベル', kr: '트래블' },
  winter: { en: 'Winter', cn: '冬季', de: 'Winter', fr: 'Hiver', ja: '冬', kr: '겨울' },
};

/**
 * The label tables, indexed by attribute.
 *
 * The page template needs one lookup rather than a chain of branches,
 * because the number of dimensions grew from four to nine.
 */
export const ATTRIBUTE_LABEL: Record<string, Record<string, Record<Locale, string>>> = {
  neckline: NECKLINE_LABEL,
  gender: GENDER_LABEL,
  season: SEASON_LABEL,
  material: MATERIAL_LABEL,
  count: COUNT_LABEL,
  form: FORM_LABEL,
  pattern: PATTERN_LABEL,
  audience: AUDIENCE_LABEL,
  use: USE_LABEL,
};

/** Localised category names. */
export const CATEGORY_LABEL: Record<CategoryId, Record<Locale, string>> = {
  hats: { en: 'Cashmere Hats & Beanies', cn: '羊绒帽', de: 'Kaschmir-Mützen', fr: 'Bonnets en cachemire', ja: 'カシミア帽子', kr: '캐시미어 모자' },
  sweaters: { en: 'Cashmere Sweaters & Knitwear', cn: '羊绒衫', de: 'Kaschmir-Pullover', fr: 'Pulls en cachemire', ja: 'カシミアセーター', kr: '캐시미어 스웨터' },
  scarves: { en: 'Cashmere Scarves & Wraps', cn: '羊绒围巾', de: 'Kaschmir-Schals', fr: 'Écharpes en cachemire', ja: 'カシミアマフラー', kr: '캐시미어 스카프' },
  accessories: { en: 'Cashmere Accessories', cn: '羊绒配饰', de: 'Kaschmir-Accessoires', fr: 'Accessoires en cachemire', ja: 'カシミアアクセサリー', kr: '캐시미어 액세서리' },
  yarn: { en: 'Cashmere Yarn & Fiber', cn: '羊绒纱线', de: 'Kaschmirgarn', fr: 'Fil de cachemire', ja: 'カシミア糸', kr: '캐시미어 원사' },
  blankets: { en: 'Cashmere Blankets & Throws', cn: '羊绒毯', de: 'Kaschmirdecken', fr: 'Couvertures en cachemire', ja: 'カシミアブランケット', kr: '캐시미어 블랭킷' },
};
