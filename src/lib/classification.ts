/**
 * Classify catalogue products into subtypes and attribute buckets.
 *
 * The rules live in src/data/taxonomy.ts. This module applies them to
 * the product records and is the single place that decides which
 * products belong to which landing page.
 */
import { getAllProducts, type Product } from '@/data/products';
import {
  ATTRIBUTE_RULES,
  SUBTYPE_RULES,
  normaliseAudience,
  normaliseCount,
  normaliseForm,
  normaliseGender,
  normaliseMaterial,
  normaliseNeckline,
  normalisePattern,
  normaliseSeason,
  normaliseUse,
  type AttributeId,
  type CategoryId,
  type Neckline,
} from '@/data/taxonomy';

/** The product record, with the fields the classifiers read. */
type Classifiable = Product & {
  collar?: string | null;
  gender?: string | null;
  season?: string | null;
  material?: string | null;
  pattern?: string | null;
  tags?: string[];
};

/**
 * The searchable text of a product: the name only.
 *
 * Neither the description nor the tags can be used for style matching.
 * The descriptions are marketing copy that mixes terms freely, and the
 * tags have been bulk-seeded with the same generic keyword list on
 * every record - all 246 scarves carry "cashmere shawl" in their tags
 * and all 76 hats carry "beanie", so matching on either would put the
 * whole category on a single subtype page.
 *
 * The product name is the only field that states what the style
 * actually is.
 */
function haystack(p: Classifiable): string {
  return (p.name || '').toLowerCase();
}

/** The owning category of a product. */
function categoryOf(p: Classifiable): CategoryId | null {
  // products.ts exposes the owning category on each record; fall back to
  // the raw JSON shape when it does not.
  const cat = (p as { categoryId?: string | null }).categoryId;
  if (cat) return cat as CategoryId;
  return null;
}

/**
 * The subtype of a product, or null when it matches no rule.
 *
 * The rules are applied in order and the first match wins, so the more
 * specific styles are listed before the catch-alls.
 */
export function subtypeOf(p: Classifiable): string | null {
  const cat = categoryOf(p);
  if (!cat) return null;
  const text = haystack(p);
  for (const rule of SUBTYPE_RULES) {
    if (rule.categoryId !== cat) continue;
    if (!rule.match.some((m: string) => text.includes(m.toLowerCase()))) continue;
    if (rule.exclude?.some((x: string) => text.includes(x.toLowerCase()))) continue;
    return rule.id;
  }
  return null;
}

/**
 * The neckline of a product.
 *
 * The record carries the neckline twice and the two sometimes disagree:
 * "Women s Classic Crew Neck Top Wool Cashmere Sweater" has a collar
 * field of "Classic V-Neck". The name is the field a buyer reads and
 * the more specific of the two, so when the name states a neckline it
 * wins over the collar field.
 *
 * Only the name patterns that are unambiguous are trusted. "Sweater"
 * and "Knitwear" say nothing about the neckline, so they do not count.
 */
const NAME_NECKLINE: [RegExp, Neckline][] = [
  [/\bv[- ]?neck\b/, 'v-neck'],
  [/\bcrew[- ]?neck\b/, 'crew-neck'],
  [/\bround[- ]?neck\b/, 'crew-neck'],
  [/\bturtleneck\b/, 'turtleneck'],
  [/\bturtle[- ]?neck\b/, 'turtleneck'],
  [/\bmock[- ]?neck\b/, 'mock-neck'],
  [/\bcowl[- ]?neck\b/, 'cowl-neck'],
  [/\bhigh[- ]?neck\b/, 'high-neck'],
  [/\bpolo( neck| collar)?\b/, 'polo-collar'],
  [/\bhalf[- ]?zip\b/, 'zip-neck'],
  [/\bzip[- ]?neck\b/, 'zip-neck'],
  [/\bhood(ed)?\b/, 'hood'],
  [/\bsleeveless\b/, 'sleeveless'],
  [/\bboat[- ]?neck\b/, 'boat-neck'],
  [/\boff[- ]?shoulder\b/, 'off-shoulder'],
  [/\bshawl[- ]?collar\b/, 'shawl-collar'],
  [/\bhenley\b/, 'henley'],
  [/\bsquare[- ]?neck\b/, 'square-neck'],
];

/** The neckline stated in the product name, if it states one. */
export function necklineFromName(p: Classifiable): Neckline | null {
  const name = (p.name || '').toLowerCase();
  if (!name) return null;
  for (const [pattern, value] of NAME_NECKLINE) {
    if (pattern.test(name)) return value;
  }
  return null;
}

/**
 * The normalised attribute values of a product.
 *
 * The later dimensions read a different field each, because the
 * catalogue does not carry them uniformly:
 *
 *   - count and form come from the name and the pattern field, which
 *     is where a yarn record states its Nm count and its form
 *   - pattern comes from the name and the pattern field, with the tags
 *     as a backstop - the tag list is seeded identically on every
 *     record of a category, so it only helps when it names a specific
 *     pattern ("Printed Scarf")
 *   - audience comes from the name, because the gender field is empty
 *     on most records and says "all" on the rest
 *   - use comes from the name and the tags
 */
export function attributesOf(p: Classifiable): Partial<Record<AttributeId, string>> {
  const out: Partial<Record<AttributeId, string>> = {};
  const neck = necklineFromName(p) ?? normaliseNeckline(p.collar);
  if (neck) out.neckline = neck;
  const gender = normaliseGender(p.gender);
  if (gender) out.gender = gender;
  const season = normaliseSeason(p.season);
  if (season) out.season = season;
  const material = normaliseMaterial(p.material);
  if (material) out.material = material;

  const name = p.name || '';
  const patternField = p.pattern || '';
  const tagText = (p.tags || []).join(' ');

  const count = normaliseCount(`${name} ${patternField}`);
  if (count) out.count = count;

  const form = normaliseForm(`${name} ${patternField}`);
  if (form) out.form = form;

  const pattern = normalisePattern(`${name} ${patternField} ${tagText}`);
  if (pattern) out.pattern = pattern;

  const audience = normaliseAudience(name);
  if (audience) out.audience = audience;

  const use = normaliseUse(`${name} ${tagText} ${p.season || ''}`);
  if (use) out.use = use;

  return out;
}

/** Every product in the catalogue, in a shape the classifiers accept. */
export function allClassifiable(): Classifiable[] {
  // getAllProducts() is the accessor that attaches the owning category to
  // each record; the raw products export leaves categoryId unset.
  return getAllProducts() as unknown as Classifiable[];
}

/**
 * Group the catalogue into the landing pages that should exist.
 *
 * Returns a map of page key to the products on it. The key is the URL
 * path segment, e.g. "sweaters/v-neck" for the V-neck sweater page.
 */
export function buildClassificationIndex(): Map<string, Classifiable[]> {
  const index = new Map<string, Classifiable[]>();
  const push = (key: string, p: Classifiable) => {
    const list = index.get(key);
    if (list) list.push(p);
    else index.set(key, [p]);
  };

  for (const p of allClassifiable()) {
    const cat = categoryOf(p);
    if (!cat) continue;

    // The category page.
    push(cat, p);

    // The subtype page.
    const sub = subtypeOf(p);
    if (sub) push(`${cat}/${sub}`, p);

    // The category + attribute pages.
    const attrs = attributesOf(p);
    for (const rule of ATTRIBUTE_RULES) {
      if (rule.categoryId !== cat) continue;
      const value = attrs[rule.attribute];
      if (value !== rule.value) continue;
      push(`${cat}/${rule.id}`, p);
    }
  }

  return index;
}
