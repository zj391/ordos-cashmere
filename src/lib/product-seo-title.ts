/**
 * 产品标题 SEO 规则：仅组合目录中已存在的名称、材质、细度、颜色、款式、版型、织法、
 * 纱线支数/结构、包装、重量、已列应用、人群、季节与尺寸字段；不生成认证、价格、MOQ、
 * 库存、交期、产能、地区或性能主张。主产品名始终在前，避免关键词堆砌。
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
  tags?: unknown;
  sizes?: unknown;
  colors?: unknown;
  packaging?: unknown;
  weight_g?: unknown;
  function?: unknown;
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

function primaryProductName(value: unknown): string {
  const cleaned = clean(value)
    .replace(/^(?:(?:premium|wholesale|china|inner mongolia|ordos|high quality|european style|europe style|classic|new|hot|best|best sell|new arrival|2020|2021|2022|2023|2024|2025|2026)\s+)+/i, '')
    .replace(/\b(?:factory customized|factory direct|factory|manufacturer|supplier|wholesale|cheap|best sell|hot sell|price)\b/ig, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,;:/])/g, '$1')
    .trim();
  return cleaned.length >= 6 ? cleaned : clean(value);
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
  const key = normalized.includes('women') || normalized.includes('ladies') ? 'women'
    : normalized.includes('men') ? 'men'
    : normalized.includes('unisex') ? 'unisex'
    : normalized.includes('kid') || normalized.includes('child') || normalized.includes('girl') || normalized.includes('boy') ? 'kids'
    : normalized.includes('baby') ? 'baby'
    : '';
  return key ? AUDIENCE_LABELS[localeKey(locale)][key] : '';
}

function semanticTags(value: unknown): string[] {
  const entries = Array.isArray(value) ? value : String(value ?? '').split(/[，,;/|]+/);
  return entries
    .map((entry) => clean(entry))
    .filter((entry) => /^(women|men|unisex|kids?|children|ladies|girls?|boys?|baby|spring|summer|autumn|fall|winter|year-round)$/i.test(entry));
}

function audienceTagFacet(value: unknown, locale: string): string {
  return audienceFacet(semanticTags(value).find((tag) => /women|men|unisex|kid|child|ladies|girl|boy|baby/i.test(tag)), locale);
}

function seasonTagFacet(value: unknown, locale: string): string {
  return seasonFacet(semanticTags(value).find((tag) => /spring|summer|autumn|fall|winter|year-round/i.test(tag)), locale);
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

function yarnCountFacet(value: unknown): string {
  const raw = clean(value);
  if (!canUseFacet(raw)) return '';
  const count = raw.match(/\b(?:\d+\s*\/\s*\d+\s*(?:Nm|Ne)|Nm\s*\d+\s*\/\s*\d+)\b/i)?.[0];
  return count ? count.replace(/\s+/g, ' ') : '';
}

function applicationFacet(value: unknown): string {
  const raw = clean(value);
  if (!canUseFacet(raw)) return '';
  const match = raw.match(/\b(?:machine\s+knitting|hand\s+knitting|knitting|weaving|flat\s+knit)\b/i)?.[0];
  return match ? match.replace(/\s+/g, ' ') : '';
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
  const name = primaryProductName(product.name);
  const material = clean(product.material);
  const micron = clean(product.micron);
  const facets = [
    canUseFacet(material) && !includesFacet(name, material) ? material : '',
    canUseFacet(micron) && !includesFacet(name, micron) ? micron : '',
    ...styleFacets(product),
    colorFacet(product.colors),
    yarnCountFacet(product.sizes),
    packagingFacet(product.packaging),
    weightFacet(product.weight_g),
    applicationFacet(product.function),
    constructionFacet(product.pattern),
    audienceFacet(product.gender, locale) || audienceTagFacet(product.tags, locale),
    seasonFacet(product.season, locale) || seasonTagFacet(product.tags, locale),
    dimensionFacet(product.sizes),
  ].filter(Boolean);
  return facets.filter((facet, index, list) => !list.slice(0, index).some((prior) => includesFacet(prior, facet) || includesFacet(facet, prior)));
}

/** H1、Product Schema 和面包屑统一使用产品名称与真实长尾属性。 */
export function buildProductHeading(product: ProductTitleInput, locale = 'en'): string {
  const name = primaryProductName(product.name) || 'Cashmere Product';
  const facets = titleFacets(product, locale);
  return facets.length ? `${name} — ${facets.join(' · ')}` : name;
}

/**
 * `<title>` 以产品主名称开头，后接真实规格和简短品牌尾缀。主名称优先于类别或泛化
 * 促销词，使搜索结果更容易区分具体款式；超长时从末尾的低优先级规格开始裁切。
 */
export function buildProductSeoTitle(
  product: ProductTitleInput,
  localizedCategory: string,
  brand = 'DONGXIAO',
  maxLength = 128,
  locale = 'en',
): string {
  const category = clean(localizedCategory);
  const productName = primaryProductName(product.name) || 'Cashmere Product';

  // 以具体产品名为主体。类别仅在名称极短时提供行业语境，其余均为目录真实规格。
  const productContext = productName.length < 18 && category && !includesFacet(productName, category) ? category : '';
  const lowPriority = [productContext, ...titleFacets(product, locale)].filter(Boolean);

  const brandSuffix = brand ? ` | ${brand}` : '';
  const totalBudget = Math.max(56, maxLength - brandSuffix.length);

  // 找到最大规格数，使主名称与规格保持完整、可读且不重复。
  let keepN = lowPriority.length;
  while (keepN > 0) {
    const kept = lowPriority.slice(0, keepN);
    const candidate = `${productName} — ${kept.join(' · ')}`;
    if (candidate.length <= totalBudget) break;
    keepN -= 1;
  }
  let core = keepN > 0
    ? `${productName} — ${lowPriority.slice(0, keepN).join(' · ')}`
    : productName;

  // 仍然过长 → 仅在必要时截产品名，规格仍维持从高到低的目录字段顺序。
  if (core.length > totalBudget) {
    const reserved = keepN > 0
      ? 3 + lowPriority.slice(0, keepN).join(' · ').length
      : 0;
    const nameMax = totalBudget - reserved;
    const trimmed = nameMax > 8 ? clipWords(productName, nameMax) : '';
    core = keepN > 0
      ? `${trimmed} — ${lowPriority.slice(0, keepN).join(' · ')}`
      : trimmed;
  }
  return `${clipWords(core, totalBudget)}${brandSuffix}`;
}
