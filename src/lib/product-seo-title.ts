/**
 * 产品标题 SEO 规则：仅组合目录中已存在的名称、材质、细度、颜色、款式、版型、织法、
 * 纱线结构、包装、重量、人群、季节与尺寸字段；不生成认证、价格、MOQ、库存、交期、
 * 产能、地区或性能主张。
 */
export type ProductTitleInput = {
  name?: unknown;
  material?: unknown;
  micron?: unknown;
  pattern?: unknown;
  collar?: unknown;
  knittingTechnology?: unknown;
  gender?: unknown;
  season?: unknown;
  sizes?: unknown;
  colors?: unknown;
  packaging?: unknown;
  weight_g?: unknown;
};

type TitleLocale = 'en' | 'de' | 'fr' | 'ja' | 'kr' | 'cn';

function clean(value: unknown): string {
  return String(value ?? '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&times;/gi, '×')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function comparable(value: string): string {
  return value.toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

function canUseFacet(value: string): boolean {
  return Boolean(value)
    && value.length <= 48
    && !/^(details?|description|n\/?a|see specification|various|custom(ized|izable)?)$/i.test(value)
    && !/\b(custom|oem|odm|bestseller|eu\s*\/\s*uk\s*\/\s*us|italian|french|frames?)\b/i.test(value);
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

function localeKey(locale: string): TitleLocale {
  return ['en', 'de', 'fr', 'ja', 'kr', 'cn'].includes(locale) ? locale as TitleLocale : 'en';
}

const AUDIENCE_LABELS: Record<TitleLocale, Record<string, string>> = {
  en: { women: "Women's", men: "Men's", unisex: 'Unisex', kids: 'Kids', baby: 'Baby' },
  de: { women: 'Damen', men: 'Herren', unisex: 'Unisex', kids: 'Kinder', baby: 'Baby' },
  fr: { women: 'Femme', men: 'Homme', unisex: 'Unisexe', kids: 'Enfant', baby: 'Bébé' },
  ja: { women: 'レディース', men: 'メンズ', unisex: 'ユニセックス', kids: 'キッズ', baby: 'ベビー' },
  kr: { women: '여성용', men: '남성용', unisex: '유니섹스', kids: '아동용', baby: '베이비' },
  cn: { women: '女款', men: '男款', unisex: '中性款', kids: '儿童款', baby: '婴童款' },
};

const SEASON_LABELS: Record<TitleLocale, Record<string, string>> = {
  en: { spring: 'Spring', summer: 'Summer', autumn: 'Autumn', fall: 'Autumn', winter: 'Winter', 'year-round': 'Year-round' },
  de: { spring: 'Frühling', summer: 'Sommer', autumn: 'Herbst', fall: 'Herbst', winter: 'Winter', 'year-round': 'Ganzjährig' },
  fr: { spring: 'Printemps', summer: 'Été', autumn: 'Automne', fall: 'Automne', winter: 'Hiver', 'year-round': "Toute l'année" },
  ja: { spring: '春', summer: '夏', autumn: '秋', fall: '秋', winter: '冬', 'year-round': '通年' },
  kr: { spring: '봄', summer: '여름', autumn: '가을', fall: '가을', winter: '겨울', 'year-round': '사계절' },
  cn: { spring: '春季', summer: '夏季', autumn: '秋季', fall: '秋季', winter: '冬季', 'year-round': '全年' },
};

function audienceFacet(value: unknown, locale: string): string {
  const normalized = clean(value).toLowerCase();
  const key = normalized.includes('women') ? 'women'
    : normalized.includes('men') ? 'men'
    : normalized.includes('unisex') ? 'unisex'
    : normalized.includes('kid') || normalized.includes('child') ? 'kids'
    : normalized.includes('baby') ? 'baby'
    : '';
  return key ? AUDIENCE_LABELS[localeKey(locale)][key] : '';
}

function seasonFacet(value: unknown, locale: string): string {
  const raw = clean(value).toLowerCase().replace(/，/g, '/');
  if (!canUseFacet(raw)) return '';
  const labels = SEASON_LABELS[localeKey(locale)];
  if (raw === 'year-round') return labels['year-round'];
  const keys = ['spring', 'summer', 'autumn', 'fall', 'winter'].filter((key) => new RegExp(`\\b${key}\\b`, 'i').test(raw));
  return keys.length ? [...new Set(keys.map((key) => labels[key]))].join(' / ') : '';
}

function dimensionFacet(value: unknown): string {
  const raw = clean(value).replace(/\([^)]*custom[^)]*\)/ig, '').trim();
  if (!canUseFacet(raw) || /\bcustom\b/i.test(raw)) return '';
  const dimension = raw.match(/\d+(?:\.\d+)?\s*(?:×|x|\*)\s*\d+(?:\.\d+)?\s*(?:cm|mm|in|inch)?/i)?.[0];
  if (dimension) return dimension.replace(/\*/g, '×').replace(/\s+/g, ' ');
  return raw.match(/\b(?:XXS|XS|S|M|L|XL|XXL|XXXL)(?:\s*\/\s*(?:XXS|XS|S|M|L|XL|XXL|XXXL)){0,5}\b/i)?.[0] || '';
}

function colorFacet(value: unknown): string {
  const raw = clean(value)
    .replace(/\bcolor cards?\b/ig, '')
    .replace(/\bcustomi[sz]e?\b/ig, '')
    .replace(/[，,]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!canUseFacet(raw) || /多种颜色可选|multiple colors?|various colors?/i.test(raw)) return '';
  const color = raw.match(/\b(?:black|white|grey|gray|beige|navy|blue|green|red|pink|brown|purple|camel|ivory|natural|multicolor)\b/i)?.[0];
  return color ? color.replace(/^./, (letter) => letter.toUpperCase()) : '';
}

function constructionFacet(value: unknown): string {
  const raw = clean(value);
  if (!canUseFacet(raw)) return '';
  const ply = raw.match(/\b(?:single[-\s]?strand|(?:2|two)[-\s]?ply|(?:3|three)[-\s]?ply)\b/i)?.[0];
  return ply ? ply.replace(/\s+/g, ' ') : '';
}

function packagingFacet(value: unknown): string {
  const raw = clean(value)
    .replace(/\/?\s*custom packaging/ig, '')
    .replace(/[，,;]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!canUseFacet(raw)) return '';
  const cone = raw.match(/(\d+(?:\.\d+)?\s*g)\s*cone\b/i)?.[1];
  const hank = raw.match(/(\d+(?:\.\d+)?\s*g)\s*hank\b/i)?.[1];
  return [cone ? `Cone ${cone}` : '', hank ? `Hank ${hank}` : ''].filter(Boolean).join(' / ');
}

function weightFacet(value: unknown): string {
  const raw = clean(value);
  if (!canUseFacet(raw) || /^(details?|description)$/i.test(raw)) return '';
  const measured = raw.match(/\b\d+(?:\s*[-–]\s*\d+)?\s*g(?:\s+per\s+\d+\s*m\s*cone)?\b/i)?.[0];
  return measured ? measured.replace(/\s+/g, ' ') : '';
}

function styleFacets(product: ProductTitleInput): string[] {
  const pattern = clean(product.pattern);
  const collar = clean(product.collar);
  const knit = clean(product.knittingTechnology);
  const accepted = [
    canUseFacet(pattern) && /cable|solid|plaid|floral|jacquard|stripe|ribbed|printed|scarf\s*\/\s*shawl/i.test(pattern) ? pattern : '',
    canUseFacet(collar) && /neck|collar|hood|zip/i.test(collar) ? collar : '',
    canUseFacet(knit) && /jacquard|cable|worsted|gauge|flat knit/i.test(knit) ? knit : '',
  ].filter(Boolean);
  return accepted.filter((facet, index, list) => !list.slice(0, index).some((prior) => includesFacet(prior, facet) || includesFacet(facet, prior)));
}

function titleFacets(product: ProductTitleInput, locale: string): string[] {
  const name = clean(product.name);
  const material = clean(product.material);
  const micron = clean(product.micron);
  const facets = [
    canUseFacet(material) && !includesFacet(name, material) ? material : '',
    canUseFacet(micron) && !includesFacet(name, micron) ? micron : '',
    ...styleFacets(product),
    colorFacet(product.colors),
    constructionFacet(product.pattern),
    packagingFacet(product.packaging),
    weightFacet(product.weight_g),
    audienceFacet(product.gender, locale),
    seasonFacet(product.season, locale),
    dimensionFacet(product.sizes),
  ].filter(Boolean);
  return facets.filter((facet, index, list) => !list.slice(0, index).some((prior) => includesFacet(prior, facet) || includesFacet(facet, prior)));
}

/** H1、Product Schema 和面包屑统一使用产品名称与真实长尾属性。 */
export function buildProductHeading(product: ProductTitleInput, locale = 'en'): string {
  const name = clean(product.name) || 'Cashmere Product';
  const facets = titleFacets(product, locale);
  return facets.length ? `${name} — ${facets.join(' · ')}` : name;
}

/** `<title>` 保留本地化分类、产品级名称、真实属性和简短品牌尾缀，避免关键词堆砌。 */
export function buildProductSeoTitle(
  product: ProductTitleInput,
  localizedCategory: string,
  brand = 'DONGXIAO',
  maxLength = 128,
  locale = 'en',
): string {
  const category = clean(localizedCategory);
  const productName = buildProductHeading(product, locale);
  const brandSuffix = brand ? ` | ${brand}` : '';
  const core = category ? `${category}: ${productName}` : productName;
  return `${clipWords(core, Math.max(56, maxLength - brandSuffix.length))}${brandSuffix}`;
}
