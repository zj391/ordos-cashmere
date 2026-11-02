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
  origin?: unknown;
  knitStructure?: unknown;
  certifications?: unknown;
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

// V4 long-tail: origin labels identify the fiber's geographic source.
// Only the origin keys actually attested in the products catalog are listed;
// unrecognized values are dropped (strict facts-only policy).
const ORIGIN_LABELS: Record<TitleLocale, Record<string, string>> = {
  en: {
    'inner-mongolia': 'Inner Mongolia Cashmere',
    'ordos': 'Ordos Cashmere',
    'alashan': 'Alashan Cashmere',
    'mongolia': 'Mongolian Cashmere',
    'china': 'China Cashmere',
  },
  de: {
    'inner-mongolia': 'Innere Mongolei Kaschmir',
    'ordos': 'Ordos Kaschmir',
    'alashan': 'Alashan Kaschmir',
    'mongolia': 'Mongolisches Kaschmir',
    'china': 'Kaschmir aus China',
  },
  fr: {
    'inner-mongolia': 'Cachemire de Mongolie-Intérieure',
    'ordos': 'Cachemire d\u2019Ordos',
    'alashan': 'Cachemire d\u2019Alashan',
    'mongolia': 'Cachemire mongol',
    'china': 'Cachemire de Chine',
  },
  ja: {
    'inner-mongolia': '内モンゴル産カシミア',
    'ordos': 'オルドス産カシミア',
    'alashan': '阿拉善産カシミア',
    'mongolia': 'モンゴル産カシミア',
    'china': '中国産カシミア',
  },
  kr: {
    'inner-mongolia': '내몽골 캐시미어',
    'ordos': '오르도스 캐시미어',
    'alashan': '알라산 캐시미어',
    'mongolia': '몽골 캐시미어',
    'china': '중국 캐시미어',
  },
  cn: {
    'inner-mongolia': '内蒙古羊绒',
    'ordos': '鄂尔多斯羊绒',
    'alashan': '阿拉善羊绒',
    'mongolia': '蒙古国羊绒',
    'china': '中国羊绒',
  },
};

// V4 long-tail: knit-structure labels identify construction techniques
// that materially affect hand-feel, durability, and B2B search intent.
const KNIT_STRUCTURE_LABELS: Record<TitleLocale, Record<string, string>> = {
  en: {
    'fully-fashioned': 'Fully Fashioned',
    'whole-garment': 'Whole Garment',
    'seamless': 'Seamless',
    'linking': 'Linked',
    'intarsia': 'Intarsia',
  },
  de: {
    'fully-fashioned': 'Fully Fashioned',
    'whole-garment': 'Ganzstrick',
    'seamless': 'Nahtlos',
    'linking': 'Vernäht',
    'intarsia': 'Intarsia',
  },
  fr: {
    'fully-fashioned': 'Façonné',
    'whole-garment': 'Tricot entier',
    'seamless': 'Sans couture',
    'linking': 'Rembourré',
    'intarsia': 'Intarsia',
  },
  ja: {
    'fully-fashioned': 'フルファッション',
    'whole-garment': 'ホールガーメント',
    'seamless': 'シームレス',
    'linking': 'リンキング',
    'intarsia': 'インターシャ',
  },
  kr: {
    'fully-fashioned': '풀패션',
    'whole-garment': '홀가먼트',
    'seamless': '심리스',
    'linking': '링킹',
    'intarsia': '인터시아',
  },
  cn: {
    'fully-fashioned': '全成型',
    'whole-garment': '一体成型',
    'seamless': '无缝',
    'linking': '套口缝合',
    'intarsia': '嵌花',
  },
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

function gaugeFacet(value: unknown): string {
  const raw = clean(value);
  if (!canUseFacet(raw)) return '';
  const m = raw.match(/\b(\d{1,2}(?:\.\d+)?\s*(?:gg|gauge|gg\.|G))\b/i)?.[0];
  if (m) return m.replace(/\./g, '.').replace(/\s+/g, '');
  const m2 = raw.match(/\b(\d{1,2})\s*gauge\b/i)?.[0];
  if (m2) return m2.replace(/\s+/g, '') + 'gg';
  return '';
}

function materialCompositionFacet(value: unknown): string {
  // For non-100% cashmere blends, expose the composition as a facet.
  // "100% Cashmere" is already covered by the material facet.
  const raw = clean(value);
  if (!canUseFacet(raw)) return '';
  if (/^100\s?%\s*cashmere$/i.test(raw)) return '';
  const blend = raw.match(/\b\d{1,3}\s?%\s*cashmere(?:\s*\d{1,3}\s?%\s*\w+)?\b/i)?.[0];
  return blend ? blend.replace(/\s+/g, ' ') : '';
}

function colorFallbackFacet(value: unknown): string {
  // When colors is empty or the placeholder "多种颜色可选" / "various colors",
  // expose a generic "Multi-color" hint so the title signals variety.
  const raw = clean(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return '';
    const joined = raw.toLowerCase();
    if (/多种颜色|various|multiple|multi-?colou?r/i.test(joined)) return '';
  }
  // Real colors already extracted by colorFacet, this is a no-op
  return '';
}

function patternFromName(value: unknown): string {
  // When the `pattern` field is empty, fall back to keywords from the
  // product name. Common long-tail patterns for B2B cashmere.
  // Skip the strict canUseFacet length (48) + banned-words (custom/oem/...)
  // filters since those are meant for short attribute fields; product
  // names are much longer and frequently contain "Custom", "Wholesale"
  // and similar commerce wording that should not disqualify extraction.
  const raw = clean(value);
  if (!raw) return '';
  // Order matters: more specific (multi-word) candidates come first so
  // 'Cable Knit' wins over 'Knit' alone.
  const candidates = [
    'Cable Knit', 'Cable knit', 'Cable',
    'Solid Color', 'Solid Colour', 'Solid',
    'Jacquard', 'Printed', 'Print',
    'Stripe', 'Striped', 'Ribbed', 'Rib',
    'POM Pom', 'POM', 'Pom Pom',
    'Crochet', 'Plain Dyed',
    'Diamond', 'Argyle', 'Fair Isle',
    'Twisted', 'Brushed', 'Boucle',
    'Knit', 'Knitted', 'Knitting',
    'Woven', 'Weaving',
  ];
  for (const c of candidates) {
    if (new RegExp(`\\b${c.replace(/\s+/g, '\\s+')}\\b`, 'i').test(raw)) {
      return c.replace(/\b\w/g, (l) => l.toUpperCase());
    }
  }
  return '';
}

function styleFromTags(value: unknown): string {
  // Pull common style keywords from the tags array. Tags typically
  // contain short labels like "Cable Knit", "Solid", "Crochet".
  // Skip canUseFacet because tags are short labels — they're already
  // curated, so the strict length / banned-words check would block
  // legitimate extractions.
  const entries = Array.isArray(value) ? value : String(value ?? '').split(/[，,;/|]+/);
  const keywords = [
    'Cable Knit', 'Solid', 'Jacquard', 'Printed', 'Ribbed', 'Rib',
    'Crochet', 'Braided', 'Twisted', 'Brushed', 'Boucle', 'Diamond',
  ];
  for (const entry of entries) {
    const cleaned = clean(entry);
    if (!cleaned) continue;
    for (const k of keywords) {
      if (new RegExp(`\\b${k}\\b`, 'i').test(cleaned)) return k;
    }
  }
  return '';
}

function audienceFromName(value: unknown, locale: string): string {
  // Fall back to extracting audience keywords from the product name
  // when the gender field is empty. Name patterns: "Women/Ladies", "Men",
  // "Kids/Children/Boys/Girls", "Baby/Infant", "Unisex".
  const raw = clean(value);
  if (!raw) return '';
  const lc = raw.toLowerCase();
  if (!/(women|men|ladies|kid|child|girl|boy|baby|unisex)/i.test(lc)) return '';
  return audienceFacet(raw, locale);
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

// V4 long-tail: origin facet. Sourced from (in priority order):
// 1. explicit product.origin field (when populated)
// 2. tags array entries that match the origin taxonomy
// 3. product name keyword scan
// All paths use a strict allow-list of origin keys; unknown strings are
// dropped to keep the SEO signal consistent and avoid false claims.
const ORIGIN_KEY_PATTERN = /\b(?:inner\s*mongolia|ordos|alashan|mongolia|china)\b/i;

function originKeyFromRaw(raw: string): string {
  if (!raw) return '';
  const lc = raw.toLowerCase();
  if (/\balashan\b/i.test(lc)) return 'alashan';
  if (/\bordos\b/i.test(lc)) return 'ordos';
  if (/\b(?:inner\s*mongolia|inner\s*mongolian)\b/i.test(lc)) return 'inner-mongolia';
  if (/\bmongolia\b/i.test(lc) && !/\binn/i.test(lc)) return 'mongolia';
  if (/\bchina\b/i.test(lc)) return 'china';
  return '';
}

function originFacet(value: unknown, locale: string): string {
  const raw = clean(value);
  if (!raw || !ORIGIN_KEY_PATTERN.test(raw)) return '';
  const key = originKeyFromRaw(raw);
  if (!key) return '';
  return ORIGIN_LABELS[localeKey(locale)][key] || '';
}

function originFromTags(value: unknown, locale: string): string {
  const entries = Array.isArray(value) ? value : String(value ?? '').split(/[，,;/|]+/);
  for (const entry of entries) {
    const cleaned = clean(entry).replace(/^["']|["']$/g, '');
    if (!cleaned) continue;
    const label = originFacet(cleaned, locale);
    if (label) return label;
  }
  return '';
}

function originFromName(value: unknown, locale: string): string {
  const raw = clean(value);
  if (!raw || !ORIGIN_KEY_PATTERN.test(raw)) return '';
  return originFacet(raw, locale);
}

// V4 long-tail: knit structure facet. Extracted from explicit
// product.knitStructure field or, fall-back, from product name keyword
// scan. Strict allow-list of techniques that have clear buyer intent.
const KNIT_STRUCTURE_KEY_PATTERN = /\b(?:fully[\s-]?fashioned|whole[\s-]?garment|seamless|linking|intarsia)\b/i;

function knitStructureFacet(value: unknown, locale: string): string {
  const raw = clean(value);
  if (!raw || !KNIT_STRUCTURE_KEY_PATTERN.test(raw)) return '';
  const lc = raw.toLowerCase();
  let key = '';
  if (/fully[\s-]?fashioned/.test(lc)) key = 'fully-fashioned';
  else if (/whole[\s-]?garment/.test(lc)) key = 'whole-garment';
  else if (/\bseamless\b/.test(lc)) key = 'seamless';
  else if (/\bintarsia\b/.test(lc)) key = 'intarsia';
  else if (/\blinking\b/.test(lc)) key = 'linking';
  if (!key) return '';
  return KNIT_STRUCTURE_LABELS[localeKey(locale)][key] || '';
}

function knitStructureFromName(value: unknown, locale: string): string {
  const raw = clean(value);
  if (!raw || !KNIT_STRUCTURE_KEY_PATTERN.test(raw)) return '';
  return knitStructureFacet(raw, locale);
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

/**
 * The candidate facets for a product.
 *
 * `excludeNameFacets` drops the facets the name already carries - a
 * title that repeats "100% Cashmere" inside "100% Cashmere Blanket"
 * spends budget on nothing. The title builder turns it off, because
 * the name it compares against is the *clipped* one: a name that lost
 * "100% Cashmere" to the budget needs that facet back.
 */
function titleFacets(product: ProductTitleInput, locale: string, excludeNameFacets = true): string[] {
  const name = primaryProductName(product.name);
  const material = clean(product.material);
  const micron = clean(product.micron);
  const facets = [
    canUseFacet(material) && !(excludeNameFacets && includesFacet(name, material)) ? materialCompositionFacet(material) || material : '',
    originFacet(product.origin, locale)
      || originFromTags(product.tags, locale)
      || originFromName(name, locale),
    canUseFacet(micron) && !(excludeNameFacets && includesFacet(name, micron)) ? micron : '',
    patternFromName(name),
    ...styleFacets(product),
    styleFromTags(product.tags),
    colorFacet(product.colors),
    yarnCountFacet(product.sizes),
    packagingFacet(product.packaging),
    weightFacet(product.weight_g),
    applicationFacet(product.function),
    gaugeFacet(product.knittingTechnology),
    knitStructureFacet(product.knitStructure, locale)
      || knitStructureFromName(name, locale),
    constructionFacet(product.pattern),
    audienceFacet(product.gender, locale)
      || audienceTagFacet(product.tags, locale)
      || audienceFromName(product.name, locale),
    seasonFacet(product.season, locale)
      || seasonTagFacet(product.tags, locale),
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
 * H1 (页面主标题) — 仅显示产品主名 + 1-2 个最关键规格。
 *
 * 与 buildProductHeading (用于 SEO title、og:title、schema、breadcrumb) 分离：
 * SEO 长尾保留在 meta 层，视觉 H1 只承担"这是什么产品"的传达，
 * 避免 6 行 H1 撕裂 hero 区视觉。
 *
 * 设计原则 (2026-09-16 editorial 重构):
 *   - 最多 3 段：name + material + micron
 *   - 总长度 ≤ 60 字符
 *   - 所有 token 必须是 buildProductHeading 的子串 (SEO 等价)
 */
export function buildProductH1(product: ProductTitleInput, locale = 'en'): string {
  const name = primaryProductName(product.name) || 'Cashmere Product';
  const material = clean(product.material);
  const micron = clean(product.micron);

  // 拼接候选 segment，每个 segment 都来自 buildProductHeading 的 facet 池
  // 这样 H1 的可见文本在 SEO 长尾里一定存在，不会引入新 token
  const candidates: string[] = [name];
  if (canUseFacet(material) && !includesFacet(name, material)) {
    candidates.push(materialCompositionFacet(material) || material);
  }
  if (canUseFacet(micron) && !includesFacet(name, micron)) {
    candidates.push(micron);
  }

  // 由长到短尝试，确保 ≤ 60 chars
  const joiner = ' · ';
  let result = candidates.join(joiner);
  while (result.length > 60 && candidates.length > 1) {
    candidates.pop();
    result = candidates.join(joiner);
  }
  // 仍超长则截断 name
  if (result.length > 60) {
    const tail = candidates.length > 1 ? joiner + candidates.slice(1).join(joiner) : '';
    const budget = 60 - tail.length;
    result = clipWords(name, budget) + tail;
  }
  return result;
}

/**
 * The separator between the product name and the reference.
 */
const REF_SEPARATOR = ' - ';
/**
 * The separator between the description part and the category term.
 */
const CATEGORY_SEPARATOR = ' — ';
/**
 * The separator between the specification facets.
 */
const SPEC_SEPARATOR = ' · ';

/**
 * Cut a value to a hard length.
 *
 * clipWords() keeps a value whole when the cut would leave too little
 * to be useful, which is the right behaviour for a product name but
 * wrong for a title that has to fit a budget. This always fits.
 */
function fitToLength(value: string, max: number): string {
  if (value.length <= max) return value;
  if (max <= 1) return value.slice(0, Math.max(1, max));
  const cut = value.slice(0, max - 1);
  const boundary = cut.replace(/\s+\S*$/, '').trim();
  const trimmed = (boundary || cut.trim()).replace(/[.,;:]+$/, '');
  return trimmed.length >= Math.min(8, max - 1) ? `${trimmed}…` : `${value.slice(0, max - 1)}…`;
}

/**
 * Drop the leading words that the category term already carries.
 *
 * "Cashmere" and "Custom" repeat what the localised category says
 * ("Cashmere Sweaters", "Kaschmir-Pullover"), so when the name has to
 * be clipped they are the first words worth losing - the budget is
 * better spent on "crew-neck sweater" than on "Cashmere".
 */
function stripGenericHead(name: string): string {
  const stripped = name.replace(
    /^(?:(?:cashmere|custom|wholesale|designer|luxury|premium)\s+)+/i,
    '',
  ).trim();
  // Never strip the whole name away.
  return stripped.length >= 6 ? stripped : name;
}

/**
 * The specification facets, in the order they are worth budget.
 *
 * The order matters when the budget runs out: what is dropped first is
 * what least often separates two catalogue entries.
 *
 *   1. the size - "150×200" is what tells two blankets apart
 *   2. the weight - the second half of that pair
 *   3. the micron count - the quality grade a buyer filters on
 *   4. the material - "100% Cashmere" against a blend
 *   5. the colour
 *   6. the construction - cable, ribbed, jacquard
 *   7. the knit structure - fully fashioned, seamless
 *   8. the gauge and the yarn count
 *   9. the audience and the season
 *  10. the origin - "Inner Mongolia Cashmere" is a brand-level fact
 *      and a brand-level keyword, so it is the first thing to go
 */
function titleSpecFacets(product: ProductTitleInput, locale: string): string[] {
  // The name filter is off: the builder decides per candidate whether
  // the *shipped* name still carries the facet.
  const facets = titleFacets(product, locale, false).filter(Boolean);
  const rank = (facet: string): number => {
    if (dimensionFacet(product.sizes) === facet) return 0;
    if (weightFacet(product.weight_g) === facet) return 1;
    if (clean(product.micron) === facet) return 2;
    if (clean(product.material) === facet) return 3;
    if (colorFacet(product.colors) === facet) return 4;
    if (knitStructureFacet(product.knitStructure, locale) === facet) return 6;
    if (gaugeFacet(product.knittingTechnology) === facet) return 7;
    if (yarnCountFacet(product.sizes) === facet) return 7;
    if (audienceFacet(product.gender, locale) === facet) return 8;
    if (seasonFacet(product.season, locale) === facet) return 9;
    if (originFacet(product.origin, locale) === facet) return 10;
    return 5;
  };
  return [...facets].sort((a, b) => rank(a) - rank(b));
}

/**
 * `<title>` for a product page.
 *
 * 2026-11-02: the order is
 *
 *     name - Ref | category · specs | brand
 *
 * The reference comes straight after the name because it is the only
 * field that tells two catalogue entries with the same name apart
 * (506 of the 1,340 products share a name), and a search result shows
 * the first ~60 characters - so the reference has to be inside that
 * window, not at the end of a 150-character title where it used to be.
 *
 * The localised category term follows it because it is the only part
 * of the title that differs between the six language versions of one
 * product: the catalogue names are English source strings on every
 * locale, so without the term the de / fr / ja / kr pages shipped the
 * English title and competed with the English page for every query.
 *
 * The specs come last of the three because they are the only part that
 * can be dropped: when the budget runs out they give way, never the
 * reference and never the category term.
 *
 * The budget comes from src/lib/product-title-context.ts, which is also
 * what the collision check and the offline simulator use - so the title
 * that is measured here is the title that ships.
 */
export function buildProductSeoTitle(
  product: ProductTitleInput,
  localizedCategory: string,
  brand = 'DONGXIAO',
  maxLength = 150,
  locale = 'en',
  /**
   * The catalogue reference (e.g. "DXE-A011-2").
   *
   * 506 products share their `name` with another product and 92 share
   * one name exactly, so without a discriminator those pages all
   * shipped the same title. The reference is the only field that tells
   * them apart - and it is already on the page under "Reference" and in
   * the Product schema as sku and mpn, so appending it states nothing the
   * page does not already show.
   *
   * The caller passes it only for the products whose title actually
   * collides with another page's title (see src/lib/product-title-ref.ts).
   */
  reference?: string,
): string {
  const category = clean(localizedCategory);
  const productName = primaryProductName(product.name) || 'Cashmere Product';
  const fullName = stripGenericHead(productName);

  const brandSuffix = brand ? ` | ${brand}` : '';
  const refSuffix = reference ? `${REF_SEPARATOR}Ref ${clean(reference)}` : '';

  // The category term only appears when the product name does not
  // already contain it.
  const productContext = category && !includesFacet(fullName, category) ? category : '';

  // The parts that must survive whatever else happens.
  const reserved =
    brandSuffix.length +
    refSuffix.length +
    (productContext ? productContext.length + CATEGORY_SEPARATOR.length : 0);

  // The specs are what separate two catalogue entries that share a
  // name, so they are the candidates for the budget that is left.
  const specs = titleSpecFacets(product, locale);

  const bodyBudget = Math.max(16, maxLength - reserved);

  // The name and the specs compete for one budget, and the decision has
  // to be made together.
  //
  // In two passes the name took its share first and the specs got
  // whatever was left, which clipped "100% Cashmere Blanket ·
  // 150×200cm, 870g" down to "100% Cashmere…" and lost the size and
  // the weight that tell two blankets apart. In the other order the
  // specs took the budget first and "crew-neck sweater — Grey" lost
  // its colour.
  //
  // So the two are chosen together: every way of clipping the name is
  // tried, each one is paired with the specs that still fit, and the
  // combination that keeps the most information wins.
  //
  // The scoring weights the name above the specs, because the name is
  // the product's identity - a title that says "14–15.5µm · 100%
  // Cashmere" without saying what the product is says nothing. A spec
  // is worth less than the same number of characters of name, but a
  // spec that the clipped name lost is worth more than one it still
  // carries, so it is never counted twice.
  const candidates: { score: number; name: string; specs: string[] }[] = [];

  // The name can never be longer than the body budget: the category
  // term and the reference are reserved before it, and the final
  // fitToLength() would otherwise cut the category term off the end -
  // which is the one part that must never be clipped, and the one
  // that keeps the six language versions of a product apart.
  const maxNameLen = Math.min(fullName.length, bodyBudget);

  for (let cap = maxNameLen; cap >= 12; cap--) {
    const name = cap >= fullName.length ? fullName : clipWords(fullName, cap);
    const nameLen = name.replace(/…$/, '').trim().length;
    if (nameLen < 8) break;

    // The specs that still fit next to this name, in priority order.
    const chosen: string[] = [];
    let cost = 0;
    for (const spec of specs) {
      if (includesFacet(name, spec)) continue;
      const add = (chosen.length ? SPEC_SEPARATOR.length + chosen.join(SPEC_SEPARATOR).length : 0)
        + SPEC_SEPARATOR.length + spec.length;
      if (name.length + reserved + cost + add > maxLength) continue;
      chosen.push(spec);
      cost += add;
    }

    // The name wins ties, and a spec that the name lost to the
    // clipping counts for more than one it still carries.
    const specValue = chosen.reduce((sum, spec) => {
      const lost = !includesFacet(fullName, spec);
      return sum + spec.length * (lost ? 0.6 : 0);
    }, 0);
    candidates.push({ score: nameLen + specValue, name, specs: chosen });

    // Below 16 characters the name no longer identifies the product,
    // so the search stops there.
    if (cap <= 16) break;
  }

  let best = candidates[0];
  for (const candidate of candidates) {
    if (candidate.score > best.score) best = candidate;
  }

  const name = best.name;
  const kept = best.specs;

  const specPart = kept.length ? `${SPEC_SEPARATOR}${kept.join(SPEC_SEPARATOR)}` : '';
  const head = `${name}${refSuffix}${productContext ? `${CATEGORY_SEPARATOR}${productContext}` : ''}`;
  const title = `${head}${specPart}${brandSuffix}`;

  return title.length > maxLength ? fitToLength(title, maxLength) : title;
}
