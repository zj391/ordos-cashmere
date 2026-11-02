/**
 * Print the title facets for one product, in one locale.
 *
 * The title builder assembles a title from the product name plus a list
 * of facets pulled out of the catalogue fields. When a title comes out
 * wrong this shows which facets were found and which were dropped, so
 * the fix is in the right function.
 *
 * Run:
 *   npx tsx scripts/inspect-product-title.ts <productId> [locale]
 */
import { getAllProducts } from '../src/data/products';
import { buildProductSeoTitle } from '../src/lib/product-seo-title';
import { primeTitleReferenceCache } from '../src/lib/product-title-ref';
import { productTitleBrand, productTitleCategory, SEO_TITLE_MAX } from '../src/lib/product-title-context';

const id = process.argv[2] ?? 'DXE-A011-2';
const locale = (process.argv[3] ?? 'en') as 'en' | 'cn' | 'de' | 'fr' | 'ja' | 'kr';

primeTitleReferenceCache();
const product = getAllProducts().find((p) => p.id === id);
if (!product) {
  console.error(`no product with id ${id}`);
  process.exit(1);
}

const category = productTitleCategory(product.categoryId, locale, product.categoryName ?? '');
const brand = productTitleBrand(locale);

console.log(`product   ${product.id} (${locale})`);
console.log(`name      ${JSON.stringify(product.name)}`);
console.log(`category  ${JSON.stringify(category)}`);
console.log(`brand     ${JSON.stringify(brand)}`);
console.log('fields:');
for (const key of [
  'material', 'micron', 'pattern', 'collar', 'knittingTechnology', 'gender', 'season',
  'sizes', 'colors', 'packaging', 'weight_g', 'weight', 'function', 'origin',
  'knitStructure', 'certifications', 'tags',
] as const) {
  const value = (product as unknown as Record<string, unknown>)[key];
  if (value === undefined || value === null || value === '') continue;
  console.log(`  ${key.padEnd(18)} ${JSON.stringify(value)}`);
}

const withoutRef = buildProductSeoTitle(product as never, category, brand, SEO_TITLE_MAX[locale], locale);
const withRef = buildProductSeoTitle(product as never, category, brand, SEO_TITLE_MAX[locale], locale, id);
console.log(`\ntitle (no ref)  ${JSON.stringify(withoutRef)}  (${withoutRef.length})`);
console.log(`title (with ref) ${JSON.stringify(withRef)}  (${withRef.length})`);
