import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const source = JSON.parse(await fs.readFile(path.join(ROOT, 'src/data/products.json'), 'utf8'));
const all = source.categories.flatMap((category) => category.products.map((product) => ({ ...product, categoryId: category.id, categoryName: category.name })));

const counts = (items) => Object.fromEntries(Object.entries(items).map(([key, value]) => [key, value]));
const duplicateValues = (values) => {
  const seen = new Map();
  for (const value of values) {
    const key = String(value || '').trim().toLowerCase();
    if (!key) continue;
    seen.set(key, (seen.get(key) || 0) + 1);
  }
  return [...seen.entries()].filter(([, count]) => count > 1);
};

const byCategory = Object.fromEntries(source.categories.map((category) => {
  const products = all.filter((product) => product.categoryId === category.id);
  return [category.id, {
    products: products.length,
    nameDuplicates: duplicateValues(products.map((product) => product.name)).reduce((sum, [, count]) => sum + count, 0),
    withMaterial: products.filter((product) => String(product.material || '').trim()).length,
    withMicron: products.filter((product) => String(product.micron || '').trim()).length,
    withDetailedDescription: products.filter((product) => String(product.detailedDescription || '').trim()).length,
    withTags: products.filter((product) => Array.isArray(product.tags) && product.tags.length).length,
  }];
}));

const report = {
  totalProducts: all.length,
  exactDuplicateNames: duplicateValues(all.map((product) => product.name)).length,
  recordsInDuplicateNameGroups: duplicateValues(all.map((product) => product.name)).reduce((sum, [, count]) => sum + count, 0),
  fields: counts({
    withMaterial: all.filter((product) => String(product.material || '').trim()).length,
    withMicron: all.filter((product) => String(product.micron || '').trim()).length,
    withDetailedDescription: all.filter((product) => String(product.detailedDescription || '').trim()).length,
    withTags: all.filter((product) => Array.isArray(product.tags) && product.tags.length).length,
    withKnitTechnology: all.filter((product) => String(product.knittingTechnology || '').trim()).length,
    withPattern: all.filter((product) => String(product.pattern || '').trim()).length,
    withSeason: all.filter((product) => String(product.season || '').trim()).length,
    withSizes: all.filter((product) => String(product.sizes || '').trim()).length,
  }),
  byCategory,
  duplicateNameExamples: duplicateValues(all.map((product) => product.name)).slice(0, 12),
};

console.log(JSON.stringify(report, null, 2));
