/**
 * AI chat knowledge base — referenced by api/chat.ts system prompts.
 * Edit this file to update what the AI assistant knows about DONGXIAO Cashmere.
 *
 * Data sources:
 * - PRODUCT_CATEGORIES: derived from products.json (real prices, MOQs, materials).
 *   Override field `nameByLocale`/`highlightByLocale` to add non-product-line categories
 *   that aren't in products.json (e.g. raw fiber, fabric — listed as 0 products in catalog).
 * - FAQ_ENTRIES: hand-curated B2B Q&A. Edit inline below.
 */

import productsData from './products.json';

export interface ProductCategory {
  id: string;
  name: string;        // English
  nameByLocale: Record<string, string>;
  count: number;
  moq: string;
  leadTime: string;
  priceRange: string;
  highlight: string;   // 1-line selling point
  highlightByLocale: Record<string, string>;
}

/**
 * Derive real stats from products.json: count, MOQ range, price range, lead time, materials.
 * Returns null if the category isn't in the product catalog.
 */
function deriveStatsFromCatalog(catId: string): {
  count: number;
  moqRange: string;
  priceRange: string;
  leadTime: string;
  materials: string[];
} | null {
  const cat = (productsData.categories as any[]).find((c) => c.id === catId);
  if (!cat) return null;
  const products = cat.products as any[];
  const n = products.length;

  // MOQ — collect unique values, sort, show range
  const moqs: number[] = [...new Set(products.map((p) => p.moq).filter((m) => m != null) as number[])].sort((a, b) => a - b);
  let moqRange = '';
  if (moqs.length === 1) {
    moqRange = `${moqs[0]} pcs`;
  } else if (moqs.length > 1) {
    // If 2 values close, show both; if many, show "X-Y pcs (or 1 sample)"
    const lo = moqs[0];
    const hi = moqs[moqs.length - 1];
    if (lo === 1) {
      moqRange = `1 sample / ${hi} pcs`;
    } else {
      moqRange = `${lo}-${hi} pcs`;
    }
  }

  // Price — parse "9.2-16.5" format, take global min/max
  let minLo = Infinity, maxHi = -Infinity;
  for (const p of products) {
    const pr = p.price;
    if (pr && typeof pr === 'string' && pr.includes('-')) {
      const [lo, hi] = pr.split('-').map((s: string) => parseFloat(s.trim()));
      if (!isNaN(lo) && !isNaN(hi)) {
        if (lo < minLo) minLo = lo;
        if (hi > maxHi) maxHi = hi;
      }
    }
  }
  const priceRange = (minLo < Infinity && maxHi > -Infinity)
    ? `USD ${minLo.toFixed(minLo < 10 ? 1 : 0)}-${maxHi.toFixed(0)}`
    : '?';

  // Lead time — collect unique
  const leads: string[] = [...new Set(products.map((p: any) => p.lead).filter((l: string) => l && l.trim()))];
  const leadTime = leads.length > 0 ? leads.slice(0, 2).join(' / ') : '30-35 days';

  // Materials — top 3 by count
  const matCounts: Record<string, number> = {};
  for (const p of products) {
    const m = p.material;
    if (m) matCounts[m] = (matCounts[m] || 0) + 1;
  }
  const topMaterials = Object.entries(matCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([m]) => m);

  return { count: n, moqRange, priceRange, leadTime, materials: topMaterials };
}

// 6 product lines. 5 are derived from products.json; "raw" (raw cashmere fiber) and "fabric"
// are non-catalog hero categories the company also offers — kept as hand-curated entries below.
export const PRODUCT_CATEGORIES: ProductCategory[] = (() => {
  // Map: catalog id → display name (English)
  const CAT_DEFS: Array<{ id: string; name: string; nameByLocale: Record<string, string> }> = [
    {
      id: 'hats',
      name: 'Cashmere Hats & Beanies',
      nameByLocale: {
        en: 'Cashmere Hats & Beanies', cn: '羊绒帽 / 毛线帽', de: 'Kaschmir-Hüte & Beanies',
        fr: 'Bonnets & bonnets cachemire', ja: 'カシミア帽子・ビーニー', kr: '캐시미어 모자·비니',
      },
    },
    {
      id: 'sweaters',
      name: 'Cashmere Sweaters & Knitwear',
      nameByLocale: {
        en: 'Cashmere Sweaters & Knitwear', cn: '羊绒衫 / 针织衫', de: 'Kaschmir-Pullover & Strick',
        fr: 'Pulls & tricots cachemire', ja: 'カシミアセーター・ニット', kr: '캐시미어 스웨터·니트',
      },
    },
    {
      id: 'scarves',
      name: 'Cashmere Scarves & Wraps',
      nameByLocale: {
        en: 'Cashmere Scarves & Wraps', cn: '羊绒围巾 / 披肩', de: 'Kaschmir-Schals & Tücher',
        fr: 'Écharpes & châles cachemire', ja: 'カシミアスカーフ・ショール', kr: '캐시미어 스카프·숄',
      },
    },
    {
      id: 'accessories',
      name: 'Cashmere Accessories (Gloves, Socks, Leggings)',
      nameByLocale: {
        en: 'Cashmere Accessories (Gloves, Socks, Leggings)', cn: '羊绒配饰（手套/袜/打底裤）',
        de: 'Kaschmir-Accessoires (Handschuhe, Socken, Leggings)',
        fr: 'Accessoires cachemire (gants, chaussettes, leggings)',
        ja: 'カシミアアクセサリー（手袋、靴下、レギンス）',
        kr: '캐시미어 액세서리 (장갑, 양말, 레깅스)',
      },
    },
    {
      id: 'yarn',
      name: 'Cashmere Yarn & Fiber',
      nameByLocale: {
        en: 'Cashmere Yarn & Fiber', cn: '羊绒纱线', de: 'Kaschmir-Garn & -Faser',
        fr: 'Fil & fibre cachemire', ja: 'カシミア糸・ファイバー', kr: '캐시미어 원사·섬유',
      },
    },
  ];

  // Hand-written highlights per category (sales angle, NOT derived from data).
  const HIGHLIGHTS: Record<string, { en: string; cn: string; de: string; fr: string; ja: string; kr: string }> = {
    hats: {
      en: 'Fold-up beanies, berets, headbands. Custom logo embroidery. Inner Mongolia 14.5-15.5μm fiber.',
      cn: '翻边毛线帽、贝雷帽、发带。可定制 logo 刺绣。内蒙 14.5-15.5μm 纤维。',
      de: 'Beanies, Berets, Stirnbaender. Logo-Stickerei. Innere Mongolei 14,5-15,5μm Faser.',
      fr: 'Bonnets, bérets, bandeaux. Broderie logo. Fibre Mongolie-Intérieure 14,5-15,5μm.',
      ja: '折り返しビーニー、ベレー、ヘッドバンド。ロゴ刺繍可。内モンゴル14.5-15.5μm繊維。',
      kr: '접이식 비니, 베레모, 헤드밴드. 로고 자수 가능. 내몽골 14.5-15.5μm 섬유.',
    },
    sweaters: {
      en: 'Cardigans, pullovers, vests, zip-ups. 3-16 gauge. CAD pattern + sample + bulk production.',
      cn: '开衫、套头、背心、拉链衫。3-16 针。CAD 制版+打样+大货生产。',
      de: 'Strickjacken, Pullover, Westen, Zip-up. 3-16 Gauge. CAD-Schnitt + Muster + Serie.',
      fr: 'Cardigans, pulls, gilets, zippés. Jauge 3-16. Patron CAO + échantillon + série.',
      ja: 'カーディガン、プルオーバー、ベスト、ジップアップ。3-16ゲージ。CAD+サンプル+量産。',
      kr: '카디건, 풀오버, 조끼, 집업. 3-16게이지. CAD 패턴+샘플+양산.',
    },
    scarves: {
      en: 'Solid, print, jacquard, ombré, woven logo. Custom packaging available.',
      cn: '素色、印花、提花、渐变、织造 logo。可定制包装。',
      de: 'Uni, Druck, Jacquard, Ombré, Weblogo. Massverpackung moeglich.',
      fr: 'Uni, imprimé, jacquard, ombré, logo tissé. Emballage personnalise disponible.',
      ja: '無地、プリント、ジャカード、オンブレ、織ロゴ。カスタムパッケージ可。',
      kr: '무지, 프린트, 자카드, 옴브레, 직조 로고. 맞춤 패키징 가능.',
    },
    accessories: {
      en: 'Gloves, socks, leggings, pants, sleep masks. Custom embroidery & packaging.',
      cn: '手套、袜子、打底裤、裤子、眼罩。可定制刺绣与包装。',
      de: 'Handschuhe, Socken, Leggings, Hosen, Schlafmasken. Stickerei & Verpackung.',
      fr: 'Gants, chaussettes, leggings, pantalons, masques. Broderie & emballage.',
      ja: '手袋、靴下、レギンス、パンツ、アイマスク。刺繍・パッケージ可。',
      kr: '장갑, 양말, 레깅스, 바지, 수면안대. 맞춤 자수·패키징.',
    },
    yarn: {
      en: '2/26 Nm worsted/woolen, white/brown/purple. Cone or hank form.',
      cn: '2/26 Nm 精纺/粗纺，白/青/紫绒。筒纱/绞纱。',
      de: '2/26 Nm Kammgarn/Streichgarn, weiss/braun/lila. Cone oder Strang.',
      fr: '2/26 Nm peigné/cardé, blanc/brun/violet. Cône ou écheveau.',
      ja: '2/26 Nm 梳毛/紡毛、白/青/紫。コーン/かせ。',
      kr: '2/26 Nm 소면/방모, 백/청/자. 콘/한키.',
    },
  };

  // 5 product categories derived from products.json
  const result: ProductCategory[] = CAT_DEFS.map((def) => {
    const stats = deriveStatsFromCatalog(def.id);
    const h = HIGHLIGHTS[def.id];
    return {
      id: def.id,
      name: def.name,
      nameByLocale: def.nameByLocale,
      count: stats ? stats.count : 0,
      moq: stats ? stats.moqRange : '?',
      leadTime: stats ? stats.leadTime : '30-45 days',
      priceRange: stats ? stats.priceRange : '?',
      highlight: h.en,
      highlightByLocale: h,
    };
  });

  // 2 hero categories (raw + fabric) — listed in B2B marketing but not in products.json.
  // Keep as hand-curated.
  result.push(
    {
      id: 'raw',
      name: 'Raw Cashmere Fiber',
      nameByLocale: {
        en: 'Raw Cashmere Fiber', cn: '羊绒原料', de: 'Rohkaschmir-Faser', fr: 'Fibre de cachemire brute',
        ja: 'カシミア原毛', kr: '캐시미어 원료',
      },
      count: 0,
      moq: '100 kg',
      leadTime: '15-25 days',
      priceRange: 'USD 75-120/kg',
      highlight: 'Direct from Inner Mongolia herders. Dehaired, washed, ready for spinning.',
      highlightByLocale: {
        en: 'Direct from Inner Mongolia herders. Dehaired, washed, ready for spinning.',
        cn: '内蒙牧民直供。分梳、水洗完成，可直接纺纱。',
        de: 'Direkt von Hirten der Inneren Mongolei. Entgrannt, gewaschen, spinnfertig.',
        fr: 'Directement des éleveurs de Mongolie-Intérieure. Épilé, lavé, prêt à filer.',
        ja: '内モンゴル牧民直送。脱毛・洗浄済み、紡績可。',
        kr: '내몽골 목축민 직송. 제모·세척 완료, 방적 가능.',
      },
    },
    {
      id: 'fabric',
      name: 'Cashmere Fabric',
      nameByLocale: {
        en: 'Cashmere Fabric', cn: '羊绒面料', de: 'Kaschmirstoff', fr: 'Tissu cachemire',
        ja: 'カシミア生地', kr: '캐시미어 원단',
      },
      count: 0,
      moq: '200 m',
      leadTime: '30-45 days',
      priceRange: 'USD 45-85/m',
      highlight: 'Woven & knitted. 200-450 gsm. Custom dye & finish.',
      highlightByLocale: {
        en: 'Woven & knitted. 200-450 gsm. Custom dye & finish.',
        cn: '机织/针织。200-450 g/m²。定制染色与后整。',
        de: 'Gewebt & gestrickt. 200-450 g/m². Massfaerbung & Veredelung.',
        fr: 'Tissé & tricoté. 200-450 g/m². Teinture et finition sur mesure.',
        ja: '織物・編物。200-450 gsm。カスタム染色・仕上げ。',
        kr: '제직·편직. 200-450 gsm. 맞춤 염색·후가공.',
      },
    }
  );

  return result;
})();

export interface FaqEntry {
  q: { en: string; cn: string };
  a: { en: string; cn: string };
}

export const FAQ_ENTRIES: FaqEntry[] = [
  {
    q: { en: 'What is your MOQ?', cn: '起订量（MOQ）是多少？' },
    a: { en: 'Raw material 100kg / Yarn 50kg / Fabric 200m / Garment OEM 100pcs/style / Scarves & accessories 50pcs.',
         cn: '原料 100kg / 纱线 50kg / 面料 200m / 成衣代工 100件/款 / 围巾配饰 50件。' },
  },
  {
    q: { en: 'What is the lead time?', cn: '交货期多久？' },
    a: { en: 'Raw material 15-25 days. Yarn 20-30 days. Fabric 30-45 days. Garment OEM 45-60 days (incl. sampling).',
         cn: '原料 15-25 天，纱线 20-30 天，面料 30-45 天，成衣代工 45-60 天（含打样）。' },
  },
  {
    q: { en: 'Can you send samples? Free or paid?', cn: '可以提供样品吗？免费还是付费？' },
    a: { en: 'Free color cards (A4 size). Paid full samples at 1.5x-2x bulk price, refundable against orders over USD 1,000.',
         cn: 'A4 色卡免费。完整样品按大货 1.5-2 倍价格收费，订单满 1000 美元可冲抵。' },
  },
  {
    q: { en: 'What payment terms do you accept?', cn: '付款方式？' },
    a: { en: 'T/T 30% deposit + 70% before shipment. L/C at sight for new customers. OA available for grade-A customers.',
         cn: 'T/T 30% 定金 + 70% 尾款（发货前）。新客户首次合作 L/C at sight。A 级老客户可走 OA。' },
  },
  {
    q: { en: 'What trade terms (Incoterms) do you support?', cn: '支持哪些贸易条款？' },
    a: { en: 'FOB Tianjin/Shanghai, CIF, DDP. We handle export customs and arrange sea (LCL/FCL) or air freight.',
         cn: 'FOB 天津/上海、CIF、DDP 均可。我们代办出口报关与海运（散货/整柜）/空运。' },
  },
  {
    q: { en: 'Do you offer OEM/ODM?', cn: '是否提供 OEM/ODM？' },
    a: { en: 'Yes. In-house design team supports OEM (your design) and ODM (we design for you). MOQ 100pcs/style.',
         cn: '是的。我们有专业设计团队支持 OEM（您的设计）与 ODM（我们设计），MOQ 100 件/款。' },
  },
  {
    q: { en: 'How is the price calculated? Any discount for bulk?', cn: '价格怎么算？大单有折扣吗？' },
    a: { en: 'Price depends on micron count (finer = pricier), yarn count (Nm), order quantity, and customization. Bulk discount: 5% for USD 5K+, 10% for USD 20K+, 15% for USD 50K+.',
         cn: '价格取决于细度（越细越贵）、支数（Nm）、订单量与定制程度。大单折扣：5000 美元 95 折 / 2 万美元 9 折 / 5 万美元 85 折。' },
  },
  {
    q: { en: 'What certifications do you have?', cn: '你们有哪些认证？' },
    a: { en: 'ISO 9001:2015, OEKO-TEX Standard 100, GOTS (on request for organic). RWS (Responsible Wool Standard) available for blended products.',
         cn: 'ISO 9001:2015、OEKO-TEX Standard 100、GOTS（按需申请有机）。混纺产品可提供 RWS 认证。' },
  },
  {
    q: { en: 'Can we visit the factory? When and how?', cn: '可以参观工厂吗？时间和方式？' },
    a: { en: 'Yes, factory visits are welcome in Ordos, Inner Mongolia. We can also arrange video audits. Please book 7 days in advance.',
         cn: '欢迎来鄂尔多斯工厂实地参观。也可以安排视频验厂。请提前 7 天预约。' },
  },
];

/**
 * Format the product knowledge base + FAQ for inclusion in a system prompt.
 * @param locale - which language to render names/highlights in
 */
export function buildKnowledgeSection(locale: string): string {
  const loc = (locale in PRODUCT_CATEGORIES[0].nameByLocale) ? locale : 'en';
  const products = PRODUCT_CATEGORIES.map((p) => {
    const name = p.nameByLocale[loc] || p.name;
    const hl = p.highlightByLocale[loc] || p.highlight;
    return `- ${name} (id=${p.id}, n=${p.count}): MOQ ${p.moq} · Lead ${p.leadTime} · Price ${p.priceRange}. ${hl}`;
  }).join('\n');

  const faqs = FAQ_ENTRIES.map((f, i) => {
    const q = f.q[loc === 'cn' ? 'cn' : 'en'];
    const a = f.a[loc === 'cn' ? 'cn' : 'en'];
    return `${i + 1}. Q: ${q}\n   A: ${a}`;
  }).join('\n');

  return `=== CATALOG SNAPSHOT (live data, regenerated on each deploy) ===
Total: 591 products across 6 product lines (hats/sweaters/scarves/accessories/yarn in catalog + raw + fabric as hero categories).

=== PRODUCT KNOWLEDGE BASE (use these exact facts) ===
${products}

=== FAQ (9 most-asked B2B questions, give direct answers from these) ===
${faqs}

When the user asks about MOQ, lead time, samples, payment, OEM, pricing, certifications, or factory visits — answer DIRECTLY from the FAQ above. Do not make up numbers. Prices and MOQs above come from our live catalog of 591 products.`;
}