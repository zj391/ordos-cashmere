import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const catalog = JSON.parse(await fs.readFile(path.join(ROOT, 'src/data/products.json'), 'utf8'));
const products = catalog.categories.flatMap((category) => category.products.map((product) => ({ ...product, categoryId: category.id })));
const fields = ['colors', 'sizes', 'knittingTechnology', 'pattern', 'packaging', 'weight', 'weight_g'];
const clean = (value) => String(value ?? '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const valueFor = (product, field) => Array.isArray(product[field]) ? product[field].map(clean).filter(Boolean).join(', ') : clean(product[field]);
const topValues = (values, limit = 12) => {
  const counts = new Map();
  for (const value of values.filter(Boolean)) counts.set(value, (counts.get(value) || 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, limit);
};

const byCategory = Object.fromEntries(catalog.categories.map((category) => {
  const group = products.filter((product) => product.categoryId === category.id);
  return [category.id, Object.fromEntries(fields.map((field) => [field, group.filter((product) => Boolean(valueFor(product, field))).length]))];
}));

console.log(JSON.stringify({
  totalProducts: products.length,
  fieldCoverage: Object.fromEntries(fields.map((field) => [field, products.filter((product) => Boolean(valueFor(product, field))).length])),
  topValues: Object.fromEntries(fields.map((field) => [field, topValues(products.map((product) => valueFor(product, field)))])),
  byCategory,
}, null, 2));
