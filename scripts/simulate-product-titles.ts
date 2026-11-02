/**
 * Offline title simulator.
 *
 * Building the site to see what the product titles look like takes six
 * minutes. This script reproduces the title for every product in every
 * locale from the same source files the build uses, so the title rules can
 * be tuned in seconds instead of build-cycles.
 *
 * Run:
 *   npx tsx scripts/simulate-product-titles.ts
 *
 * Environment:
 *   TITLE_BUDGET_LATIN   budget for en/de/fr (default from the source)
 *   TITLE_BUDGET_CJK     budget for cn/ja/kr
 *   TITLE_SHOW=sample    print the sample titles (default)
 *   TITLE_SHOW=none      skip the samples
 */
import { getAllProducts } from '../src/data/products';
import { buildProductSeoTitle } from '../src/lib/product-seo-title';
import { primeTitleReferenceCache, needsTitleReference } from '../src/lib/product-title-ref';
import {
  productTitleBrand,
  productTitleCategory,
  SEO_TITLE_MAX,
  type TitleLocale,
} from '../src/lib/product-title-context';

const LOCALES: TitleLocale[] = ['en', 'cn', 'de', 'fr', 'ja', 'kr'];
const CJK: TitleLocale[] = ['cn', 'ja', 'kr'];

function main(): void {
  const latinBudget = Number(process.env.TITLE_BUDGET_LATIN ?? 0);
  const cjkBudget = Number(process.env.TITLE_BUDGET_CJK ?? 0);
  const budget: Record<TitleLocale, number> = { ...SEO_TITLE_MAX };
  if (latinBudget) for (const l of ['en', 'de', 'fr'] as TitleLocale[]) budget[l] = latinBudget;
  if (cjkBudget) for (const l of CJK) budget[l] = cjkBudget;

  primeTitleReferenceCache();
  const products = getAllProducts();

  const titles: { locale: TitleLocale; id: string; title: string }[] = [];
  for (const product of products) {
    for (const locale of LOCALES) {
      const base = productTitleCategory(product.categoryId, locale, product.categoryName ?? '');
      const category = base;
      const brand = productTitleBrand(locale);
      const reference = needsTitleReference(product.id) ? product.id : undefined;
      const title = buildProductSeoTitle(product as never, category, brand, budget[locale], locale, reference);
      titles.push({ locale, id: product.id, title });
    }
  }

  const byTitle = new Map<string, { locale: TitleLocale; id: string }[]>();
  for (const row of titles) {
    const list = byTitle.get(row.title) ?? [];
    list.push(row);
    byTitle.set(row.title, list);
  }
  const cross: string[] = [];
  const same: string[] = [];
  for (const [title, rows] of byTitle) {
    if (rows.length < 2) continue;
    (new Set(rows.map((r) => r.locale)).size > 1 ? cross : same).push(title);
  }

  const lengths = titles.map((t) => t.title.length).sort((a, b) => a - b);
  const over60 = lengths.filter((l) => l > 60).length;
  const overBudget = titles.filter((t) => t.title.length > budget[t.locale]).length;
  const refCount = titles.filter((t) => t.title.includes('Ref ')).length;
  const clipped = titles.filter((t) => t.title.includes('…')).length;
  // A title that was cut mid-word is the real problem - one that is long
  // but complete still tells the buyer what the product is.
  const midWordCut = titles.filter((t) => /[a-zà-ÿ…]{2,}\.\.\.|…\s*[a-zà-ÿ]{1,2}\b/i.test(t.title)).length;
  const refHidden = titles.filter((t) => {
    const at = t.title.indexOf('Ref ');
    return at > 0 && at > 60;
  }).length;

  console.log(
    `budget ${JSON.stringify(budget)}  products ${products.length} x ${LOCALES.length} = ${titles.length} titles`,
  );
  console.log(`duplicate groups : ${cross.length + same.length}  (cross-locale ${cross.length}, same-locale ${same.length})`);
  console.log(`title length      : median ${lengths[Math.floor(lengths.length / 2)]}  p90 ${lengths[Math.floor(lengths.length * 0.9)]}  max ${lengths[lengths.length - 1]}  over 60: ${over60}`);
  console.log(`over budget       : ${overBudget}`);
  console.log(`with Ref          : ${refCount}  (ref past 60 chars: ${refHidden})`);
  console.log(`clipped (ellipsis): ${clipped}`);

  const worst = [...byTitle.entries()]
    .filter(([, rows]) => rows.length > 1)
    .sort((a, b) => b[1].length - a[1].length);
  if (worst.length) {
    console.log('\n=== worst duplicate groups ===');
    for (const [title, rows] of worst.slice(0, 10)) {
      console.log(`  x${rows.length}  ${title}`);
      for (const row of rows.slice(0, 3)) console.log(`        ${row.locale}/${row.id}`);
    }
  }

  if (process.env.TITLE_SHOW !== 'none') {
    console.log('\n=== sample titles ===');
    for (const locale of LOCALES) {
      for (const id of ['DXE-A011-2', 'blankets-100', 'hats-110']) {
        const row = titles.find((t) => t.locale === locale && t.id === id);
        if (row) console.log(`  ${locale} ${id.padEnd(14)} ${row.title}`);
      }
    }
  }
}

main();
