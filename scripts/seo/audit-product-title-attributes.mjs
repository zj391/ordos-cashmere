import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const catalog = JSON.parse(await fs.readFile(path.join(ROOT, 'src/data/products.json'), 'utf8'));
const products = catalog.categories.flatMap((category) => category.products.map((product) => ({ ...product, categoryId: category.id })));

const TITLE_FIELDS = ['material', 'micron', 'colors', 'knittingTechnology', 'pattern', 'season', 'gender', 'sizes', 'collar', 'packaging', 'weight_g', 'function'];
const CANDIDATE_FIELDS = [
  'color', 'colors', 'colorFamily', 'sleeve', 'sleeveType', 'closure', 'pockets',
  'craft', 'craftsmanship', 'finish', 'weave', 'usage', 'use', 'occasion',
  'packing', 'unit',
];
const FIELDS = [...new Set([...TITLE_FIELDS, ...CANDIDATE_FIELDS])];
const clean = (value) => String(value ?? '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const topValues = (values, limit = 16) => {
  const count = new Map();
  for (const value of values.map(clean).filter(Boolean)) count.set(value, (count.get(value) || 0) + 1);
  return [...count.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, limit);
};

const tagValues = products.flatMap((product) => Array.isArray(product.tags) ? product.tags : []).map((tag) => clean(tag).replace(/^"|"$/g, ''));
const allowedTagPattern = /^(women|men|ladies|unisex|kids|baby|beanie|beret|headband|cardigan|pullover|turtleneck|v-neck|crew neck|vest|zip|scarf|shawl|wrap|poncho|gloves|mittens|socks|leggings|pants|worsted|woolen|machine knitting|hand knitting|weaving|winter|spring|summer|autumn|fall)$/i;
const allowedTags = tagValues.filter((tag) => allowedTagPattern.test(tag));

const report = {
  totalProducts: products.length,
  availableProductKeys: [...new Set(products.flatMap((product) => Object.keys(product)))].sort(),
  titleFieldsAlreadyUsed: TITLE_FIELDS,
  candidateFieldsNotYetUsed: CANDIDATE_FIELDS,
  fieldCoverage: Object.fromEntries(FIELDS.map((field) => [field, products.filter((product) => clean(product[field])).length])),
  topFieldValues: Object.fromEntries(FIELDS.map((field) => [field, topValues(products.map((product) => product[field]))])),
  tagCoverage: {
    productsWithAnyTag: products.filter((product) => Array.isArray(product.tags) && product.tags.length).length,
    productsWithAllowedSemanticTag: products.filter((product) => (Array.isArray(product.tags) ? product.tags : []).some((tag) => allowedTagPattern.test(clean(tag).replace(/^"|"$/g, '')))).length,
    topAllowedTags: topValues(allowedTags),
    excludedTagExamples: topValues(tagValues.filter((tag) => !allowedTagPattern.test(tag)), 24),
  },
  categoryCoverage: Object.fromEntries(catalog.categories.map((category) => {
    const group = products.filter((product) => product.categoryId === category.id);
    return [category.id, Object.fromEntries(FIELDS.map((field) => [field, group.filter((product) => clean(product[field])).length]))];
  })),
};

console.log(JSON.stringify(report, null, 2));
