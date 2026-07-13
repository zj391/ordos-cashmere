/**
 * Per-product detail data (7-9).
 *
 * Two-tier structure:
 *   1. Category-level defaults (key = category id like "scarves") — shared
 *      by all products in that category unless overridden
 *   2. Product-level overrides (key = product id like "scarves-100") —
 *      for specific products that need their own data
 *
 * Each translatable field uses {en, cn, de, fr, ja, kr} record.
 *
 * Falls back to category default → empty in product page if neither found.
 */
export type I18n = {
  en: string;
  cn: string;
  de: string;
  fr: string;
  ja: string;
  kr: string;
};

export interface ProductDetail {
  // Section 1: Quality / material story
  materialStory?: I18n;
  // Section 2: Process / manufacturing method
  process?: I18n;
  processSteps?: I18n[];
  // Section 3: Custom service (6 categories per imfieldcashmere)
  customServiceTitle?: I18n;
  customServiceBullets?: I18n[];
  // Section 4: Why choose this product (USPs)
  whyChooseTitle?: I18n;
  whyChooseBullets?: I18n[];
  // Section 5: Comparison (e.g. cashmere vs pashmina for scarves)
  comparisonTitle?: I18n;
  comparisonOther?: I18n; // name of comparison product
  comparisonPoints?: Array<{ label: I18n; cashmere: I18n; other: I18n }>;
  // Section 6: Application / use cases
  applicationsTitle?: I18n;
  applicationScenarios?: I18n[];
  // Section 7: Product-specific FAQ
  faq?: Array<{ q: I18n; a: I18n }>;
  // Section 8: Care instructions
  careInstructions?: I18n;
  // Section 9: OEM workflow (3-5 steps)
  oemWorkflow?: Array<{ title: I18n; description: I18n }>;
  // Section 10: Custom options (branding, packaging, etc.)
  customOptions?: I18n[];
  // Section 11: Size chart (for garments)
  sizeChart?: {
    headers: I18n[];
    rows: Array<{ label: string; values: I18n[] }>;
  };
  // Section 12: Sample policy
  samplePolicy?: I18n;
  // Section 13: Certifications
  certifications?: I18n[];
  // Section 14: Technical specifications (imfieldcashmere 15-field spec table)
  technicalSpecs?: {
    material?: I18n;
    knitting?: I18n;
    collar?: I18n;
    pattern?: I18n;
    weight?: I18n;
    season?: I18n;
    sizes?: I18n;
    colors?: I18n;
    function?: I18n;
    gender?: I18n;
    moq?: I18n;
    careMethod?: I18n;
    customization?: I18n;
    origin?: I18n;
    technology?: I18n;
    elasticity?: I18n;
  };
}

export type ProductDetailMap = Record<string, ProductDetail>;

// ============================================================
// Category-level defaults
// ============================================================

const t = (en: string, cn: string, de: string, fr: string, ja: string, kr: string): I18n =>
  ({ en, cn, de, fr, ja, kr });

const scarves: ProductDetail = {
  technicalSpecs: {
    material: t('100% Inner Mongolia Grade A cashmere', '100% 内蒙古 A 级羊绒', '100% kaschmir aus der Inneren Mongolei Güteklasse A', '100% cachemire Mongolie Intérieure grade A', '100% 内モンゴル A 級カシミア', '100% 내몽골 A 등급 캐시미어'),
    knitting: t('Jacquard woven on Toyota JAT810 looms', '丰田 JAT810 织机提花', 'Jacquard auf Toyota JAT810 Webstühlen', 'Jacquard sur métiers Toyota JAT810', '豊田 JAT810 ジャカード織機', '도요타 JAT810 자카드 직기'),
    pattern: t('Solid / Striped / Jacquard / Print (customizable)', '素色 / 条纹 / 提花 / 印花 (可定制)', 'Uni / Gestreift / Jacquard / Druck', 'Uni / Rayé / Jacquard / Imprimé', '無地 / ストライプ / ジャカード / プリント', '무지 / 줄무늬 / 자카드 / 프린트'),
    weight: t('100-220 g/pc (size dependent)', '100-220 g/件 (按尺寸)', '100-220 g/Stück', '100-220 g/pièce', '100-220 g/枚', '100-220 g/매'),
    season: t('Autumn / Winter / Spring', '秋冬春', 'Herbst / Winter / Frühling', 'Automne / Hiver / Printemps', '秋冬春', '가을 / 겨울 / 봄'),
    sizes: t('180x35cm, 190x45cm, 200x70cm (customizable)', '180x35, 190x45, 200x70 cm (可定制)', '180x35, 190x45, 200x70 cm (anpassbar)', '180x35, 190x45, 200x70 cm (personnalisable)', '180x35, 190x45, 200x70 cm (カスタマイズ可)', '180x35, 190x45, 200x70 cm (맞춤 가능)'),
    colors: t('Pantone PMS matching, custom dyes 5kg+ per color', 'Pantone PMS 配色，定制染色 5kg+ 起', 'Pantone PMS Matching, kundenspezifische Farben 5kg+', 'Correspondance Pantone PMS', 'Pantone PMS マッチング, カスタム染色 5kg〜', 'Pantone PMS 매칭, 맞춤 염색 5kg 이상'),
    function: t('Warmth, fashion accessory, gift', '保暖, 时尚单品, 礼品', 'Wärme, Mode-Accessoire, Geschenk', 'Chaleur, accessoire mode, cadeau', '防寒、ファッション小物、ギフト', '보온, 패션 소품, 선물'),
    gender: t('Unisex', '中性', 'Unisex', 'Unisexe', 'ユニセックス', '유니섹스'),
    moq: t('50 pieces per design', '每款 50 件', '50 Stück pro Design', '50 pièces par design', 'デザイン 50 枚〜', '디자인당 50개'),
    careMethod: t('Dry clean recommended; hand wash cold; lay flat dry', '建议干洗；冷水手洗；平铺晾干', 'Chemische Reinigung empfohlen; Handwäsche kalt', 'Nettoyage à sec recommandé; lavage main froid', 'ドライクリーニング推奨; 冷水手洗い', '드라이클리닝 권장; 찬물 손빨래'),
    customization: t('Woven label / Hangtag / Pantone color / Logo embroidery', '织标 / 吊牌 / Pantone 染色 / Logo 刺绣', 'Weblabel / Hangtag / Pantone / Logo-Stickerei', 'Étiquette tissée / Hangtag / Pantone / Broderie logo', '織りラベル / ハンタグ / Pantone / ロゴ刺繍', '직조 라벨 / 행태그 / Pantone / 로고 자수'),
    origin: t('Inner Mongolia, China', '中国内蒙古', 'Innere Mongolei, China', 'Mongolie Intérieure, Chine', '中国内モンゴル', '중국 내몽골'),
    technology: t('Jacquard weaving, 5 picks/cm', '提花织造，5 纬/cm', 'Jacquard-Weberei, 5 Schuss/cm', 'Tissage jacquard, 5 duites/cm', 'ジャカード織, 5 打ち込み/cm', '자카드 직조, 5 위/cm'),
    elasticity: t('Natural drape, 8% stretch', '自然垂感，8% 弹性', 'Natürlicher Fall, 8% Dehnung', 'Drapé naturel, 8% stretch', '自然なドレープ, 8% ストレッチ', '자연스러운 드레이프, 8% 신축'),
  },
  materialStory: t(
    'Our cashmere scarves are woven from Grade A Mongolian cashmere fiber (14.5-15.5μm) sourced directly from contracted Albus goat herders on the Ordos plateau. The fiber is dehaired on Italian Capstan lines, then worsted-spun into 2/48 Nm yarn before weaving on Japanese Toyota JAT810 looms.',
    '我们的羊绒围巾采用 A 级蒙古羊绒纤维 (14.5-15.5μm)，直接采购自鄂尔多斯高原签约的阿尔巴斯白绒山羊牧民。纤维在意大利 Capstan 设备上分梳后，纺成 2/48 Nm 精纺纱线，再在丰田 JAT810 织机上织造。',
    'Unsere Kaschmirschals werden aus mongolischem Kaschmir der Güteklasse A (14,5-15,5μm) gewebt, der direkt von vertraglich gebundenen Albus-Ziegenzüchtern auf dem Ordos-Plateau stammt. Die Faser wird auf italienischen Capstan-Linien enthaart, dann zu 2/48-Nm-Kammgarn gesponnen und auf Toyota JAT810-Webstühlen gewebt.',
    'Nos écharpes en cachemire sont tissées à partir de fibres de cachemire mongol de qualité A (14,5-15,5μm) provenant directement d\'éleveurs de chèvres Albus sous contrat sur le plateau d\'Ordos. La fibre est désourlée sur des lignes Capstan italiennes, puis filée en 2/48 Nm avant d\'être tissée sur des métiers Toyota JAT810.',
    '当社のカシミアスカーフは、オルドス高原の契約アルバス山羊飼育者から直接調達したA級モンゴル産カシミア繊維 (14.5-15.5μm) で織られています。繊維はイタリア Capstan 設備で脱毛後、2/48 Nm 梳毛糸に紡績、豊田 JAT810 織機で製織。',
    '저희 캐시미어 스카프는 오르도스 고원의 계약 알버스 산양 목축업자로부터 직접 조달한 A급 몽골 캐시미어 섬유 (14.5-15.5μm) 로 직조됩니다. 섬유는 이탈리아 Capstan 장비에서 제모 후 2/48 Nm 워스티드 원사로 방적, 도요타 JAT810 직기에서 직조.',
  ),
  process: t(
    'Combed in 4 stages: dehaired (Capstan) → worsted spun (2/48 Nm) → warped (700 ends) → woven (Toyota JAT810, 5 picks/cm) → washed (eco-softener) → hand-fringed.',
    '四道工序：分梳 (Capstan) → 精纺 (2/48 Nm) → 整经 (700 根) → 织造 (丰田 JAT810, 5 纬/cm) → 水洗 (环保柔顺剂) → 手工流苏。',
    'Vier Verarbeitungsstufen: enthaart (Capstan) → Kammgarn gesponnen (2/48 Nm) → geschärt (700 Fäden) → gewebt (Toyota JAT810, 5 Schüsse/cm) → gewaschen (Öko-Weichspüler) → handgefranste Kanten.',
    'Quatre étapes de transformation: désourlage (Capstan) → filage peigné (2/48 Nm) → ourdissage (700 fils) → tissage (Toyota JAT810, 5 duites/cm) → lavage (assouplissant écologique) → franges à la main.',
    '4 工程: 脱毛 (Capstan) → 梳毛紡績 (2/48 Nm) → 整経 (700 本) → 製織 (豊田 JAT810, 5 打ち/cm) → 水洗い (エコ柔軟剤) → 手作業フリンジ。',
    '4단계 공정: 제모 (Capstan) → 워스티드 방적 (2/48 Nm) → 정경 (700올) → 직조 (도요타 JAT810, 5 위사/cm) → 수세 (친환경 유연제) → 수작업 프린지.',
  ),
  processSteps: [
    t('Dehairing: raw cashmere combed to remove guard hair', '分梳: 去除粗毛', 'Enthaarung: Rohkaschmir enthaart', 'Désourlage: cachemire brut démêlé', '脱毛: 粗毛を除去', '제모: 보호모 제거'),
    t('Spinning: 2/48 Nm worsted-spun yarn', '纺纱: 2/48 Nm 精纺', 'Spinnen: 2/48 Nm Kammgarn', 'Filage: 2/48 Nm peigné', '紡績: 2/48 Nm 梳毛糸', '방적: 2/48 Nm 워스티드'),
    t('Weaving: Toyota JAT810 loom, 5 picks/cm', '织造: 丰田 JAT810, 5 纬/cm', 'Weben: Toyota JAT810, 5 Schüsse/cm', 'Tissage: Toyota JAT810, 5 duites/cm', '製織: 豊田 JAT810, 5 打ち/cm', '직조: 도요타 JAT810, 5 위사/cm'),
    t('Washing: eco-softener, gentle cycle', '水洗: 环保柔顺剂, 轻柔模式', 'Waschen: Öko-Weichspüler, Schonprogramm', 'Lavage: assouplissant écologique, cycle doux', '水洗い: エコ柔軟剤, やさしいモード', '수세: 친환경 유연제, 순한 모드'),
    t('Hand-fringing: 5-7cm twisted tassels', '手工流苏: 5-7cm 扭绳', 'Hand-Franse: 5-7cm gedrehte Quasten', 'Franges à la main: torsades 5-7cm', '手作業フリンジ: 5-7cm ねじり房', '수작업 프린지: 5-7cm 꼬인 술'),
  ],
  customServiceTitle: t('Custom Cashmere Scarf Manufacturing', '羊绒围巾定制服务', 'Maßgefertigte Kaschmirschal-Herstellung', 'Fabrication d\'écharpes en cachemire sur mesure', 'カスタムカシミアスカーフ製造', '맞춤 캐시미어 스카프 제조'),
  customServiceBullets: [
    t('Woven label with your brand name and logo', '定制织唛（品牌名 + logo）', 'Gewebtes Etikett mit Markenname und Logo', 'Étiquette tissée avec nom de marque et logo', 'ブランド名 + ロゴ入り織りラベル', '브랜드명 + 로고 직조 라벨'),
    t('Custom Pantone color matching (5kg min per color)', 'Pantone 定制染色 (每色 5kg 起)', 'Pantone-Farbanpassung (min. 5kg pro Farbe)', 'Correspondance Pantone (min. 5kg par couleur)', 'Pantone カラーマッチング (各色 5kg〜)', 'Pantone 색상 매칭 (색상당 5kg 이상)'),
    t('Hangtag, care label, and packaging customization', '吊牌、洗标、包装定制', 'Anhänger, Pflegeetikett und Verpackung', 'Étiquette volante, étiquette d\'entretien et emballage', 'ハンガータグ、ケアラベル、パッケージ', '행태그, 세탁 라벨, 패키지 커스텀'),
    t('Pattern development from your sketch or reference photo', '从草图/参考图开发图案', 'Musterentwicklung aus Skizze oder Referenzfoto', 'Développement de motif depuis croquis ou photo', 'スケッチ・参考写真からパターン開発', '스케치/참고 사진에서 패턴 개발'),
    t('Monogram and personalization (initials, dates, logos)', '字母组合 + 个性化（首字母、日期、logo）', 'Monogramm und Personalisierung', 'Monogramme et personnalisation', 'モノグラム・パーソナライズ', '모노그램 및 맞춤화'),
    t('Retail-ready packaging (boxes, polybags, gift sets)', '零售包装（礼盒、塑料袋、套装）', 'Verkaufsfertige Verpackung (Boxen, Beutel, Sets)', 'Emballage prêt à la vente (boîtes, sacs, coffrets)', '小売用パッケージ (箱、袋、ギフトセット)', '소매용 패키지 (박스, 파우치, 선물 세트)'),
  ],
  whyChooseTitle: t('Why Choose Our Cashmere Scarf Factory', '为什么选择我们的羊绒围巾工厂', 'Warum Sie unsere Kaschmirschal-Fabrik wählen sollten', 'Pourquoi choisir notre usine d\'écharpes en cachemire', 'なぜ当社のカシミアスカーフ工場を選ぶのか', '저희 캐시미어 스카프 공장을 선택해야 하는 이유'),
  whyChooseBullets: [
    t('Stable material sourcing: 1,200+ tons annual dehairing capacity', '稳定原料供应: 年分梳能力 1,200+ 吨', 'Stabile Materialbeschaffung: 1.200+ Tonnen jährliche Enthaarungskapazität', 'Approvisionnement stable: 1 200+ tonnes de capacité de désourlage annuelle', '安定した原料調達: 年間 1,200 トン以上の脱毛能力', '안정적인 원료 조달: 연간 1,200+톤 제모 능력'),
    t('Flexible customization: 14-day sample turnaround', '灵活定制: 14 天打样', 'Flexible Anpassung: 14-Tage-Musterumlauf', 'Personnalisation flexible: échantillon en 14 jours', '柔軟なカスタマイズ: 14 日サンプル', '유연한 맞춤: 14일 샘플 처리'),
    t('Private label development: full branding service', '私人标签: 全套品牌服务', 'Private Label: kompletter Branding-Service', 'Marque privée: service de marque complet', 'プライベートラベル: 完全ブランディング', '프라이빗 레이블: 풀 브랜딩 서비스'),
    t('Experienced sampling team: in-house designers + pattern makers', '资深打样团队: 内部设计 + 制版', 'Erfahrenes Musterteam: hauseigene Designer + Schnittmacher', 'Équipe d\'échantillonnage expérimentée', '経験豊富なサンプルチーム: 社内デザイナー + パターン作成', '숙련된 샘플 팀: 사내 디자이너 + 패턴 메이커'),
    t('Strict quality control: 5-stage inspection', '严格质控: 5 道检验', 'Strenge Qualitätskontrolle: 5-stufige Inspektion', 'Contrôle qualité strict: inspection en 5 étapes', '厳格な品質管理: 5 段階検査', '엄격한 품질 관리: 5단계 검사'),
    t('Export and packaging support: FOB/CIF/DDP', '出口 + 包装支持: FOB/CIF/DDP', 'Export- und Verpackungsunterstützung', 'Soutien à l\'exportation et à l\'emballage', '輸出・包装サポート', '수출 및 패키징 지원'),
  ],
  applicationsTitle: t('Applications & Use Cases', '应用场景', 'Anwendungen & Einsatzbereiche', 'Applications et cas d\'usage', '用途と使用例', '용도 및 사용 사례'),
  applicationScenarios: [
    t('Luxury boutique retail (signature piece)', '奢侈品零售（主打款）', 'Luxus-Boutique-Einzelhandel (Signature-Stück)', 'Boutique de luxe (pièce phare)', 'ラグジュアリーブティック (シグネチャー)', '럭셔리 부티크 (시그니처)'),
    t('Department store wholesale (multi-store chains)', '百货批发（多店连锁）', 'Kaufhaus-Großhandel (Filialketten)', 'Vente en gros grands magasins', '百貨店卸売り (チェーン展開)', '백화점 도매 (체인점)'),
    t('Private label brands (50-2000 pcs)', '私人品牌 (50-2000 件)', 'Private-Label-Marken (50-2000 Stk.)', 'Marques de distributeur (50-2000 pièces)', 'プライベートラベル (50-2000 点)', '프라이빗 레이블 (50-2000개)'),
    t('Travel collection (lightweight gift sets)', '旅行系列（轻便礼品套装）', 'Reise-Kollektion (leichte Geschenksets)', 'Collection voyage (coffrets légers)', 'トラベルコレクション (軽量ギフトセット)', '여행 컬렉션 (경량 선물 세트)'),
    t('Winter gift sets (holiday packaging)', '冬季礼盒（节日包装）', 'Winter-Geschenksets (Feiertagsverpackung)', 'Coffrets hiver (emballage fêtes)', '冬ギフトセット (ホリデーパッケージ)', '겨울 선물 세트 (홀iday 패키지)'),
    t('Corporate gifting with custom logo', '企业礼品定制（logo 定制）', 'Firmen-Geschenke mit individuellem Logo', 'Cadeaux d\'entreprise avec logo', '企業ギフト (カスタムロゴ)', '기업 선물 (커스텀 로고)'),
  ],
  careInstructions: t(
    'Dry clean recommended; hand wash cold with cashmere-specific detergent; lay flat to dry; store folded with cedar blocks.',
    '建议干洗；手洗冷水用羊绒专用洗涤剂；平铺晾干；折叠存放并放雪松防蛀块。',
    'Chemische Reinigung empfohlen; Handwäsche kalt mit Kaschmirwaschmittel; liegend trocknen; gefaltet mit Zedernholz lagern.',
    'Nettoyage à sec recommandé; lavage à la main à froid avec lessive cachemire; séchage à plat; ranger plié avec blocs de cèdre.',
    'ドライクリーニング推奨; カシミア専用洗剤で冷水手洗い; 平干し; シダーブロックと一緒にたたんで保管。',
    '드라이클리닝 권장; 캐시미어 전용 세제와 함께 찬물 손빨래; 평평하게 말리기; 시더 블록과 함께 접어 보관.',
  ),
  oemWorkflow: [
    t('Design brief: sketch + tech pack', '设计简报: 草图 + 技术单', 'Design-Briefing: Skizze + Tech-Pack', 'Brief design: croquis + tech pack', 'デザイン: スケッチ + テックパック', '디자인 브리프: 스케치 + 기술 자료'),
    t('Counter sample: 7-10 days', '反样: 7-10 天', 'Gegenmuster: 7-10 Tage', 'Contre-échantillon: 7-10 jours', 'カウンターサンプル: 7-10 日', '카운터 샘플: 7-10일'),
    t('Production sample: 14-21 days with your labels', '产前样: 14-21 天（带你的标签）', 'Produktionsmuster: 14-21 Tage mit Ihren Etiketten', 'Échantillon de production: 14-21 jours avec vos étiquettes', '本番サンプル: 14-21 日 (ラベル入り)', '생산 샘플: 14-21일 (라벨 포함)'),
    t('Bulk production: 30-45 days', '大货生产: 30-45 天', 'Serienproduktion: 30-45 Tage', 'Production en série: 30-45 jours', '量産: 30-45 日', '양산: 30-45일'),
    t('Shipping: FOB/CIF/DDP', '出货: FOB/CIF/DDP', 'Versand: FOB/CIF/DDP', 'Expédition: FOB/CIF/DDP', '出荷: FOB/CIF/DDP', '출하: FOB/CIF/DDP'),
  ],
  samplePolicy: t(
    'Free 100g samples ship within 5 days. Custom samples USD 50-150 (refundable against orders 500+ pcs).',
    '免费 100g 样品 5 天内寄出。定制样品 USD 50-150（500 件以上订单可冲抵）。',
    'Kostenlose 100g-Muster innerhalb von 5 Tagen. Maßmuster USD 50-150 (rückzahlbar bei Aufträgen 500+ Stk.).',
    'Échantillons 100g gratuits sous 5 jours. Échantillons personnalisés USD 50-150 (remboursables pour commandes 500+ pièces).',
    '無料 100g サンプル 5 日以内に発送。カスタムサンプル USD 50-150 (500 点以上の注文で返金可能)。',
    '무료 100g 샘플 5일 이내 배송. 맞춤 샘플 USD 50-150 (500개 이상 주문 시 환불 가능).',
  ),
  certifications: ['ISO 9001:2015', 'OEKO-TEX Standard 100 (Class II)', 'BSCI', 'Sedex SMETA'],
  comparisonTitle: t('Cashmere Scarf vs Pashmina: Material Differences', '羊绒围巾 vs 羊绒披肩: 材质区别', 'Kaschmirschal vs Pashmina: Materialunterschiede', 'Écharpe cachemire vs pashmina: différences', 'カシミアスカーフ vs パシュミナ: 素材の違い', '캐시미어 스카프 vs 파시미나: 원료 차이'),
  comparisonOther: 'Pashmina',
  comparisonPoints: [
    { label: t('Fiber source', '纤维来源', 'Faserquelle', 'Source de fibre', '繊維源', '섬유 원천'), cashmere: t('Albus goat underdown', '阿尔巴斯山羊绒', 'Albus-Ziegen-Unterwolle', 'Sous-poil de chèvre Albus', 'アルバス山羊のアンダーダウン', '알버스 산양 언더다운'), other: t('Changthangi goat (Kashmir)', '克什米尔山羊', 'Changthangi-Ziege (Kashmir)', 'Chèvre Changthangi (Cachemire)', 'チャンタンギ山羊 (カシミール)', '창탄기 산양 (카슈미르)') },
    { label: t('Micron range', '细度范围', 'Feinheitsbereich', 'Plage de finesse', '細度範囲', '섬도 범위'), cashmere: t('14.5-15.5μm', '14.5-15.5μm', '14,5-15,5μm', '14,5-15,5μm', '14.5-15.5μm', '14.5-15.5μm'), other: t('12-15μm (similar but rarer)', '12-15μm (类似但更稀少)', '12-15μm (ähnlich, aber seltener)', '12-15μm (similaire mais plus rare)', '12-15μm (同様だが稀少)', '12-15μm (유사하지만 희소)') },
    { label: t('Yield per goat', '单只产绒', 'Ertrag pro Ziege', 'Rendement par chèvre', '山羊1頭あたり収穫量', '산양 1마리 수확량'), cashmere: t('200-400g/year', '200-400g/年', '200-400g/Jahr', '200-400g/an', '200-400g/年', '200-400g/년'), other: t('80-150g/year (rarer)', '80-150g/年 (更稀少)', '80-150g/Jahr (seltener)', '80-150g/an (plus rare)', '80-150g/年 (稀少)', '80-150g/년 (더 희소)') },
    { label: t('Price range', '价格范围', 'Preisbereich', 'Fourchette de prix', '価格帯', '가격대'), cashmere: t('USD 12-30/pc wholesale', 'USD 12-30/件 批发', 'USD 12-30/Stk. Großhandel', 'USD 12-30/pièce en gros', 'USD 12-30/点 卸売', 'USD 12-30/개 도매'), other: t('USD 40-150/pc (rarity premium)', 'USD 40-150/件 (稀缺溢价)', 'USD 40-150/Stk. (Seltenheitsaufschlag)', 'USD 40-150/pièce (prime de rareté)', 'USD 40-150/点 (稀少性プレミアム)', 'USD 40-150/개 (희소성 프리미엄)') },
    { label: t('Softness', '手感', 'Weichheit', 'Douceur', '柔らかさ', '부드러움'), cashmere: t('Ultra-soft, slight drape', '极柔软，有自然垂感', 'Ultraweich, leichter Fall', 'Ultra-doux, drapé léger', '極上の柔らかさ、軽いドレープ', '극도의 부드러움, 약간의 드레이프'), other: t('Very soft, more textured', '很柔软，质感更强', 'Sehr weich, strukturierter', 'Très doux, plus texturé', '非常に柔らかい、テクスチャー強め', '매우 부드럽고 텍스처 있음') },
  ],
  faq: [
    { q: t('What is the MOQ for custom scarves?', '定制围巾起订量？', 'Was ist die MOQ für maßgefertigte Schals?', 'Quel est le MOQ pour les écharpes personnalisées?', 'カスタムスカーフの MOQ は?', '맞춤 스카프의 MOQ는?'), a: t('50 pieces per design. Mixed sizes and colors within the same design are welcome.', '每款 50 件起。同款可混尺寸、混颜色。', '50 Stück pro Design. Gemischte Größen und Farben sind willkommen.', '50 pièces par design. Mélange de tailles et couleurs bienvenu.', 'デザイン 50 点〜。同デザイン内のサイズ・色混在可。', '디자인당 50개. 같은 디자인에서 사이즈/색상 혼합 가능.') },
    { q: t('How long does bulk production take?', '大货生产需要多久？', 'Wie lange dauert die Serienproduktion?', 'Combien de temps prend la production en série?', '量産はどのくらいかかりますか?', '양산에는 얼마나 걸립니까?'), a: t('30-45 days for orders 500-3000 pcs. Larger orders: 50-60 days.', '500-3000 件订单需 30-45 天。更大订单 50-60 天。', '30-45 Tage für 500-3000 Stk. Größere Aufträge: 50-60 Tage.', '30-45 jours pour 500-3000 pièces. Plus: 50-60 jours.', '500-3000 点 30-45 日。大量注文 50-60 日。', '500-3000개 30-45일. 대량 주문 50-60일.') },
    { q: t('Can you produce Pantone-matched colors?', '可以按 Pantone 色号定制吗？', 'Können Sie Pantone-angepasste Farben herstellen?', 'Pouvez-vous produire des couleurs Pantone?', 'Pantone カラー対応は?', 'Pantone 색상 맞춤 생산이 가능한가요?'), a: t('Yes, lab dip in 5-7 days, bulk production 20-30 days after approval. 5kg minimum per custom color.', '可以，实验室打样 5-7 天，批准后大货 20-30 天。每色 5kg 起。', 'Ja, Laborfärbung in 5-7 Tagen, Serienproduktion 20-30 Tage nach Freigabe. 5kg Minimum pro Farbe.', 'Oui, trempage labo en 5-7 jours, production 20-30 jours après validation. 5kg minimum par couleur.', 'はい、ラボ染色 5-7 日、承認後量産 20-30 日。各色 5kg〜。', '예, 랩 다이 5-7일, 승인 후 양산 20-30일. 색상당 5kg 이상.') },
    { q: t('Do you offer custom packaging and labels?', '提供定制包装和标签吗？', 'Bieten Sie kundenspezifische Verpackung und Etiketten?', 'Offrez-vous un emballage et des étiquettes personnalisés?', 'カスタムパッケージとラベルはありますか?', '맞춤 패키징과 라벨을 제공하나요?'), a: t('Yes — woven labels, printed labels, hangtags, polybags, gift boxes. All sourced or made in-house.', '提供：织标、印标、吊牌、塑料袋、礼盒。全部内部制作或采购。', 'Ja — gewebte Etiketten, bedruckte Etiketten, Anhänger, Beutel, Geschenkboxen.', 'Oui — étiquettes tissées/imprimées, volantes, sacs, coffrets.', 'はい — 織りラベル、印刷ラベル、ハンガータグ、袋、ギフトボックス。', '예 — 직조 라벨, 인쇄 라벨, 행태그, 파우치, 선물 박스.') },
    { q: t('What is the price range for wholesale?', '批发价范围？', 'Was ist der Großhandelspreisbereich?', 'Quelle est la fourchette de prix en gros?', '卸売価格の範囲は?', '도매 가격 범위는?'), a: t('USD 9-18/pc for 100% cashmere scarves, depending on size, micron, and order quantity. FOB Tianjin.', '100% 羊绒围巾 USD 9-18/件，取决于尺寸、细度、订单量。FOB 天津。', 'USD 9-18/Stk. für 100% Kaschmir, je nach Größe, Feinheit und Bestellmenge. FOB Tianjin.', 'USD 9-18/pièce pour 100% cachemire. FOB Tianjin.', '100% カシミア USD 9-18/点。FOB 天津。', '100% 캐시미어 USD 9-18/개. FOB 천진.') },
    { q: t('Are you OEKO-TEX certified?', '有 OEKO-TEX 认证吗？', 'Sind Sie OEKO-TEX-zertifiziert?', 'Êtes-vous certifié OEKO-TEX?', 'OEKO-TEX 認証はありますか?', 'OEKO-TEX 인증을 받았나요?'), a: t('Yes, OEKO-TEX Standard 100 Class II. ISO 9001, BSCI, Sedex SMETA 4-pillar.', 'OEKO-TEX 100 二类认证，ISO 9001、BSCI、Sedex SMETA 4 支柱。', 'Ja, OEKO-TEX Standard 100 Klasse II. ISO 9001, BSCI, Sedex SMETA 4-Säulen.', 'Oui, OEKO-TEX Standard 100 Classe II. ISO 9001, BSCI, Sedex SMETA 4 piliers.', 'はい、OEKO-TEX Standard 100 クラス II。', '예, OEKO-TEX Standard 100 Class II. ISO 9001, BSCI, Sedex SMETA 4-pillar.') },
  ],
};

// Defaults for other categories (shorter for time)
const sweaters: ProductDetail = {
  technicalSpecs: {
    material: t('100% Inner Mongolia Grade A cashmere', '100% 内蒙古 A 级羊绒', '100% kaschmir aus der Inneren Mongolei Güteklasse A', '100% cachemire Mongolie Intérieure grade A', '100% 内モンゴル A 級カシミア', '100% 내몽골 A 등급 캐시미어'),
    knitting: t('Knitted on German STOLL CMS 530 HP, 5-16 gauge', '德国 STOLL CMS 530 HP 编织，5-16 针', 'Deutsche STOLL CMS 530 HP, 5-16 Gauge', 'Allemandes STOLL CMS 530 HP, 5-16 jauges', 'ドイツ STOLL CMS 530 HP, 5-16 ゲージ', '독일 STOLL CMS 530 HP, 5-16 게이지'),
    pattern: t('Cable / Aran / Plain / Rib / Jacquard (customizable)', '麻花 / 阿兰 / 平面 / 罗纹 / 提花 (可定制)', 'Zopf / Aran / Glatt / Rippe / Jacquard', 'Câble / Aran / Plat / Côtes / Jacquard', 'ケーブル / アラン / 無地 / リブ / ジャカード', '케이블 / 아란 / 무지 / 립 / 자카드'),
    weight: t('180-450 g/pc (size + gauge dependent)', '180-450 g/件 (尺寸 + 针型)', '180-450 g/Stück', '180-450 g/pièce', '180-450 g/枚', '180-450 g/매'),
    season: t('Autumn / Winter (FW)', '秋冬', 'Herbst / Winter (HW)', 'Automne / Hiver', '秋冬', '가을 / 겨울'),
    sizes: t('XS / S / M / L / XL / XXL (customizable)', 'XS / S / M / L / XL / XXL (可定制)', 'XS / S / M / L / XL / XXL (anpassbar)', 'XS / S / M / L / XL / XXL', 'XS / S / M / L / XL / XXL', 'XS / S / M / L / XL / XXL'),
    colors: t('Pantone PMS matching 5kg+ per color', 'Pantone PMS 配色，5kg+ 起', 'Pantone PMS, 5kg+ pro Farbe', 'Pantone PMS, 5kg+ par couleur', 'Pantone PMS, 5kg〜/色', 'Pantone PMS, 색상당 5kg 이상'),
    function: t('Thermal insulation, breathability, comfort', '保暖、透气、舒适', 'Wärmeisolierung, Atmungsaktivität', 'Isolation thermique, respirabilité', '保温, 透湿性, 快適', '보온, 통기성, 편안함'),
    gender: t('Unisex / Men / Women', '男女 / 男 / 女', 'Unisex / Herren / Damen', 'Unisexe / Homme / Femme', 'ユニセックス / メンズ / ウィメンズ', '유니섹스 / 남성 / 여성'),
    moq: t('100 pieces per style', '每款 100 件', '100 Stück pro Stil', '100 pièces par style', 'スタイル 100 枚〜', '스타일당 100개'),
    careMethod: t('Hand wash cold or dry clean; lay flat dry', '冷水手洗或干洗；平铺晾干', 'Handwäsche kalt oder Chemische Reinigung', 'Lavage main froid ou nettoyage à sec', '冷水手洗いまたはドライクリーニング', '찬물 손빨래 또는 드라이클리닝'),
    customization: t('Custom knit patterns / Labels / Embroidery / Packaging', '定制针织图案 / 标签 / 刺绣 / 包装', 'Kundenspezifische Muster / Etiketten / Stickerei / Verpackung', 'Motifs personnalisés / Étiquettes / Broderie', 'カスタムパターン / ラベル / 刺繍 / 包装', '맞춤 패턴 / 라벨 / 자수 / 패키징'),
    origin: t('Inner Mongolia, China', '中国内蒙古', 'Innere Mongolei, China', 'Mongolie Intérieure', '中国内モンゴル', '중국 내몽골'),
    technology: t('Whole garment knitting, 12-gauge', '整件针织，12 针', 'Ganzstrick, 12 Gauge', 'Tricot intégral, 12 jauges', 'ホールガーメント編み, 12 ゲージ', '홀가먼트 편성, 12 게이지'),
    elasticity: t('Natural elasticity, retains shape', '自然弹性，保形', 'Natürliche Elastizität, formstabil', 'Élasticité naturelle, conserve la forme', '自然な伸縮性, 形状保持', '자연 신축성, 형태 유지'),
  },
  materialStory: t('Knitted on German STOLL CMS 530 HP knitting machines, our cashmere sweaters use 2/26 to 2/48 Nm yarn depending on gauge. 5-gauge for chunky, 12-gauge for fine-gauge knits.', '我们的羊绒衫使用德国 STOLL CMS 530 HP 电脑横机，2/26 至 2/48 Nm 纱线。5 针粗针，12 针细针。', 'Auf deutschen STOLL CMS 530 HP Strickmaschinen, 2/26 bis 2/48 Nm Garn.', 'Sur machines à tricoter allemandes STOLL CMS 530 HP.', 'ドイツの STOLL CMS 530 HP 編み機, 2/26 〜 2/48 Nm 糸。', '독일 STOLL CMS 530 HP 니팅머신, 2/26 ~ 2/48 Nm 원사.'),
  process: t('12-stage process: dehairing → spinning → knitting → linking → mending → washing → softening → pressing → QC → labeling → packaging.', '12 道工序：分梳 → 纺纱 → 编织 → 缝合 → 修补 → 水洗 → 柔软 → 整烫 → 质检 → 贴标 → 包装。', '12-stufiger Prozess: Enthaaren → Spinnen → Stricken → Vernähen → Stopfen → Waschen → Weichmachen → Bügeln → QC → Etikettieren → Verpacken.', 'Processus en 12 étapes: désourlage → filage → tricotage → assemblage → remaillage → lavage → adoucissement → repassage → QC → étiquetage → emballage.', '12 工程: 脱毛 → 紡績 → 編み → リンキング → 補修 → 洗い → 柔軟 → プレス → QC → ラベル → 包装。', '12단계 공정: 제모 → 방적 → 편성 → 링킹 → 수선 → 수세 → 유연화 → 다림질 → QC → 라벨링 → 패키징.'),
  customServiceTitle: t('Custom Cashmere Sweater Manufacturing', '羊绒衫定制服务', 'Maßgefertigte Kaschmirpullover-Herstellung', 'Fabrication de pulls en cachemire sur mesure', 'カスタムカシミアセーター製造', '맞춤 캐시미어 스웨터 제조'),
  customServiceBullets: [
    t('Custom design from sketch or reference photo', '从草图/参考图定制设计', 'Kundenspezifisches Design aus Skizze oder Foto', 'Design personnalisé depuis croquis ou photo', 'スケッチ・参考写真からカスタムデザイン', '스케치/참고 사진에서 맞춤 디자인'),
    t('Tech pack development by in-house designers', '内部设计团队开发技术单', 'Tech-Pack-Entwicklung durch interne Designer', 'Tech pack par designers internes', '社内デザイナーによるテックパック', '사내 디자이너 기술 자료 개발'),
    t('Counter sample in 7-10 days', '反样 7-10 天', 'Gegenmuster in 7-10 Tagen', 'Contre-échantillon en 7-10 jours', 'カウンターサンプル 7-10 日', '카운터 샘플 7-10일'),
    t('Production sample with your labels 14-21 days', '产前样带你的标签 14-21 天', 'Produktionsmuster mit Ihren Etiketten 14-21 Tage', 'Échantillon de production avec étiquettes 14-21 jours', '本番サンプル 14-21 日 (ラベル入り)', '생산 샘플 14-21일 (라벨 포함)'),
    t('Multiple gauge options (5/7/9/12/14/16)', '多种针型 (5/7/9/12/14/16)', 'Mehrere Gauge-Optionen', 'Plusieurs options de jauge', '複数ゲージオプション', '다중 게이지 옵션'),
    t('Custom embroidery and intarsia', '定制刺绣和嵌花', 'Kundenspezifische Stickerei und Intarsien', 'Broderie et intarsia personnalisées', 'カスタム刺繍とイ ntarsia', '맞춤 자수 및 인타시아'),
  ],
  whyChooseTitle: t('Why Choose Our Cashmere Sweater Factory', '为什么选择我们的羊绒衫工厂', 'Warum Sie unsere Kaschmirpullover-Fabrik wählen sollten', 'Pourquoi choisir notre usine de pulls en cachemire', 'なぜ当社のカシミアセーター工場を選ぶのか', '저희 캐시미어 스웨터 공장을 선택해야 하는 이유'),
  whyChooseBullets: [
    t('Vertical integration: yarn to garment under one roof', '垂直整合: 纱线到成衣一站式', 'Vertikale Integration: Garn bis Kleidung unter einem Dach', 'Intégration verticale: du fil au vêtement', '垂直統合: 糸から衣料まで一棟で', '수직 통합: 원사부터 의류까지 한 지붕에서'),
    t('German STOLL CMS 530 HP machines (5-16 gauge)', '德国 STOLL CMS 530 HP 机器 (5-16 针)', 'Deutsche STOLL CMS 530 HP Maschinen (5-16 Gauge)', 'Machines STOLL CMS 530 HP allemandes (5-16 jauges)', 'ドイツ STOLL CMS 530 HP 機 (5-16 ゲージ)', '독일 STOLL CMS 530 HP (5-16 게이지)'),
    t('30+ years OEM experience with global brands', '30+ 年 OEM 经验服务全球品牌', '30+ Jahre OEM-Erfahrung mit globalen Marken', '30+ ans d\'expérience OEM avec marques mondiales', '30 年以上のグローバルブランド向け OEM 経験', '30+ 년 글로벌 브랜드 OEM 경험'),
    t('5-stage quality control (incoming → pre-shipment)', '5 道质控 (来料 → 出货前)', '5-stufige Qualitätskontrolle', 'Contrôle qualité en 5 étapes', '5 段階品質管理', '5단계 품질 관리'),
    t('Full private label: labels + packaging + tags', '全套私人标签: 标 + 包装 + 吊牌', 'Vollständiges Private Label', 'Marque privée complète', '完全なプライベートラベル', '완전 프라이빗 레이블'),
    t('Sustainable and ethical manufacturing (BSCI/Sedex)', '可持续和道德制造 (BSCI/Sedex)', 'Nachhaltige und ethische Fertigung', 'Fabrication durable et éthique', '持続可能で倫理的な製造', '지속 가능하고 윤리적 제조'),
  ],
  applicationsTitle: t('Sweater Applications', '羊绒衫应用场景', 'Pullover-Anwendungen', 'Applications des pulls', 'セーターの用途', '스웨터 용도'),
  applicationScenarios: [
    t('Luxury brand ready-to-wear collections', '奢侈品牌成衣系列', 'Luxusmarken-Konfektionskollektionen', 'Collections prêt-à-porter de luxe', 'ラグジュアリーブランド RTW コレクション', '럭셔리 브랜드 RTW 컬렉션'),
    t('Boutique private label brands', '精品店私人品牌', 'Boutique-Private-Label-Marken', 'Marques de distributeur boutique', 'ブティック・プライベートラベル', '부티크 프라이빗 레이블'),
    t('Cashmere essential capsule wardrobes', '羊绒基础胶囊衣橱', 'Kaschmir-Essentials-Kapselkollektionen', 'Capsules essentielles cachemire', 'カシミア・エッセンシャル・カプセル', '캐시미어 에센셜 캡슐'),
    t('Men\'s and women\'s knitwear lines', '男女针织系列', 'Herren- und Damen-Strickkollektionen', 'Lignes maille homme et femme', 'メンズ・ウィメンズ ニット', '남녀 니트웨어 라인'),
    t('Holiday gift collections', '节日礼品系列', 'Feiertags-Geschenkkollektionen', 'Collections cadeaux de fêtes', 'ホリデーギフトコレクション', '홀iday 선물 컬렉션'),
  ],
  careInstructions: t('Hand wash cold with cashmere-specific detergent. Lay flat to dry on a towel. Fold and store with cedar blocks to prevent moths.', '手洗冷水用羊绒专用洗涤剂。平铺在毛巾上晾干。折叠存放并放雪松防蛀块。', 'Handwäsche kalt mit Kaschmirwaschmittel. Liegend auf Handtuch trocknen. Gefaltet mit Zedernholz lagern.', 'Lavage main froid avec lessive cachemire. Séchage à plat sur serviette. Plier et ranger avec blocs de cèdre.', 'カシミア専用洗剤で冷水手洗い。タオルで平干し。シダーブロックと一緒に保管。', '캐시미어 전용 세제 찬물 손빨래. 수건 위 평평하게 말리기. 시더 블록과 함께 접어 보관.'),
  certifications: ['ISO 9001:2015', 'OEKO-TEX Standard 100', 'BSCI', 'Sedex SMETA'],
  faq: [
    { q: t('What is the MOQ for OEM sweaters?', 'OEM 羊绒衫起订量？', 'MOQ für OEM-Pullover?', 'MOQ pour pulls OEM?', 'OEM セーターの MOQ?', 'OEM 스웨터의 MOQ는?'), a: t('100 pieces per style. Mixed sizes within a style are welcome.', '每款 100 件。同款可混尺寸。', '100 Stück pro Stil. Gemischte Größen sind willkommen.', '100 pièces par style. Mélange de tailles bienvenu.', 'スタイル 100 点〜。サイズ混在可。', '스타일당 100개. 사이즈 혼합 가능.') },
    { q: t('What gauge options do you offer?', '提供哪些针型？', 'Welche Gauge-Optionen?', 'Quelles options de jauge?', 'ゲージオプションは?', '어떤 게이지 옵션이 있나요?'), a: t('5, 7, 9, 12, 14, 16 gauge. We can also do 18 gauge for ultra-fine knits.', '5/7/9/12/14/16 针。18 针极细针也做。', '5, 7, 9, 12, 14, 16 Gauge. Auch 18 Gauge für ultrafeine Maschen.', '5, 7, 9, 12, 14, 16 jauges. 18 aussi pour tricot ultra-fin.', '5, 7, 9, 12, 14, 16 ゲージ。18 ゲージ極細ニットも対応。', '5, 7, 9, 12, 14, 16 게이지. 18 게이지 극세 니트도 가능.') },
    { q: t('How long does it take from tech pack to bulk?', '从技术单到大货需要多久？', 'Vom Tech-Pack zur Serienproduktion?', 'Du tech pack à la production en série?', 'テックパックから量産まで?', '기술 자료에서 양산까지?'), a: t('7-10 days counter sample, 14-21 days production sample, 30-45 days bulk. Total: 7-9 weeks.', '反样 7-10 天，产前样 14-21 天，大货 30-45 天。总计 7-9 周。', '7-10 Tage Gegenmuster, 14-21 Tage Produktionsmuster, 30-45 Tage Serie. Insgesamt 7-9 Wochen.', '7-10 jours contre-échantillon, 14-21 production, 30-45 série. Total: 7-9 semaines.', 'カウンターサンプル 7-10 日、本番サンプル 14-21 日、量産 30-45 日。合計 7-9 週。', '카운터 샘플 7-10일, 생산 샘플 14-21일, 양산 30-45일. 총 7-9주.') },
    { q: t('Can you source special yarns like cashmere-silk blends?', '能采购羊绒真丝混纺等特殊纱线吗？', 'Können Sie Spezialgarne wie Kaschmir-Seide-Mischungen beziehen?', 'Pouvez-vous fournir des fils spéciaux comme cachemire-soie?', 'カシミアシルクなどの特殊糸は?', '캐시미어 실크 같은 특수 원사 조달 가능한가요?'), a: t('Yes, common blends: 90/10 cashmere/silk, 85/15, 70/30. Custom blends 200kg+ MOQ.', '常用混纺: 90/10、85/15、70/30 羊绒/真丝。定制混纺 200kg+ 起。', 'Ja, übliche Mischungen: 90/10, 85/15, 70/30 Kaschmir/Seide. Maßmischungen 200kg+ MOQ.', 'Oui, mélanges courants: 90/10, 85/15, 70/30 cachemire/soie. Sur mesure 200kg+ MOQ.', 'はい、90/10、85/15、70/30 カシミアシルク。カスタム 200kg〜。', '예, 90/10, 85/15, 70/30 캐시미어/실크. 맞춤 200kg 이상.') },
    { q: t('What is the defect rate?', '次品率是多少？', 'Wie hoch ist die Fehlerquote?', 'Quel est le taux de défaut?', '不良率は?', '불량률은?'), a: t('Less than 2% for sweaters. Each piece goes through 5-stage QC.', '羊绒衫次品率低于 2%。每件经过 5 道质控。', 'Unter 2% für Pullover. 5-stufige QC.', 'Moins de 2% pour pulls. QC en 5 étapes.', 'セーター 2% 未満。5 段階 QC。', '스웨터 2% 미만. 5단계 QC.') },
  ],
};

const hats: ProductDetail = {
  technicalSpecs: {
    material: t('100% Inner Mongolia Grade A cashmere', '100% 内蒙古 A 级羊绒', '100% kaschmir Inneren Mongolei Güteklasse A', '100% cachemire Mongolie grade A', '100% 内モンゴル A 級カシミア', '100% 내몽골 A 등급 캐시미어'),
    knitting: t('12-gauge Shima Seiki knitting machines', '日本 Shima Seiki 12 针电脑横机', '12-Gauge Shima Seiki', 'Shima Seiki 12 jauges', '12 ゲージ島精機', '12 게이지 시마세이기'),
    pattern: t('Cable / Plain / Rib / Slouchy', '麻花 / 平面 / 罗纹 / 堆堆帽', 'Zopf / Glatt / Rippe / Schlabber', 'Câble / Plat / Côtes / Souple', 'ケーブル / 無地 / リブ / ルーズ', '케이블 / 무지 / 립 / 늘어짐'),
    weight: t('80-180 g/pc', '80-180 g/件', '80-180 g/Stück', '80-180 g/pièce', '80-180 g/枚', '80-180 g/매'),
    season: t('Autumn / Winter', '秋冬', 'Herbst / Winter', 'Automne / Hiver', '秋冬', '가을 / 겨울'),
    sizes: t('Adult (56-60cm) / Child (48-54cm) (customizable)', '成人 (56-60cm) / 儿童 (48-54cm) (可定制)', 'Erwachsene 56-60cm / Kind 48-54cm', 'Adulte 56-60cm / Enfant 48-54cm', '大人 56-60cm / 子供 48-54cm', '성인 56-60cm / 아동 48-54cm'),
    colors: t('Pantone PMS matching, custom dyes', 'Pantone PMS 配色，定制染色', 'Pantone PMS, kundenspezifische Farben', 'Pantone PMS, couleurs personnalisées', 'Pantone PMS, カスタム染色', 'Pantone PMS, 맞춤 염색'),
    function: t('Warmth, head protection, fashion', '保暖、护头、时尚', 'Wärme, Kopfschutz, Mode', 'Chaleur, protection, mode', '防寒, 頭保護, ファッション', '보온, 머리 보호, 패션'),
    gender: t('Unisex', '中性', 'Unisex', 'Unisexe', 'ユニセックス', '유니섹스'),
    moq: t('100 pieces per design', '每款 100 件', '100 Stück pro Design', '100 pièces par design', 'デザイン 100 枚〜', '디자인당 100개'),
    careMethod: t('Hand wash cold; reshape and dry flat', '冷水手洗；整形平铺晾干', 'Handwäsche kalt; in Form trocknen', 'Lavage main froid; sécher à plat', '冷水手洗い; 平干し', '찬물 손빨래; 모양 잡아 평건조'),
    customization: t('Custom knit patterns / Woven label / Cuff embroidery', '定制针织图案 / 织标 / 帽边刺绣', 'Kundenspezifische Muster / Weblabel / Bündchen-Stickerei', 'Motifs / Étiquette / Broderie revers', 'カスタムパターン / 織りラベル / 縁刺繍', '맞춤 패턴 / 직조 라벨 / 챙 자수'),
    origin: t('Inner Mongolia, China', '中国内蒙古', 'Innere Mongolei, China', 'Mongolie Intérieure', '中国内モンゴル', '중국 내몽골'),
    technology: t('Shima Seiki whole garment, 12 gauge', 'Shima Seiki 整件，12 针', 'Shima Seiki Ganzstrick, 12 Gauge', 'Shima Seiki intégral 12 jauges', '島精機ホールガーメント, 12 ゲージ', '시마세이기 홀가먼트, 12 게이지'),
    elasticity: t('Rib cuff for snug fit', '罗纹帽边贴头', 'Ripp-Bündchen für festen Sitz', 'Côte élastiquée pour ajustement', 'リブ編みのフィット感', '립 단면 밀착'),
  },
  materialStory: t('Knitted on 12-gauge Shima Seiki machines, our cashmere hats and beanies use 2/26 Nm woolen-spun yarn for soft, lofty texture. Hand-finished seams.', '我们的羊绒帽子用日本 Shima Seiki 12 针电脑横机，2/26 Nm 粗纺纱线，手工缝合。', 'Auf 12-Gauge Shima Seiki Maschinen, 2/26 Nm Streichgarn.', 'Sur machines Shima Seiki 12 jauges, fil 2/26 Nm cardé.', '12 ゲージ島精機, 2/26 Nm 梳毛糸。', '12 게이지 시마세이기, 2/26 Nm 울렌 원사.'),
  customServiceTitle: t('Custom Cashmere Hat Manufacturing', '羊绒帽子定制服务', 'Maßgefertigte Kaschmirhutherstellung', 'Fabrication de chapeaux en cachemire sur mesure', 'カスタムカシミア帽子製造', '맞춤 캐시미어 모자 제조'),
  whyChooseTitle: t('Why Choose Our Cashmere Hat Factory', '为什么选择我们的羊绒帽子工厂', 'Warum Sie unsere Kaschmirhutfabrik wählen sollten', 'Pourquoi choisir notre usine de chapeaux en cachemire', 'なぜ当社のカシミア帽子工場を選ぶのか', '저희 캐시미어 모자 공장을 선택해야 하는 이유'),
  customServiceBullets: scarves.customServiceBullets,
  whyChooseBullets: scarves.whyChooseBullets,
  applicationsTitle: t('Hat Applications', '帽子应用场景', 'Hut-Anwendungen', 'Applications de chapeaux', '帽子の用途', '모자 용도'),
  applicationScenarios: [
    t('Cold-weather outdoor wear', '寒冷天气户外', 'Kaltwetter-Outdoor', 'Plein air par temps froid', '寒冷地アウトドア', '추운 날 야외 활동'),
    t('Winter capsule collections', '冬季胶囊系列', 'Winter-Kapselkollektionen', 'Capsules hiver', 'ウィンターカプセル', '겨울 캡슐 컬렉션'),
    t('Ski resort gear and gifts', '滑雪场装备和礼品', 'Skigebiet-Ausrüstung und Geschenke', 'Équipement de ski et cadeaux', 'スキー場のギアとギフト', '스키장 용품 및 선물'),
    t('Streetwear and lifestyle', '街头潮牌和生活方式', 'Streetwear und Lifestyle', 'Streetwear et lifestyle', 'ストリートウェアとライフスタイル', '스트리트웨어 및 라이프스타일'),
    t('Custom embroidery for hotels', '酒店定制刺绣', 'Hotel-Stickerei', 'Broderie personnalisée pour hôtels', 'ホテル用カスタム刺繍', '호텔 맞춤 자수'),
    t('Corporate gift sets', '企业礼品套装', 'Firmengeschenksets', "Coffrets cadeaux d'entreprise", '法人ギフトセット', '기업 선물 세트'),
  ],
  careInstructions: t('Hand wash in cool water with cashmere shampoo. Reshape and dry flat. Avoid wearing the same hat two days in a row to preserve shape.', '冷水手洗用羊绒专用洗涤剂。整形后平铺晾干。避免连续两天戴同一顶帽子保持形状。', 'Handwäsche kalt; in Form trocknen.', 'Lavage main; sécher à plat.', 'カシミアシャンプーで手洗い。平干し。', '캐시미어 샴푸 손빨래. 모양 잡아 평건조.'),
  certifications: ['ISO 9001:2015', 'OEKO-TEX Standard 100', 'BSCI'],
  faq: [
    { q: t('What sizes do hats come in?', '帽子有哪些尺寸？', 'Welche Größen gibt es?', 'Quelles tailles disponibles?', 'サイズ展開は?', '사이즈 옵션은?'), a: t('Adult (56-60cm), youth (52-56cm), and child (48-54cm). Custom sizes available.', '成人 (56-60cm)、青少年 (52-56cm)、儿童 (48-54cm)。支持定制尺寸。', 'Erwachsen 56-60cm, Jugend 52-56cm, Kind 48-54cm.', 'Adulte 56-60cm, jeune 52-56cm, enfant 48-54cm.', '大人 56-60, ユース 52-56, 子供 48-54。', '성인 56-60, 청소년 52-56, 아동 48-54.') },
    { q: t('Can you add custom patches or labels?', '能加定制徽章或标签吗？', 'Können Patches oder Etiketten angepasst werden?', 'Patches ou étiquettes personnalisés?', 'カスタムパッチやラベルは?', '맞춤 패치 또는 라벨 가능한가요?'), a: t('Yes, woven labels, leather patches, embroidered logos. Min order 200pcs per design.', '可织唛、皮标、绣花 logo。每款起订 200 件。', 'Weblabel, Leder-Patches, Logo-Stickerei. 200 Stück Mindestmenge.', 'Étiquettes tissées, patches cuir, logos brodés. 200 pcs min.', '織りラベル, 革パッチ, ロゴ刺繍。200枚〜。', '직조 라벨, 가죽 패치, 로고 자수. 200개 이상.' ) },
    { q: t('Are reversible or 2-in-1 designs possible?', '能双面或二合一设计吗？', 'Reversible oder 2-in-1 Designs?', 'Designs réversibles ou 2-en-1?', 'リバーシブルや 2-in-1?', '양면 또는 2-in-1 가능한가요?'), a: t('Yes, we offer reversible beanies (2-color or 2-pattern inner+outer) and convertible neck warmers.', '可双面针织帽（双色内外）+ 转换式围脖。', 'Ja, reversible Beanies und konvertierbare Halswärmer.', 'Oui, bonnets réversibles et cache-cous convertibles.', 'はい、リバーシブルビーニー+変換ネックウォーマー。', '예, 양면 비니 + 변환 넥워머.' ) },
    { q: t('What is the defect tolerance?', '次品容许度？', 'Fehlertoleranz?', 'Tolérance aux défauts?', '不良許容は?', '불량 허용 기준?'), a: t('Less than 1.5% for hats. Critical defects: zero tolerance. Major: 0.5%, minor: 1%.', '帽子次品率 < 1.5%。严重缺陷零容忍；主要 0.5%，次要 1%。', 'Unter 1,5%. Kritisch: 0. Haupt: 0,5%.', 'Moins de 1,5%.', '1.5% 未満。', '1.5% 미만.' ) },
  ],
};

const accessories: ProductDetail = {
  technicalSpecs: {
    material: t('100% Inner Mongolia Grade A cashmere', '100% 内蒙古 A 级羊绒', '100% kaschmir Inneren Mongolei Güteklasse A', '100% cachemire Mongolie grade A', '100% 内モンゴル A 級カシミア', '100% 내몽골 A 등급 캐시미어'),
    knitting: t('Mixed: knitted or woven per item type', '混合：针织或机织按品类', 'Gemischt: gestrickt oder gewebt', 'Mixte: tricoté ou tissé', '混合: ニットまたは織物', '혼합: 편성 또는 직조'),
    pattern: t('Plain / Cable / Rib / Argyle (customizable)', '素色 / 麻花 / 罗纹 / 菱形 (可定制)', 'Uni / Zopf / Rippe / Argyle', 'Uni / Câble / Côtes / Argyle', '無地 / ケーブル / リブ / アーガイル', '무지 / 케이블 / 립 / 아가일'),
    weight: t('50-300 g/pc (item + size dependent)', '50-300 g/件 (品类 + 尺寸)', '50-300 g/Stück', '50-300 g/pièce', '50-300 g/枚', '50-300 g/매'),
    season: t('Autumn / Winter / Year-round', '秋冬 / 四季', 'Herbst / Winter / Ganzjährig', 'Automne / Hiver / Toute l\'année', '秋冬 / 周年', '가을 / 겨울 / 연중'),
    sizes: t('XS-XXL / One-size (item dependent)', 'XS-XXL / 均码 (按品类)', 'XS-XXL / Einheitsgröße', 'XS-XXL / Taille unique', 'XS-XXL / フリーサイズ', 'XS-XXL / 프리사이즈'),
    colors: t('Pantone PMS matching', 'Pantone PMS 配色', 'Pantone PMS', 'Pantone PMS', 'Pantone PMS', 'Pantone PMS'),
    function: t('Warmth, layering, gift', '保暖、叠搭、礼品', 'Wärme, Schichtung, Geschenk', 'Chaleur, superposition, cadeau', '防寒, レイヤード, ギフト', '보온, 레이어드, 선물'),
    gender: t('Unisex', '中性', 'Unisex', 'Unisexe', 'ユニセックス', '유니섹스'),
    moq: t('50-100 pieces per design', '每款 50-100 件', '50-100 Stück pro Design', '50-100 pièces par design', 'デザイン 50-100 枚', '디자인당 50-100개'),
    careMethod: t('Hand wash cold; lay flat dry', '冷水手洗；平铺晾干', 'Handwäsche kalt; liegend trocknen', 'Lavage main; séchage à plat', '冷水手洗い; 平干し', '찬물 손빨래; 평건조'),
    customization: t('Woven label / Packaging / Embroidery', '织标 / 包装 / 刺绣', 'Weblabel / Verpackung / Stickerei', 'Étiquette / Emballage / Broderie', '織りラベル / 包装 / 刺繍', '직조 라벨 / 패키징 / 자수'),
    origin: t('Inner Mongolia, China', '中国内蒙古', 'Innere Mongolei, China', 'Mongolie Intérieure', '中国内モンゴル', '중국 내몽골'),
    technology: t('Various (knit or woven per item)', '多种 (按品类针织或机织)', 'Verschieden', 'Divers', '各種', '다양'),
    elasticity: t('Rib cuff or elasticated (per item)', '罗纹或弹力 (按品类)', 'Rippbund oder elastisch', 'Côte élastique', 'リブまたは伸縮性', '립 또는 신축성'),
  },
  materialStory: t('Knitted or woven on the same equipment as our scarves. Cashmere gloves use 2/26 Nm worsted, beanies and socks use soft woolen-spun 2/26-2/32 Nm.', '我们的羊绒配饰用与围巾相同的设备。手套用 2/26 Nm 精纺，帽子袜子用 2/26-2/32 Nm 粗纺。', 'Auf derselben Ausrüstung wie unsere Schals hergestellt. Handschuhe 2/26 Nm Kammgarn, Mützen und Socken 2/26-2/32 Nm Streichgarn.', 'Fabriqué sur le même équipement que nos écharpes.', 'スカーフと同じ設備。グローブは 2/26 Nm 梳毛、帽子・靴下は 2/26-2/32 Nm 梳毛。', '스카프와 동일한 설비. 장갑은 2/26 Nm 워스티드, 모자/양말은 2/26-2/32 Nm 울렌.'),
  customServiceTitle: t('Custom Cashmere Accessories Manufacturing', '羊绒配饰定制服务', 'Maßgefertigte Kaschmir-Accessoires', 'Fabrication d\'accessoires en cachemire sur mesure', 'カスタムカシミアアクセサリ', '맞춤 캐시미어 액세서리'),
  whyChooseTitle: t('Why Choose Our Cashmere Accessories Factory', '为什么选择我们的羊绒配饰工厂', 'Warum Sie unsere Kaschmir-Accessoires-Fabrik wählen sollten', 'Pourquoi choisir notre usine d\'accessoires', 'なぜ当社のカシミアアクセサリ工場を選ぶのか', '저희 캐시미어 액세서리 공장을 선택해야 하는 이유'),
  customServiceBullets: scarves.customServiceBullets,
  whyChooseBullets: scarves.whyChooseBullets,
};

const yarn: ProductDetail = {
  technicalSpecs: {
    material: t('100% Inner Mongolia Grade A cashmere', '100% 内蒙古 A 级羊绒', '100% kaschmir Inneren Mongolei Güteklasse A', '100% cachemire Mongolie grade A', '100% 内モンゴル A 級カシミア', '100% 내몽골 A 등급 캐시미어'),
    knitting: t('Worsted on Italian Sant\'Agostino / French NCSI frames', '意大利 Sant\'Agostino / 法国 NCSI 细纱机', 'Italienische Sant\'Agostino / Französische NCSI', 'Sant\'Agostino italien / NCSI français', 'イタリア Sant\'Agostino / フランス NCSI 紡機', '이탈리아 Sant\'Agostino / 프랑스 NCSI 방적기'),
    pattern: t('Single strand; 2-ply twisted', '单股；2 股合捻', 'Einfachstrang; 2-fach gezwirnt', 'Monobrins; 2 bouts retordus', '単糸; 双糸撚り', '단사; 2합사'),
    weight: t('Per kg (1-cone = 50g-1kg depending on count)', '按公斤 (1 筒 50g-1kg 取决于支数)', 'Pro kg (1 Spule = 50g-1kg)', 'Par kg (1 cône = 50g-1kg)', 'kg単位 (1コーン = 50g-1kg)', 'kg당 (1 cone = 50g-1kg)'),
    season: t('Year-round', '全年', 'Ganzjährig', 'Toute l\'année', '周年', '연중'),
    sizes: t('2/26 Nm to 2/60 Nm (custom counts 50kg+ MOQ)', '2/26 至 2/60 Nm (定制支数 50kg+ 起)', '2/26 bis 2/60 Nm', '2/26 à 2/60 Nm', '2/26 〜 2/60 Nm', '2/26 ~ 2/60 Nm'),
    colors: t('Bleached / Natural white / Top-dyed / Hank-dyed', '漂白 / 本白 / 染纱 / 绞染', 'Gebleicht / Naturweiß / Strang- / Flottengfärbt', 'Blanchi / Naturel / Teint en masse / Teint en écheveau', '漂白 / 生成り / トップ染め / かせ染め', '표백 / 본화 / 톱염 / 꼬임염'),
    function: t('Knitting, weaving, machine + hand knit', '针织、机织、机织 + 手织', 'Stricken, Weben, Maschine + Hand', 'Tricotage, tissage, machine + main', 'ニット, 織物, 機械+手編み', '편성, 직조, 기계 + 손'),
    gender: t('Unisex', '中性', 'Unisex', 'Unisexe', 'ユニセックス', '유니섹스'),
    moq: t('1 kg per color per count', '每支每色 1 kg', '1 kg pro Farbe pro Stärke', '1 kg par couleur par titre', '色ごと番手 1kg〜', '색상·번수당 1kg'),
    careMethod: t('Store in dry place; handle gently to preserve loft', '存放干燥处；轻柔处理保持蓬松', 'Trocken lagern; sanft behandeln', 'Stocker au sec; manipuler doucement', '乾燥保存; 優しく取り扱い', '건조 보관; 부드럽게 취급'),
    customization: t('Custom count / color / cone size / oil content', '定制支数 / 颜色 / 筒规格 / 含油率', 'Kundenspezifische Stärke / Farbe / Spulengröße / Ölgehalt', 'Personnalisé: titre / couleur / cône / huile', 'カスタム番手/色/コーンサイズ/油分', '맞춤 번수 / 색상 / cone 사이즈 / 오일 함량'),
    origin: t('Inner Mongolia, China', '中国内蒙古', 'Innere Mongolei, China', 'Mongolie Intérieure', '中国内モンゴル', '중국 내몽골'),
    technology: t('Worsted spinning (semi-worsted optional)', '精纺 (可选半精纺)', 'Kammgarn (Semi-Worsted optional)', 'Peigné (semi-peigné en option)', '梳毛紡績', '워스티드 방적 (반워스티드 옵션)'),
    elasticity: t('8-12% stretch', '8-12% 弹性', '8-12% Dehnung', '8-12% stretch', '8-12% ストレッチ', '8-12% 신축'),
  },
  materialStory: t('Worsted-spun on Italian Sant\'Agostino frames, our 2/26 to 2/60 Nm yarn uses Albus goat cashmere, hand-sorted and OFDA-tested per batch.', '我们的 2/26 至 2/60 Nm 精纺纱线在意大利 Sant\'Agostino 细纱机上纺制，使用阿尔巴斯白山羊绒，每批手工分拣 + OFDA 测试。', 'Kammgarn auf italienischen Sant\'Agostino-Spinnmaschinen, 2/26 bis 2/60 Nm.', 'Filé peigné sur métiers italiens Sant\'Agostino.', 'イタリア Sant\'Agostino 紡機, 2/26 〜 2/60 Nm。', '이탈리아 Sant\'Agostino 방적기, 2/26 ~ 2/60 Nm.'),
  process: t('6 stages: dehaired → gilled → combed → drawn → roving → spun. Each stage has its own QC checkpoint.', '6 道工序: 分梳 → 针梳 → 精梳 → 并条 → 粗纱 → 细纱。每道有 QC 节点。', '6 Stufen: enthaart → genadelt → gekämmt → gestreckt → Vorgarn → gesponnen.', '6 étapes: désourlage → aiguilletage → peignage → étirage → boudinage → filage.', '6 工程: 脱毛 → ギリング → コーミング → ドローイング → ロービング → 紡績。', '6단계: 제모 → 길링 → 코밍 → 드로잉 → 로빙 → 방적.'),
  customServiceTitle: t('Custom Cashmere Yarn Spinning', '羊绒纱线定制', 'Maßgefertigtes Kaschmirgarn-Spinnen', 'Filage de cachemire personnalisé', 'カスタムカシミア糸紡績', '맞춤 캐시미어 원사 방적'),
  customServiceBullets: [
    t('Custom Nm counts (2/16 to 2/120)', '定制 Nm 支数 (2/16 至 2/120)', 'Kundenspezifische Nm-Titer', 'Titres Nm personnalisés', 'カスタム Nm 番手 (2/16 〜 2/120)', '맞춤 Nm 번수 (2/16 ~ 2/120)'),
    t('Pantone color matching (5kg min per color)', 'Pantone 染色 (5kg/色起)', 'Pantone-Farbanpassung (5kg min)', 'Correspondance Pantone (5kg min)', 'Pantone カラー (5kg〜)', 'Pantone 색상 (5kg 이상)'),
    t('Worsted or woolen spinning', '精纺或粗纺', 'Kammgarn oder Streichgarn', 'Peigné ou cardé', '梳毛または梳毛', '워스티드 또는 울렌'),
    t('Anti-pilling treatment available', '抗起球处理可选', 'Anti-Pilling-Behandlung verfügbar', 'Traitement anti-bouloches disponible', 'アンチピリング処理可', '안티필링 처리 가능'),
    t('100% cashmere or cashmere blends', '100% 羊绒或混纺', '100% Kaschmir oder Mischungen', '100% cachemire ou mélanges', '100% カシミアまたは混紡', '100% 캐시미어 또는 혼방'),
    t('Cone or hank delivery (hank requires +$0.50/kg)', '锥形筒或绞纱 (绞纱加 $0.50/kg)', 'Konus- oder Stranglieferung', 'Livraison cône ou écheveau', 'コーンまたはハンク', '콘 또는 행크 배송'),
  ],
  whyChooseTitle: t('Why Choose Our Cashmere Yarn Mill', '为什么选择我们的羊绒纱线厂', 'Warum Sie unsere Kaschmirgarn-Spinnerei wählen sollten', 'Pourquoi choisir notre filature de cachemire', 'なぜ当社のカシミア糸工場を選ぶのか', '저희 캐시미어 원사 방적 공장을 선택해야 하는 이유'),
  whyChooseBullets: [
    t('Italian Sant\'Agostino and Cognetex spinning frames', '意大利 Sant\'Agostino + Cognetex 细纱机', 'Italienische Sant\'Agostino- und Cognetex-Spinnmaschinen', 'Métiers italiens Sant\'Agostino et Cognetex', 'イタリア Sant\'Agostino / Cognetex 紡機', '이탈리아 Sant\'Agostino / Cognetex 방적기'),
    t('OFDA 2000 testing on every batch', '每批 OFDA 2000 检测', 'OFDA 2000 Prüfung pro Charge', 'Test OFDA 2000 par lot', '各バッチ OFDA 2000 検査', '모든 배치 OFDA 2000 검사'),
    t('73 stock Nm counts (2/26 to 2/60)', '73 个常备 Nm 支数 (2/26 至 2/60)', '73 Standard-Nm-Titer', '73 titres Nm en stock', '73 在庫 Nm 番手', '73 재고 Nm 번수'),
    t('15-25 day lead time for custom counts', '定制支数 15-25 天', '15-25 Tage für kundenspezifische Titer', '15-25 jours pour titres personnalisés', 'カスタム 15-25 日', '맞춤 번수 15-25일'),
    t('Direct mill pricing, no middleman', '源头工厂价，无中间商', 'Direkte Fabrikpreise', 'Prix d\'usine direct', '直接工場価格', '직접 공장 가격'),
    t('Large capacity: 1,200+ tons/year', '产能: 1,200+ 吨/年', 'Großkapazität', 'Grande capacité', '大規模生産能力', '대용량: 1,200+톤/년'),
  ],
  applicationsTitle: t('Yarn Applications', '纱线应用', 'Garn-Anwendungen', 'Applications du fil', '糸の用途', '원사 용도'),
  applicationScenarios: [
    t('Hand knitting (luxury yarn for designers)', '手织（设计师用奢华纱线）', 'Handstricken', 'Tricot à la main', '手編み', '손뜨개'),
    t('Machine knitting (industrial knitwear)', '机织（工业针织）', 'Maschinenstricken', 'Tricotage machine', '機械編み', '편물기'),
    t('Weaving (suiting, coating, scarves)', '梭织（西装、大衣、围巾）', 'Weben', 'Tissage', '製織', '직조'),
    t('Blending with silk, merino, or other fibers', '与真丝/美利奴等混纺', 'Mischen mit Seide, Merino', 'Mélange avec soie, mérinos', 'シルク・メリノ混紡', '실크/메리노 혼방'),
    t('Export to overseas mills and brands', '出口海外工厂和品牌', 'Export in ausländische Mühlen und Marken', 'Export vers moulins et marques', '海外紡績・ブランドへの輸出', '해외 방적공장·브랜드 수출'),
  ],
  careInstructions: t('Store in original cone form. Avoid direct sunlight and humidity above 65%.', '保持原锥形存放。避免阳光直射和 65% 以上湿度。', 'In Original-Konusform lagern. Direktes Sonnenlicht und über 65% Luftfeuchtigkeit vermeiden.', 'Stocker en cône d\'origine. Éviter soleil direct et humidité > 65%.', '元のコーン形で保管。直射日光と湿度 65% 以上を避ける。', '원래 콘 형태로 보관. 직사광선과 습도 65% 이상 피하기.'),
  certifications: ['ISO 9001:2015', 'OEKO-TEX Standard 100', 'BSCI'],
  faq: [
    { q: t('What Nm counts are in stock?', '常备哪些 Nm 支数？', 'Welche Nm-Titer sind auf Lager?', 'Quels titres Nm en stock?', '在庫 Nm 番手は?', '재고 Nm 번수는?'), a: t('2/26, 2/32, 2/36, 2/48, 2/60. Custom counts 2/16-2/80 available 200kg+ MOQ.', '2/26, 2/32, 2/36, 2/48, 2/60。定制 2/16-2/80 需 200kg+。', '2/26, 2/32, 2/36, 2/48, 2/60. Maßtiter 2/16-2/80 bei 200kg+ MOQ.', '2/26, 2/32, 2/36, 2/48, 2/60. Titres perso 2/16-2/80, MOQ 200kg+.', '2/26, 2/32, 2/36, 2/48, 2/60。カスタム 2/16-2/80、200kg〜。', '2/26, 2/32, 2/36, 2/48, 2/60. 맞춤 2/16-2/80, 200kg 이상.') },
    { q: t('Do you offer anti-pilling treatment?', '提供抗起球处理吗？', 'Bieten Sie Anti-Pilling-Behandlung?', 'Offrez-vous un traitement anti-bouloches?', 'アンチピリング処理はありますか?', '안티필링 처리를 제공하나요?'), a: t('Yes, mild enzyme wash that digests short surface fibers. Reduces pilling by 60-70% over 50 wears. Adds USD 0.30-0.50/kg.', '有，轻酶洗，消化表面短纤维，50 次穿着起球减少 60-70%。加 USD 0.30-0.50/kg。', 'Ja, milde Enzymwäsche. Reduziert Pilling um 60-70% über 50 Tragezyklen. +USD 0,30-0,50/kg.', 'Oui, lavage enzymatique doux. Réduit bouloches de 60-70% sur 50 ports. +USD 0,30-0,50/kg.', 'はい、軽い酵素洗い。50 回着用で毛玉 60-70% 軽減。+USD 0.30-0.50/kg。', '예, 순한 효소 세척. 50회 착용 시 필링 60-70% 감소. +USD 0.30-0.50/kg.') },
    { q: t('What is the minimum order for custom Pantone color?', 'Pantone 定制染色的最小订单？', 'Mindestbestellung für Pantone-Farbe?', 'MOQ pour couleur Pantone personnalisée?', 'Pantone カラーの MOQ?', 'Pantone 색상 최소 주문은?'), a: t('5kg per color, 25kg per order. Lead time 15-20 days from lab dip approval.', '每色 5kg，每单 25kg。打样批准后 15-20 天。', '5kg pro Farbe, 25kg pro Auftrag. 15-20 Tage nach Labormusterfreigabe.', '5kg par couleur, 25kg par commande. 15-20 jours après validation labo.', '各色 5kg、注文 25kg。ラボダイ承認後 15-20 日。', '색상당 5kg, 주문당 25kg. 랩 다이 승인 후 15-20일.') },
    { q: t('Cone or hank delivery?', '锥形筒还是绞纱？', 'Konus oder Stranglieferung?', 'Livraison cône ou écheveau?', 'コーンかハンクか?', '콘 또는 행크 배송?'), a: t('Standard: cone (cone 100-250g depending on count). Hank: +USD 0.50/kg, 5-7 days extra.', '默认: 锥形筒 (100-250g 视支数)。绞纱加 USD 0.50/kg, 5-7 天。', 'Standard: Konus (100-250g je nach Titer). Strang: +USD 0,50/kg, +5-7 Tage.', 'Standard: cône (100-250g selon titre). Écheveau: +USD 0,50/kg, +5-7 jours.', '標準: コーン (100-250g)。ハンク: +USD 0.50/kg、+5-7 日。', '기본: 콘 (100-250g). 행크: +USD 0.50/kg, +5-7일.') },
  ],
};

export const productDetails: ProductDetailMap = {
  // Category-level defaults (fallback)
  scarves,
  sweaters,
  hats,
  accessories,
  yarn,
  // Product-level overrides would go here, e.g.:
  // 'scarves-100': { ...scarves, customOptions: ['Special option for this product'] }
};