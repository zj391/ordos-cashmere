// Tag landing page SEO copy. Each tag combo (e.g. "cashmere beanies",
// "cashmere cardigans") gets its own keyword-rich landing page so
// Google can index long-tail B2B queries that aren't covered by the
// 5 category hubs.
//
// Lives in a separate .ts file because esbuild chokes on long
// unicode arrays in .astro frontmatter (cryptic 'col 101' errors).
import type { Locale } from '@/lib/i18n';

export type TagSeoEntry = {
  title: string;
  description: string;
  h1: string;
  intro: string;
  keywords: string[];
  // The category this tag belongs to (used for product filtering)
  categoryId: 'hats' | 'sweaters' | 'scarves' | 'accessories' | 'yarn';
  // The match predicate (encoded as keyword list) — products matching
  // ANY keyword in the name+tags+pattern+collar will be included.
  // Used by the tag-page component to filter productsData.
  matchField: 'name' | 'all';
  matchKeywords: string[];
};

// Map URL slug → SEO entry. Each slug is unique, so this is a Record
// (not nested by categoryId).
export const TAG_PAGES: Record<string, TagSeoEntry> = {
  // Hats
  'cashmere-beanies': {
    title: 'Cashmere Beanies Wholesale | Knit Winter Hats | DONGXIAO®',
    description: 'Wholesale cashmere beanies and winter knit hats. 14–15.5µm Mongolian cashmere, 12gg knit construction, ribbed cuff. MOQ for beanies: 50–100 pieces. Sample 7–10 days.',
    h1: 'Cashmere Beanies Wholesale',
    intro: 'Browse cashmere beanies from our Ordos facility: cuffed winter beanies, rib-knit beanies, chunky gauge beanies for cold weather. Each style is knit from 14–15.5µm Mongolian cashmere on 12–14 gauge machines, with documented micron range, lot reference and finishing records available per shipment.',
    keywords: ['cashmere beanies', 'cashmere winter hats', 'cashmere beanie wholesale', 'knit cashmere beanie', 'wool cashmere beanie', 'cashmere beanie manufacturer', 'Mongolian cashmere beanie', 'wholesale cashmere hats'],
    categoryId: 'hats',
    matchField: 'name',
    matchKeywords: ['beanie'],
  },
  // Sweaters
  'cashmere-sweaters-for-women': {
    title: 'Cashmere Sweaters for Women | Wholesale | DONGXIAO®',
    description: 'Wholesale cashmere sweaters for women: cardigans, pullovers, turtlenecks, V-necks. 14–15.5µm Mongolian cashmere, 12gg fine to 3gg heavy. MOQ 100–200 pieces.',
    h1: 'Cashmere Sweaters for Women Wholesale',
    intro: 'Browse cashmere knitwear for women from our Ordos facility: cardigans, pullovers, turtlenecks, V-necks and crew necks in 12–14 gauge fine knit and 3–7gg heavy knit. Available in 100% cashmere, cashmere-merino blends and cashmere-wool combinations. OEM and private label programs supported.',
    keywords: ['cashmere sweaters for women', 'women cashmere cardigan', 'cashmere pullover women', 'cashmere womens knitwear', 'womens cashmere sweater wholesale', 'cashmere cardigan wholesale', 'cashmere sweater manufacturer'],
    categoryId: 'sweaters',
    matchField: 'all',
    matchKeywords: ['ladies', 'women'],
  },
  'cashmere-cardigans': {
    title: 'Cashmere Cardigans Wholesale | Cardigans for Men & Women | DONGXIAO®',
    description: 'Wholesale cashmere cardigans: V-neck, button-front, shawl-collar, ribbed trim. 14–15.5µm Mongolian cashmere, 12gg fine gauge. MOQ 100–200 pieces, sample 10–14 days.',
    h1: 'Cashmere Cardigans Wholesale',
    intro: 'Browse cashmere cardigans from our Ordos facility: V-neck cardigans, crew-neck cardigans, shawl-collar cardigans, button-front cardigans. Each style is knit from 14–15.5µm Mongolian cashmere on 12–14 gauge machines, with documented construction records per shipment.',
    keywords: ['cashmere cardigans', 'cashmere cardigan wholesale', 'cashmere cardigan manufacturer', 'wool cashmere cardigan', 'cashmere button cardigan', 'cashmere v neck cardigan'],
    categoryId: 'sweaters',
    matchField: 'all',
    matchKeywords: ['cardigan'],
  },
  'cashmere-pullover-sweaters': {
    title: 'Cashmere Pullover Sweaters Wholesale | Crew & V-Neck | DONGXIAO®',
    description: 'Wholesale cashmere pullover sweaters: crew neck, V-neck, round neck pullovers in 100% cashmere. 14–15.5µm Mongolian cashmere, 12–14gg. MOQ 100–200 pieces, OEM/private label.',
    h1: 'Cashmere Pullover Sweaters Wholesale',
    intro: 'Browse cashmere pullover sweaters from our Ordos facility: crew neck pullovers, V-neck pullovers, round neck pullovers, tunic pullovers. Each style is knit from 14–15.5µm Mongolian cashmere on 12–14 gauge machines, with documented construction and finishing records available per shipment.',
    keywords: ['cashmere pullover', 'cashmere pullovers wholesale', 'cashmere pullover sweater', 'cashmere crew neck pullover', 'cashmere v neck pullover', 'cashmere pullover manufacturer'],
    categoryId: 'sweaters',
    matchField: 'all',
    matchKeywords: ['pullover'],
  },
  // Scarves
  'cashmere-shawls': {
    title: 'Cashmere Shawls Wholesale | Pashmina & Wrap Shawls | DONGXIAO®',
    description: 'Wholesale cashmere shawls, pashmina shawls, wrap shawls. 100% Mongolian cashmere, woven and knit constructions. Custom dimensions, Pantone matching.',
    h1: 'Cashmere Shawls Wholesale',
    intro: 'Browse cashmere shawls from our Ordos facility: pashmina-style shawls, wrap shawls, large-format shawls, bridal shawls. Each is woven or knit from 100% Mongolian cashmere, with custom dimensions and Pantone color matching available for orders 100+ pieces.',
    keywords: ['cashmere shawls', 'cashmere shawl wholesale', 'cashmere pashmina shawl', 'cashmere wrap shawl', 'wool cashmere shawl', 'cashmere shawl manufacturer'],
    categoryId: 'scarves',
    matchField: 'all',
    matchKeywords: ['shawl'],
  },
  'cashmere-scarves-for-women': {
    title: 'Cashmere Scarves for Women | Wholesale | DONGXIAO®',
    description: 'Wholesale cashmere scarves for women: printed, solid color, pashmina-style, hijab-friendly. 100% Mongolian cashmere, woven and knit. Custom sizes and Pantone colors.',
    h1: 'Cashmere Scarves for Women Wholesale',
    intro: 'Browse cashmere scarves for women from our Ordos facility: printed scarves, solid color scarves, pashmina-style scarves, hijab-friendly scarves. Custom dimensions, Pantone color matching and private label programs available.',
    keywords: ['cashmere scarves for women', 'women cashmere scarf', 'cashmere womens scarf', 'cashmere hijab scarf', 'cashmere printed scarf women'],
    categoryId: 'scarves',
    matchField: 'all',
    matchKeywords: ['ladies', 'women'],
  },
  'cashmere-blanket-scarves': {
    title: 'Cashmere Blanket Scarves Wholesale | Oversized Wraps | DONGXIAO®',
    description: 'Wholesale cashmere blanket scarves and oversized wraps. 100% Mongolian cashmere, 200×90 cm oversized format for shoulder draping. Custom dimensions available.',
    h1: 'Cashmere Blanket Scarves Wholesale',
    intro: 'Browse cashmere blanket scarves from our Ordos facility: oversized 200×90 cm wraps for shoulder draping, blanket-style scarves, large-format pashminas. Custom sizes and Pantone matching available for orders 100+ pieces.',
    keywords: ['cashmere blanket scarf', 'cashmere blanket wrap', 'oversized cashmere scarf', 'cashmere wrap shawl', 'large cashmere scarf'],
    categoryId: 'scarves',
    matchField: 'all',
    matchKeywords: ['blanket'],
  },
  'cashmere-pashmina-shawls': {
    title: 'Cashmere Pashmina Shawls Wholesale | Oversized | DONGXIAO®',
    description: 'Wholesale cashmere pashmina shawls, 200×70 cm wide format. 100% Mongolian cashmere, woven. Custom Pantone colors, OEM/ODM supported.',
    h1: 'Cashmere Pashmina Shawls Wholesale',
    intro: 'Browse cashmere pashmina shawls from our Ordos facility: oversized 200×70 cm format for shoulder draping, hand-finished tassels, Pantone color matching. Each shawl is woven from 100% Mongolian cashmere.',
    keywords: ['cashmere pashmina shawl', 'cashmere pashmina wholesale', 'pashmina cashmere', 'wool cashmere pashmina', 'large cashmere shawl', 'cashmere wrap pashmina'],
    categoryId: 'scarves',
    matchField: 'all',
    matchKeywords: ['pashmina'],
  },
  // Accessories
  'cashmere-socks': {
    title: 'Cashmere Socks Wholesale | Knit & Plain | DONGXIAO®',
    description: 'Wholesale cashmere socks: knit, ribbed, terry-lined, baby and adult sizes. 14–15.5µm Mongolian cashmere. Custom sizes and Pantone colors for orders 100+ pairs.',
    h1: 'Cashmere Socks Wholesale',
    intro: 'Browse cashmere socks from our Ordos facility: knit socks, ribbed socks, terry-lined socks, baby socks, ankle socks. Custom sizes available for orders 100+ pairs with documented construction records per shipment.',
    keywords: ['cashmere socks', 'cashmere socks wholesale', 'cashmere knit socks', 'cashmere dress socks', 'wool cashmere socks', 'cashmere socks manufacturer'],
    categoryId: 'accessories',
    matchField: 'all',
    matchKeywords: ['sock'],
  },
  'cashmere-pants': {
    title: 'Cashmere Pants & Trousers Wholesale | Knit | DONGXIAO®',
    description: 'Wholesale cashmere pants and trousers: high-waisted, skinny, wide-leg, knit construction. 14–15.5µm Mongolian cashmere. Custom sizes for orders 100+ pieces.',
    h1: 'Cashmere Pants & Trousers Wholesale',
    intro: 'Browse cashmere pants and trousers from our Ordos facility: high-waisted cashmere pants, skinny cashmere pants, knit cashmere trousers, knitted cashmere leggings. Custom sizes and Pantone color matching available.',
    keywords: ['cashmere pants', 'cashmere trousers', 'cashmere pants wholesale', 'wool cashmere pants', 'cashmere knit pants', 'cashmere pants manufacturer'],
    categoryId: 'accessories',
    matchField: 'all',
    matchKeywords: ['pants', 'trouser'],
  },
  // 2026-09-01 new tags — broader Q4 long-tail SEO coverage
  'cashmere-mens-knitwear': {
    title: 'Cashmere Knitwear for Men | Wholesale | DONGXIAO®',
    description: 'Wholesale cashmere knitwear for men: sweaters, cardigans, pullovers, vests. 14–15.5µm Mongolian cashmere, 12gg fine gauge to 3gg chunky. MOQ 50–100 pieces.',
    h1: 'Cashmere Knitwear for Men Wholesale',
    intro: 'Browse cashmere knitwear for men from our Ordos facility: crew neck pullovers, V-neck cardigans, turtlenecks, cable knit vests and zip-front cardigans. Each piece is knit from 14–15.5µm Mongolian cashmere on gauge machines, with documented micron and construction records per shipment.',
    keywords: ['cashmere mens sweater', 'cashmere mens cardigan', 'cashmere pullover men', 'cashmere knitwear men', 'mens cashmere wholesale', 'cashmere mens sweater manufacturer'],
    categoryId: 'sweaters',
    matchField: 'all',
    matchKeywords: ['men', 'mens', "men's"],
  },
  'cashmere-womens-knitwear': {
    title: 'Cashmere Knitwear for Women | Wholesale | DONGXIAO®',
    description: 'Wholesale cashmere knitwear for women: cardigans, pullovers, turtlenecks. 14–15.5µm Mongolian cashmere, 12gg fine gauge to 5gg medium. MOQ 50–100 pieces, OEM/private label.',
    h1: 'Cashmere Knitwear for Women Wholesale',
    intro: 'Browse cashmere knitwear for women from our Ordos facility: cardigans, pullover sweaters, turtlenecks, V-necks, crew necks. Knit from 14–15.5µm Mongolian cashmere, with documented construction and finishing records per shipment.',
    keywords: ['cashmere womens sweater', 'cashmere womens cardigan', 'cashmere pullover women', 'cashmere knitwear women', 'womens cashmere wholesale'],
    categoryId: 'sweaters',
    matchField: 'all',
    matchKeywords: ['ladies', 'women', 'womens', "women's"],
  },
  'cashmere-winter-collection': {
    title: 'Cashmere Winter Collection | Wholesale | DONGXIAO®',
    description: 'Wholesale cashmere winter collection: beanies, scarves, sweaters, gloves. 14–15.5µm Mongolian cashmere, knit and woven constructions. MOQ 30–100 pieces, sampling 7–10 days.',
    h1: 'Cashmere Winter Collection',
    intro: 'Browse our cashmere winter collection from the Ordos facility: cashmere beanies and winter hats, scarves and shawls, pullovers and turtlenecks, gloves and leg warmers. Each piece is documented with micron range and lot reference per shipment, suitable for AW collections of European, US and Asian buyers.',
    keywords: ['cashmere winter', 'winter cashmere', 'cashmere autumn winter', 'AW cashmere collection', 'winter cashmere wholesale'],
    categoryId: 'hats',
    matchField: 'all',
    matchKeywords: ['winter', 'autumn'],
  },
  'cashmere-wool-blend': {
    title: 'Cashmere Wool Blend Knitwear Wholesale | 30/70 Yarn | DONGXIAO®',
    description: 'Wholesale 30% cashmere 70% wool blend knitwear. 14–15.5µm Mongolian cashmere blended with fine wool, knit construction. MOQ 100 pieces, 12gg fine to 7gg medium gauge.',
    h1: 'Cashmere Wool Blend Knitwear',
    intro: 'Browse cashmere-wool blend knitwear from our Ordos facility: 30% cashmere / 70% wool pullovers, cardigans, and accessories. The blend gives warmth, resilience and price advantage vs. 100% cashmere, while retaining the cashmere hand-feel at the yarn surface. Custom ratios (40/60, 50/50, 70/30) available for orders 200+ pieces.',
    keywords: ['cashmere wool blend', 'cashmere merino blend', '30 cashmere 70 wool', 'cashmere blend sweater', 'cashmere blend knitwear wholesale'],
    categoryId: 'sweaters',
    matchField: 'all',
    matchKeywords: ['30% cashmere', '70% wool', '70% wool', 'blend'],
  },
  'cashmere-bestsellers': {
    title: 'Cashmere Bestsellers Wholesale | Top-Rated B2B SKUs | DONGXIAO®',
    description: 'Wholesale cashmere bestsellers: top-rated hats, scarves, sweaters and accessories chosen by 500+ B2B buyers. 14–15.5µm Mongolian cashmere, 12gg knit. In stock for fast sampling.',
    h1: 'Cashmere Bestsellers Wholesale',
    intro: 'Browse our cashmere bestsellers — the SKUs most ordered by B2B buyers across Europe, North America and Asia in the last 24 months. Each style is consistently in stock with documented records, ready for 7-day sampling and 30–35 day production lead time.',
    keywords: ['cashmere bestsellers', 'cashmere top sellers', 'bestselling cashmere wholesale', 'popular cashmere styles'],
    categoryId: 'hats',
    matchField: 'all',
    matchKeywords: ['bestseller'],
  },
  'cashmere-year-round': {
    title: 'Cashmere Year-Round Knitwear Wholesale | All-Season | DONGXIAO®',
    description: 'Wholesale year-round cashmere knitwear: 12gg fine gauge pieces suitable for AW and SS collections. 14–15.5µm Mongolian cashmere. MOQ 50–100 pieces, OEM/private label.',
    h1: 'Cashmere Year-Round Knitwear',
    intro: 'Browse year-round cashmere knitwear from our Ordos facility: 12gg fine gauge pullovers, cardigans and accessories suitable for both autumn/winter and spring/summer collections. Each piece uses 14–15.5µm Mongolian cashmere with documented construction and finishing records per shipment.',
    keywords: ['year round cashmere', 'cashmere all season', 'SS cashmere', 'cashmere transitional knitwear'],
    categoryId: 'sweaters',
    matchField: 'all',
    matchKeywords: ['year-round', 'year round', 'all season'],
  },
};

// Locale overrides — same copy localized to each language for tag pages
export const TAG_PAGE_LOCALIZE: Record<string, Record<Locale, { title: string; description: string; h1: string; intro: string; keywords: string[] }>> = {
  'cashmere-beanies': {
    en: { title: 'Cashmere Beanies Wholesale | Knit Winter Hats | DONGXIAO®', description: 'Wholesale cashmere beanies and winter knit hats. 14–15.5µm Mongolian cashmere, 12gg knit construction, ribbed cuff. MOQ for beanies: 50–100 pieces.', h1: 'Cashmere Beanies Wholesale', intro: 'Browse cashmere beanies from our Ordos facility: cuffed winter beanies, rib-knit beanies, chunky gauge beanies for cold weather. Each style is knit from 14–15.5µm Mongolian cashmere on 12–14 gauge machines.', keywords: ['cashmere beanies', 'cashmere winter hats', 'cashmere beanie wholesale', 'knit cashmere beanie', 'wool cashmere beanie', 'cashmere beanie manufacturer', 'Mongolian cashmere beanie'] },
    cn: { title: '羊绒毛线帽批发 | 针织冬季帽 | 东霄 DONGXIAO®', description: '羊绒毛线帽与冬季针织帽批发。14–15.5µm 蒙古羊绒，12 针织造，罗纹帽口。MOQ 50–100 件。', h1: '羊绒毛线帽批发', intro: '浏览鄂尔多斯版根工厂精选羊绒毛线帽：罗纹冬季帽、罗纹针织帽、粗针冷天帽。每款采用 14–15.5µm 蒙古羊绒，12–14 针织机织造。', keywords: ['羊绒毛线帽', '羊绒冬季帽', '羊绒帽子批发', '针织羊绒帽', '羊绒帽子厂家', '蒙古羊绒帽'] },
    de: { title: 'Kaschmir-Beanies Großhandel | DONGXIAO®', description: 'Großhandel Kaschmir-Beanies und Winter-Strickmützen. 14–15.5µm mongolisches Kaschmir, 12gg gestrickt, gerippter Bund. MOQ 50–100 Stück.', h1: 'Kaschmir-Beanies Großhandel', intro: 'Ausgewählte Kaschmir-Beanies aus unserer Ordos-Fabrik.', keywords: ['Kaschmir Beanies', 'Kaschmir Wintermützen', 'Kaschmir Mützen Großhandel', 'Kaschmir Beanie Hersteller'] },
    fr: { title: 'Bonnets en Cachemire en Gros | DONGXIAO®', description: 'Bonnets, beanies en cachemire en gros. Cachemire mongol 14–15.5µm, tricoté 12gg, bord côtelé. MOQ 50–100 pièces.', h1: 'Bonnets en Cachemire en Gros', intro: 'Sélection de bonnets en cachemire de notre usine d\'Ordos.', keywords: ['bonnets cachemire', 'beanies cachemire', 'grossiste cachemire', 'bonnets cachemire tricotés'] },
    ja: { title: 'カシミアビーニー卸売り | DONGXIAO®', description: 'カシミアビーニー、ニット帽卸売り。14–15.5µmモンゴル産、12ゲージ。リブ付き。MOQ 50–100個。', h1: 'カシミアビーニー卸売り', intro: 'オルドス工場から厳選したカシミアビーニー。', keywords: ['カシミアビーニー', 'カシミア帽子', 'カシミア卸売り', 'ニット帽'] },
    kr: { title: '캐시미어 비니 도매 | DONGXIAO®', description: '캐시미어 비니, 니트 모자 도매. 14–15.5µm 몽골 캐시미어, 12게이지. 리브 마감. MOQ 50–100개.', h1: '캐시미어 비니 도매', intro: '오르도스 공장에서 선별한 캐시미어 비니.', keywords: ['캐시미어 비니', '캐시미어 모자', '캐시미어 도매', '니트 모자'] },
  },
  'cashmere-sweaters-for-women': {
    en: { title: 'Cashmere Sweaters for Women | Wholesale | DONGXIAO®', description: 'Wholesale cashmere sweaters for women: cardigans, pullovers, turtlenecks. 14–15.5µm Mongolian cashmere, 12gg fine to 3gg heavy. MOQ 100–200 pieces.', h1: 'Cashmere Sweaters for Women Wholesale', intro: 'Browse cashmere knitwear for women from our Ordos facility.', keywords: ['cashmere sweaters for women', 'women cashmere cardigan', 'cashmere pullover women', 'cashmere womens knitwear', 'womens cashmere sweater wholesale'] },
    cn: { title: '女款羊绒衫批发 | 东霄 DONGXIAO®', description: '女款羊绒衫批发：开衫、套头衫、高领。14–15.5µm 蒙古羊绒，12 针细到 3 针粗。MOQ 100–200 件。', h1: '女款羊绒衫批发', intro: '浏览鄂尔多斯工厂精选女款羊绒针织衫：开衫、套头衫、高领衫。', keywords: ['女款羊绒衫', '羊绒开衫', '女款羊绒套头衫', '羊绒针织衫批发'] },
    de: { title: 'Kaschmir-Pullover für Damen | Großhandel | DONGXIAO®', description: 'Großhandel Kaschmir-Pullover für Damen.', h1: 'Kaschmir-Damenpullover', intro: 'Kaschmir-Strickwaren für Damen aus unserer Ordos-Fabrik.', keywords: ['Kaschmir Pullover Damen', 'Damen Kaschmir Strick'] },
    fr: { title: 'Pulls en Cachemire pour Femme | Grossiste | DONGXIAO®', description: 'Pulls en cachemire pour femme en gros.', h1: 'Pulls Femme en Cachemire', intro: 'Pulls en cachemire pour femme de notre usine d\'Ordos.', keywords: ['pulls cachemire femme', 'cardigans cachemire femme'] },
    ja: { title: 'レディース カシミアセーター | 卸売り | DONGXIAO®', description: 'レディースカシミアセーター卸売り。', h1: 'レディース カシミアセーター卸売り', intro: 'オルドス工場のレディースカシミアニット。', keywords: ['レディース カシミア', 'カシミアセーター 卸売り'] },
    kr: { title: '여성용 캐시미어 스웨터 | 도매 | DONGXIAO®', description: '여성용 캐시미어 스웨터 도매.', h1: '여성용 캐시미어 스웨터 도매', intro: '오르도스 공장의 여성용 캐시미어 니트웨어.', keywords: ['여성 캐시미어', '캐시미어 가디건 여성'] },
  },
  'cashmere-cardigans': {
    en: { title: 'Cashmere Cardigans Wholesale | Cardigans for Men & Women | DONGXIAO®', description: 'Wholesale cashmere cardigans: V-neck, button-front, shawl-collar. 14–15.5µm Mongolian cashmere, 12gg fine gauge. MOQ 100–200 pieces.', h1: 'Cashmere Cardigans Wholesale', intro: 'Browse cashmere cardigans from our Ordos facility: V-neck cardigans, crew-neck cardigans, button-front cardigans. Each style is knit from 14–15.5µm Mongolian cashmere on 12–14 gauge machines.', keywords: ['cashmere cardigans', 'cashmere cardigan wholesale', 'cashmere cardigan manufacturer', 'wool cashmere cardigan'] },
    cn: { title: '羊绒开衫批发 | 东霄 DONGXIAO®', description: '羊绒开衫批发：V 领、扣式、披肩领。14–15.5µm 蒙古羊绒，12 针细针织。MOQ 100–200 件。', h1: '羊绒开衫批发', intro: '浏览鄂尔多斯工厂精选羊绒开衫：V 领开衫、圆领开衫、扣式开衫。', keywords: ['羊绒开衫', '羊绒开衫批发', '羊绒开衫厂家', '羊绒针织开衫'] },
    de: { title: 'Kaschmir-Cardigans Großhandel | DONGXIAO®', description: 'Großhandel Kaschmir-Cardigans.', h1: 'Kaschmir-Cardigans Großhandel', intro: 'Kaschmir-Cardigans aus unserer Ordos-Fabrik.', keywords: ['Kaschmir Cardigans', 'Kaschmir Cardigan Großhandel'] },
    fr: { title: 'Cardigans en Cachemire en Gros | DONGXIAO®', description: 'Cardigans en cachemire en gros.', h1: 'Cardigans en Cachemire', intro: 'Cardigans en cachemire de notre usine d\'Ordos.', keywords: ['cardigans cachemire', 'cardigan cachemire grossiste'] },
    ja: { title: 'カシミアカーディガン卸売り | DONGXIAO®', description: 'カシミアカーディガン卸売り。', h1: 'カシミアカーディガン卸売り', intro: 'オルドス工場のカシミアカーディガン。', keywords: ['カシミアカーディガン', 'カシミアカーディガン 卸売り'] },
    kr: { title: '캐시미어 가디건 도매 | DONGXIAO®', description: '캐시미어 가디건 도매.', h1: '캐시미어 가디건 도매', intro: '오르도스 공장의 캐시미어 가디건.', keywords: ['캐시미어 가디건', '캐시미어 가디건 도매'] },
  },
  'cashmere-pullover-sweaters': {
    en: { title: 'Cashmere Pullover Sweaters Wholesale | Crew & V-Neck | DONGXIAO®', description: 'Wholesale cashmere pullover sweaters: crew neck, V-neck pullovers in 100% cashmere. 14–15.5µm Mongolian cashmere, 12–14gg. MOQ 100–200 pieces, OEM/private label.', h1: 'Cashmere Pullover Sweaters Wholesale', intro: 'Browse cashmere pullover sweaters from our Ordos facility: crew neck pullovers, V-neck pullovers, round neck pullovers. Each style is knit from 14–15.5µm Mongolian cashmere on 12–14 gauge machines.', keywords: ['cashmere pullover', 'cashmere pullovers wholesale', 'cashmere pullover sweater', 'cashmere crew neck pullover', 'cashmere v neck pullover'] },
    cn: { title: '羊绒套头衫批发 | 圆领 V 领 | 东霄 DONGXIAO®', description: '羊绒套头衫批发：圆领、V 领 100% 羊绒。14–15.5µm 蒙古羊绒，12–14 针。MOQ 100–200 件，OEM/贴牌。', h1: '羊绒套头衫批发', intro: '浏览鄂尔多斯工厂精选羊绒套头衫：圆领套头衫、V 领套头衫。', keywords: ['羊绒套头衫', '羊绒套头衫批发', '羊绒圆领衫', '羊绒 V 领衫'] },
    de: { title: 'Kaschmir-Pullover Großhandel | DONGXIAO®', description: 'Großhandel Kaschmir-Pullover.', h1: 'Kaschmir-Pullover Großhandel', intro: 'Kaschmir-Pullover aus unserer Ordos-Fabrik.', keywords: ['Kaschmir Pullover', 'Kaschmir Pullover Großhandel'] },
    fr: { title: 'Pulls en Cachemire en Gros | DONGXIAO®', description: 'Pulls en cachemire en gros.', h1: 'Pulls en Cachemire', intro: 'Pulls en cachemire de notre usine d\'Ordos.', keywords: ['pulls cachemire', 'pulls cachemire grossiste'] },
    ja: { title: 'カシミアプルオーバー卸売り | DONGXIAO®', description: 'カシミアプルオーバー卸売り。', h1: 'カシミアプルオーバー卸売り', intro: 'オルドス工場のカシミアプル-overer.',
    keywords: ['カシミアプル_overer', 'カシミア セーター'] },
    kr: { title: '캐시미어 풀오버 도매 | DONGXIAO®', description: '캐시미어 풀오버 도매.', h1: '캐시미어 풀오버 도매', intro: '오르도스 공장의 캐시미어 풀오버.', keywords: ['캐시미어 풀오버', '캐시미어 풀오버 도매'] },
  },
  'cashmere-shawls': {
    en: { title: 'Cashmere Shawls Wholesale | Pashmina & Wrap Shawls | DONGXIAO®', description: 'Wholesale cashmere shawls, pashmina shawls, wrap shawls. 100% Mongolian cashmere, woven and knit constructions.', h1: 'Cashmere Shawls Wholesale', intro: 'Browse cashmere shawls from our Ordos facility.', keywords: ['cashmere shawls', 'cashmere shawl wholesale', 'cashmere pashmina shawl', 'cashmere wrap shawl', 'wool cashmere shawl'] },
    cn: { title: '羊绒披肩批发 | 东霄 DONGXIAO®', description: '羊绒披肩批发：披肩、斗篷式披肩。100% 蒙古羊绒，机织与针织。', h1: '羊绒披肩批发', intro: '浏览鄂尔多斯工厂精选羊绒披肩。', keywords: ['羊绒披肩', '羊绒披肩批发', '羊绒披肩厂家', '羊绒机织披肩'] },
    de: { title: 'Kaschmir-Shawls Großhandel | DONGXIAO®', description: 'Großhandel Kaschmir-Shawls.', h1: 'Kaschmir-Shawls Großhandel', intro: 'Kaschmir-Shawls aus unserer Ordos-Fabrik.', keywords: ['Kaschmir Shawls', 'Kaschmir Shawl Großhandel'] },
    fr: { title: 'Châles en Cachemire en Gros | DONGXIAO®', description: 'Châles en cachemire en gros.', h1: 'Châles en Cachemire', intro: 'Châles en cachemire de notre usine d\'Ordos.', keywords: ['châles cachemire', 'châles cachemire grossiste'] },
    ja: { title: 'カシミアショール卸売り | DONGXIAO®', description: 'カシミアショール卸売り。', h1: 'カシミアショール卸売り', intro: 'オルドス工場のカシミアショール。', keywords: ['カシミアショール', 'カシミアショール 卸売り'] },
    kr: { title: '캐시미어 숄 도매 | DONGXIAO®', description: '캐시미어 숄 도매.', h1: '캐시미어 숄 도매', intro: '오르도스 공장의 캐시미어 숄.', keywords: ['캐시미어 숄', '캐시미어 숄 도매'] },
  },
  'cashmere-scarves-for-women': {
    en: { title: 'Cashmere Scarves for Women | Wholesale | DONGXIAO®', description: 'Wholesale cashmere scarves for women: printed, solid color, pashmina-style. 100% Mongolian cashmere, woven and knit. Custom sizes and Pantone colors.', h1: 'Cashmere Scarves for Women Wholesale', intro: 'Browse cashmere scarves for women from our Ordos facility.', keywords: ['cashmere scarves for women', 'women cashmere scarf', 'cashmere womens scarf', 'cashmere hijab scarf'] },
    cn: { title: '女款羊绒围巾批发 | 东霄 DONGXIAO®', description: '女款羊绒围巾批发：印花、素色、披肩款。100% 蒙古羊绒，机织与针织。', h1: '女款羊绒围巾批发', intro: '浏览鄂尔多斯工厂精选女款羊绒围巾。', keywords: ['女款羊绒围巾', '女款羊绒丝巾', '羊绒头巾'] },
    de: { title: 'Kaschmir-Schals für Damen | Großhandel | DONGXIAO®', description: 'Großhandel Kaschmir-Schals für Damen.', h1: 'Kaschmir-Damenschals', intro: 'Kaschmir-Schals für Damen aus unserer Ordos-Fabrik.', keywords: ['Kaschmir Damenschals', 'Damen Kaschmir'] },
    fr: { title: 'Écharpes en Cachemire pour Femme | DONGXIAO®', description: 'Écharpes en cachemire pour femme en gros.', h1: 'Écharpes Femme en Cachemire', intro: 'Écharpes en cachemire pour femme de notre usine d\'Ordos.', keywords: ['écharpes cachemire femme'] },
    ja: { title: 'レディース カシミアスカーフ | 卸売り | DONGXIAO®', description: 'レディースカシミアスカーフ卸売り。', h1: 'レディース カシミアスカーフ卸売り', intro: 'オルドス工場のレディースカシミアスカーフ。', keywords: ['レディース カシミア', 'カシミアスカーフ レディース'] },
    kr: { title: '여성용 캐시미어 스카프 | 도매 | DONGXIAO®', description: '여성용 캐시미어 스카프 도매.', h1: '여성용 캐시미어 스카프 도매', intro: '오르도스 공장의 여성용 캐시미어 스카프.', keywords: ['여성 캐시미어', '캐시미어 스카프 여성'] },
  },
  'cashmere-blanket-scarves': {
    en: { title: 'Cashmere Blanket Scarves Wholesale | Oversized Wraps | DONGXIAO®', description: 'Wholesale cashmere blanket scarves and oversized wraps. 100% Mongolian cashmere, 200×90 cm format. Custom dimensions available.', h1: 'Cashmere Blanket Scarves Wholesale', intro: 'Browse cashmere blanket scarves from our Ordos facility: oversized 200×90 cm wraps for shoulder draping.', keywords: ['cashmere blanket scarf', 'cashmere blanket wrap', 'oversized cashmere scarf', 'cashmere wrap shawl', 'large cashmere scarf'] },
    cn: { title: '羊绒围巾毯批发 | 加大尺寸 | 东霄 DONGXIAO®', description: '羊绒围巾毯与加大披肩批发。100% 蒙古羊绒，200×90 cm 加大规格。', h1: '羊绒围巾毯批发', intro: '浏览鄂尔多斯工厂精选羊绒围巾毯：200×90 cm 加大规格披肩。', keywords: ['羊绒围巾毯', '羊绒加大披肩', '200x90 羊绒披肩'] },
    de: { title: 'Kaschmir-Decke-Schals Großhandel | DONGXIAO®', description: 'Großhandel Kaschmir-Decke-Schals.', h1: 'Kaschmir-Decke-Schals', intro: 'Kaschmir-Decke-Schals aus unserer Ordos-Fabrik.', keywords: ['Kaschmir Decke Schal', 'Kaschmir Überwurf'] },
    fr: { title: 'Écharpes-Étendards en Cachemire en Gros | DONGXIAO®', description: 'Écharpes-étendards en cachemire en gros.', h1: 'Écharpes-Étendards en Cachemire', intro: 'Écharpes-étendards en cachemire de notre usine d\'Ordos.', keywords: ['écharpe étendard cachemire', 'châle grande taille cachemire'] },
    ja: { title: 'カシミアブランケットスカーフ卸売り | DONGXIAO®', description: 'カシミアブランケットスカーフ卸売り。', h1: 'カシミアブランケットスカーフ', intro: 'オルドス工場のカシミアブランケットスカーフ。', keywords: ['カシミア ブランケット', '大きいカシミア'] },
    kr: { title: '캐시미어 블랭킷 스카프 도매 | DONGXIAO®', description: '캐시미어 블랭킷 스카프 도매.', h1: '캐시미어 블랭킷 스카프 도매', intro: '오르도스 공장의 캐시미어 블랭킷 스카프.', keywords: ['캐시미어 블랭킷', '큰 캐시미어 스카프'] },
  },
  'cashmere-pashmina-shawls': {
    en: { title: 'Cashmere Pashmina Shawls Wholesale | Oversized | DONGXIAO®', description: 'Wholesale cashmere pashmina shawls, 200×70 cm wide format. 100% Mongolian cashmere, woven.', h1: 'Cashmere Pashmina Shawls Wholesale', intro: 'Browse cashmere pashmina shawls from our Ordos facility.', keywords: ['cashmere pashmina shawl', 'cashmere pashmina wholesale', 'pashmina cashmere', 'wool cashmere pashmina', 'large cashmere shawl'] },
    cn: { title: '羊绒披肩披巾批发 | 东霄 DONGXIAO®', description: '羊绒披肩披巾批发：200×70 cm 大规格。100% 蒙古羊绒，机织。', h1: '羊绒披肩披巾批发', intro: '浏览鄂尔多斯工厂精选羊绒披肩披巾：200×70 cm 大规格。', keywords: ['羊绒披肩', '羊绒披巾', '羊绒机织披肩'] },
    de: { title: 'Kaschmir-Pashmina-Shawls Großhandel | DONGXIAO®', description: 'Großhandel Kaschmir-Pashmina-Shawls.', h1: 'Kaschmir-Pashmina-Shawls', intro: 'Kaschmir-Pashmina-Shawls aus unserer Ordos-Fabrik.', keywords: ['Kaschmir Pashmina', 'Kaschmir Pashmina Shawl'] },
    fr: { title: 'Châles Pashmina en Cachemire en Gros | DONGXIAO®', description: 'Châles pashmina en cachemire en gros.', h1: 'Châles Pashmina en Cachemire', intro: 'Châles pashmina en cachemire de notre usine d\'Ordos.', keywords: ['pashmina cachemire', 'châle pashmina cachemire'] },
    ja: { title: 'カシミアパシュミナショール卸売り | DONGXIAO®', description: 'カシミアパシュミナショール卸売り。', h1: 'カシミアパシュミナショール', intro: 'オルдス工場のカシミアパシュミナショール。', keywords: ['カシミア パシュミナ', 'パシュミナ ショール'] },
    kr: { title: '캐시미어 파시미나 숄 도매 | DONGXIAO®', description: '캐시미어 파시미나 숄 도매.', h1: '캐시미어 파시미나 숄 도매', intro: '오르도스 공장의 캐시미어 파시미나 숄.', keywords: ['캐시미어 파시미나', '파시미나 숄'] },
  },
  'cashmere-socks': {
    en: { title: 'Cashmere Socks Wholesale | Knit & Plain | DONGXIAO®', description: 'Wholesale cashmere socks: knit, ribbed, terry-lined, baby and adult sizes. 14–15.5µm Mongolian cashmere. Custom sizes for orders 100+ pairs.', h1: 'Cashmere Socks Wholesale', intro: 'Browse cashmere socks from our Ordos facility.', keywords: ['cashmere socks', 'cashmere socks wholesale', 'cashmere knit socks', 'wool cashmere socks', 'cashmere socks manufacturer'] },
    cn: { title: '羊绒袜子批发 | 针织与素色 | 东霄 DONGXIAO®', description: '羊绒袜子批发：针织、罗纹、毛圈、婴童与成人尺寸。 14–15.5µm 蒙古羊绒。', h1: '羊绒袜子批发', intro: '浏览鄂尔多斯工厂精选羊绒袜子。', keywords: ['羊绒袜子', '羊绒袜批发', '羊绒针织袜', '羊绒婴儿袜'] },
    de: { title: 'Kaschmir-Socken Großhandel | DONGXIAO®', description: 'Großhandel Kaschmir-Socken.', h1: 'Kaschmir-Socken Großhandel', intro: 'Kaschmir-Socken aus unserer Ordos-Fabrik.', keywords: ['Kaschmir Socken', 'Kaschmir Socken Großhandel'] },
    fr: { title: 'Chaussettes en Cachemire en Gros | DONGXIAO®', description: 'Chaussettes en cachemire en gros.', h1: 'Chaussettes en Cachemire', intro: 'Chaussettes en cachemire de notre usine d\'Ordos.', keywords: ['chaussettes cachemire', 'grossiste chaussettes cachemire'] },
    ja: { title: 'カシミア靴下卸売り | DONGXIAO®', description: 'カシミア靴下卸売り。', h1: 'カシミア靴下卸売り', intro: 'オルドス工場のカシミア靴下。', keywords: ['カシミア靴下', 'カシミア靴下 卸売り'] },
    kr: { title: '캐시미어 양말 도매 | DONGXIAO®', description: '캐시미어 양말 도매.', h1: '캐시미어 양말 도매', intro: '오르도스 공장의 캐시미어 양말.', keywords: ['캐시미어 양말', '캐시미어 양말 도매'] },
  },
  'cashmere-pants': {
    en: { title: 'Cashmere Pants & Trousers Wholesale | Knit | DONGXIAO®', description: 'Wholesale cashmere pants and trousers: high-waisted, skinny, wide-leg, knit construction. 14–15.5µm Mongolian cashmere. Custom sizes for orders 100+ pieces.', h1: 'Cashmere Pants & Trousers Wholesale', intro: 'Browse cashmere pants and trousers from our Ordos facility.', keywords: ['cashmere pants', 'cashmere trousers', 'cashmere pants wholesale', 'wool cashmere pants', 'cashmere pants manufacturer'] },
    cn: { title: '羊绒长裤批发 | 针织 | 东霄 DONGXIAO®', description: '羊绒长裤批发：高腰、修身、针织。14–15.5µm 蒙古羊绒。', h1: '羊绒长裤批发', intro: '浏览鄂尔多斯工厂精选羊绒长裤。', keywords: ['羊绒长裤', '羊绒裤子批发', '羊绒针织裤'] },
    de: { title: 'Kaschmir-Hosen Großhandel | DONGXIAO®', description: 'Großhandel Kaschmir-Hosen.', h1: 'Kaschmir-Hosen Großhandel', intro: 'Kaschmir-Hosen aus unserer Ordos-Fabrik.', keywords: ['Kaschmir Hosen', 'Kaschmir Hosen Großhandel'] },
    fr: { title: 'Pantalons en Cachemire en Gros | DONGXIAO®', description: 'Pantalons en cachemire en gros.', h1: 'Pantalons en Cachemire', intro: 'Pantalons en cachemire de notre usine d\'Ordos.', keywords: ['pantalons cachemire', 'pantalons cachemire grossiste'] },
    ja: { title: 'カシミアパンツ卸売り | DONGXIAO®', description: 'カシミアパンツ卸売り。', h1: 'カシミアパンツ卸売り', intro: 'オルドス工場のカシミアパンツ。', keywords: ['カシミアパンツ', 'カシミアパンツ 卸売り'] },
    kr: { title: '캐시미어 팬츠 도매 | DONGXIAO®', description: '캐시미어 팬츠 도매.', h1: '캐시미어 팬츠 도매', intro: '오르도스 공장의 캐시미어 팬츠.', keywords: ['캐시미어 팬츠', '캐시미어 팬츠 도매'] },
  },
  // 2026-09-01 new tag locales
  'cashmere-mens-knitwear': {
    en: { title: 'Cashmere Knitwear for Men | Wholesale | DONGXIAO®', description: 'Wholesale cashmere knitwear for men: sweaters, cardigans, pullovers, vests. 14–15.5µm Mongolian cashmere, 12gg fine gauge to 3gg chunky. MOQ 50–100 pieces.', h1: 'Cashmere Knitwear for Men Wholesale', intro: 'Browse cashmere knitwear for men from our Ordos facility.', keywords: ['cashmere mens sweater', 'mens cashmere wholesale', 'cashmere mens sweater manufacturer'] },
    cn: { title: '男士羊绒针织衫批发 | 东霄 DONGXIAO®', description: '男士羊绒针织衫批发：套头、开衫、马甲。14–15.5µm 蒙古羊绒。MOQ 50–100 件。', h1: '男士羊绒针织衫批发', intro: '浏览鄂尔多斯工厂精选男士羊绒针织衫。', keywords: ['男士羊绒衫', '男款羊绒针织衫', '男士羊绒衫批发'] },
    de: { title: 'Kaschmir-Strickwaren für Herren | Großhandel | DONGXIAO®', description: 'Großhandel Kaschmir-Strickwaren für Herren.', h1: 'Kaschmir-Strickwaren für Herren', intro: 'Kaschmir-Strickwaren für Herren aus unserer Ordos-Fabrik.', keywords: ['Kaschmir Herren Strickwaren'] },
    fr: { title: 'Pulls en Cachemire pour Homme | Grossiste | DONGXIAO®', description: 'Pulls en cachemire pour homme en gros.', h1: 'Pulls Homme en Cachemire', intro: 'Pulls en cachemire pour homme de notre usine d\'Ordos.', keywords: ['pulls cachemire homme'] },
    ja: { title: 'メンズ カシミアニット | 卸売り | DONGXIAO®', description: 'メンズカシミアニット卸売り。', h1: 'メンズ カシミアニット卸売り', intro: 'オルドス工場のメンズカシミアニット。', keywords: ['メンズ カシミア', 'カシミアニット メンズ'] },
    kr: { title: '남성용 캐시미어 니트 | 도매 | DONGXIAO®', description: '남성용 캐시미어 니트 도매.', h1: '남성용 캐시미어 니트 도매', intro: '오르도스 공장의 남성용 캐시미어 니트.', keywords: ['남성 캐시미어', '캐시미어 니트 남성'] },
  },
  'cashmere-womens-knitwear': {
    en: { title: 'Cashmere Knitwear for Women | Wholesale | DONGXIAO®', description: 'Wholesale cashmere knitwear for women: cardigans, pullovers, turtlenecks. 14–15.5µm Mongolian cashmere, 12gg fine to 5gg medium. MOQ 50–100 pieces.', h1: 'Cashmere Knitwear for Women Wholesale', intro: 'Browse cashmere knitwear for women from our Ordos facility.', keywords: ['cashmere womens sweater', 'womens cashmere wholesale'] },
    cn: { title: '女士羊绒针织衫批发 | 东霄 DONGXIAO®', description: '女士羊绒针织衫批发：开衫、套头、高领。14–15.5µm 蒙古羊绒。MOQ 50–100 件。', h1: '女士羊绒针织衫批发', intro: '浏览鄂尔多斯工厂精选女士羊绒针织衫。', keywords: ['女士羊绒衫', '女款羊绒针织衫', '女士羊绒衫批发'] },
    de: { title: 'Kaschmir-Strickwaren für Damen | Großhandel | DONGXIAO®', description: 'Großhandel Kaschmir-Strickwaren für Damen.', h1: 'Kaschmir-Strickwaren für Damen', intro: 'Kaschmir-Strickwaren für Damen aus unserer Ordos-Fabrik.', keywords: ['Kaschmir Damen Strickwaren'] },
    fr: { title: 'Pulls en Cachemire pour Femme | Grossiste | DONGXIAO®', description: 'Pulls en cachemire pour femme en gros.', h1: 'Pulls Femme en Cachemire', intro: 'Pulls en cachemire pour femme de notre usine d\'Ordos.', keywords: ['pulls cachemire femme'] },
    ja: { title: 'レディース カシミアニット | 卸売り | DONGXIAO®', description: 'レディースカシミアニット卸売り。', h1: 'レディース カシミアニット卸売り', intro: 'オルドス工場のレディースカシミアニット。', keywords: ['レディース カシミア'] },
    kr: { title: '여성용 캐시미어 니트 | 도매 | DONGXIAO®', description: '여성용 캐시미어 니트 도매.', h1: '여성용 캐시미어 니트 도매', intro: '오르도스 공장의 여성용 캐시미어 니트.', keywords: ['여성 캐시미어'] },
  },
  'cashmere-winter-collection': {
    en: { title: 'Cashmere Winter Collection | Wholesale | DONGXIAO®', description: 'Wholesale cashmere winter collection: beanies, scarves, sweaters, gloves. 14–15.5µm Mongolian cashmere.', h1: 'Cashmere Winter Collection', intro: 'Browse cashmere winter collection from our Ordos facility.', keywords: ['cashmere winter', 'winter cashmere', 'AW cashmere collection'] },
    cn: { title: '羊绒冬季系列批发 | 东霄 DONGXIAO®', description: '羊绒冬季系列批发：帽子、围巾、毛衫、手套。14–15.5µm 蒙古羊绒。', h1: '羊绒冬季系列', intro: '浏览鄂尔多斯工厂精选羊绒冬季系列。', keywords: ['羊绒冬季', '冬季羊绒', '羊绒秋冬'] },
    de: { title: 'Kaschmir-Winterkollektion | Großhandel | DONGXIAO®', description: 'Kaschmir-Winterkollektion.', h1: 'Kaschmir-Winterkollektion', intro: 'Kaschmir-Winterkollektion aus unserer Ordos-Fabrik.', keywords: ['Kaschmir Winter', 'Winterkollektion'] },
    fr: { title: 'Collection Cachemire Hiver en Gros | DONGXIAO®', description: 'Collection cachemire hiver en gros.', h1: 'Collection Cachemire Hiver', intro: 'Collection cachemire hiver de notre usine d\'Ordos.', keywords: ['cachemire hiver'] },
    ja: { title: 'カシミア冬コレクション卸売り | DONGXIAO®', description: 'カシミア冬コレクション卸売り。', h1: 'カシミア冬コレクション', intro: 'オルドス工場のカシミア冬コレクション。', keywords: ['カシミア 冬'] },
    kr: { title: '캐시미어 겨울 컬렉션 도매 | DONGXIAO®', description: '캐시미어 겨울 컬렉션 도매.', h1: '캐시미어 겨울 컬렉션 도매', intro: '오르도스 공장의 캐시미어 겨울 컬렉션.', keywords: ['캐시미어 겨울'] },
  },
  'cashmere-wool-blend': {
    en: { title: 'Cashmere Wool Blend Knitwear Wholesale | 30/70 Yarn | DONGXIAO®', description: 'Wholesale 30% cashmere 70% wool blend knitwear. 14–15.5µm Mongolian cashmere blended with fine wool.', h1: 'Cashmere Wool Blend Knitwear', intro: 'Browse cashmere-wool blend knitwear from our Ordos facility.', keywords: ['cashmere wool blend', 'cashmere merino blend', '30 cashmere 70 wool'] },
    cn: { title: '羊绒羊毛混纺针织衫批发 | 30/70 配比 | 东霄 DONGXIAO®', description: '30% 羊绒 70% 羊毛混纺针织衫批发。14–15.5µm 蒙古羊绒与细羊毛混纺。', h1: '羊绒羊毛混纺针织衫', intro: '浏览鄂尔多斯工厂精选羊绒羊毛混纺针织衫。', keywords: ['羊绒混纺', '羊绒羊毛混纺', '30羊绒70羊毛'] },
    de: { title: 'Kaschmir-Wollmischung Großhandel | DONGXIAO®', description: 'Großhandel Kaschmir-Wollmischung.', h1: 'Kaschmir-Wollmischung', intro: 'Kaschmir-Wollmischung aus unserer Ordos-Fabrik.', keywords: ['Kaschmir Wollmischung'] },
    fr: { title: 'Mélange Cachemire Laine en Gros | DONGXIAO®', description: 'Mélange cachemire laine en gros.', h1: 'Mélange Cachemire Laine', intro: 'Mélange cachemire laine de notre usine d\'Ordos.', keywords: ['mélange cachemire laine'] },
    ja: { title: 'カシミア羊毛混紡卸売り | DONGXIAO®', description: 'カシミア羊毛混紡卸売り。', h1: 'カシミア羊毛混紡', intro: 'オルドス工場のカシミア羊毛混紡。', keywords: ['カシミア羊毛混纺'] },
    kr: { title: '캐시미어 울 블렌드 도매 | DONGXIAO®', description: '캐시미어 울 블렌드 도매.', h1: '캐시미어 울 블렌드 도매', intro: '오르도스 공장의 캐시미어 울 블렌드.', keywords: ['캐시미어 울 블렌드'] },
  },
  'cashmere-bestsellers': {
    en: { title: 'Cashmere Bestsellers Wholesale | Top-Rated B2B SKUs | DONGXIAO®', description: 'Wholesale cashmere bestsellers: top-rated hats, scarves, sweaters, accessories. 14–15.5µm Mongolian cashmere.', h1: 'Cashmere Bestsellers Wholesale', intro: 'Browse cashmere bestsellers from our Ordos facility.', keywords: ['cashmere bestsellers', 'cashmere top sellers', 'bestselling cashmere wholesale'] },
    cn: { title: '羊绒畅销款批发 | B2B 热卖款 | 东霄 DONGXIAO®', description: '羊绒畅销款批发：500+ 买家选择的帽子、围巾、毛衫。14–15.5µm 蒙古羊绒。', h1: '羊绒畅销款批发', intro: '浏览鄂尔多斯工厂精选羊绒畅销款。', keywords: ['羊绒畅销', '热卖羊绒', '畅销羊绒批发'] },
    de: { title: 'Kaschmir-Bestseller Großhandel | DONGXIAO®', description: 'Großhandel Kaschmir-Bestseller.', h1: 'Kaschmir-Bestseller Großhandel', intro: 'Kaschmir-Bestseller aus unserer Ordos-Fabrik.', keywords: ['Kaschmir Bestseller'] },
    fr: { title: 'Meilleures Ventes Cachemire en Gros | DONGXIAO®', description: 'Meilleures ventes cachemire en gros.', h1: 'Meilleures Ventes Cachemire', intro: 'Meilleures ventes cachemire de notre usine d\'Ordos.', keywords: ['meilleures ventes cachemire'] },
    ja: { title: 'カシミアベストセラー卸売り | DONGXIAO®', description: 'カシミアベストセラー卸売り。', h1: 'カシミアベストセラー卸売り', intro: 'オルドス工場のカシミアベストセラー。', keywords: ['カシミア ベストセラー'] },
    kr: { title: '캐시미어 베스트셀러 도매 | DONGXIAO®', description: '캐시미어 베스트셀러 도매.', h1: '캐시미어 베스트셀러 도매', intro: '오르도스 공장의 캐시미어 베스트셀러.', keywords: ['캐시미어 베스트셀러'] },
  },
  'cashmere-year-round': {
    en: { title: 'Cashmere Year-Round Knitwear Wholesale | All-Season | DONGXIAO®', description: 'Wholesale year-round cashmere knitwear: 12gg fine gauge pieces suitable for AW and SS collections.', h1: 'Cashmere Year-Round Knitwear', intro: 'Browse year-round cashmere knitwear from our Ordos facility.', keywords: ['year round cashmere', 'cashmere all season', 'SS cashmere'] },
    cn: { title: '羊绒全季针织衫批发 | 12 针细针 | 东霄 DONGXIAO®', description: '羊绒全季针织衫批发：12 针细针适合秋冬与春夏系列。14–15.5µm 蒙古羊绒。', h1: '羊绒全季针织衫', intro: '浏览鄂尔多斯工厂精选羊绒全季针织衫。', keywords: ['羊绒全季', '四季羊绒', '羊绒春夏'] },
    de: { title: 'Kaschmir-Ganzjahres-Strickwaren Großhandel | DONGXIAO®', description: 'Großhandel Kaschmir-Ganzjahres-Strickwaren.', h1: 'Kaschmir-Ganzjahres-Strickwaren', intro: 'Kaschmir-Ganzjahres-Strickwaren aus unserer Ordos-Fabrik.', keywords: ['Kaschmir Ganzjahres'] },
    fr: { title: 'Cachemire Toute Saison en Gros | DONGXIAO®', description: 'Cachemire toute saison en gros.', h1: 'Cachemire Toute Saison', intro: 'Cachemire toute saison de notre usine d\'Ordos.', keywords: ['cachemire toute saison'] },
    ja: { title: 'カシミア年間ニット卸売り | DONGXIAO®', description: 'カシミア年間ニット卸売り。', h1: 'カシミア年間ニット', intro: 'オルドス工場のカシミア年間ニット。', keywords: ['カシミア 年間'] },
    kr: { title: '캐시미어 연중무휴 니트 도매 | DONGXIAO®', description: '캐시미어 연중무휴 니트 도매.', h1: '캐시미어 연중무휴 니트 도매', intro: '오르도스 공장의 캐시미어 연중무휴 니트.', keywords: ['캐시미어 연중무휴'] },
  },
};