/**
 * Show the titles that break a rule.
 *
 * The title rules have several constraints - the locale budget, the
 * category term staying whole, the reference staying inside the first
 * 60 characters - and it is easy to break one while fixing another.
 * This prints the offenders for each rule, so a regression is visible
 * without a full build.
 *
 * Run:
 *   npx tsx scripts/check-title-rules.ts
 */
import { getAllProducts } from '../src/data/products';
import { buildProductSeoTitle } from '../src/lib/product-seo-title';
import { primeTitleReferenceCache, needsTitleReference } from '../src/lib/product-title-ref';
import { productTitleBrand, productTitleCategory, SEO_TITLE_MAX, type TitleLocale } from '../src/lib/product-title-context';

const LOCALES: TitleLocale[] = ['en', 'cn', 'de', 'fr', 'ja', 'kr'];

function main(): void {
  primeTitleReferenceCache();
  const products = getAllProducts();

  const overBudget: string[] = [];
  const clippedTerm: string[] = [];
  const refHidden: string[] = [];
  const clippedName: string[] = [];

  for (const locale of LOCALES) {
    const budget = SEO_TITLE_MAX[locale];
    const brand = productTitleBrand(locale);
    for (const product of products) {
      const category = productTitleCategory(product.categoryId, locale, product.categoryName ?? '');
      const reference = needsTitleReference(product.id) ? product.id : undefined;
      const title = buildProductSeoTitle(product as never, category, brand, budget, locale, reference);

      if (title.length > budget) {
        overBudget.push(`${locale}/${product.id} (${title.length}/${budget}) ${title}`);
      }
      // The category term must not carry an ellipsis.
      //
      // The term is added as " — <term>" after the name and the
      // reference, so the check looks at that segment only. A name
      // that already says "Cashmere Yarn" does not get the term
      // repeated, and an ellipsis inside the name is the name's own
      // clipping - not a clipped term.
      const termAt = title.indexOf(` — ${category}`);
      if (termAt >= 0) {
        const after = title.slice(termAt + 3 + category.length);
        const segment = after.split(/ · | \| /)[0];
        if (segment.includes('…')) {
          clippedTerm.push(`${locale}/${product.id} ${title}`);
        }
      }
      const at = title.indexOf('Ref ');
      if (at > 60) refHidden.push(`${locale}/${product.id} (ref at ${at}) ${title}`);
      // A name cut to fewer than 12 characters tells the buyer nothing.
      const head = title.split(' - ')[0].split(' · ')[0].split(' — ')[0];
      if (head.endsWith('…') && head.replace('…', '').trim().length < 12) {
        clippedName.push(`${locale}/${product.id} ${title}`);
      }
    }
  }

  const report = (label: string, rows: string[]) => {
    console.log(`${label}: ${rows.length}`);
    for (const row of rows.slice(0, 6)) console.log(`   ${row}`);
  };
  report('over budget', overBudget);
  report('clipped category term', clippedTerm);
  report('reference past 60 chars', refHidden);
  report('name clipped to nothing', clippedName);
}

main();
