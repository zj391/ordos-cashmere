/**
 * AI chat knowledge base — referenced by api/chat.ts system prompts.
 * Edit this file to update what the AI assistant knows about DONGXIAO Cashmere.
 */

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

export const PRODUCT_CATEGORIES: ProductCategory[] = [
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
    id: 'yarn',
    name: 'Cashmere Yarn & Fiber',
    nameByLocale: {
      en: 'Cashmere Yarn & Fiber', cn: '羊绒纱线', de: 'Kaschmirgarn', fr: 'Fil de cachemire',
      ja: 'カシミア糸', kr: '캐시미어 원사',
    },
    count: 73,
    moq: '50 kg',
    leadTime: '20-30 days',
    priceRange: 'USD 110-180/kg',
    highlight: '2/26 Nm to 2/60 Nm. White, brown, purple. Cone or hank.',
    highlightByLocale: {
      en: '2/26 Nm to 2/60 Nm. White, brown, purple. Cone or hank.',
      cn: '2/26 至 2/60 Nm。白绒/青绒/紫绒。筒纱或绞纱。',
      de: '2/26 bis 2/60 Nm. Weiss, Braun, Lila. Cone oder Strang.',
      fr: '2/26 à 2/60 Nm. Blanc, brun, violet. Cône ou écheveau.',
      ja: '2/26〜2/60 Nm。白・青・紫。コーンまたはハンキー。',
      kr: '2/26~2/60 Nm. 백색·청색·자색. 콘 또는 한키.',
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
  },
  {
    id: 'garment_oem',
    name: 'Garment OEM (Sweaters)',
    nameByLocale: {
      en: 'Garment OEM (Sweaters)', cn: '成衣代工（针织）', de: 'Bekleidung OEM (Strick)',
      fr: 'Vêtement OEM (tricot)', ja: '衣料OEM（ニット）', kr: '의류 OEM (니트)',
    },
    count: 166,
    moq: '100 pcs/style',
    leadTime: '45-60 days',
    priceRange: 'USD 35-95/pc',
    highlight: 'Full-package knitting: CAD pattern, sample, bulk. In-house design team.',
    highlightByLocale: {
      en: 'Full-package knitting: CAD pattern, sample, bulk. In-house design team.',
      cn: '针织全包服务：CAD 制版、打样、大货。内部设计团队。',
      de: 'Strick-Vollpaket: CAD-Schnitt, Muster, Serie. Inhouse-Designteam.',
      fr: 'Tricot clé en main : patron CAO, échantillon, série. Équipe design interne.',
      ja: 'ニット一括請負：CADパターン、サンプル、量産。社内デザインチーム。',
      kr: '니트 풀패키지: CAD 패턴, 샘플, 양산. 사내 디자인팀.',
    },
  },
  {
    id: 'scarves',
    name: 'Cashmere Scarves & Wraps',
    nameByLocale: {
      en: 'Cashmere Scarves & Wraps', cn: '羊绒围巾披肩', de: 'Kaschmirschals & Tücher',
      fr: 'Écharpes & étoles cachemire', ja: 'カシミアスカーフ・ショール', kr: '캐시미어 스카프·숄',
    },
    count: 208,
    moq: '50 pcs',
    leadTime: '30-45 days',
    priceRange: 'USD 18-65/pc',
    highlight: 'Solid, print, fringe, woven logo. Custom packaging.',
    highlightByLocale: {
      en: 'Solid, print, fringe, woven logo. Custom packaging.',
      cn: '素色、印花、流苏、织造 logo。定制包装。',
      de: 'Uni, Druck, Fransen, gewebtes Logo. Massverpackung.',
      fr: 'Uni, imprimé, franges, logo tissé. Emballage personnalisé.',
      ja: '無地、プリント、フリンジ、織ロゴ。カスタムパッケージ。',
      kr: '무지, 프린트, 프린지, 직조 로고. 맞춤 패키징.',
    },
  },
  {
    id: 'hats_accessories',
    name: 'Hats & Accessories',
    nameByLocale: {
      en: 'Hats & Accessories', cn: '帽子与配饰', de: 'Mützen & Accessoires',
      fr: 'Bonnets & accessoires', ja: '帽子・アクセサリー', kr: '모자·액세서리',
    },
    count: 144, // 66 hats + 78 accessories
    moq: '50 pcs',
    leadTime: '30-45 days',
    priceRange: 'USD 12-45/pc',
    highlight: 'Beanies, gloves, socks, headbands. Logo embroidery available.',
    highlightByLocale: {
      en: 'Beanies, gloves, socks, headbands. Logo embroidery available.',
      cn: '毛线帽、手套、袜子、发带。可定制 logo 刺绣。',
      de: 'Beanies, Handschuhe, Socken, Stirnbaender. Logo-Stickerei moeglich.',
      fr: 'Bonnets, gants, chaussettes, bandeaux. Broderie logo disponible.',
      ja: 'ビーニー、手袋、靴下、ヘッドバンド。ロゴ刺繍可。',
      kr: '비니, 장갑, 양말, 헤드밴드. 로고 자수 가능.',
    },
  },
];

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
    return `- ${name} (${p.id}): MOQ ${p.moq} · Lead ${p.leadTime} · Price ${p.priceRange}. ${hl}`;
  }).join('\n');

  const faqs = FAQ_ENTRIES.map((f, i) => {
    const q = f.q[loc === 'cn' ? 'cn' : 'en'];
    const a = f.a[loc === 'cn' ? 'cn' : 'en'];
    return `${i + 1}. Q: ${q}\n   A: ${a}`;
  }).join('\n');

  return `=== PRODUCT KNOWLEDGE BASE (use these exact facts) ===
${products}

=== FAQ (9 most-asked B2B questions, give direct answers from these) ===
${faqs}

When the user asks about MOQ, lead time, samples, payment, OEM, pricing, certifications, or factory visits — answer DIRECTLY from the FAQ above. Do not make up numbers.`;
}