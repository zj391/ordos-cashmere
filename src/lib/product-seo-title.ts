/**
 * 产品标题 SEO 规则：仅组合产品目录中已存在的名称、材质、细度和页面本地化分类词。
 * 不生成或推断认证、价格、MOQ、库存、交期、产能、适用地区或性能主张。
 */
export type ProductTitleInput = {
  name?: unknown;
  material?: unknown;
  micron?: unknown;
};

function clean(value: unknown): string {
  return String(value ?? '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function comparable(value: string): string {
  return value.toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

function canUseFacet(value: string): boolean {
  return Boolean(value) && !/^(details?|description|n\/?a|see specification|various|custom(ized|izable)?)$/i.test(value);
}

function includesFacet(name: string, facet: string): boolean {
  const haystack = comparable(name);
  const needle = comparable(facet);
  return Boolean(needle) && haystack.includes(needle);
}

function clipWords(value: string, max: number): string {
  if (value.length <= max) return value;
  const clipped = value.slice(0, Math.max(1, max - 1));
  const wordBoundary = clipped.replace(/\s+\S*$/, '').trim();
  return `${wordBoundary || clipped.trim()}…`;
}

/**
 * 用完整产品名称承载 SKU 级差异，再补充名称中不存在的真实材质和细度。
 * 该值用于页面 H1、Product Schema 和面包屑，保持用户可见标题与实体名称一致。
 */
export function buildProductHeading(product: ProductTitleInput): string {
  const name = clean(product.name) || 'Cashmere Product';
  const material = clean(product.material);
  const micron = clean(product.micron);
  const facets = [
    canUseFacet(material) && !includesFacet(name, material) ? material : '',
    canUseFacet(micron) && !includesFacet(name, micron) ? micron : '',
  ].filter(Boolean);

  return facets.length ? `${name} — ${facets.join(' · ')}` : name;
}

/**
 * `<title>` 以本地化分类词开头，随后保留产品级名称，并将品牌放在尾部。
 * 这使每个详情页有描述性、差异化且较为简洁的 title，而不进行关键词堆砌。
 */
export function buildProductSeoTitle(
  product: ProductTitleInput,
  localizedCategory: string,
  brand = 'DONGXIAO',
  maxLength = 78,
): string {
  const category = clean(localizedCategory);
  const productName = buildProductHeading(product);
  const brandSuffix = brand ? ` | ${brand}` : '';
  const core = category ? `${category}: ${productName}` : productName;
  return `${clipWords(core, Math.max(40, maxLength - brandSuffix.length))}${brandSuffix}`;
}
