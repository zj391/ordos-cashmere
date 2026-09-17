/**
 * Yarn blend formulations manufactured at our Ordos facility.
 *
 * 10 production-tested yarn formulations that define our cashmere yarn program.
 * Each entry pairs a yarn count (Nm) with a fiber blend ratio. These formulations
 * drive product-page material descriptions and yarn category-page SEO copy.
 *
 * Categories:
 *   - pure-cashmere: 100% Grade A Mongolian cashmere (no blends)
 *   - cashmere-wool: cashmere + merino/wool blends (entry-level + mid-tier)
 *   - cashmere-blend: cashmere + special fibers (linen, silk, cotton, recycled)
 *   - specialty: signature / signature-blend lines (YARK cotton-cashmere, Taiji)
 *
 * Display rules (CategoryPage.astro + yarn page):
 *   - yarn category page renders these as a compact "Yarn Formulations" table
 *   - product detail pages reference the matching blend formula in the spec ledger
 *   - yarn-fabric.astro and cashmere-yarn-types.astro surface the full table for SEO
 */
export type YarnFormulaCategory =
  | 'pure-cashmere'
  | 'cashmere-wool'
  | 'cashmere-blend'
  | 'specialty';

export interface YarnFormula {
  /** Yarn count (Nm). Examples: "2/26NM", "1/4.3NM 和 1/6.5NM" */
  count: string;
  /** English-style fiber blend description. Free-form for special fibers. */
  blend: string;
  /** Yarn construction category */
  category: YarnFormulaCategory;
  /** Short blurb explaining typical use / position */
  useCase: string;
  /** B2B MOQ in kg per count / color */
  moqKg: number;
  /** Typical B2B wholesale FOB Tianjin range, USD per kg */
  fobUsdPerKg: string;
}

export const YARN_FORMULAS: YarnFormula[] = [
  // Pure cashmere (4 entries)
  {
    count: '2/26NM',
    blend: '100% cashmere',
    category: 'pure-cashmere',
    useCase: 'Standard machine-knitting and weaving yarn for sweaters, scarves, accessories',
    moqKg: 50,
    fobUsdPerKg: 'USD 95–120',
  },
  {
    count: '2/36NM',
    blend: '100% cashmere',
    category: 'pure-cashmere',
    useCase: 'Mid-gauge pure cashmere for lightweight knitwear and refined jersey',
    moqKg: 50,
    fobUsdPerKg: 'USD 105–135',
  },
  {
    count: '3/68NM',
    blend: '100% cashmere',
    category: 'pure-cashmere',
    useCase: 'Fine-gauge worsted cashmere for premium dress weight and ultra-fine knit',
    moqKg: 50,
    fobUsdPerKg: 'USD 145–180',
  },
  {
    count: '1/4.3NM 和 1/6.5NM',
    blend: '100% cashmere',
    category: 'pure-cashmere',
    useCase: 'Chunky-weaving / hand-knit yarn for blanket, throw, and home textile',
    moqKg: 50,
    fobUsdPerKg: 'USD 85–110',
  },
  // Cashmere + wool (2 entries)
  {
    count: '2/26NM',
    blend: '30% cashmere + 70% wool',
    category: 'cashmere-wool',
    useCase: 'Entry-level cashmere-wool blend for sweaters, scarves, and accessories',
    moqKg: 50,
    fobUsdPerKg: 'USD 55–75',
  },
  {
    count: '2/60NM',
    blend: '30% cashmere + 70% wool',
    category: 'cashmere-wool',
    useCase: 'Fine-gauge cashmere-wool blend for premium mid-tier knitwear',
    moqKg: 50,
    fobUsdPerKg: 'USD 70–90',
  },
  // Cashmere blend (2 entries)
  {
    count: '1/17NM',
    blend: '65% cashmere + 35% linen',
    category: 'cashmere-blend',
    useCase: 'Spring/summer cashmere-linen for breathable knitwear and transitional pieces',
    moqKg: 50,
    fobUsdPerKg: 'USD 80–100',
  },
  {
    count: '2/60NM',
    blend: '70% cashmere + 30% silk',
    category: 'cashmere-blend',
    useCase: 'Premium cashmere-silk blend for fine-gauge tops and luxury knit accessories',
    moqKg: 50,
    fobUsdPerKg: 'USD 130–165',
  },
  // Specialty (2 entries)
  {
    count: '2/16NM',
    blend: '50% cashmere + 50% cotton-cashmere (YARK)',
    category: 'specialty',
    useCase: 'YARK signature cotton-cashmere blend for transitional-season casual knit',
    moqKg: 100,
    fobUsdPerKg: 'USD 75–95',
  },
  {
    count: '2/80NM',
    blend: '10% cashmere + 40% wool + 50% recycled cellulose (Taiji Stone fiber)',
    category: 'specialty',
    useCase: 'Taiji Stone signature blend with mineral-infused cellulose for wellness-positioned knitwear',
    moqKg: 100,
    fobUsdPerKg: 'USD 70–95',
  },
];

/** Summary counts per category, used by yarn category page hero and SEO copy */
export const YARN_FORMULA_STATS = YARN_FORMULAS.reduce<Record<YarnFormulaCategory, number>>(
  (acc, f) => {
    acc[f.category] = (acc[f.category] || 0) + 1;
    return acc;
  },
  { 'pure-cashmere': 0, 'cashmere-wool': 0, 'cashmere-blend': 0, specialty: 0 }
);

export const YARN_FORMULA_LABELS: Record<YarnFormulaCategory, { en: string; cn: string }> = {
  'pure-cashmere':  { en: 'Pure Cashmere', cn: '纯羊绒' },
  'cashmere-wool':  { en: 'Cashmere + Wool', cn: '羊绒 + 羊毛' },
  'cashmere-blend': { en: 'Cashmere + Specialty Fibers', cn: '羊绒 + 特种纤维' },
  specialty:        { en: 'Signature Blends', cn: '特色混纺' },
};
