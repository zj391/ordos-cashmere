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
  // ── MOQ & 订单 (11 questions) ──
  {
    q: { en: 'What is the minimum order quantity (MOQ) for cashmere products?', cn: '羊绒产品最小起订量是多少？' },
    a: { en: 'Cashmere baby blanket: 100 pieces per design. Yarn: 50 kg per color. Raw material: 100 kg per grade. Garment OEM: 100 pieces per style. Scarves & accessories: 50 pieces per design. We accept smaller trial orders on a case-by-case basis for new buyers.', cn: '羊绒婴儿毯 100 条/设计。纱线 50 kg/色。原料 100 kg/等级。成衣代工 100 件/款。围巾配饰 50 件/设计。新客户首批可协商小批量试单。' },
  },
  {
    q: { en: 'Do you accept smaller trial orders?', cn: '你们接受小批量试单吗？' },
    a: { en: 'Yes, for new buyers and first-time collaborations we can discuss smaller trial quantities (typically 30-50% of standard MOQ). Trial orders may carry a 5-10% small-batch surcharge and slightly longer lead time due to production scheduling.', cn: '可以。新客户和首次合作可协商 30-50% 标准 MOQ 的小批量试单。试单可能加收 5-10% 小批量附加费，交期略长。' },
  },
  {
    q: { en: 'What is the MOQ for a private-label cashmere sweater program?', cn: '自有品牌羊绒衫计划的 MOQ 是多少？' },
    a: { en: 'Standard MOQ is 100 pieces per style with 3-color minimum per colorway. For multi-piece collections (5 styles), the total commitment is 500 pieces. Custom Pantone from 5 kg per color.', cn: '标准 MOQ 为每款 100 件，每色至少 3 色。5 款系列总下单量 500 件。定制潘通色 5 kg/色起。' },
  },
  {
    q: { en: 'Can I order less than MOQ if I pay a higher price?', cn: '如果加价可以少于 MOQ 下单吗？' },
    a: { en: 'Yes, in most cases we can accommodate orders at 50-70% of MOQ with a 10-15% price premium to cover changeover costs. Most common for sample-size productions and capsule collections.', cn: '可以，多数情况下可承接 50-70% MOQ 订单，加价 10-15% 覆盖换线/换款成本。多用于样品级小批量和胶囊系列。' },
  },
  {
    q: { en: 'What is the MOQ for cashmere yarn orders?', cn: '羊绒纱线订单的 MOQ 是多少？' },
    a: { en: 'Minimum order is 50 kg per color for stock colors. For custom Pantone colors, minimum is 5 kg per colorway. Standard production runs are 200-500 kg per color.', cn: '现货色起订量 50 kg/色。定制潘通色起订 5 kg/色。标准大货下单量为每色 200-500 kg。' },
  },
  {
    q: { en: 'What is the MOQ for cashmere scarves wholesale?', cn: '羊绒围巾批发的 MOQ 是多少？' },
    a: { en: '50 pieces per design for stock colors. Custom Pantone from 5 kg per color (about 25-30 scarves per kg). Custom dimensions from 100 pieces.', cn: '现货色起订量 50 条/设计。定制潘通色起订 5 kg/色（约 25-30 条围巾/kg）。定制尺寸起订 100 条。' },
  },
  {
    q: { en: 'What is the MOQ for cashmere hats / beanies?', cn: '羊绒帽 / 冷帽的 MOQ 是多少？' },
    a: { en: 'Standard MOQ is 50 pieces per design with 3 colors minimum. Custom embroidered logos from 100 pieces. Custom patterns from 200 pieces.', cn: '标准 MOQ 为每款 50 件，至少 3 色。定制绣花 logo 起订 100 件。定制花纹起订 200 件。' },
  },
  {
    q: { en: 'What is the MOQ for cashmere gloves?', cn: '羊绒手套的 MOQ 是多少？' },
    a: { en: '50 pairs per design for stock colors. Lined versions (cashmere, merino, or silk lined) from 200 pairs due to the additional assembly step.', cn: '现货色起订 50 双/设计。加里布款（羊绒/美利奴/真丝里布）起订 200 双，因额外组装工序。' },
  },
  {
    q: { en: 'Do you have a minimum spend per order?', cn: '每单有最低消费金额吗？' },
    a: { en: 'For first orders we recommend a minimum USD 5,000-10,000 commitment to optimize freight and customs costs. Repeat orders have no minimum spend requirement.', cn: '首单建议最低 5,000-10,000 美元，以优化运费和报关成本。复购订单无最低下单金额限制。' },
  },
  {
    q: { en: 'Can I combine multiple SKUs into one order to meet MOQ?', cn: '能合并多个 SKU 凑 MOQ 吗？' },
    a: { en: 'Yes, combined MOQ across SKUs is acceptable if the total meets at least 300 pieces and all SKUs share yarn/dye lot feasibility. Common approach for capsule collection buyers.', cn: '可以。如果总下单量达 300 件以上且所有 SKU 共享纱线/染批可行性，可合并 SKU 计算 MOQ。小型胶囊系列常见做法。' },
  },
  {
    q: { en: 'What happens if I order more than MOQ?', cn: '超过 MOQ 下单会怎样？' },
    a: { en: 'Orders exceeding MOQ unlock tiered volume discounts: 5% off USD 5K+, 10% off USD 20K+, 15% off USD 50K+. Larger orders receive priority queue during peak season (Aug-Nov).', cn: '超过 MOQ 的订单可享分级折扣：5000 美元 95 折 / 2 万美元 9 折 / 5 万美元 85 折。大单旺季（8-11 月）享优先排产。' },
  },

  // ── 交期 & 物流 (10 questions) ──
  {
    q: { en: 'What is the typical lead time for cashmere orders?', cn: '羊绒订单典型交期是多久？' },
    a: { en: 'Raw material: 15-25 days. Yarn: 20-30 days. Fabric: 30-45 days. Garment OEM: 45-60 days (incl. sampling). Scarves & accessories: 25-35 days. Express rush available with 30-50% surcharge.', cn: '原料 15-25 天。纱线 20-30 天。面料 30-45 天。成衣代工 45-60 天（含打样）。围巾配饰 25-35 天。加急可走，加价 30-50%。' },
  },
  {
    q: { en: 'How long does it take to receive a sample?', cn: '收到样品要多久？' },
    a: { en: 'Sample sets ship in 5-10 days from request confirmation. International air freight adds 5-7 days. Total sample delivery is typically 10-17 days from request.', cn: '样套从确认起 5-10 天发出。国际空运再加 5-7 天。样套从申请到收货通常 10-17 天。' },
  },
  {
    q: { en: 'What is a rush lead time?', cn: '什么是加急交期？' },
    a: { en: 'Rush production skips the standard production queue and may involve: switching to in-progress yarn lots, parallel cutting/sewing, and faster QC rounds. Rush surcharges are typically 30-50% of base price.', cn: '加急生产跳过标准排产，可能涉及：调用在产纱线批次、并行调度裁剪/缝制、加快质检。加急费通常为基础价格的 30-50%。' },
  },
  {
    q: { en: 'How long does sea freight take from China to my destination?', cn: '中国到目的地海运要多久？' },
    a: { en: 'Sea freight: 20-35 days to EU/US/Middle East depending on port pair. Air freight: 5-7 days. Express courier (DHL/FedEx): 3-5 days. We arrange LCL (loose container) and FCL (full container).', cn: '海运到欧盟/美国/中东 20-35 天（看港口组合）。空运 5-7 天。快递（DHL/FedEx）3-5 天。我们安排散货（LCL）和整柜（FCL）。' },
  },
  {
    q: { en: 'Can you ship DDP (delivered duty paid)?', cn: '能做 DDP（完税到门）吗？' },
    a: { en: 'Yes, we offer DDP to EU, US, Canada, and Australia via our logistics partners. DDP includes customs clearance and import duties. Surcharge is typically 8-15% of FOB price depending on destination.', cn: '可以。我们为欧盟、美国、加拿大、澳大利亚提供 DDP 服务，含清关与进口关税。DDP 附加费通常为 FOB 价格的 8-15%，视目的地而定。' },
  },
  {
    q: { en: 'What is the rush production surcharge?', cn: '加急生产附加费是多少？' },
    a: { en: 'Standard rush surcharge is 30% for 25-30 day delivery and 50% for 15-20 day delivery. Rush applies when standard queue is fully booked (typically Q4 peak season).', cn: '标准加急附加费：25-30 天交期 +30%；15-20 天交期 +50%。加急适用于标准队列已满（多为 Q4 旺季）。' },
  },
  {
    q: { en: 'Do you handle customs clearance?', cn: '你们处理清关吗？' },
    a: { en: 'Yes, for DDP shipments. For FOB/CIF, buyer handles destination customs. We provide all necessary export documents: commercial invoice, packing list, COO, CIQ, and any required certificates.', cn: '可以，针对 DDP 货物。FOB/CIF 由买家处理目的港清关。我们提供所有出口文件：商业发票、装箱单、原产地证、CIQ 及所需证书。' },
  },
  {
    q: { en: 'What shipping documents do you provide?', cn: '你们提供哪些运输单证？' },
    a: { en: 'Per shipment: Commercial Invoice, Packing List, Bill of Lading / Airway Bill, Certificate of Origin (CCPIT), CIQ Health Certificate (when required), Fumigation Certificate (when required).', cn: '每单提供：商业发票、装箱单、海运/空运提单、原产地证（CCPIT）、CIQ 卫生证（按需）、熏蒸证（按需）。' },
  },
  {
    q: { en: 'Can I split an order into multiple shipments?', cn: '订单可以分批装运吗？' },
    a: { en: 'Yes, partial shipments are common for first-time collaborations and capsule collections. Each partial shipment is invoiced separately. We can also stage shipments based on your launch calendar.', cn: '可以。分批装运是首次合作和胶囊系列的常见做法。每批独立开票。我们也可以按贵方上新节奏分批发送。' },
  },
  {
    q: { en: 'What is the freight cost for a typical order?', cn: '典型订单运费是多少？' },
    a: { en: 'Freight depends on volume/weight/route. Typical estimates: USD 1.50-3.00/kg sea freight Tianjin-EU, USD 5-8/kg air freight. We provide freight quotes per shipment upon order confirmation.', cn: '运费取决于体积/重量/路线。典型参考：天津-欧盟海运 1.50-3.00 美元/kg，空运 5-8 美元/kg。下单确认后按批提供运费报价。' },
  },

  // ── 样品 & 打样 (10 questions) ──
  {
    q: { en: 'Can you send samples? Free or paid?', cn: '可以寄样品吗？免费还是付费？' },
    a: { en: 'Free color cards (A4 size). Paid full samples at 1.5-2x bulk price, refundable against orders over USD 1,000. Custom samples (your Pantone, your design) at 2-2.5x bulk price.', cn: 'A4 色卡免费。完整样品按大货 1.5-2 倍价格收费，订单满 1000 美元可冲抵。定制样品（您的潘通色/设计）按大货 2-2.5 倍价格收费。' },
  },
  {
    q: { en: 'How long does sample production take?', cn: '打样要多长时间？' },
    a: { en: 'Standard samples: 5-10 days. Custom samples (your Pantone, your design): 10-15 days including lab dip preparation. Sample sets ship via air freight (5-7 days international).', cn: '标准样品 5-10 天。定制样品（您的潘通色/设计）10-15 天，含色卡打样准备。样套走国际空运（5-7 天送达）。' },
  },
  {
    q: { en: 'Are sample fees refundable?', cn: '样品费可以冲抵吗？' },
    a: { en: 'Yes, sample fees are fully refundable against bulk orders of USD 1,000 or more. Refund is applied to the bulk order invoice, not returned as cash.', cn: '可以，样品费在订单满 1,000 美元时可全额冲抵。冲抵金额应用于大货订单发票，不以现金返还。' },
  },
  {
    q: { en: 'Can I get a sample before placing the bulk order?', cn: '大货前能先打样吗？' },
    a: { en: 'Yes — we strongly recommend a sample before bulk for all custom orders. Samples let you verify: hand-feel, color accuracy, gauge, weight, embroidery placement, and finishing quality. Sample lead time is included in total bulk lead time.', cn: '可以。我们强烈建议所有定制订单在批量生产前打样。样品可验证：手感、颜色准确度、针型、克重、绣花位置和后整理质量。打样周期包含在大货交期内。' },
  },
  {
    q: { en: 'What sample formats are available?', cn: '有哪些样品形式？' },
    a: { en: 'Color card (A4 fabric swatches), yarn hank (50g), full garment sample (your size), beanie/hat sample, scarf/wrap sample, glove sample. Custom formats available on request.', cn: '色卡（A4 面料样）、纱线绞（50 g）、完整成衣样品（您的尺码）、帽子样品、围巾/披肩样品、手套样品。可按需定制。' },
  },
  {
    q: { en: 'How many samples can I receive at once?', cn: '一次能收多少样品？' },
    a: { en: 'Standard sample set: 3-5 samples covering different categories/colors. For custom programs: typically 1-2 samples per style in development. Sample quantities are 1-3 pieces per style.', cn: '标准样套 3-5 个样品覆盖不同品类/颜色。定制项目开发中每款 1-2 个样品。每款样品数量 1-3 件。' },
  },
  {
    q: { en: 'Do you send samples to first-time buyers without order history?', cn: '首次合作没订单历史也给寄样吗？' },
    a: { en: 'Yes, we do. First-time buyers receive samples after we confirm mutual interest (typically after an initial conversation about your program). We do not send free samples to anonymous requests without program context.', cn: '可以。首次买家在我们确认合作意向后（通常在初步沟通您项目之后）寄样。我们不会在无项目背景的情况下向匿名请求寄免费样品。' },
  },
  {
    q: { en: 'Can samples be customized with my logo or label?', cn: '样品能加我的 logo 或标签吗？' },
    a: { en: 'Yes. Embroidered logo from 100 pieces (sample may be charged extra). Custom woven labels sewn in from 100 pieces. Custom hangtags from 500 pieces. Sample-level branding is typically not cost-effective — recommend testing branding on bulk.', cn: '可以。绣花 logo 起订 100 件（样品可能额外收费）。织标缝入起订 100 件。吊牌起订 500 件。样品级品牌印字通常性价比不高，建议在大货上做。' },
  },
  {
    q: { en: 'What is the shipping cost for samples?', cn: '样品运费多少？' },
    a: { en: 'Sample shipping is paid by the buyer via prepaid courier account (DHL/FedEx), or we can add shipping cost to sample invoice. Sample freight is typically USD 30-80 international air freight.', cn: '样品运费由买家通过预付快递账户（DHL/FedEx）支付，或我们把运费加入样品发票。样品国际空运通常 30-80 美元。' },
  },
  {
    q: { en: 'Do you keep client samples on file?', cn: '你们会存档客户样品吗？' },
    a: { en: 'Yes, we archive approved samples for 2 years. This allows us to: re-produce against approved reference, resolve color/gauge disputes, and fast-track repeat orders with minimal sampling.', cn: '可以。我们归档已确认样品 2 年。这使我们能：按已批准参考重新生产、解决颜色/针型争议、为复购订单加速跳过大样阶段。' },
  },

  // ── 价格 & 付款 (10 questions) ──
  {
    q: { en: 'How is the price calculated?', cn: '价格怎么算？' },
    a: { en: 'Price depends on 4 factors: micron count (finer = pricier, 14.5μm top grade), yarn count (Nm, higher = finer = pricier), order quantity (volume discount tiers), and customization (Pantone, embroidery, packaging). Base FOB Tianjin price.', cn: '价格取决于 4 个因素：纤维细度（越细越贵，14.5μm 顶级）、纱线支数（Nm 越高越细越贵）、订单量（量价折扣）、定制程度（潘通色、绣花、包装）。基础 FOB 天津价。' },
  },
  {
    q: { en: 'What are the bulk discount tiers?', cn: '批量折扣怎么算？' },
    a: { en: '5% off for orders USD 5,000+. 10% off for USD 20,000+. 15% off for USD 50,000+. 20% off for USD 100,000+ (negotiated). Discounts apply to FOB base price; freight and customs are separate.', cn: '5,000 美元起 95 折。2 万美元起 9 折。5 万美元起 85 折。10 万美元起 8 折（按项目协商）。折扣适用于 FOB 基价，运费和报关费另算。' },
  },
  {
    q: { en: 'What payment terms do you accept?', cn: '你们接受哪些付款条件？' },
    a: { en: 'T/T 30% deposit + 70% balance before shipment. L/C at sight for first-time customers. OA (open account) available for grade-A repeat customers with established credit history. Western Union and PayPal for sample fees.', cn: 'T/T 30% 定金 + 70% 尾款（发货前）。新客户首次合作 L/C 即期。OA（赊账）适用于有信用记录的 A 级老客户。样品费可走西联或 PayPal。' },
  },
  {
    q: { en: 'Can I pay by L/C?', cn: '能用 L/C 付款吗？' },
    a: { en: 'Yes, L/C at sight is accepted for first-time customers. We work with major issuing banks. L/C should be irrevocable, confirmed, and allow partial shipments and transshipment.', cn: '可以，新客户首次合作可走 L/C 即期。我们与主要开证行合作。L/C 应为不可撤销、保兑、允许分批装运和转运。' },
  },
  {
    q: { en: 'What is the cost premium for Alashan vs Ordos Inner Mongolia cashmere?', cn: '阿尔巴斯 vs 鄂尔多斯羊绒的价差是多少？' },
    a: { en: 'Alashan white down (14.5μm) carries a 15-25% premium over standard Ordos grade (15.0μm). This reflects longer fiber, higher whiteness, and lower yield per goat. Both grades carry our full quality guarantee.', cn: '阿尔巴斯白绒（14.5μm）相比标准鄂尔多斯级（15.5μm）有 15-25% 溢价。这反映纤维更长、白度更高、单只产绒量更低。两个等级都享有完整品质保证。' },
  },
  {
    q: { en: 'What is the cost premium for finer yarn counts?', cn: '细支纱线溢价多少？' },
    a: { en: '2/48 Nm vs 2/26 Nm: +25-35% premium. 2/60 Nm vs 2/26 Nm: +50-70% premium. 2/80 Nm vs 2/26 Nm: +100-150% premium. Finer counts require longer combing cycles, slower spinning, and more QC rounds.', cn: '2/48 Nm 对比 2/26 Nm: +25-35%。2/60 Nm 对比 2/26 Nm: +50-70%。2/80 Nm 对比 2/26 Nm: +100-150%。细支需要更长分梳周期、更慢纺纱、更多质检。' },
  },
  {
    q: { en: 'Are yarn prices quoted per kg or per piece?', cn: '纱线按 kg 还是按件报价？' },
    a: { en: 'Standard yarn pricing is per kg. Finished garment pricing is per piece (FOB Tianjin). Fabric is per meter. We can quote either unit depending on your program\'s accounting needs.', cn: '标准纱线按 kg 报价。成衣按件报价（FOB 天津）。面料按米报价。可按您项目的会计需要报价任一单位。' },
  },
  {
    q: { en: 'Is the price inclusive of packaging?', cn: '价格含包装吗？' },
    a: { en: 'Standard export packaging (polybag + 5-ply carton) is included. Custom packaging (gift box, branded tissue, custom hangtags, branded shipping marks) is additional: USD 1-6 per piece depending on complexity.', cn: '标准出口包装（塑料袋 + 5 层瓦楞纸箱）已含。定制包装（礼盒、品牌薄纸、定制吊牌、品牌唛头）另算：1-6 美元/件，看复杂度。' },
  },
  {
    q: { en: 'What currency do you accept?', cn: '你们接受哪些货币？' },
    a: { en: 'Primary: USD. Also accepted: EUR, CNY, GBP. Wire transfers in these currencies are standard. Cryptocurrency not accepted for first orders but negotiable for repeat customers.', cn: '首选美元。也接受欧元、人民币、英镑。这些货币的电汇为标准。首次订单不接受加密货币，复购客户可协商。' },
  },
  {
    q: { en: 'When is the deposit due?', cn: '定金什么时候付？' },
    a: { en: 'Deposit (30%) is due upon order confirmation and invoice issuance. Production starts within 3 business days of deposit receipt. Balance (70%) is due upon pre-shipment inspection photo/video approval.', cn: '定金（30%）在订单确认和发票开出后即付。我方在收到定金 3 个工作日内启动生产。尾款（70%）在装运前验货照片/视频批准后支付。' },
  },

  // ── 认证 & 合规 (10 questions) ──
  {
    q: { en: 'What certifications do you have?', cn: '你们有哪些认证？' },
    a: { en: 'ISO 9001:2015 (quality management), OEKO-TEX Standard 100 (textile safety), GOTS (organic, on request), GRS (recycled), SFA (Sustainable Fibre Alliance — herder welfare), REACH SVHC compliance, CSDDD readiness, EU DPP framework integration (2027-ready).', cn: 'ISO 9001:2015（质量管理）、OEKO-TEX Standard 100（纺织安全）、GOTS（有机，按需）、GRS（再生）、SFA（可持续纤维联盟 — 牧民福利）、REACH SVHC 合规、CSDDD 就绪、欧盟 DPP 框架对接（2027 就绪）。' },
  },
  {
    q: { en: 'Do you have an OEKO-TEX certificate?', cn: '你们有 OEKO-TEX 认证吗？' },
    a: { en: 'Yes — OEKO-TEX Standard 100 for our facility and products, renewed annually. Certificate number available on request. Covers raw cashmere through finished knitwear.', cn: '是。我们工厂和产品的 OEKO-TEX Standard 100 认证，年度续证。证书编号按需提供。覆盖羊绒原料至针织成衣。' },
  },
  {
    q: { en: 'Do you have OEKO-TEX for baby products?', cn: '婴儿产品有 OEKO-TEX 认证吗？' },
    a: { en: 'Yes, OEKO-TEX Standard 100 Class I (baby-safe) is available for cashmere baby blankets, baby sets, and infant accessories. Required for any baby product sold to EU/US baby retailers.', cn: '可以，针对羊绒婴儿毯、婴儿套装和婴儿配饰提供 OEKO-TEX Standard 100 Class I（婴儿安全级）。所有销往欧盟/美国婴儿零售的婴儿产品必需。' },
  },
  {
    q: { en: 'Do you have organic certification (GOTS)?', cn: '你们有 GOTS 有机认证吗？' },
    a: { en: 'Yes, GOTS certification available on request for organic cashmere programs. GOTS requires full chain-of-custody documentation from herder to finished product. MOQ for GOTS orders is typically 500+ pieces.', cn: '可以，针对有机羊绒项目提供 GOTS 认证（按需）。GOTS 要求从牧民到成品的全链监管链文档。GOTS 订单 MOQ 通常 500 件以上。' },
  },
  {
    q: { en: 'Do you have GRS (recycled) certification?', cn: '你们有 GRS 再生认证吗？' },
    a: { en: 'Yes, GRS available for recycled cashmere blends (typically 70% virgin / 30% recycled). We source recycled fiber from post-industrial waste (mill clippings, yarn ends). GRS certified by third-party audit.', cn: '可以，为再生羊绒混纺（通常 70% 原生 / 30% 再生）提供 GRS 认证。我们的再生纤维来自工业废料（纺厂下脚料、纱线尾料）。GRS 由第三方审计认证。' },
  },
  {
    q: { en: 'Are you REACH SVHC compliant?', cn: '你们符合 REACH SVHC 吗？' },
    a: { en: 'Yes, we maintain current REACH SVHC declarations for all EU shipments. 227 substances screened. Declaration documents are provided per shipment and updated quarterly.', cn: '是。我们为所有欧盟出货维护 REACH SVHC 当前声明。227 项物质筛查。声明文件随每单提供，每季度更新。' },
  },
  {
    q: { en: 'Are you CSDDD ready?', cn: '你们符合 CSDDD 吗？' },
    a: { en: 'Yes. We maintain: herder welfare records, water usage data, land-use impact documentation, animal welfare protocols. These satisfy CSDDD due diligence requirements for large EU buyer companies.', cn: '是。我们维护：牧民福利记录、用水数据、土地利用影响文档、动物福利协议。这些满足 CSDDD 对大型欧盟采购企业的尽职调查要求。' },
  },
  {
    q: { en: 'Are you EU Digital Product Passport (DPP) ready?', cn: '你们准备好了 EU DPP 数字产品护照吗？' },
    a: { en: 'Yes. Our facility is integrated with EU DPP data requirements as of 2026. Each SKU carries: fiber origin, micron count, processing location, certifications, repair guidance, end-of-life instructions. GS1 Digital Link QR codes on care labels.', cn: '是。我们工厂已对接欧盟 DPP 数据要求（截至 2026 年）。每个 SKU 包含：纤维来源、细度、加工地点、认证、修补指引、回收说明。洗标上提供 GS1 Digital Link 二维码。' },
  },
  {
    q: { en: 'Do you comply with UFLPA (Uyghur Forced Labor Prevention Act)?', cn: '你们符合 UFLPA（维吾尔强迫劳动预防法）吗？' },
    a: { en: 'Yes. Our facility is in Ordos, Inner Mongolia. All raw fiber is sourced from contracted herder cooperatives in Inner Mongolia (Alashan, Ordos plateau). We provide full chain-of-custody documentation for UFLPA compliance.', cn: '是。我们工厂位于内蒙古鄂尔多斯。所有原料纤维来自内蒙古（阿拉善、鄂尔多斯高原）的签约牧民合作社。我们为 UFLPA 合规提供完整监管链文档。' },
  },
  {
    q: { en: 'Do you have a sustainability report?', cn: '你们有可持续发展报告吗？' },
    a: { en: 'Yes, we publish an annual sustainability report covering: fiber sourcing traceability, herder welfare programs, water and waste management, carbon footprint, and 2027 EU DPP roadmap. Available on request.', cn: '是。我们每年发布可持续发展报告，涵盖：纤维采购可追溯性、牧民福利项目、水资源与废弃物管理、碳足迹、2027 欧盟 DPP 路线图。按需提供。' },
  },

  // ── 工厂 & 验厂 (10 questions) ──
  {
    q: { en: 'Can we visit the factory? When and how?', cn: '可以参观工厂吗？' },
    a: { en: 'Yes, factory visits are welcome in Ordos, Inner Mongolia. We can also arrange video audits. Please book 7 days in advance. Visitors arrange visa + flights to Baotou Airport (1.5h drive to Ordos).', cn: '欢迎来鄂尔多斯工厂参观。也可安排视频验厂。请提前 7 天预约。访客需办签证 + 飞包头机场（距鄂尔多斯约 1.5 小时车程）。' },
  },
  {
    q: { en: 'How large is your factory?', cn: '你们工厂多大？' },
    a: { en: '38,000 sqm facility in Ordos Industrial Park. 500+ employees. Annual capacity: 1,200+ tons dehairing cashmere. Vertically integrated: dehairing, spinning, knitting, finishing, all under one roof.', cn: '工厂位于鄂尔多斯工业园区，38,000 平方米，500+ 员工。年产能 1,200+ 吨脱梳羊绒。垂直一体化：分梳、纺纱、针织、后整理，全部同一园区。' },
  },
  {
    q: { en: 'How long has your factory been operating?', cn: '你们工厂运营多久了？' },
    a: { en: 'Founded in 2002 — 23 years of cashmere manufacturing experience. Founding team came from state-owned cashmere operations in the 1980s. Three generations of herders in our contracted cooperatives.', cn: '2002 年建厂，23 年羊绒制造经验。创始团队来自 1980 年代国有羊绒企业。签约合作社已合作三代牧民。' },
  },
  {
    q: { en: 'What machinery do you use?', cn: '你们用什么设备？' },
    a: { en: 'Spinning: Italian Savio and Volkmann frames. Knitting: German STOLL ADF and Japanese Shima Seiki flat-bed (12-16gg range). Finishing: Italian Lavazza wash + Biancalani softener. Equipment upgrades every 2-3 years.', cn: '纺纱：意大利 Savio 和 Volkmann 纱机。针织：德国 STOLL ADF 和日本 Shima Seiki 横机（12-16 针范围）。后整理：意大利 Lavazza 水洗 + Biancalani 柔软剂。每 2-3 年升级设备。' },
  },
  {
    q: { en: 'Can you do a video factory audit?', cn: '能做视频验厂吗？' },
    a: { en: 'Yes, video audits via Zoom/Teams/WeChat Work. 1-2 hour session covers: dehairing line, spinning line, knitting floor, QC station, packaging. Recordings available. Live Q&A in English/Chinese/Japanese.', cn: '可以，通过 Zoom/Teams/企业微信视频验厂。1-2 小时覆盖：分梳线、纺纱线、针织车间、质检站、包装。可提供录像。中英日语实时问答。' },
  },
  {
    q: { en: 'What is your quality control process?', cn: '你们的质检流程是什么？' },
    a: { en: '5-stage QC: (1) inbound raw fiber inspection, (2) in-process yarn testing (count, twist, strength), (3) pre-finishing garment inspection, (4) post-finishing hand-feel and measurement QC, (5) pre-shipment AQL inspection (1.5/2.5/4.0 levels).', cn: '5 段质检：(1) 原料入库检验，(2) 纱线在产测试（支数、捻度、强力），(3) 成衣后整理前检验，(4) 后整理后手感和尺寸检验，(5) 装运前 AQL 检验（1.5/2.5/4.0 三档）。' },
  },
  {
    q: { en: 'Can we appoint a third-party QC inspector?', cn: '可以指定第三方质检吗？' },
    a: { en: 'Yes, third-party inspectors (SGS, BV, TUV, Intertek) are welcome. We accommodate inspection visits during production and pre-shipment. Buyer pays inspector fees; we provide facility access and production schedule.', cn: '可以，欢迎第三方检验员（SGS、BV、TUV、Intertek）。我们配合生产中和装运前检验访问。检验员费用由买家支付；我们提供工厂通道和生产排期。' },
  },
  {
    q: { en: 'How do you handle quality issues after delivery?', cn: '交货后质量问题怎么处理？' },
    a: { en: 'Claim window: 30 days after receipt for defects, 90 days for latent defects. Resolution options: replacement, credit note, or refund. We provide root-cause analysis and corrective action documentation within 7 days of claim.', cn: '索赔期：收货后 30 天报缺陷，90 天报潜在缺陷。解决方式：替换、贷记或退款。我们提供在索赔 7 天内的根因分析和纠正措施文档。' },
  },
  {
    q: { en: 'Do you have an English-speaking sales team?', cn: '你们销售团队有英语母语的吗？' },
    a: { en: 'Yes — sales team includes native English, Chinese, Japanese speakers. German/French/Spanish handled via translators. Sales reps assigned by region: EU/US team (en), JP/KR team (ja/kr), Greater China team (cn), DACH (de) by specialist.', cn: '是。销售团队含英语、中文、日语母语。德/法/西语通过翻译。销售按地区分配：欧/美团队（en）、日韩（ja/kr）、大中华（cn）、德语区（de）专人负责。' },
  },
  {
    q: { en: 'Where is your factory located exactly?', cn: '你们工厂具体在哪？' },
    a: { en: 'Ordos Industrial Park, Dongsheng District, Ordos City, Inner Mongolia Autonomous Region, China. ZIP: 017000. GPS: 39.6086° N, 109.7813° E. Nearest airport: Baotou (BAV), 1.5h drive. Nearest high-speed rail: Ordos station.', cn: '中国内蒙古自治区鄂尔多斯市东胜区鄂尔多斯工业园区。邮编 017000。GPS：北纬 39.6086°，东经 109.7813°。最近机场：包头（BAV），车程 1.5 小时。最近高铁站：鄂尔多斯站。' },
  },

  // ── OEM & 定制 (10 questions) ──
  {
    q: { en: 'Do you offer OEM/ODM?', cn: '你们提供 OEM/ODM 吗？' },
    a: { en: 'Yes. In-house design team supports OEM (your design) and ODM (we design for you). MOQ 100pcs/style. Design services: tech pack conversion, pattern grading, sample development, fit session feedback.', cn: '是的。我们有专业设计团队支持 OEM（您的设计）与 ODM（我们设计），MOQ 100 件/款。设计服务：技术包转换、纸样放码、样品开发、合身度反馈。' },
  },
  {
    q: { en: 'Can I send you my tech pack for production?', cn: '能发我的技术包给你们做吗？' },
    a: { en: 'Yes — please send tech packs in PDF, AI, or CLO 3D format. We provide feedback within 3 business days including: fabric suggestions, construction notes, costing, and timeline. Sample production starts after tech pack approval.', cn: '可以。请以 PDF、AI 或 CLO 3D 格式发送技术包。我们在 3 个工作日内反馈：面料建议、工艺说明、成本核算、时间表。样品生产在技术包确认后启动。' },
  },
  {
    q: { en: 'What file formats do you accept for designs?', cn: '你们接受哪些文件格式？' },
    a: { en: 'Tech packs: PDF, AI, CLO 3D. Embroidery: DST, EMB, PES, or high-res PNG (300dpi+). Print: AI, PSD, PDF (vector preferred). Logos: AI, EPS, or high-res PNG.', cn: '技术包：PDF、AI、CLO 3D。绣花：DST、EMB、PES 或高清 PNG（300 dpi+）。印花：AI、PSD、PDF（矢量优先）。Logo：AI、EPS 或高清 PNG。' },
  },
  {
    q: { en: 'Can you match my custom Pantone color?', cn: '能对定制潘通色吗？' },
    a: { en: 'Yes, custom Pantone matching is standard. From 5 kg per color. Lab dip in 5-7 days, bulk production 25-30 days after lab dip approval. Pantone TPX/TCX codes matched with ±0.5 ΔE tolerance.', cn: '可以。定制潘通色对色是标准服务。起订 5 kg/色。色卡 5-7 天，确认后大货 25-30 天。TPX/TCX 色卡匹配精度 ±0.5 ΔE。' },
  },
  {
    q: { en: 'What is the ODM design process?', cn: 'ODM 设计流程是什么？' },
    a: { en: 'Step 1: Brief & mood board. Step 2: Concept sketches (3 directions). Step 3: Selected sketch → tech pack. Step 4: Sample development. Step 5: Fit feedback & revisions. Step 6: Production sample & bulk. Total ODM timeline: 60-90 days.', cn: '步骤 1：简报与情绪板。步骤 2：概念草图（3 个方向）。步骤 3：选定草图→技术包。步骤 4：样品开发。步骤 5：合身度反馈与修改。步骤 6：生产样品与大货。整个 ODM 周期 60-90 天。' },
  },
  {
    q: { en: 'Can you develop a custom cashmere blend?', cn: '能定制羊绒混纺吗？' },
    a: { en: 'Yes, custom blends beyond our 10 stock formulations are common. Lead time for new blend development: 2-4 weeks including fiber sourcing, sample spinning, and testing. Custom blend MOQ: 200 kg.', cn: '可以。我们的 10 个常规配方之外定制混纺很常见。新混纺开发周期 2-4 周，包括纤维采购、样品纺纱、测试。定制混纺 MOQ：200 kg。' },
  },
  {
    q: { en: 'What yarn counts can you produce?', cn: '你们能做哪些纱线支数？' },
    a: { en: 'Standard counts: 2/26 Nm, 2/36 Nm, 2/48 Nm, 2/60 Nm. Custom counts: 1/4.3 Nm to 3/68 Nm range. Worsted or woolen-spun. Custom count MOQ: 50-100 kg.', cn: '常规支数：2/26 Nm、2/36 Nm、2/48 Nm、2/60 Nm。定制支数范围：1/4.3 Nm 至 3/68 Nm。精纺或粗纺。定制支数 MOQ：50-100 kg。' },
  },
  {
    q: { en: 'What embroidery options do you support?', cn: '你们支持哪些绣花选项？' },
    a: { en: 'Standard embroidery: flat stitch, 3D puff, appliqué. Thread colors: 200+ stock + custom Pantone. Position: cuff, back of hand, neckline, hem, sleeve, custom. Embroidered logo MOQ: 100-200 pieces depending on size.', cn: '标准绣花：平绣、3D 立体贴绣、贴布绣。线色：200+ 现货色 + 定制潘通。位置：袖口、手背、领口、下摆、袖子、定制。绣花 logo MOQ：100-200 件，看尺寸。' },
  },
  {
    q: { en: 'Can you do custom packaging?', cn: '能做定制包装吗？' },
    a: { en: 'Yes. Branded rigid boxes from 100 sets. Branded folding boxes from 500. Custom tissue from 500 sets. Custom hangtags from 500. Custom polybags from 1,000. Branded shipping marks from 100 cartons.', cn: '可以。品牌硬质礼盒起订 100 套。品牌折叠盒起订 500 套。定制薄纸起订 500 套。定制吊牌起订 500 件。定制塑料袋起订 1,000 个。品牌唛头起订 100 箱。' },
  },
  {
    q: { en: 'Can you add my brand label to existing designs?', cn: '现有款式能加我的品牌标签吗？' },
    a: { en: 'Yes, custom labels: woven labels (sewn in) from 100 pieces, printed care labels from 500 pieces, embroidered logo from 200 pieces. We work with your existing brand assets or help create new ones.', cn: '可以。定制标签：织标（缝入）起订 100 件，印洗标起订 500 件，绣花 logo 起订 200 件。我们使用您现有品牌素材或帮助创建新素材。' },
  },

  // ── 运输 & 标签 (10 questions) ──
  {
    q: { en: 'What shipping marks do you use?', cn: '你们用什么唛头？' },
    a: { en: 'Standard: neutral shipping marks (no brand). Custom: your brand marks, neutral with model numbers, or per-piece numbering. Branded shipping marks from 100 cartons.', cn: '标准：中性唛头（无品牌）。定制：您的品牌唛头、带款号的中性、或单品编号唛头。品牌唛头起订 100 箱。' },
  },
  {
    q: { en: 'What are standard carton dimensions?', cn: '标准箱型尺寸是什么？' },
    a: { en: 'Inner box: 35x25x10 cm. Master carton: 60x40x40 cm or 50x40x30 cm depending on product. Custom carton sizes from 500 cartons.', cn: '内盒：35x25x10 cm。外箱：60x40x40 cm 或 50x40x30 cm，看产品。定制箱型起订 500 个。' },
  },
  {
    q: { en: 'What is your standard carton packing?', cn: '你们标准箱包装是怎样的？' },
    a: { en: 'Standard: 5-ply corrugated, double-walled for heavier items. Reinforced corners. Foam or tissue interleave. Palletized for FCL. Carton weight limit: 25 kg per master carton.', cn: '标准：5 层瓦楞，重物用双层。加固边角。泡沫或薄纸隔层。整柜打托盘。主箱重量限制：25 kg/箱。' },
  },
  {
    q: { en: 'Do you provide hangtags and care labels?', cn: '你们提供吊牌和洗标吗？' },
    a: { en: 'Yes. Standard care labels per ISO 3758 (textile care symbols) in 6 languages. Custom hangtags (printed or embossed) from 500 pieces. Custom care labels from 500 pieces.', cn: '可以。标准洗标按 ISO 3758（纺织护理符号）提供 6 种语言。定制吊牌（印刷或压花）起订 500 件。定制洗标起订 500 件。' },
  },
  {
    q: { en: 'Are care instructions printed in multiple languages?', cn: '洗护说明有多种语言吗？' },
    a: { en: 'Yes — our standard care labels include English, Chinese, German, French, Japanese, Korean. Custom languages available on request. Care symbols per ISO 3758.', cn: '是。我们的标准洗标含英、中、德、法、日、韩 6 种语言。定制语言按需提供。护理符号按 ISO 3758。' },
  },
  {
    q: { en: 'Can I add a barcode or RFID tag to my order?', cn: '能加条形码或 RFID 吗？' },
    a: { en: 'Yes. Barcode (EAN-13, UPC, Code 128) on hangtags or labels: from 500 pieces. RFID (UHF, NFC) tags sewn in or on hangtag: from 1,000 pieces (longer lead time for RFID).', cn: '可以。条形码（EAN-13、UPC、Code 128）印在吊牌或标签上：起订 500 件。RFID（UHF、NFC）标签缝入或贴在吊牌：起订 1,000 件（RFID 货期更长）。' },
  },
  {
    q: { en: 'Do you provide fiber composition labels per destination market?', cn: '你们按目的市场提供成分标签吗？' },
    a: { en: 'Yes. EU: per Regulation 1007/2011. US: per FTC Textile Fiber Products Identification Act. China: per GB/T 29862-2013. Japan: per 家庭用品品质表示法. We provide all standard format labels.', cn: '可以。欧盟按 1007/2011 法规，美国按 FTC 纺织纤维产品识别法，中国按 GB/T 29862-2013，日本按家庭用品品质表示法。我们提供所有标准格式标签。' },
  },
  {
    q: { en: 'How is product traceability documented?', cn: '你们怎么记录产品可追溯性？' },
    a: { en: 'Each shipment includes a lot traceability sheet: herder cooperative, combing date, dehairing batch, spinning lot, knitting batch, finishing date, QC records. Documents archived 7 years.', cn: '每批出货附带批次追溯清单：牧民合作社、梳采日期、分梳批次、纺纱批次、针织批次、后整理日期、质检记录。文档归档 7 年。' },
  },
  {
    q: { en: 'Can I get a Certificate of Origin for my shipment?', cn: '能提供原产地证吗？' },
    a: { en: 'Yes, per shipment. Issued by CCPIT (China Council for the Promotion of International Trade). Standard processing: 2-3 business days. Free for our shipments.', cn: '可以，每单提供。由 CCPIT（中国国际贸易促进委员会）签发。标准处理 2-3 个工作日。我方出货免费提供。' },
  },
  {
    q: { en: 'What if a shipment arrives damaged?', cn: '货物到达时破损怎么办？' },
    a: { en: 'Document damage with photos within 48 hours of receipt. We file claims with the freight carrier and offer replacement or credit. Open original packaging for inspection before signing delivery receipt.', cn: '收货后 48 小时内拍照记录破损。我们向货运公司提交索赔并提供替换或贷记。在签收前打开原包装检查。' },
  },

  // ── 客户 & 流程 (10 questions) ──
  {
    q: { en: 'What is the typical MOQ for a private-label cashmere sweater program?', cn: '自有品牌羊绒衫计划的典型 MOQ 是多少？' },
    a: { en: 'Standard MOQ is 100 pieces per style with 3-color minimum per colorway. For a 5-style capsule collection, total commitment is 500 pieces. Custom Pantone from 5 kg per color.', cn: '标准 MOQ 为每款 100 件，每色至少 3 个下单色。5 款胶囊系列总下单量为 500 件。定制潘通色 5 kg/色起。' },
  },
  {
    q: { en: 'How do I start a program with you?', cn: '怎么开始和你们合作？' },
    a: { en: 'Step 1: Send inquiry (via website form or WhatsApp). Step 2: Receive our response within 24h. Step 3: Provide tech pack / reference. Step 4: Sample + quote. Step 5: Order confirmation + deposit. Step 6: Production. Step 7: QC + shipment.', cn: '步骤 1：询盘（官网表单或 WhatsApp）。步骤 2：24 小时内收到回复。步骤 3：提供技术包/参考。步骤 4：样品 + 报价。步骤 5：订单确认 + 定金。步骤 6：生产。步骤 7：质检 + 出货。' },
  },
  {
    q: { en: 'How long does the full program take from inquiry to delivery?', cn: '完整项目从询盘到交货要多久？' },
    a: { en: 'Standard program: 90-120 days. Inquiry → sample: 15-25 days. Sample approval → bulk production: 45-75 days. Bulk production → delivery: 30-60 days. Rush programs compress to 60-90 days with surcharges.', cn: '标准项目 90-120 天。询盘 → 样品 15-25 天。样品确认 → 大货 45-75 天。大货 → 交货 30-60 天。加急项目压缩到 60-90 天，有附加费。' },
  },
  {
    q: { en: 'Do you handle multiple seasons or yearly contracts?', cn: '你们处理多季或年度合同吗？' },
    a: { en: 'Yes, we work with several buyers on annual contracts with quarterly deliveries. Annual contract benefits: priority queue, locked pricing, custom formulation development, dedicated account manager.', cn: '可以。我们与多个买家签订年度合同按季度交付。年度合同权益：优先排产、价格锁定、定制配方开发、专属客户经理。' },
  },
  {
    q: { en: 'Do you sign NDAs?', cn: '你们签 NDA 吗？' },
    a: { en: 'Yes, we sign mutual NDAs before sharing sensitive information (formulations, customer lists, costing). Standard NDA processing: 2-3 business days. We work with buyer-favorable and mutual formats.', cn: '是。我们签署双方保密协议后再分享敏感信息（配方、客户名单、成本）。标准 NDA 处理 2-3 个工作日。我们接受买方友好型和双方型版本。' },
  },
  {
    q: { en: 'Do you offer exclusivity by territory or buyer?', cn: '你们按地区或买家提供独家吗？' },
    a: { en: 'Case-by-case. We offer limited exclusivity for buyers committing to USD 100,000+ annual contracts in specific categories. Standard exclusivity fee: 5-10% volume rebate. We do not offer global exclusivity.', cn: '按项目协商。我们对承诺 USD 10 万 + 年度合同的买家在特定品类提供有限独家。标准独家费：5-10% 量价返点。我们不提供全球独家。' },
  },
  {
    q: { en: 'Can I request a specific account manager?', cn: '能指定客户经理吗？' },
    a: { en: 'Yes — once we establish a working relationship, you are assigned a dedicated account manager for ongoing communication. Account managers handle: order updates, QC feedback, production scheduling, urgent escalations.', cn: '可以。建立合作关系后，您会被分配专属客户经理负责日常沟通。客户经理处理：订单更新、质检反馈、生产排期、紧急升级。' },
  },
  {
    q: { en: 'What communication channels do you support?', cn: '你们支持哪些沟通渠道？' },
    a: { en: 'WhatsApp (primary for most buyers), WeChat (China buyers), email (formal communications and documents), Zoom/Teams (video meetings). We respond within 24 hours on weekdays.', cn: 'WhatsApp（多数买家首选）、微信（中国买家）、邮件（正式沟通和文件）、Zoom/Teams（视频会议）。我们工作日 24 小时内回复。' },
  },
  {
    q: { en: 'Can I visit your showroom?', cn: '能参观你们的 showroom 吗？' },
    a: { en: 'We have a sample showroom at our Ordos factory (limited sample collection on site). For comprehensive sample review, we recommend sending samples to your office. We also attend major trade shows: Magic Show Las Vegas (Feb/Aug), Première Vision Paris (Feb/Sep), Milano Unica Milan (Feb/Sep).', cn: '我们在鄂尔多斯工厂设有样品间（现场样品有限）。如需完整样品评审，建议寄样到您办公室。我们也参加主要展会：拉斯维加斯 Magic Show（2/8 月）、巴黎 Première Vision（2/9 月）、米兰 Milano Unica（2/9 月）。' },
  },
  {
    q: { en: 'Do you have customer references?', cn: '你们有客户参考吗？' },
    a: { en: 'We provide references from buyers in your industry on request, subject to buyer approval. We work with brands, retailers, private labels, and trading companies across EU, US, Japan, Korea, and domestic China markets.', cn: '按需提供您行业的买家参考（需买家同意）。我们合作的品牌、零售商、自有品牌、贸易公司分布于欧盟、美国、日本、韩国及中国国内市场。' },
  },

  // ── 其他常见 (11 questions) ──
  {
    q: { en: 'Do you sell to individuals or only businesses?', cn: '你们卖给个人还是只卖企业？' },
    a: { en: 'We are a B2B wholesale factory — we sell to businesses (brands, retailers, importers, designers). For individual purchases, please contact our retail partners or visit our consumer-facing channels.', cn: '我们是 B2B 批发工厂 — 销售对象为企业（品牌、零售商、进口商、设计师）。个人购买请联系我们的零售合作伙伴或访问我们的消费端渠道。' },
  },
  {
    q: { en: 'What is the difference between cashmere and pashmina?', cn: '羊绒和 pashmina 有什么区别？' },
    a: { en: 'Originally, pashmina referred to cashmere from the Changthangi goat (12-14μm, 3-5x the price of standard cashmere). Today, \'pashmina\' is used loosely to mean wider/longer cashmere shawls (typically 200x70cm or larger). Most modern \'pashmina\' is made from Chinese/Mongolian cashmere.', cn: '原本 pashmina 指 Changthangi 山羊产羊绒（12-14μm，价格是标准羊绒的 3-5 倍）。今天\'pashmina\'被宽松地用作宽/长羊绒披肩（通常 200x70 cm 或更大）。多数现代\'pashmina\'由中蒙羊绒制成。' },
  },
  {
    q: { en: 'What micron count is your cashmere?', cn: '你们羊绒的细度是多少？' },
    a: { en: 'Standard grade: 14.5-15.5μm (Grade A Mongolian). Premium: 14.0-14.5μm (Grade A+). Ultra-fine: 13.5-14.0μm (limited availability). Lower micron = finer, softer, more expensive.', cn: '标准级 14.5-15.5μm（A 级内蒙）。高级 14.0-14.5μm（A+ 级）。超细级 13.5-14.0μm（供应有限）。细度越低 = 越细越柔软越贵。' },
  },
  {
    q: { en: 'How do I know my cashmere is real?', cn: '怎么知道我的羊绒是真的？' },
    a: { en: 'Three tests: (1) burn test — real cashmere burns slowly, smells like burnt hair, leaves crushable black ash; (2) microscope test — cashmere has smooth scale pattern visible at 40x; (3) micron count — lab equipment measures fiber diameter, real cashmere is below 19μm. Wool or synthetics fail one or more tests.', cn: '三种方法：(1) 燃烧测试 — 真羊绒缓慢燃烧，散发类似烧毛发气味，留下可碾碎黑灰；(2) 显微镜测试 — 真羊绒在 40 倍放大下呈平滑鳞片结构；(3) 细度测试 — 实验室设备测量纤维直径，真羊绒低于 19 μm。羊毛或合成纤维会在一项或多项中失败。' },
  },
  {
    q: { en: 'What is your carbon footprint?', cn: '你们的碳足迹是多少？' },
    a: { en: 'Our facility operates on grid mix (60% wind/solar in Inner Mongolia region). Per-ton carbon intensity is published in our annual sustainability report. We offer carbon-neutral shipping via DHL GoGreen or equivalent surcharge.', cn: '我们工厂使用电网混合电力（内蒙古地区 60% 风能/太阳能）。每吨碳强度公布在我们的年度可持续发展报告中。我们通过 DHL GoGreen 或同等加价提供碳中和运输。' },
  },
  {
    q: { en: 'Do you support any social causes?', cn: '你们支持哪些社会公益？' },
    a: { en: 'Yes — we sponsor: (1) herder education programs in Alashan and Ordos, (2) women\'s weaving cooperatives in Inner Mongolia, (3) sustainable cashmere initiatives via SFA. Details available in our sustainability report.', cn: '是。我们赞助：(1) 阿拉善和鄂尔多斯牧民教育项目，(2) 内蒙古妇女编织合作社，(3) 通过 SFA 推动可持续羊绒倡议。详情见我们的可持续发展报告。' },
  },
  {
    q: { en: 'What trade shows do you attend?', cn: '你们参加哪些展会？' },
    a: { en: 'Annual: Magic Show Las Vegas (Feb/Aug), Première Vision Paris (Feb/Sep), Milano Unica Milan (Feb/Sep), Hong Kong Gifts & Premium Fair (Apr/Oct), China International Import Expo Shanghai (Nov). We also attend regional shows on request.', cn: '年度展会：拉斯维加斯 Magic Show（2/8 月）、巴黎 Première Vision（2/9 月）、米兰 Milano Unica（2/9 月）、香港礼品及赠品展（4/10 月）、上海中国国际进口博览会（11 月）。我们也按需参加区域展会。' },
  },
  {
    q: { en: 'Can you provide insurance for shipments?', cn: '货物能投保吗？' },
    a: { en: 'Yes, all shipments can be insured via our freight forwarder. Standard insurance: 110% of invoice value (covers typical loss). Higher coverage available on request. Insurance cost: 0.3-0.5% of insured value.', cn: '可以。所有货物可通过我方货代保险。标准保险：发票价值的 110%（覆盖常规损失）。按需可提供更高保险。保险费：保险价值的 0.3-0.5%。' },
  },
  {
    q: { en: 'What happens if there\'s a dispute?', cn: '出现争议怎么处理？' },
    a: { en: 'We follow ICC mediation rules for first-instance disputes. Documentation chain: PI, contract, QC records, photos, communications. Resolution path: direct negotiation → ICC mediation → arbitration in Shanghai or Singapore. Most disputes resolve in negotiation.', cn: '我们遵循 ICC 调解规则作为争议第一程序。文档链：PI、合同、质检记录、照片、沟通记录。解决路径：直接协商 → ICC 调解 → 上海或新加坡仲裁。多数争议在协商阶段解决。' },
  },
  {
    q: { en: 'How do you protect my designs and IP?', cn: '你们怎么保护我的设计和 IP？' },
    a: { en: 'We sign IP-specific NDAs for unique designs. Custom patterns and formulations are exclusive to you within agreed terms. We do not replicate custom designs for other buyers without written consent. Design files archived securely and not shared beyond assigned personnel.', cn: '我们为独特设计签署专门的 IP 保护协议。定制纸样和配方在约定条款内专属于您。我们不会在无书面同意的情况下为其他买家复制定制设计。设计文件安全归档，仅在指定人员范围内共享。' },
  },
  {
    q: { en: 'What languages does your team speak?', cn: '你们团队说什么语言？' },
    a: { en: 'Sales team: native English, Chinese, Japanese. Technical team: English, Chinese. Operations: English, Chinese. We use professional translators for German, French, Spanish, Korean, Italian. Sample communication in any language is supported.', cn: '销售团队：英语、中文、日语母语。技术团队：英语、中文。运营：英语、中文。德、法、西、韩、意使用专业翻译。支持任何语言的样品沟通。' },
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

  // FAQ: build compact index + full answers in same locale.
  // Index helps AI match user question → answer number quickly.
  // Full answers ensure it cites accurate factory facts.
  // Locale-aware FAQ pick: prefer exact locale, fall back to English.
  // (FAQ entries only ship en + cn pairs; de/fr/ja/kr use EN as fallback source.)
  const faqLines = FAQ_ENTRIES.map((f, i) => {
    const q = f.q[loc] || f.q.en;
    const a = f.a[loc] || f.a.en;
    const idx = String(i + 1).padStart(3, '0');
    return `[${idx}] Q: ${q}\n     A: ${a}`;
  }).join('\n\n');

  return `=== ROLE ===
You are the B2B sales assistant for DONGXIAO Cashmere, a 23-year-old cashmere source factory in Ordos, Inner Mongolia, China. Serve global importers, brand buyers, and trading companies.

=== ANSWERING RULES ===
1. Use ONLY facts from CATALOG + FAQ below. Do NOT make up numbers, MOQs, lead times, prices, or certifications.
2. If user asks about MOQ, lead time, samples, payment, OEM, certifications, or factory — answer DIRECTLY using FAQ [NNN] entries.
3. If a question is outside the FAQ, say you don't have that info and offer to escalate to a sales rep via the inquiry form.
4. Keep replies under 120 words unless user asks for detail.
5. For formal quotes, guide to inquiry form (Raw / Yarn / Garment OEM).

=== CATALOG SNAPSHOT ===
Total: 591 products across 6 product lines (hats/sweaters/scarves/accessories/yarn in catalog + raw + fabric as hero categories).

=== PRODUCT KNOWLEDGE BASE (cite these exact facts) ===
${products}

=== FAQ KNOWLEDGE BASE (${FAQ_ENTRIES.length} entries, cite as [NNN]) ===
${faqLines}

When the user asks about a topic covered in the FAQ, ANSWER DIRECTLY using the corresponding [NNN] entry's facts. Examples:
- "What is your MOQ?" → find [NNN] matching MOQ → quote exact figures
- "Can I visit the factory?" → find [NNN] about factory visits → quote process
- "Do you have OEKO-TEX?" → find [NNN] about OEKO-TEX → confirm + quote scope`;
}