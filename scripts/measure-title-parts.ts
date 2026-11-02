/**
 * How much room the title parts actually need.
 *
 * The title has to carry the product name, the localised category term,
 * the catalogue reference and the brand. When those four do not fit into
 * the budget, something has to give - this shows which part is the
 * problem, per locale.
 *
 * Run:
 *   npx tsx scripts/measure-title-parts.ts
 */
import { getAllProducts } from '../src/data/products';
import { LOCALE_CATEGORY_SHORT_NAMES, BUYER_INTENT_PREFIX, type TitleLocale } from '../src/lib/product-title-context';

const LOCALES: TitleLocale[] = ['en', 'cn', 'de', 'fr', 'ja', 'kr'];

function primary(v: unknown): string {
  const cleaned = String(v ?? '')
    .trim()
    .replace(/^(?:(?:premium|wholesale|china|inner mongolia|ordos|high quality|european style|europe style|classic|new|hot|best|best sell|new arrival|2020|2021|2022|2023|2024|2025|2026)\s+)+/i, '')
    .replace(/\b(?:factory customized|factory direct|factory|manufacturer|supplier|wholesale|cheap|best sell|hot sell|price)\b/ig, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,;:/])/g, '$1')
    .trim();
  return cleaned.length >= 6 ? cleaned : String(v ?? '').trim();
}

function stripHead(v: string): string {
  const s = v.replace(/^(?:(?:cashmere|custom|wholesale|designer|luxury|premium)\s+)+/i, '').trim();
  return s.length >= 6 ? s : v;
}

function categoryOf(categoryId: string, locale: TitleLocale, fallback: string): string {
  const base = LOCALE_CATEGORY_SHORT_NAMES[locale]?.[categoryId] ?? fallback;
  const prefix = BUYER_INTENT_PREFIX[locale]?.[categoryId];
  if (!prefix) return base;
  if (/(wholesale|grossist|großhandel|卸売|도매|批发)/i.test(base)) return base;
  return `${prefix} ${base}`;
}

function pct(values: number[], p: number): number {
  return values[Math.min(values.length - 1, Math.floor(values.length * p))];
}

const products = getAllProducts();
for (const locale of LOCALES) {
  const names: number[] = [];
  const cats: number[] = [];
  const totals: number[] = [];
  for (const p of products) {
    const name = stripHead(primary(p.name)).length;
    const cat = categoryOf(p.categoryId, locale, p.categoryName ?? '').length;
    names.push(name);
    cats.push(cat);
    // name + " - Ref XXX" + " - category" + " | BRAND"
    totals.push(name + 19 + 3 + cat + 3 + 12);
  }
  names.sort((a, b) => a - b);
  cats.sort((a, b) => a - b);
  totals.sort((a, b) => a - b);
  console.log(
    `${locale}  name median ${pct(names, 0.5)} p90 ${pct(names, 0.9)} max ${names[names.length - 1]}` +
      `  |  cat median ${pct(cats, 0.5)} max ${cats[cats.length - 1]}` +
      `  |  all four parts: median ${pct(totals, 0.5)} p90 ${pct(totals, 0.9)} max ${totals[totals.length - 1]}`,
  );
}
