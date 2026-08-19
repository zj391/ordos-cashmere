/**
 *
 * Product sub-type detail data (overa-).
 *
 * Split each top-level category (scarves, sweaters, hats, accessories, yarn)
 * into 3-5 sub-types. Each sub-type overrides a small subset of fields
 * (materialStory, process, whyChooseBullets, applicationScenarios, faq)
 * with content tailored to that sub-type. Fields not overridden fall back
 * to the category-level default in product-details.ts.
 *
 * Routing: getProductSubType(product) maps a product id + name to a
 * sub-type key, e.g. 'scarves:printed' or 'sweaters:cardigan'. The detail
 * resolver looks up `productDetails[cat.subType] || productDetails[cat.id]`.
 *
 * Sub-type keys use ':' separator so they coexist cleanly with the existing
 * 'scarves' / 'sweaters' / etc. category keys in the ProductDetailMap.
 */

import type { ProductDetail } from './product-details';

const t = (en: string, cn: string, de: string, fr: string, ja: string, kr: string) =>
  ({ en, cn, de, fr, ja, kr });

// ============================================================
// SCARVES sub-types (4)
// ============================================================

// Printed scarves: digital print / pattern / custom design
const scarvesPrinted: Partial<ProductDetail> = {
  materialStory: t(
    'Our printed cashmere scarves use the same Grade A Mongolian cashmere fiber as our solid scarves, but the woven greige cloth is digitally printed on Italian MS JP7 inkjet printers using reactive dyes that bond at the molecular level. Print resolution up to 1440 dpi allows for photorealistic patterns, brand logos, and gradient designs without compromising the cashmere hand-feel.',
    '我们的印花羊绒围巾使用与素色围巾相同的 A 级蒙古羊绒，但印花工艺采用意大利 MS JP7 数码印花机和活性染料分子级固色。1440 dpi 分辨率可呈现照片级图案、品牌 logo 和渐变设计，同时保持羊绒手感。',
    'Unsere bedruckten Kaschmirschals verwenden die gleiche mongolische Kaschmirfaser der Klasse A wie unsere Uni-Schals, jedoch wird das gewebte Rohgewebe auf italienischen MS-JP7-Tintenstrahldruckern mit Reaktivfarbstoffen bedruckt, die sich auf molekularer Ebene verbinden.',
    'Nos écharpes cachemire imprimées utilisent la même fibre mongole Grade A que nos écharpes unies, mais le tissu écru est imprimé numériquement sur des imprimantes italiennes MS JP7 avec des colorants réactifs.',
    '当社のプリント・カシミアスカーフは、染色カシミアと同じ A 級モンゴル産カシミア繊維を使用。インクジェット印刷はイタリア MS JP7 機で反応染料による分子結合。',
    '저희 인쇄 캐시미어 스카프는 무지 캐시미어와 동일한 A급 몽골 캐시미어 섬유를 사용하지만, 날염은 이탈리아 MS JP7 잉크젯 프린터와 반응성 염료로 분자 수준에서 결합.',
  ),
  process: t(
    'Greige cloth is woven first (2/48 Nm, 5 picks/cm), then scoured and bleached, then printed in a single pass on MS JP7, then washed at 30°C to remove excess dye, then steamed for color fixation, then softened, then hand-fringed.',
    '坯布（2/48 Nm、5 纬/cm）先织造，然后煮练漂白，再用 MS JP7 单道印花，30°C 水洗除浮色，蒸汽固色，柔软处理，最后手工流苏。',
    'Rohgewebe wird zuerst gewebt (2/48 Nm, 5 Schuss/cm), dann gewaschen und gebleicht, dann in einem Durchgang auf MS JP7 bedruckt.',
    'Le tissu écru est d\'abord tissé (2/48 Nm, 5 duites/cm), puis lavé et blanchi, puis imprimé en une passe sur MS JP7.',
    '生地をまず織り (2/48 Nm、5 打ち/cm)、精練・漂白、MS JP7 で 1 パス印刷、30°C 洗浄で余剰染料を除去、スチームで色止め、柔軟加工、手作業フリンジ。',
    '생지 먼저 직조 (2/48 Nm, 5 위사/cm), 정련 및 표백, MS JP7에서 1회 나염, 30°C 수세, 스팀 고색, 유연화, 수작업 프린지.',
  ),
  whyChooseBullets: [
    t('Photorealistic print quality at 1440 dpi', '1440 dpi 照片级印花质量', 'Fotorealistische Druckqualität bei 1440 dpi', 'Qualité d\'impression photoréaliste à 1440 dpi', '1440 dpi の写真品質プリント', '1440 dpi 사진 품질 나염'),
    t('Reactive-dye bonding: 50+ wash cycles without fade', '活性染料固色: 50+ 次水洗不褪色', 'Reaktivfarbstoff-Bindung: 50+ Waschzyklen ohne Verblassen', 'Colorants réactifs: 50+ cycles de lavage sans décoloration', '反応染料: 50 回以上洗濯で色褪せなし', '반응성 염료: 50회 이상 세탁에도 변색 없음'),
    t('Custom Pantone matching on both base color and print layer', '底色和印花双层 Pantone 配色', 'Pantone-Anpassung für Grund und Druck', 'Correspondance Pantone sur fond et impression', 'ベース色・プリント色とも Pantone 対応', '배경과 나염 모두 Pantone 매칭'),
    t('Low MOQ 50 pcs per design (vs 200+ for woven jacquard)', '50 件起小批量（vs 提花 200+ 件起）', 'MOQ ab 50 Stk. pro Design (vs 200+ für Jacquard)', 'MOQ 50 pièces par design (vs 200+ jacquard)', 'デザイン 50 点〜（ジャカード 200+）', '디자인당 50개 (자카드 200개 이상)'),
    t('Photo + brand logo + monogram on one scarf', '同一围巾印照片 + 品牌 logo + 首字母', 'Foto + Markenlogo + Monogramm auf einem Schal', 'Photo + logo + monogramme sur une écharpe', '写真 + ロゴ + モノグラム', '사진 + 로고 + 모노그램'),
    t('14-day sampling turnaround from approved artwork', '确认稿件后 14 天出样', '14 Tage Musterumlauf ab genehmigter Vorlage', 'Échantillon en 14 jours après BAT approuvé', '校了後 14 日サンプル', '원고 승인 후 14일 샘플'),
  ],
  applicationScenarios: [
    t('Brand collab capsule collections (art-driven scarves)', '品牌联名胶囊系列（艺术图案）', 'Marken-Kollaborationen (kunstorientvolle Schals)', 'Capsules de collaboration artistique', 'ブランドコラボレーション（アート系）', '브랜드 협업 캡슐 컬렉션'),
    t('Limited-edition holiday drops', '节日限量发售', 'Limitierte Feiertagseditionen', 'Éditions limitées saisonnières', 'ホリデー限定ドロップ', '시즌 한정판'),
    t('Photo-realistic nature or travel patterns', '自然或旅行摄影照片图案', 'Fotorealistische Natur- oder Reise-Motive', 'Motifs nature ou voyage photo-réalistes', '自然・旅のフォトリアル柄', '자연·여행 사진 패턴'),
    t('Brand logo or corporate gifting', '品牌 logo 或企业礼品', 'Markenlogo oder Firmengeschenke', 'Logo de marque ou cadeaux d\'entreprise', 'ブランドロゴ・法人ギフト', '브랜드 로고 또는 기업 선물'),
    t('Retail collections that need unique IP per drop', '每季独立 IP 的零售系列', 'Retail-Kollektionen mit einzigartigem IP pro Drop', 'Collections retail avec IP unique', '小売ドロップごとの独自 IP', '드롭별 독자 IP가 필요한 리테일'),
  ],
  faq: [
    { q: t('How do you print on cashmere without affecting hand-feel?', '如何在羊绒上印花不影响手感？', 'Wie drucken Sie auf Kaschmir ohne den Griff zu beeinträchtigen?', 'Comment imprimez-vous sur le cachemire sans affecter le toucher?', 'カシミアの風合いを損なわずにプリントするには?', '캐시미어 촉감에 영향 없이 나염하는 방법은?'),
      a: t('Reactive dyes bond at the molecular level with cashmere fiber, so the print sits inside the fiber rather than as a surface coating. Post-print washing removes excess dye, and the fabric is softened with eco-friendly agents. The result is a printed scarf indistinguishable from solid-dyed cashmere in hand-feel.', '活性染料在分子级与羊绒纤维结合，印花是"纤维内部"而非"表面涂层"。印花后水洗除浮色，再用环保柔顺剂处理。结果是印花围巾与染色围巾手感无明显差异。', 'Reaktivfarbstoffe verbinden sich auf molekularer Ebene mit der Kaschmirfaser, sodass der Druck innerhalb der Faser sitzt.', 'Les colorants réactifs se lient au niveau moléculaire à la fibre cachemire, donc l\'impression est à l\'intérieur de la fibre.', '反応染料はカシミア繊維と分子レベルで結合するため、プリントは繊維内側に。', '반응성 염료는 캐시미어 섬유와 분자 수준에서 결합하므로 나염이 섬유 내부에 자리잡습니다.') },
    { q: t('What artwork file format do you need?', '需要什么格式的稿件？', 'Welches Kunstdatei-Format benötigen Sie?', 'Quel format de fichier artistique?', 'アートワークのファイル形式は?', '원고 파일 형식이 어떻게 되나요?'),
      a: t('AI/EPS/PDF vector preferred at 1:1 scale with Pantone references for spot colors. Photographic prints need 300+ dpi TIFF/PSD. Free our design service within 24 hours from sketch or photo reference.', '首选 AI/EPS/PDF 矢量、Pantone 色号；摄影类需 300+ dpi TIFF/PSD。草图或照片参考我们免费24小时内出设计稿。', 'AI/EPS/PDF Vektor bevorzugt mit Pantone-Referenzen. Fotografische Drucke benötigen 300+ dpi TIFF/PSD.', 'AI/EPS/PDF vectoriel préféré avec références Pantone. Impressions photo : 300+ dpi TIFF/PSD.', 'AI/EPS/PDF ベクター推奨（スポット色は Pantone）。写真印刷は 300+ dpi TIFF/PSD。', 'AI/EPS/PDF 벡터 + Pantone 참조 권장. 사진 인쇄는 300+ dpi TIFF/PSD.' ) },
    { q: t('How many Pantone colors per design?', '每款设计几个 Pantone 色？', 'Wie viele Pantone-Farben pro Design?', 'Combien de Pantone par design?', '1 デザインの Pantone 数は?', '디자인당 Pantone 색상은 몇 개?'),
      a: t('Up to 8 Pantone colors per design at no surcharge. 9-12 colors adds USD 0.20-0.40 per piece. 13+ colors requires multi-pass printing and adds USD 0.50-1.00 per piece.', '每款 8 色以内不加价。9-12 色加 USD 0.20-0.40/件。13+ 色需多道印花，加 USD 0.50-1.00/件。', 'Bis zu 8 Pantone pro Design ohne Aufpreis. 9-12 Farben +USD 0,20-0,40/Stk.', 'Jusqu\'à 8 Pantone par design sans surcharge. 9-12 +USD 0,20-0,40/pièce.', '8 色まで追加料金なし。9-12 は +USD 0.20-0.40/枚。', '디자인당 8 색까지 추가 비용 없음. 9-12 색 +USD 0.20-0.40/매.' ) },
    { q: t('Will printed colors fade after washing?', '印花水洗后会褪色吗？', 'Verblassen Druckfarben nach dem Waschen?', 'Les couleurs imprimées décolorent-elles au lavage?', 'プリント色は洗濯で褪せますか?', '나염 색상은 세탁 후 변색되나요?'),
      a: t('Reactive dyes have a 4-5 grade color fastness rating. With cold hand-wash and cashmere shampoo, colors remain vivid for 50+ wash cycles. Avoid bleach, hot water, and direct sunlight drying.', '活性染料色牢度 4-5 级。冷水手洗 + 羊绒专用洗涤剂，50+ 次水洗仍鲜艳。避免漂白剂、热水、阳光直晒晾干。', 'Reaktivfarbstoffe haben Note 4-5 Farbechtheit. Mit kalter Handwäsche 50+ Waschzyklen farbecht.', 'Colorants réactifs ont une solidité de grade 4-5. 50+ lavages à froid sans décoloration.', '反応染料は 4-5 級。冷水手洗で 50 回以上洗濯後も鮮明。', '반응성 염료는 4-5급 색 견뢰도. 찬물 손빨래 시 50회 이상 세탁 후에도 선명.' ) },
    { q: t('Can printed scarves match the same care as solid cashmere?', '印花围巾和素色羊绒洗护方法相同吗？', 'Gelten für bedruckte Schals die gleichen Pflegehinweise?', 'Les écharpes imprimées ont-elles le même entretien?', 'プリントスカーフのケアは染色と同じ?', '나염 스카프도 무지 캐시미어와 같은 관리가 가능한가요?'),
      a: t('Yes. Cold hand-wash with cashmere shampoo, lay flat to dry, dry clean safe. The print is molecular-level bonded and survives standard cashmere care cycles.', '可以。冷水手洗 + 羊绒专用洗涤剂，平铺晾干，可干洗。印花分子级结合，标准羊绒洗护即可。', 'Ja. Handwäsche kalt, liegend trocknen, chemische Reinigung möglich.', 'Oui. Lavage main froid, séchage à plat, nettoyage à sec.', 'はい。冷水手洗い、平干し、ドライクリーニング可。', '예. 찬물 손빨래, 평건조, 드라이클리닝 안전.' ) },
  ],
};

// Shawl/wrap scarves: oversized, drape-forward
const scarvesShawl: Partial<ProductDetail> = {
  materialStory: t(
    'Cashmere shawls and wraps are made on the same Toyota JAT810 looms as our classic scarves but at 30% wider greige cloth (typically 200×100 cm vs 190×45 cm). The extra width creates the signature drape that distinguishes a shawl from a standard scarf — fuller coverage, softer fall, and a more elegant silhouette when worn over the shoulders.',
    '我们的羊绒披肩使用与经典围巾相同的丰田 JAT810 织机，但坯布宽度增加 30%（通常 200×100 cm vs 190×45 cm）。额外的宽度造就披肩独特的垂感——更全面的覆盖、更柔软的垂落、更优雅的肩部轮廓。',
    'Kaschmirschals und -wraps werden auf denselben Toyota JAT810-Webstühlen wie unsere klassischen Schals hergestellt, jedoch 30 % breiteres Rohgewebe (typischerweise 200×100 cm vs 190×45 cm).',
    'Châles et wraps cachemire sont fabriqués sur les mêmes métiers Toyota JAT810 que nos écharpes classiques, mais avec un tissu écru 30% plus large.',
    'カシミア・ショールとラップは、クラシックスカーフと同じ豊田 JAT810 織機で作られていますが、生地幅が 30% 広くなります（通常 200×100 cm vs 190×45 cm）。',
    '캐시미어 숄과 랩은 클래식 스카프와 동일한 도요타 JAT810 직기에서 직조되지만, 생지 폭이 30% 더 넓습니다 (일반적으로 200×100 cm 대 190×45 cm).',
  ),
  process: t(
    'Same 4-stage combing as classic scarves, with wider warping (900+ ends vs 700) and 5 picks/cm density to maintain fabric stability at greater width. Hand-fringed on all four sides for shawl-grade finishing.',
    '与经典围巾相同的 4 道分梳工序，整经数 900+ 根（vs 700），5 纬/cm 保持大宽度布面稳定。四边手工流苏用于披肩级收口。',
    'Gleiche 4-stufige Verarbeitung wie klassische Schals, mit breiterer Kettfadenführung (900+ vs 700) und 5 Schuss/cm Dichte für Stabilität bei größerer Breite.',
    'Même processus en 4 étapes que les écharpes classiques, avec ourdissage plus large (900+ vs 700) et densité 5 duites/cm.',
    'クラシック・スカーフと同じ 4 工程ですが、整経本数 900+ (vs 700)、密度 5 打ち/cm で幅広の安定性を確保。',
    '클래식 스카프와 동일한 4단계 공정, 정경 900올 이상 (700 대비), 5 위사/cm 밀도.',
  ),
  whyChooseBullets: [
    t('200×100 cm oversized format for shoulder draping', '200×100 cm 大尺寸适合肩披', '200×100 cm Überformat für Schulter-Drapierung', 'Format surdimensionné 200×100 cm pour draper', '200×100 cm オーバーサイズ', '200×100 cm 오버사이즈'),
    t('Heavier fabric weight (180-280 g) for warmth', '更重的布重（180-280 g）保暖', 'Schwereres Stoffgewicht (180-280 g) für Wärme', 'Poids tissu plus lourd (180-280 g) pour chaleur', 'より重い目付 (180-280 g) で保温', '더 무거운 원단 중량 (180-280 g)으로 보온'),
    t('4-side hand-fringed finishing (vs 2-side on scarves)', '四面手工流苏（vs 围巾两面）', '4-seitige Handfransen (vs 2-seitig bei Schals)', 'Franges 4 côtés (vs 2 sur écharpes)', '4 辺手作業フリンジ（スカーフは 2 辺）', '4면 수작업 프린지 (스카프 2면 대비)'),
    t('Light-as-air: 100% cashmere shawls under 200 g', '轻盈如羽：100% 羊绒披肩 < 200 g', 'Federleicht: 100% Kaschmir unter 200 g', 'Léger comme l\'air: châles 100% cachemire sous 200 g', '軽量: 100% カシミア 200g 以下', '공기처럼 가벼움: 100% 캐시미어 숄 200g 미만'),
    t('Ideal for evening wear and resort wardrobes', '适合晚装和度假衣橱', 'Ideal für Abendgarderobe und Resort-Kollektionen', 'Idéal pour tenues de soirée et garde-robe resort', 'イブニングやリゾート向け', '이브닝 웨어와 리조트 의류에 이상적'),
    t('Custom edge finishing (fringed, rolled hem, blanket stitch)', '定制边处理（流苏、卷边、毛毯针）', 'Kundenspezifische Kantenverarbeitung', 'Finition de bord personnalisée', 'カスタム縁仕上げ', '맞춤 가장자리 마감'),
  ],
  applicationScenarios: [
    t('Evening events and galas (over a slip dress)', '晚宴和晚会（披在连衣裙外）', 'Abendveranstaltungen und Galas', 'Soirées et galas', 'イブニング・ガラ', '이브닝 행사와 갈라'),
    t('Resort and cruise-wear capsule collections', '度假和邮轮胶囊系列', 'Resort- und Kreuzfahrt-Kapselkollektionen', 'Capsules resort et croisière', 'リゾート・クルーズ', '리조트와 크루즈 캡슐'),
    t('Mother-of-bride or wedding guest wraps', '母亲婚礼披肩', 'Mutter-der-Braut- oder Hochzeitsgast-Wraps', 'Wraps pour mariée ou invitée', '新郎新婦の母・ゲスト', '어머니 또는 결혼식 하객용 랩'),
    t('Heirloom gift sets (shawl + scarf combo)', '传家礼品套装（披肩 + 围巾）', 'Erbstück-Geschenksets (Schal + Wrap)', 'Coffrets héritages (châle + écharpe)', '伝家のギフトセット', '가문의 유품 선물 세트'),
    t('Editorial and fashion week styling', '编辑和时装周造型', 'Editorial und Fashion-Week-Styling', 'Stylisme éditorial et fashion week', 'エディトリアル・ファッションウィーク', '에디토리얼 및 패션위크 스타일링'),
  ],
};

// Tasseled scarves: fringed / decorative
const scarvesTasseled: Partial<ProductDetail> = {
  materialStory: t(
    'Our tasseled cashmere scarves use the same Grade A Mongolian cashmere as solid scarves, with hand-twisted fringe applied at both ends. The tassels are formed by separating warp threads into 4-6 bundles per side, hand-twisting each bundle for 5-7 cm, and sealing the tips with a single knot. This hand-finishing is what differentiates a luxury cashmere scarf from a machine-hemmed commodity product.',
    '我们的流苏羊绒围巾使用与素色相同的 A 级蒙古羊绒，两端手工扭转流苏。每个流苏由 4-6 束经线组成，手工扭转 5-7 cm，单结封口。这种手工收口是奢华羊绒围巾与机器收口商品的区别。',
    'Unsere getasselten Kaschmirschals verwenden die gleiche mongolische Kaschmirfaser der Klasse A wie Uni-Schals, mit handgedrehten Fransen an beiden Enden.',
    'Nos écharpes cachemire à franges utilisent la même fibre mongole Grade A que les unies, avec des franges torsadées à la main aux deux extrémités.',
    '当社のタッセル・カシミアスカーフは、無地カシミアと同じ A 級モンゴル産カシミアを使用し、両端に手作業でひねったタッセルを付けています。',
    '저희 술 장식 캐시미어 스카프는 무지 캐시미어와 동일한 A급 몽골 캐시미어를 사용하며, 양 끝에 손으로 비틀어 술 장식을 만듭니다.',
  ),
  process: t(
    '5-stage hand-finishing: weaving → eco-softener wash → hand separation of warp threads → twisting into 4-6 tassel bundles → hand knot sealing. Each scarf takes 20-30 minutes of hand work after weaving.',
    '5 道手工收口：织造 → 环保柔顺剂水洗 → 手工分经线 → 4-6 束扭转流苏 → 单结封口。每条围巾织造后需 20-30 分钟手工。',
    '5-stufige Handveredelung: Weben → Öko-Weichspüler-Wäsche → manuelle Kettfadentrennung → Drehen zu 4-6 Tassel-Bündeln → handgeknüpfter Verschluss.',
    'Finition manuelle en 5 étapes: tissage → lavage adoucissant écologique → séparation manuelle → torsion en 4-6 faisceaux → nouage final.',
    '5 工程手仕上げ: 製織 → エコ柔軟剤洗い → 手作業による経糸分離 → 4-6 タッセル束への撚り → 単結封止。',
    '5단계 수작업 마감: 직조 → 친환경 유연제 수세 → 경사사 수작업 분리 → 4-6 술 다발 꼬기 → 단매듭 봉인.',
  ),
  whyChooseBullets: [
    t('Hand-twisted tassels (no machine-hemmed ends)', '手工扭转流苏（非机器收口）', 'Handgedrehte Fransen (keine Maschinensäume)', 'Franges torsadées à la main (pas d\'ourlets machine)', '手作業ひねりタッセル', '수작업 꼬아 만든 술 (기계 마감 아님)'),
    t('4-6 tassel bundles per side, custom bundle count on request', '每侧 4-6 束流苏，可定制束数', '4-6 Tassel-Bündel pro Seite, kundenspezifisch', '4-6 faisceaux par côté, personnalisable', '片側 4-6 束、カスタム束数対応', '한쪽 4-6 술 다발, 맞춤 다발 수 가능'),
    t('Choose twisted, knotted, or pom-pom tassel style', '可选扭转流苏、扭结流苏或毛球流苏', 'Gewählt: gedreht, geknotet oder Pompon-Tassel', 'Torsadé, noué ou pompon', 'ねじり結び、ポンポン房スタイル', '꼬임, 매듭, 폼폼 술 스타일'),
    t('Both-end or four-end tasseling for shawl formats', '围巾两端或披肩四端流苏', 'Beidseitig oder vierseitig bei Schalformaten', 'Deux ou quatre extrémités pour châles', '両端または四端タッセル', '양 끝 또는 네 모서리 술 장식'),
    t('20-30 min hand work per scarf (vs 0 for commodity)', '每条 20-30 分钟手工（vs 商品 0 分钟）', '20-30 Min Handarbeit pro Schal (vs 0 für Massenware)', '20-30 min travail manuel par écharpe (vs 0)', '1 本 20-30 分の手工（コモディティは 0）', '스카프당 20-30분 수작업'),
    t('Artisan-finished scarves command 20-30% premium', '手工收口溢价 20-30%', 'Handgefertigte Schals erzielen 20-30% Aufschlag', 'Écharpes finies main commandent 20-30% prime', '手仕上げ品は 20-30% プレミアム', '수공예 마감 스카프는 20-30% 프리미엄'),
  ],
  applicationScenarios: [
    t('Premium boutique retail (signature piece)', '精品零售（主打款）', 'Premium-Boutique-Einzelhandel', 'Boutique premium (pièce phare)', 'プレミアム・ブティック', '프리미엄 부티크 소매 (시그니처)'),
    t('Holiday gift sets with branded gift box', '节日礼品套装 + 品牌礼盒', 'Feiertags-Geschenksets mit Markenbox', 'Coffrets fêtes avec boîte de marque', 'ホリデーギフト + ブランドボックス', '홀iday 선물 세트 + 브랜드 박스'),
    t('Corporate gifting with monogram tassels', '企业礼品 + 首字母流苏', 'Firmengeschenke mit Monogramm-Fransen', 'Cadeaux d\'entreprise avec franges monogrammées', 'モノグラム付き法人ギフト', '모노그램 술이 있는 기업 선물'),
    t('Wedding favors for guests', '婚礼回礼', 'Hochzeitsgeschenke für Gäste', 'Cadeaux de mariage pour invités', '結婚式のゲストギフト', '결혼식 하객 선물'),
    t('Luxury scarf bars and trunk shows', '奢华围巾店和展会', 'Luxus-Schal-Bars und Trunk Shows', 'Bars à écharpes de luxe et trunk shows', 'ラグジュアリー・スカーフバー、トランクショー', '럭셔리 스카프 바 및 트렁크쇼'),
  ],
};

// Hijab scarves: religious + modest wear
const scarbesHijab: Partial<ProductDetail> = {
  materialStory: t(
    'Our hijab and modest-wear cashmere scarves are designed for all-day wear comfort and modest drape. The 180×35 cm and 200×35 cm standard formats stay secure without pinning, and the 2/48 Nm worsted-spun yarn produces a fabric with just enough weight (90-120 g) to drape softly without slipping. Same Grade A Mongolian cashmere, but with non-slip finishing applied for active wear.',
    '我们的羊绒头巾和遮蔽穿戴围巾为全天舒适佩戴设计。180×35 cm 和 200×35 cm 标准尺寸无需别针即可稳固。2/48 Nm 精纺纱线重 90-120 g，自然垂落不滑落。同 A 级蒙古羊绒，但增加了防滑整理。',
    'Unsere Hijab- und Kaschmirschals für zurückhaltendes Tragen sind für ganztägigen Tragekomfort ausgelegt.',
    'Nos hijabs et écharpes cachemire pour port modeste sont conçus pour un confort toute la journée.',
    '当社のヒジャブおよび控えめな装いのためのカシミアスカーフは、一日中快適な着用感のために設計されています。',
    '저희 히잡 및 단정한 착용을 위한 캐시미어 스카프는 종일 착용 편안함을 위해 설계되었습니다.',
  ),
  process: t(
    'Same combing and weaving as our classic scarves, but with a non-slip finish applied post-weaving (silicon-based micro-dot treatment on the inner surface). The finish is invisible, breathable, and survives 30+ wash cycles.',
    '与经典围巾相同的分梳和织造工艺，但织造后添加防滑整理（基于硅胶微点处理的内表面）。整理剂不可见、透气、耐 30+ 次水洗。',
    'Gleiche Verarbeitung wie klassische Schals, aber mit rutschfester Appretur nach dem Weben (Silikon-Mikropunkt-Behandlung auf der Innenseite).',
    'Même processus que nos écharpes classiques, mais avec finition antidérapante post-tissage (micro-points silicone sur la face intérieure).',
    'クラシック・スカーフと同じ加工ですが、製織後に滑り止め仕上げ（内面にシリコン・マイクロドット処理）。',
    '클래식 스카프와 동일한 공정이지만, 직조 후 미끄럼 방지 마감 (내면에 실리콘 마이크로 도트 처리).',
  ),
  whyChooseBullets: [
    t('180×35 cm and 200×35 cm modest-wear formats', '180×35 cm 和 200×35 cm 遮蔽穿戴尺寸', '180×35 cm und 200×35 cm Formate für zurückhaltendes Tragen', 'Formats 180×35 cm et 200×35 cm pour port modeste', '180×35 cm / 200×35 cm 控えめ丈', '180×35 cm 및 200×35 cm 단정한 착용 사이즈'),
    t('Non-slip finish: stays in place without pins', '防滑整理：不需别针即可稳固', 'Rutschfeste Appretur: bleibt ohne Nadeln an Ort und Stelle', 'Finition antidérapante : reste en place sans épingles', '滑り止め加工：ピン不要', '미끄럼 방지 마감: 핀 없이 자리 고정'),
    t('Breathable for all-day wear (silicon finish is micro-thin)', '全天佩戴透气（硅胶处理微薄）', 'Atmungsaktiv für Ganztagestragen (Silikonfinish ist mikro-dünn)', 'Respirant pour port toute la journée', '一日中着用に快適', '종일 착용 가능 (실리콘 마감 극미세)'),
    t('Standard and custom widths available', '标准和定制宽度可选择', 'Standard- und kundenspezifische Breiten', 'Largeurs standard et personnalisées', '標準・カスタム幅', '표준 및 맞춤 너비'),
    t('Coordinated tonal palette: 12 stock colors', '协调色调：12 种常备颜色', 'Abgestimmte Tonpalette: 12 Lagerfarben', 'Palette tonale coordonnée: 12 couleurs stock', '12 色の標準パレット', '12가지 재고 컬러'),
    t('Modest-wear brands: private label packages', '遮蔽穿戴品牌：私人标签包装', 'Modestwear-Marken: Private-Label-Pakete', 'Marques modestes: paquets marque privée', '控えめ装いブランド向け', '단정한 의류 브랜드: 프라이빗 레이블 패키지'),
  ],
};

// ============================================================
// HATS sub-types (3)
// ============================================================

// Beanie: standard fold-up cuff
const hatsBeanie: Partial<ProductDetail> = {
  materialStory: t(
    'Beanies are our highest-volume hat style, knitted on 12-gauge Shima Seiki machines with 2/26 Nm woolen-spun cashmere for soft, lofty hand-feel. The fold-up cuff (typically 7-8 cm) is the signature element — it adds warmth over the ears and gives the beanie its structured silhouette. Adult sizes run 56-60 cm circumference; child sizes 48-54 cm.',
    '毛线帽是我们销量最高的帽子款式，使用 12 针 Shima Seiki 电脑横机和 2/26 Nm 粗纺羊绒纱线，手感柔软蓬松。翻边帽口（通常 7-8 cm）是标志性元素——保暖耳朵并赋予毛线帽结构化轮廓。成人尺寸 56-60 cm 头围；儿童 48-54 cm。',
    'Beanies sind unser meistverkaufter Hut-Stil, gestrickt auf 12-Gauge Shima Seiki Maschinen mit 2/26 Nm Streichgarn-Kaschmir.',
    'Les bonnets sont notre style de chapeau le plus vendu, tricotés sur des machines Shima Seiki 12 jauges avec du cachemire cardé 2/26 Nm.',
    'ビーニーは当社の最も生産量が多い帽子スタイルで、12 ゲージ島精機編み機と 2/26 Nm 梳毛紡績カシミアで編まれています。',
    '비니는 저희 가장 많이 생산되는 모자 스타일로, 12 게이지 시마세이기 편성기와 2/26 Nm 울렌 방적 캐시미어로 편성됩니다.',
  ),
  whyChooseBullets: [
    t('Fold-up cuff: 7-8 cm structured rib', '翻边帽口：7-8 cm 结构化罗纹', 'Umgeschlagenes Bündchen: 7-8 cm Rippe', 'Revers structuré 7-8 cm en côtes', '折り返し縁 7-8 cm リブ', '접이식 챙 7-8 cm 구조 립'),
    t('Adult sizes 56-60 cm, child 48-54 cm', '成人 56-60 cm，儿童 48-54 cm', 'Erwachsenengrößen 56-60 cm, Kind 48-54 cm', 'Tailles adulte 56-60 cm, enfant 48-54 cm', '大人 56-60 cm、子供 48-54 cm', '성인 56-60 cm, 아동 48-54 cm'),
    t('Soft woolen-spun yarn for lofty hand-feel', '粗纺纱线手感蓬松柔软', 'Streichgarn für lockeren Griff', 'Fil cardé pour toucher duveteux', '梳毛紡績糸でふんわり', '울렌 방적 원사로 부드러운 촉감'),
    t('Logo embroidery on cuff edge', '帽口 logo 刺绣', 'Logo-Stickerei am Bündchenrand', 'Logo brodé sur revers', '縁へのロゴ刺繍', '챙 가장자리에 로고 자수'),
    t('Custom Pantone colorways (12 stock colors)', '定制 Pantone 色（12 种常备）', 'Kundenspezifische Pantone-Farben (12 Lagerfarben)', 'Couleurs Pantone personnalisées (12 stock)', 'Pantone カスタム（12 色在庫）', '맞춤 Pantone (재고 12색)'),
    t('Quick 25-30 day bulk production', '快速 25-30 天大货生产', 'Schnelle 25-30 Tage Serienproduktion', 'Production rapide 25-30 jours', '量産 25-30 日', '양산 25-30일'),
  ],
  applicationScenarios: [
    t('Boutique private label and gift sets', '精品私人品牌和礼品套装', 'Boutique-Private-Label und Geschenksets', 'Boutiques marque privée et coffrets', 'ブティック・プライベートラベル', '부티크 프라이빗 레이블 및 선물 세트'),
    t('Ski resort wear and après-ski lounge', '滑雪场服装和雪后休闲', 'Skigebiet und Après-Ski-Lounge', 'Vêtements de ski et lounge après-ski', 'スキー場・アフタースキー', '스키장 의복 및 애프터스키 라운지'),
    t('Streetwear capsule collections', '街头潮牌胶囊系列', 'Streetwear-Kapselkollektionen', 'Capsules streetwear', 'ストリートウェア・カプセル', '스트리트웨어 캡슐 컬렉션'),
    t('Corporate gifts with embroidered logos', '企业礼品 + logo 刺绣', 'Firmengeschenke mit Logo-Stickerei', 'Cadeaux d\'entreprise avec logos brodés', '法人ギフト + ロゴ刺繍', '기업 선물 + 로고 자수'),
    t('Travel retail and airport boutiques', '旅行零售和机场精品店', 'Travel-Retail und Flughafen-Boutiquen', 'Travel retail et boutiques aéroport', 'トラベルリテール・空港ブティック', '여행 소매 및 공항 부티크'),
  ],
};

// Beret: French-style fashion hat
const hatsBeret: Partial<ProductDetail> = {
  materialStory: t(
    'Berets are knitted on the same 12-gauge Shima Seiki machines as beanies but with a wider crown (typically 22-24 cm) and a flat, circular silhouette finished with a soft suedine or leather trim. The cashmere is 3-ply for body and structure, giving the beret its characteristic soft, slouchy drape that holds shape without rigidity.',
    '贝雷帽使用与毛线帽相同的 12 针 Shima Seiki 机器编织，但冠部更宽（通常 22-24 cm），平面圆形轮廓配以柔软仿麂皮或皮革收口。羊绒 3 股加厚版提供身体感和结构感，使贝雷帽保持柔软垂坠形状而不僵硬。',
    'Berets werden auf denselben 12-Gauge Shima Seiki Maschinen wie Beanies gestrickt, jedoch mit breiterer Krone (typischerweise 22-24 cm) und flacher, kreisförmiger Silhouette mit weichem Wildleder- oder Lederbesatz.',
    'Les bérets sont tricotés sur les mêmes machines Shima Seiki 12 jauges que les bonnets, mais avec une calotte plus large (22-24 cm) et une silhouette plate et circulaire.',
    'ベレーはビニーと同じ 12 ゲージ島精機編み機で編まれますが、頂部が広く（22-24 cm）、柔らかいスエードまたは革トリムの平らな円形シルエット。',
    '베레는 비니와 동일한 12 게이지 시마세이기 편성기로 편성되지만, 더 넓은 크라운 (일반적으로 22-24 cm)과 부드러운 스웨이드 또는 가죽 마감의 평평한 원형 실루엣.',
  ),
  whyChooseBullets: [
    t('French-style beret silhouette with suedine trim', '法式贝雷帽轮廓 +仿麂皮收口', 'Französischer Beret mit Wildlederbesatz', 'Béret français avec finition suédine', 'フレンチスタイル + スエードトリム', '프렌치 스타일 베레 + 스웨이드 마감'),
    t('3-ply construction holds shape without rigidity', '3 股加厚结构保持形状不僵硬', '3-fädige Konstruktion hält Form ohne Steifheit', 'Construction 3 plis tient la forme sans rigidité', '3 ply 構造で形状保持しつつしなやか', '3ply 구조로 형태 유지하며 부드러움'),
    t('Logo embroidery on leather trim band', '皮革收口带 logo 刺绣', 'Logo-Stickerei am Lederbesatz', 'Logo brodé sur bande cuir', '革トリムへのロゴ刺繍', '가죽 마감 밴드에 로고 자수'),
    t('Sizes 55-60 cm adult, custom-fit on request', '成人 55-60 cm，可定制', 'Größen 55-60 cm Erwachsene, Sondergröße', 'Tailles 55-60 cm adulte, sur mesure', '大人 55-60 cm、特注サイズ対応', '성인 55-60 cm, 맞춤 사이즈 가능'),
    t('Mix of standard and Pantone custom colors', '常备色和 Pantone 定制色混合', 'Standard- und Pantone-Sonderfarben', 'Couleurs standard et Pantone personnalisées', '標準色 + Pantone カスタム', '표준 + Pantone 맞춤 색상'),
    t('Premium fashion positioning (3-4x beanie price)', '高端时尚定位（3-4 倍毛线帽价）', 'Premium-Mode-Positionierung (3-4x Beanie-Preis)', 'Positionnement premium (3-4x prix bonnet)', 'プレミアムファッション（3-4 倍）', '프리미엄 패션 포지셔닝 (비니 가격의 3-4배)'),
  ],
  applicationScenarios: [
    t('Parisian and European fashion collections', '巴黎和欧洲时尚系列', 'Pariser und europäische Modekollektionen', 'Collections mode parisiennes et européennes', 'パリ・ヨーロッパ・ファッション', '파리 및 유럽 패션 컬렉션'),
    t('Editorial styling and fashion week', '编辑造型和时装周', 'Editorial Styling und Modewoche', 'Stylisme éditorial et fashion week', 'エディトリアル・ファッションウィーク', '에디토리얼 스타일링 및 패션위크'),
    t('Vintage-inspired capsule collections', '复古灵感胶囊系列', 'Vintage-inspirierte Kapselkollektionen', 'Capsules inspirées vintage', 'ヴィンテージ風カプセル', '빈티지 영감 캡슐 컬렉션'),
    t('Boutique private label with custom trim', '精品私人品牌 + 定制收口', 'Boutique-Private-Label mit Sonderbesatz', 'Marque privée boutique avec finition custom', 'ブティック + カスタムトリム', '부티크 프라이빗 레이블 + 맞춤 마감'),
    t('Premium resort wear and cruise collections', '高端度假和邮轮系列', 'Premium-Resort- und Kreuzfahrt-Kollektionen', 'Resort premium et croisières', 'プレミアムリゾート・クルーズ', '프리미엄 리조트 및 크루즈'),
  ],
};

// Cap/visor: structured sport-meets-fashion
const hatsCap: Partial<ProductDetail> = {
  materialStory: t(
    'Our cashmere caps and visors blend sport-luxe with the warmth of cashmere. The structured 6-panel crown is knit on 7-gauge machines for body, then blocked and pressed for the iconic baseball cap silhouette. The visor is finished with a suedine underlayer. Cashmere caps are a niche luxury item — typically sold at 4-5x the price of cotton caps — and target fashion-forward buyers who value warmth without sacrificing style.',
    '我们的羊绒鸭舌帽和遮阳帽融合运动奢华与羊绒保暖。结构化 6 面板冠部用 7 针机器编织以提供挺括感，然后定型和整烫形成标志性棒球帽轮廓。帽檐有仿麂皮底层。羊绒鸭舌帽是小众奢华产品——通常售价是棉质帽的 4-5 倍——针对追求保暖又不牺牲风格的前卫买家。',
    'Unsere Kaschmirkappen und -visiere vereinen Sport-Luxus mit der Wärme von Kaschmir.',
    'Nos casquettes et visières cachemire mélangent sport-luxe avec la chaleur du cachemire.',
    '当社のカシミアキャップとバイザーは、スポーツ・ラグジュアリーとカシミアの暖かさを融合しています。',
    '저희 캐시미어 캡과 바이저는 스포츠 럭셔리와 캐시미어의 보온성을 결합합니다.',
  ),
  whyChooseBullets: [
    t('7-gauge knit: structured crown holds shape', '7 针编织：结构化冠部保持形状', '7-Gauge-Strick: strukturierte Krone hält Form', 'Tricot 7 jauges: calotte structurée', '7 ゲージ構造的クラウン', '7 게이지 편성: 구조적 크라운'),
    t('Suedine under-visor lining', '仿麂皮帽檐底层', 'Wildleder-Unterfutter am Visier', 'Doublure suédine sous visière', 'バイザー裏スエード', '바이저 아래 스웨이드 안감'),
    t('Adjustable leather strap with brass buckle', '可调节皮带 + 黄铜扣', 'Verstellbarer Lederriemen mit Messingschnalle', 'Sangle cuir réglable avec boucle laiton', '真鍮バックル付き調整可能ストラップ', '황동 버클 조절 가죽 스트랩'),
    t('Custom logo embroidery (front panel)', '前面板定制 logo 刺绣', 'Kundenspezifische Logo-Stickerei (Frontplatte)', 'Logo brodé personnalisé (panneau avant)', 'フロントパネル刺繍', '앞 패널 맞춤 로고 자수'),
    t('Sport-meets-fashion positioning', '运动 + 时尚定位', 'Sport-trifft-Mode-Positionierung', 'Positionnement sport-rencontre-mode', 'スポーツ × ファッション', '스포츠와 패션의 만남'),
    t('Pantone custom colors (8 stock + custom)', 'Pantone 定制色（8 常备 + 定制）', 'Pantone-Sonderfarben (8 Lager + Sonderanfertigung)', 'Couleurs Pantone personnalisées (8 stock + custom)', 'Pantone カスタム（8 色 + 特注）', 'Pantone 맞춤 (재고 8색 + 맞춤)'),
  ],
  applicationScenarios: [
    t('Athleisure and golf resort wear', '运动休闲和高尔夫度假装', 'Athleisure und Golf-Resort-Wear', 'Athleisure et tenue de golf resort', 'アスレジャー・ゴルフリゾート', '애슬레저 및 골프 리조트'),
    t('Premium streetwear collabs', '高端潮牌联名', 'Premium-Streetwear-Kollaborationen', 'Collaborations streetwear premium', 'プレミアム・ストリートコラボ', '프리미엄 스트리트웨어 협업'),
    t('Sport-meets-fashion editorial shoots', '运动 + 时尚编辑拍摄', 'Sport-Mode-Editorial-Shootings', 'Shootings éditoriaux sport-mode', 'スポーツ×ファッション 撮影', '스포츠-패션 에디토리얼 촬영'),
    t('Boutique accessories for capsule drops', '胶囊发布的精品配饰', 'Boutique-Accessoires für für Capsule-Drops', 'Accessoires boutique pour capsules', 'カプセル向け小物', '캡슐용 부티크 액세서리'),
    t('Premium men\'s and women\'s hat collections', '高端男女帽系列', 'Premium-Herren- und Damen-Hutkollektionen', 'Collections chapeaux homme/femme premium', 'プレミアム・メンズ/ウィメンズ', '프리미엄 남성/여성 모자'),
  ],
};

// ============================================================
// SWEATERS sub-types (4)
// ============================================================

// Pullover: classic crew/v-neck
const sweatersPullover: Partial<ProductDetail> = {
  materialStory: t(
    'Our cashmere pullovers are knitted on German STOLL CMS 530 HP flat knitting machines in 12-gauge for fine-gauge pullovers and 7-gauge for chunky. The yarn is 2/26 to 2/48 Nm worsted-spun cashmere depending on the gauge — finer yarn for finer gauge. Linking (seaming) is done by hand on a stitch-by-stitch basis, giving the pullover its seamless-look finish that distinguishes premium cashmere from mass-market products.',
    '我们的羊绒套头衫在德国 STOLL CMS 530 HP 电脑横机上编织，细针款 12 针、粗针款 7 针。纱线根据针型从 2/26 到 2/48 Nm 精纺不等。缝合（链接）由手工逐针完成，形成无痕外观，是奢华羊绒与普通商品的区别。',
    'Unsere Kaschmirpullover werden auf deutschen STOLL CMS 530 HP Flachstrickmaschinen in 12-Gauge (fein) oder 7-Gauge (grob) gestrickt.',
    'Nos pulls cachemire sont tricotés sur des machines à tricoter plates allemandes STOLL CMS 530 HP en 12 jauges (fin) ou 7 jauges (chunky).',
    '当社のカシミア・プルオーバーは、ドイツ STOLL CMS 530 HP 横編み機で 12 ゲージ（細目）または 7 ゲージ（厚手）で編まれます。',
    '저희 캐시미어 풀오버는 독일 STOLL CMS 530 HP 플랫 편성기로 12 게이지 (파인) 또는 7 게이지 (청키)로 편성됩니다.',
  ),
  whyChooseBullets: [
    t('Crew, V-neck, and turtleneck variants in stock', '常备圆领、V 领和高领款', 'Rundhals-, V-Ausschnitt- und Rolli-Varianten', 'Variantes col rond, V, roulé', 'クルー・Vネック・タートルネック', '크루넥, V넥, 터틀넥'),
    t('Hand-linked seams (no visible machine seams)', '手工缝合（无可见机器接缝）', 'Handvernähte Nähte (keine sichtbaren Maschinennähte)', 'Coutures main (pas de coutures machine visibles)', '手作業リンキング', '수작업 링킹 (기계 이음새 없음)'),
    t('2/26 to 2/48 Nm yarn based on gauge', '2/26 至 2/48 Nm 纱线按针型', '2/26 bis 2/48 Nm Garn basierend auf Gauge', 'Fil 2/26 à 2/48 Nm selon jauge', '2/26 〜 2/48 Nm 糸（ゲージによる）', '2/26 ~ 2/48 Nm 원사 (게이지에 따라)'),
    t('12 colors in stock + Pantone custom dyeing', '12 种常备色 + Pantone 定制', '12 Lagerfarben + Pantone-Sonderfärbung', '12 couleurs stock + Pantone personnalisé', '12 色在庫 + Pantone カスタム', '12가지 재고 + Pantone 맞춤'),
    t('Mix XS-XXL sizes in one order at no surcharge', 'XS-XXL 混码不加价', 'Größen XS-XXL in einer Bestellung ohne Aufpreis', 'Tailles XS-XXL mélangées sans surcharge', 'XS-XXL サイズ混合追加料金なし', 'XS-XXL 사이즈 혼합 추가 비용 없음'),
    t('Quick 30-35 day bulk (vs 45 for full custom)', '快速 30-35 天大货（vs 全定制 45 天）', 'Schnelle 30-35 Tage Serie (vs 45 Vollkustom)', 'Production rapide 30-35 jours (vs 45 sur mesure)', '量産 30-35 日（フルカスタムは 45 日）', '양산 30-35일 (풀 커스텀 45일 대비)'),
  ],
  applicationScenarios: [
    t('Essentials capsule wardrobes (3-5 piece sets)', '基础胶囊衣橱（3-5 件套）', 'Essentials-Kapselkollektionen (3-5 Teile)', 'Capsules essentielles (3-5 pièces)', 'エッセンシャル・カプセル（3-5 点）', '에센셜 캡슐 컬렉션 (3-5개 세)'),
    t('Luxury brand ready-to-wear main collections', '奢侈品牌成衣主线', 'Luxusmarken-Konfektions-Hauptkollektionen', 'Collections principales de luxe prêt-à-porter', 'ラグジュアリー・RTW メイン', '럭셔리 브랜드 RTW 메인'),
    t('Boutique ready-to-wear for men and women', '精品男女成衣', 'Boutique-Konfektion für Männer und Frauen', 'Prêt-à-porter boutique homme et femme', 'ブティック・RTW（男女）', '부티크 RTW (남녀)'),
    t('Office and business attire layering', '办公室商务叠搭', 'Büro- und Business-Layering', 'Superposition bureau et travail', 'オフィス・ビジネス・レイヤード', '오피스·비즈니스 레이어드'),
    t('Holiday gift collections', '节日礼品系列', 'Feiertags-Geschenkkollektionen', 'Collections cadeaux de fêtes', 'ホリデーギフト', '홀iday 선물 컬렉션'),
  ],
};

// Cardigan: button/zip front closure
const sweatersCardigan: Partial<ProductDetail> = {
  materialStory: t(
    'Our cashmere cardigans add a button or zip front closure to the classic pullover, plus a slightly wider body cut for layering over shirts or under jackets. The button placket is reinforced with a 2 cm button band and 4-5 bone or shell buttons (customizable to logo-engraved metal). Cardigans typically weigh 50-80 g more than pullovers due to the longer knitting cycle and additional linking.',
    '我们的羊绒开衫在经典套头衫基础上加入纽扣或拉链前开襟，衣身略宽便于内搭衬衫或外穿夹克。门襟用 2 cm 纽扣带加固，4-5 颗骨贝纽扣（可定制为 logo 雕刻金属扣）。开衫因更长针织周期和额外缝合，比套头衫重 50-80 g。',
    'Unsere Kaschmir-Cardigans fügen dem klassischen Pullover einen Knopf- oder Reißverschlussverschluss hinzu, mit etwas weiterem Körper für Layering.',
    'Nos cardigans cachemire ajoutent une fermeture par boutons ou zip au pull classique, avec une coupe légèrement plus large.',
    '当社のカシミア・カーディガンは、クラシックなプルオーバーにボタンまたはジッパー前立てを追加し、レイヤードのためにやや広めのボディカット。',
    '저희 캐시미어 카디건은 클래식 풀오버에 단추 또는 지퍼 프론트 클로저를 추가하고, 셔츠 위나 자켓 아래 레이어드를 위해 약간 더 와이드한 바디 컷.',
  ),
  whyChooseBullets: [
    t('Button or zip front closure with reinforced placket', '纽扣或拉链前开襟 + 加固门襟', 'Knopf- oder Reißverschluss mit verstärkter Leiste', 'Fermeture boutons ou zip avec patte renforcée', 'ボタンまたはジッパー前立て', '단추 또는 지퍼 프론트 + 보강 패트'),
    t('4-5 buttons (bone, shell, or custom metal)', '4-5 颗纽扣（骨贝或定制金属）', '4-5 Knöpfe (Bein, Muschel oder Sondermetall)', '4-5 boutons (os, coquillage ou métal)', '4-5 ボタン（骨・貝・カスタム金属）', '4-5 단추 (뼈, 조개 또는 맞춤 금속)'),
    t('Wider body cut for layering', '更宽衣身便于叠搭', 'Weiterer Körper-Schnitt für Layering', 'Coupe plus large pour superposition', 'レイヤード対応', '레이어드를 위한 와이드 컷'),
    t('Compatible with all knit patterns (cable, Aran, rib)', '兼容所有针织图案（麻花、阿兰、罗纹）', 'Kompatibel mit allen Strickmustern', 'Compatible avec tous les motifs', '全編みパターン対応', '모든 편성 패턴 호환'),
    t('Logo-embroidered buttons or engraved metal buttons', 'logo 刺绣纽扣或雕刻金属扣', 'Logo-gestickte oder gravierte Metallknöpfe', 'Boutons brodés logo ou gravés métal', 'ロゴ刺繍・刻印メタルボタン', '로고 자수 단추 또는 각인 금속 단추'),
    t('50-80 g heavier than pullover (same size)', '比套头衫重 50-80 g（同尺寸）', '50-80 g schwerer als Pullover (gleiche Größe)', '50-80 g plus lourd que pull (même taille)', 'プルオーバーより 50-80g 重い', '풀오버보다 50-80g 더 무거움'),
  ],
  applicationScenarios: [
    t('Office and business layering', '办公室商务叠搭', 'Büro- und Business-Layering', 'Superposition bureau et travail', 'オフィス・ビジネス', '오피스·비즈니스 레이어드'),
    t('Transitional season wardrobes (spring/fall)', '过渡季节衣橱（春秋）', 'Übergangssaison-Garderoben (Frühling/Herbst)', 'Garde-robes mi-saison', '季節の変わり目', '환절기 의류'),
    t('Vintage-inspired men\'s and women\'s lines', '复古男女系列', 'Vintage-inspirierte Herren- und Damenlinien', 'Lignes vintage homme et femme', 'ヴィンテージ系', '빈티지 남성/여성 라인'),
    t('Boutique private label brands', '精品私人品牌', 'Boutique-Private-Label-Marken', 'Marques de distributeur boutique', 'ブティック・プライベート', '부티크 프라이빗 레이블'),
    t('Gift sets with matching scarf', '搭配围巾的礼品套装', 'Geschenksets mit passendem Schal', 'Coffrets avec écharpe assortie', 'マッチングスカーフ・ギフトセット', '매칭 스카프 선물 세트'),
  ],
};

// Turtleneck: high-neck warmth
const sweatersTurtleneck: Partial<ProductDetail> = {
  materialStory: t(
    'Our cashmere turtlenecks use the same STOLL CMS 530 HP machines as pullovers, but the high folded collar (typically 18-22 cm height when folded) is a separate knitted component attached during linking. The collar is double-thickness cashmere to retain its fold and shape over years of wear. Turtlenecks sell at a 10-15% premium over crew necks because of the additional knitting and finishing.',
    '我们的羊绒高领使用与套头衫相同的 STOLL CMS 530 HP 机器，但高翻领（折叠时通常 18-22 cm 高）是单独的针织部件，在缝合时连接。领部双层羊绒以保持多年折叠不变形。高领比圆领溢价 10-15%，因额外针织和整理工序。',
    'Unsere Kaschmir-Rollkragenpullover verwenden dieselben STOLL CMS 530 HP Maschinen wie Pullover, aber der hohe gefaltete Kragen ist eine separate Strickkomponente.',
    'Nos pulls à col roulé cachemire utilisent les mêmes machines STOLL CMS 530 HP, mais le col haut replié est un composant tricoté séparé.',
    '当社のカシミア・タートルネックはプルオーバーと同じ STOLL CMS 530 HP 機を使用しますが、高めの折り返し襟は別体の編み地コンポーネント。',
    '저희 캐시미어 터틀넥은 풀오버와 동일한 STOLL CMS 530 HP 기계를 사용하지만, 접이식 높은 칼라는 별도의 편성 컴포넌트입니다.',
  ),
  whyChooseBullets: [
    t('High folded collar: 18-22 cm', '高翻领：18-22 cm', 'Hoher gefalteter Kragen: 18-22 cm', 'Col haut replié: 18-22 cm', '高めの折り返し襟 18-22 cm', '높은 접이식 칼라 18-22 cm'),
    t('Double-thickness cashmere for shape retention', '双层羊绒保持形状', 'Doppelschicht-Kaschmir für Formerhaltung', 'Cachemire double épaisseur pour rétention', '形状保持のための二重構造', '형태 유지를 위한 이중 두께 캐시미어'),
    t('10-15% premium over crew neck', '比圆领溢价 10-15%', '10-15% Aufschlag gegenüber Rundhals', '10-15% prime vs col rond', 'クルーネックより 10-15% プレミアム', '크루넥 대비 10-15% 프리미엄'),
    t('Compatible with 12gg, 14gg, 16gg fine gauges', '兼容 12/14/16 针细针型', 'Kompatibel mit 12/14/16 Gauge', 'Compatible 12/14/16 jauges', '12/14/16 ゲージ対応', '12/14/16 게이지 호환'),
    t('Custom collar height on request (15-25 cm)', '定制领高（15-25 cm）', 'Kundenspezifische Kragenhöhe (15-25 cm)', 'Hauteur de col personnalisée (15-25 cm)', 'カスタム襟高さ（15-25 cm）', '맞춤 칼라 높이 (15-25 cm)'),
    t('Layered look under blazers and coats', '西装和外套下的叠搭造型', 'Layered-Look unter Blazern und Mänteln', 'Look superposé sous blazers et manteaux', 'ブレザー・コート下のレイヤード', '블레이저 및 코트 아래 레이어드 룩'),
  ],
  applicationScenarios: [
    t('Cold-weather capsule collections', '寒冷天气胶囊系列', 'Kaltwetter-Kapselkollektionen', 'Capsules grand froid', '寒冷地カプセル', '추운 날씨 캡슐 컬렉션'),
    t('Editorial layering looks', '编辑叠搭造型', 'Editorial Layering-Looks', 'Looks superposés éditoriaux', 'エディトリアル・レイヤード', '에디토리얼 레이어드 룩'),
    t('Unisex essential wardrobes', '中性基础衣橱', 'Unisex-Essentials-Garderoben', 'Garde-robes essentielles unisexes', 'ユニセックス・エッセンシャル', '유니섹스 에센셜'),
    t('Travel wardrobes (versatile warmth)', '旅行衣橱（多用途保暖）', 'Reise-Garderoben (vielseitige Wärme)', 'Garde-robes voyage (chaleurité polyvalente)', 'トラベルワードローブ', '여행 의류'),
    t('Gift sets with monogram option', '礼品套装 + 首字母选项', 'Geschenksets mit Monogramm-Option', 'Coffrets avec option monogramme', 'モノグラムギフト', '모노그램 옵션 선물 세트'),
  ],
};

// Vest/sleeveless: layering piece
const sweatersVest: Partial<ProductDetail> = {
  materialStory: t(
    'Our cashmere vests are sleeveless knitwear for layering under blazers or over shirts, typically with a V-neck or scoop neck and a 2-3 cm rib trim at the armhole. Vests use the same gauge options as pullovers but with reduced knitting time (no sleeves, no sleeve linking) and 25-35% less yarn consumption than a pullover. Pricing is typically 30-40% below a pullover at the same gauge.',
    '我们的羊绒背心为无袖针织品，用于西装内或衬衫外叠搭，通常 V 领或圆领，袖口 2-3 cm 罗纹收口。背心与套头衫相同针型选项但针织时间更短（无袖、无袖缝合），比套头衫少 25-35% 纱线。同针型定价通常低 30-40%。',
    'Unsere Kaschmirwesten sind ärmellose Strickwaren für Layering unter Blazern oder über Hemden.',
    'Nos gilets cachemire sont des tricots sans manches pour superposition sous blazers ou sur chemises.',
    '当社のカシミア・ベストは、ブレザー下またはシャツ上に重ねるための袖なしニットです。',
    '저희 캐시미어 조끼는 블레이저 아래 또는 셔츠 위에 레이어드하는 슬리브리스 니트웨어입니다.',
  ),
  whyChooseBullets: [
    t('V-neck or scoop neck with rib trim', 'V 领或圆领 + 罗纹收口', 'V-Ausschnitt oder Rundhals mit Rippbund', 'Col V ou rond avec bord côte', 'Vネックまたは丸首', 'V넥 또는 스쿱넥 + 립 마감'),
    t('25-35% less yarn than pullover', '比套头衫少 25-35% 纱线', '25-35% weniger Garn als Pullover', '25-35% moins de fil que pull', 'プルオーバーより 25-35% 少ない糸', '풀오버 대비 25-35% 적은 원사'),
    t('30-40% lower price than pullover', '比套头衫低 30-40% 价', '30-40% günstiger als Pullover', '30-40% moins cher que pull', 'プルオーバーより 30-40% 安価', '풀오버 대비 30-40% 저렴'),
    t('Compatible with all gauge options (7-16)', '兼容所有针型（7-16）', 'Kompatibel mit allen Gauge-Optionen (7-16)', 'Compatible toutes jauges (7-16)', '全ゲージ対応 (7-16)', '7-16 게이지 호환'),
    t('Lightweight layering piece (180-280 g)', '轻量叠搭单品（180-280 g）', 'Leichtes Layering-Stück (180-280 g)', 'Pièce de superposition (180-280 g)', '軽量レイヤード（180-280 g）', '경량 레이어드 (180-280 g)'),
    t('Custom logo embroidery at chest or back', '胸前或背面定制 logo 刺绣', 'Logo-Stickerei auf Brust oder Rücken', 'Logo brodé poitrine ou dos', '胸・背へのロゴ刺繍', '가슴 또는 등 맞춤 로고 자수'),
  ],
  applicationScenarios: [
    t('Boutique layering pieces (under blazers)', '精品叠搭单品（西装内）', 'Boutique-Layering (unter Blazern)', 'Boutiques superposition (sous blazers)', 'ブティック・レイヤード', '부티크 레이어드 (블레이저 아래)'),
    t('Office and business attire essentials', '办公室商务基础款', 'Büro- und Business-Essentials', 'Essentiels bureau et travail', 'オフィス・ビジネス・エッセンシャル', '오피스·비즈니스 에센셜'),
    t('Transitional season wardrobes', '过渡季节衣橱', 'Übergangssaison-Garderoben', 'Garde-robes mi-saison', '季節の変わり目ワードローブ', '환절기 의류'),
    t('Boutique capsule and 3-piece sets', '精品胶囊和 3 件套', 'Boutique-Kapsel und 3-Teile-Sets', 'Capsules et ensembles 3 pièces', 'ブティック・カプセル・3 点セット', '부티크 캡슐 및 3개 세트'),
    t('Gift sets (vest + scarf + beanie)', '礼品套装 (背心 + 围巾 + 帽子)', 'Geschenksets (Weste + Schal + Mütze)', 'Coffrets (gilet + écharpe + bonnet)', 'ギフトセット', '선물 세트 (조끼 + 스카프 + 비니)'),
  ],
};

// ============================================================
// ACCESSORIES sub-types (3)
// ============================================================

// Socks: knit leg/foot wear
const accessoriesSocks: Partial<ProductDetail> = {
  materialStory: t(
    'Our cashmere socks are knitted on Italian Lonati socks machines (L464, 168 needles) for a seamless tubular construction that fits without pressure points. 2/26 Nm woolen-spun yarn is used for loftiness. Standard sizes run EU 32-46, and we offer custom kids (shoe-13), and tall ankle-high to over-the-knee formats. The cashmere toe and heel are reinforced with a tighter knit for durability.',
    '我们的羊绒袜在意大利 Lonati L464 袜机（168 针）上编织，无缝管状结构无压力点贴合。2/26 Nm 粗纺纱线提供蓬松感。标准尺码覆盖欧码 32-46，可定制儿童码、踝袜到过膝长袜。羊绒袜头和脚跟加密编织增强耐用性。',
    'Unsere Kaschmirsocken werden auf italienischen Lonati Sockenmaschinen (L464, 168 Nadeln) für eine nahtlose Schlauchkonstruktion gestrickt.',
    'Nos chaussettes cachemire sont tricotées sur des machines italiennes Lonati (L464, 168 aiguilles) pour une construction tubulaire sans couture.',
    '当社のカシミア・ソックスは、イタリア Lonati ソックス機（L464、168 針）でシームレスなチューブラー構造に編み上げます。',
    '저희 캐시미어 양말은 이탈리아 Lonati 양말 기계 (L464, 168바늘)로 이음매 없는 튜브러 구조로 편성됩니다.',
  ),
  whyChooseBullets: [
    t('Italian Lonati seamless tubular knit', '意大利 Lonati 无缝管状针织', 'Italienische Lonati nahtlose Schlauchkonstruktion', 'Tricot tubulaire sans couture Lonati', 'イタリア Lonati シームレス', '이탈리아 Lonati 이음매 없는 튜브러'),
    t('EU 32-46 standard sizes, custom kids available', '欧码 32-46 标准，可定制儿童码', 'EU 32-46 Standardgrößen, Sondergrößen Kinder', 'Tailles EU 32-46 standard, enfants sur mesure', 'EU 32-46 標準、特注子供', 'EU 32-46 표준, 맞춤 아동'),
    t('Reinforced toe and heel for durability', '加固袜头和脚跟增强耐用', 'Verstärkte Zehen und Fersen für Haltbarkeit', 'Orteil et talon renforcés', 'つま先・かかとの補強', '발가락·발뒤꿈치 보강'),
    t('Ankle, crew, knee-high formats in stock', '常备踝袜、中筒、过膝长袜', 'Socken-, Crew-, Kniestrümpfe auf Lager', 'Formats cheville, mi-mollet, genou', 'アンクル・クルー・ニーハイ', '앵클, 크루, 니하이'),
    t('Custom Pantone colorways (12 stock)', '定制 Pantone 色（12 种常备）', 'Kundenspezifische Pantone-Farben (12 Lagerfarben)', 'Couleurs Pantone personnalisées (12 stock)', 'Pantone カスタム（12 色）', 'Pantone 맞춤 (재고 12색)'),
    t('Soft cashmere suitable for sensitive skin', '柔软羊绒适合敏感肌', 'Weiches Kaschmir für empfindliche Haut', 'Cachemire doux pour peaux sensibles', '敏感肌向け柔らかいカシミア', '민감성 피부에 적합한 부드러운 캐시미어'),
  ],
  applicationScenarios: [
    t('Winter wardrobe essentials', '冬季衣橱基础款', 'Winter-Garderobe-Essentials', 'Essentiels garde-robe hiver', '冬ワードローブ・エッセンシャル', '겨울 의류 에센셜'),
    t('Travel sets (socks + eye mask + scarf)', '旅行套装 (袜 + 眼罩 + 围巾)', 'Reise-Sets (Socken + Schlafmaske + Schal)', 'Ensembles voyage (chaussettes + masque + écharpe)', 'トラベルセット', '여행 세트 (양말 + 안대 + 스카프)'),
    t('Hotel turndown gifts', '酒店夜床礼品', 'Hotel-Nachtgeschenke', 'Cadeaux de nuit d\'hôtel', 'ホテル就寝時ギフト', '호텔 취침 선물'),
    t('Yoga and wellness retail', '瑜伽和健康零售', 'Yoga- und Wellness-Einzelhandel', 'Yoga et bien-être', 'ヨガ・ウェルネス', '요가·웰니스 소매'),
    t('Premium corporate gifting', '高端企业礼品', 'Premium-Firmengeschenke', 'Cadeaux d\'entreprise premium', 'プレミアム法人ギフト', '프리미엄 기업 선물'),
  ],
};

// Pants/leggings: knit legwear
const accessoriesPants: Partial<ProductDetail> = {
  materialStory: t(
    'Our cashmere pants and leggings are knitted on circular knitting machines in 12-14 gauge for stretch and recovery, with 2/26-2/32 Nm woolen-spun yarn for soft drape. The waistband is reinforced elastic, and the pant legs are knit-to-shape with shaped ankle cuffs. Cashmere pants are a niche luxury item — typically sold at 4-5x the price of cotton leggings — for loungewear, travel, and lightwearwear markets.',
    '我们的羊绒裤和打底裤在圆形针织机上以 12-14 针编织，2/26-2/32 Nm 粗纺纱线柔软垂坠。腰头加固弹性，裤腿针织成型配踝部收口。羊绒裤是小众奢华产品——通常售价是棉质打底裤的 4-5 倍——面向家居服、旅行和轻便穿着市场。',
    'Unsere Kaschmirhosen und Leggings werden auf Rundstrickmaschinen in 12-14 Gauge gestrickt.',
    'Nos pantalons et leggings cachemire sont tricotés sur des machines circulaires en 12-14 jauges.',
    '当社のカシミア・パンツは、12-14 ゲージの丸編み機で編まれ、ストレッチ性と回復性に優れています。',
    '저희 캐시미어 바지와 레깅스는 12-14 게이지 원형 편성기로 편성되어 신축성과 회복력이 뛰어납니다.',
  ),
  whyChooseBullets: [
    t('Circular knit with shaped ankle cuffs', '圆形针织 + 踝部成型', 'Rundstrick mit geformten Knöchelmanschetten', 'Tricot circulaire avec poignets cheville formés', '丸編み + 足首成形', '원형 편성 + 발목 셰이프드'),
    t('Reinforced elastic waistband', '加固弹性腰头', 'Verstärkter elastischer Bund', 'Ceinture élastique renforcée', '補強伸縮ウエスト', '보강 탄성 허리밴드'),
    t('12-14 gauge for stretch + drape', '12-14 针提供弹性和垂坠', '12-14 Gauge für Stretch und Fall', '12-14 jauges pour stretch et drapé', '12-14 ゲージでストレッチとドレープ', '12-14 게이지로 신축성 + 드레이프'),
    t('Loungewear and travel capsule', '家居服和旅行胶囊', 'Loungewear- und Reise-Kapsel', 'Capsule loungewear et voyage', 'ラウンジウェア・トラベル', '라운지웨어·여행 캡슐'),
    t('Custom rise (high/mid/low) and leg shape (skinny/straight/wide)', '定制腰线（高/中/低）和腿型（紧身/直筒/宽松）', 'Kundenspezifische Bundhöhe und Beinform', 'Hauteur et forme de jambe personnalisées', 'カスタム股上と脚シルエット', '맞춤 기립 (하이/미드/로우) 및 다리 모양'),
    t('Premium positioning (4-5x cotton legging price)', '高端定位（棉质打底裤 4-5 倍价）', 'Premium-Positionierung (4-5x Preis)', 'Positionnement premium (4-5x)', 'プレミアム（4-5 倍）', '프리미엄 포지셔닝 (4-5배)'),
  ],
  applicationScenarios: [
    t('Loungewear and at-home capsule', '家居服和居家胶囊', 'Loungewear und Homewear-Kapsel', 'Loungewear et capsule maison', 'ラウンジウェア・ホーム', '라운지웨어 및 홈웨어'),
    t('Travel comfort sets', '旅行舒适套装', 'Reise-Komfort-Sets', 'Ensembles confort voyage', 'トラベル・コンフォート', '여행 편안함 세트'),
    t('Yoga and wellness premium lines', '瑜伽和健康高端系列', 'Yoga- und Wellness-Premium-Linien', 'Lignes premium yoga et bien-être', 'ヨガ・ウェルネス・プレミアム', '요가·웰니스 프리미엄'),
    t('Resort and après-ski lounge', '度假和雪后休闲', 'Resort- und Après-Ski-Lounge', 'Resort et après-ski lounge', 'リゾート・アフタースキー', '리조트 및 애프터스키 라운지'),
    t('Premium loungewear gift sets', '高端家居服礼品套装', 'Premium-Loungewear-Geschenksets', 'Coffrets loungewear premium', 'プレミアムラウンジ・ギフト', '프리미엄 라운지웨어 선물 세트'),
  ],
};

// Gloves/mittens: handwear
const accessoriesGloves: Partial<ProductDetail> = {
  materialStory: t(
    'Our cashmere gloves and mittens are knitted on Italian gloves-machines (12 gauge, 84 needles) for a close-fitting seamless construction. The cuff is 2x1 rib for elastic retention, and the palm has a tighter knit for grip. Touchscreen-compatible variants integrate conductive silver-copper yarn at the thumb and index fingertips. Mittens (one-piece thumb) are available as a warmer alternative, with 15-20% more fiber consumption per pair than fingered gloves.',
    '我们的羊绒手套和连指手套在意大利手套机（12 针、84 针）上编织，贴身无缝结构。袖口 2x1 罗纹保弹性，掌心加密编织增强握持力。触屏兼容版在拇指和食指指尖集成导电银铜丝。连指手套（一体式拇指）是更保暖选择，比分指手套每对多 15-20% 纤维消耗。',
    'Unsere Kaschmirhandschuhe und Fäustlinge werden auf italienischen Handschuhmaschinen (12 Gauge, 84 Nadeln) für eine nahtlose, eng anliegende Konstruktion gestrickt.',
    'Nos gants et moufles cachemire sont tricotés sur des machines italiennes (12 jauges, 84 aiguilles) pour une construction ajustée sans couture.',
    '当社のカシミア手袋とミトンは、イタリア手袋編み機（12 ゲージ、84 針）でシームレスな密着構造に編み上げます。',
    '저희 캐시미어 장갑과 벙어리장갑은 이탈리아 장갑 편성기 (12 게이지, 84바늘)로 이음매 없는 밀착 구조로 편성됩니다.',
  ),
  whyChooseBullets: [
    t('Italian 12-gauge seamless knit, 84 needles', '意大利 12 针无缝针织，84 针', 'Italienische 12-Gauge nahtlos, 84 Nadeln', 'Tricot italien 12 jauges sans couture, 84 aiguilles', 'イタリア 12 ゲージシームレス', '이탈리아 12 게이지 이음매 없는 편성, 84바늘'),
    t('Touchscreen silver-copper thumb + index (+USD 0.30-0.50/pair)', '触屏银铜丝拇指+食指 (+USD 0.30-0.50/对)', 'Touchscreen Silber-Kupfer Daumen+Zeigefinger', 'Tactile argent-cuivre pouce+index', 'タッチスクリーン銀銅', '터치스크린 은-구리 엄지+검지'),
    t('Mittens 15-20% warmer than fingered gloves', '连指比分指暖 15-20%', 'Fäustlinge 15-20% wärmer', 'Moufles 15-20% plus chaudes', 'ミトン 15-20% 暖かい', '벙어리장갑 15-20% 더 따뜻'),
    t('2x1 rib cuff for elastic retention', '2x1 罗纹袖口保弹性', '2x1 Ripp-Bündchen', 'Bord côte 2x1', '2x1 リブ', '2x1 립 챙'),
    t('Custom Pantone colors (8 stock)', '定制 Pantone 色（8 常备）', 'Pantone-Sonderfarben (8 Lager)', 'Couleurs Pantone personnalisées (8 stock)', 'Pantone カスタム（8 色）', 'Pantone 맞춤 (재고 8색)'),
    t('Leather trim option (palm + cuff edge)', '皮革收口选项（掌心+袖口边）', 'Lederbesatz-Option', 'Option finition cuir', '革トリム', '가죽 마감 옵션'),
  ],
  applicationScenarios: [
    t('Winter wardrobe essentials (premium)', '冬季衣橱基础款（高端）', 'Winter-Garderobe-Essentials (Premium)', 'Essentiels garde-robe hiver (premium)', '冬ワードローブ・エッセンシャル', '겨울 의류 에센셜 (프리미엄)'),
    t('Office touch-screen glove market', '办公触屏手套市场', 'Büro-Touchscreen-Handschuh-Markt', 'Marché gants bureau tactile', 'オフィス・タッチ手袋市場', '사무용 터치스크린 장갑 시장'),
    t('Travel and après-ski comfort', '旅行和雪后舒适', 'Reise- und Après-Ski-Komfort', 'Confort voyage et après-ski', 'トラベル・アフタースキー', '여행·애프터스키 편안함'),
    t('Premium boutique gift sets', '高端精品礼品套装', 'Premium-Boutique-Geschenksets', 'Coffrets boutique premium', 'プレミアム・ブティック・ギフト', '프리미엄 부티크 선물 세트'),
    t('Heated-glove inner liners (specialty)', '发热手套内衬（专业款）', 'Heizhandschuh-Innenfutter', 'Doublures gants chauffants', '電熱手袋ライナー', '발열 장갑 내부 라이너'),
  ],
};

// ============================================================
// YARN sub-types (3)
// ============================================================

// Worsted/machine knitting yarn
const yarnWorsted: Partial<ProductDetail> = {
  materialStory: t(
    'Our worsted-spun cashmere yarn is combed, gilled, and ring-spun for a smooth, lustrous surface ideal for 12-18 gauge knitwear and machine knitting. Worsted yarn pills 40-50% less than woolen-spun yarn because the parallel fiber alignment reduces loose ends. Available in 2/26 to 2/80 Nm counts, with custom counts from 2/16 to 2/120. Standard dyeing at 5kg+ per Pantone color.',
    '我们的精纺羊绒纱经过分梳、针梳、环锭纺纱，表面光滑有光泽，适合 12-18 针针织和机织。精纺纱起球比粗纺少 40-50%，因纤维平行排列减少松散端。提供 2/26 至 2/80 Nm 支数，可定制 2/16 至 2/120。每 Pantone 色 5kg+ 起染色。',
    'Unser kammgarngesponnenes Kaschmirgarn wird gekämmt, durchlaufgekämmt und ringgesponnen für eine glatte, glänzende Oberfläche.',
    'Notre fil cachemire peigné est cardé, peigné et filé en anneau pour une surface lisse et brillante.',
    '当社の梳毛紡績カシミア糸は、コーミング、ギリング、リング紡績により滑らかで光沢のある表面。',
    '저희 워스티드 방적 캐시미어 원사는 코밍, 질링, 링 방적을 거쳐 매끄럽고 광택 있는 표면.',
  ),
  whyChooseBullets: [
    t('Combed ring-spun for smooth hand-feel', '精梳环锭纺纱手感光滑', 'Kammgarn-Ringgesponnen für glatten Griff', 'Cardé ring-spun pour toucher lisse', 'コーマ・リング紡績', '코밍 링 방적으로 매끄러운 촉감'),
    t('40-50% less pilling than woolen-spun', '比粗纺起球少 40-50%', '40-50% weniger Pilling als Streichgarn', '40-50% moins de bouloches que cardé', '梳毛は毛玉 40-50% 減', '울렌 대비 필링 40-50% 감소'),
    t('2/26 to 2/80 Nm standard counts', '2/26 至 2/80 Nm 标准支数', '2/26 bis 2/80 Nm Standard-Feinheiten', '2/26 à 2/80 Nm standard', '2/26 〜 2/80 Nm 標準', '2/26 ~ 2/80 Nm 표준'),
    t('Custom counts 2/16 to 2/120 Nm', '定制 2/16 至 2/120 Nm', 'Kundenspezifische Feinheiten 2/16 bis 2/120 Nm', 'Comptes personnalisés 2/16 à 2/120 Nm', 'カスタム 2/16 〜 2/120 Nm', '맞춤 2/16 ~ 2/120 Nm'),
    t('5kg+ MOQ for Pantone custom dyeing', 'Pantone 定制染色 5kg+ 起', '5kg+ MOQ für Pantone-Sonderfärbung', 'MOQ 5kg+ pour teinture Pantone', '5kg〜 Pantone カスタム染色', '5kg 이상 Pantone 맞춤 염색'),
    t('Used for 12-18 gauge premium knitwear', '用于 12-18 针高端针织', 'Verwendet für 12-18 Gauge Premium-Strick', 'Utilisé pour 12-18 jauges premium', '12-18 ゲージ・プレミアム', '12-18 게이지 프리미엄 니트웨어용'),
  ],
  applicationScenarios: [
    t('Premium knitwear production (12-18 gauge)', '高端针织生产（12-18 针）', 'Premium-Strickproduktion (12-18 Gauge)', 'Production tricot premium (12-18 jauges)', 'プレミアム・ニット（12-18 ゲージ）', '프리미엄 니트웨어 생산 (12-18 게이지)'),
    t('Machine knitting for sample runs', '机织打样', 'Maschinenstricken für Musterläufe', 'Tricotage machine pour échantillonnage', 'サンプル機編み', '샘플 러닝 기기 편성'),
    t('Brand-owned knitting mills', '品牌自有针织厂', 'Markeneigene Strickereien', 'Filatures propres aux marques', 'ブランド所有のニット工場', '브랜드 소유 편성 공장',
    t('Hand knitting for designer studios', '设计师手织工坊', 'Handstricken für Designstudios', 'Tricotage main pour studios', 'デザイナー・スタジオ手編み', '디자이너 스튜디오 수편성',
    t('Cashmere-silk and cashmere-merino blends', '羊绒真丝和羊绒美利奴混纺', 'Kaschmir-Seide und Kaschmir-Merino-Mischungen', 'Mélanges cachemire-soie et cachemire-mérinos', 'カシミアシルク・カシミアメリノ混紡', 'Cashmere silk wool blend'),
  ],
};

// Woolen-spun/hand knitting yarn
const yarnWoolen: Partial<ProductDetail> = {
  materialStory: t(
    'Our woolen-spun cashmere yarn is carded and mule-spun for a lofty, soft, slightly fuzzy surface ideal for 7-9 gauge chunky knitwear, hand knitting, and weaving. The fiber alignment is random rather than parallel, which gives woolen yarn its characteristic soft, voluminous drape and visible "cashmere halo" effect. Available in 2/26 to 2/48 Nm counts.',
    '我们的粗纺羊绒纱经过梳理和走锭纺纱，蓬松柔软微毛表面，适合 7-9 针粗针织、手织和梭织。纤维随机排列（而非平行），赋予粗纺纱独特的柔软蓬松垂感和可见的"羊绒绒光"效果。提供 2/26 至 2/48 Nm 支数。',
    'Unser streichgarngesponnenes Kaschmirgarn wird kardiert und mule-gesponnen für eine lockere, weiche Oberfläche.',
    'Notre fil cachemire cardé est cardé et filé au mule pour une surface duveteuse et douce.',
    '当社の梳毛紡績カシミア糸は、カードされ、ミュール紡績により、嵩高で柔らかな表面。',
    '저희 울렌 방적 캐시미어 원사는 카딩과 룰 방적을 거쳐 풍성하고 부드러운 표면.',
  ),
  whyChooseBullets: [
    t('Carded mule-spun for lofty, soft hand-feel', '粗梳走铸匀的蓬松柔软手感', 'Kardiert und-Mule-gesponnen für lockeren', 'Cardé mule-spun duveteux', 'カード・ミュール紡', '카딩 룰 방적으로 풍성함'),
    t('Visible "cashmere halo" effect', '可见的"羊绒绒光"效果', 'Sichtbarer Kaschmir-Halo-Effekt', 'Effet halo cachemire visible', 'カシミア・ヘイロー効果', '캐시미어 헤일로 효과'),
    t('Best for 7-9 gauge chunky and hand knit', '最适合 7-9 针粗针织和手织', 'Am besten für 7-9 Gauge Grobstrick und Handstrick', 'Idéal 7-9 jauges chunky et tricot main', '7-9 ゲージ・チャンキー・手編み', '7-9 게이지 청키 및 수편성에 최적'),
    t('2/26 to 2/48 Nm counts available', '2/26 至 2/48 Nm 支数', '2/26 bis 2/48 Nm Feinheiten', '2/26 à 2/48 Nm disponibles', '2/26 〜 2/48 Nm', '2/26 ~ 2/48 Nm'),
    t('Slightly more pills than worsted (intentional look)', '比精纺稍多起球（设计效果）', 'Leicht mehr Pilling als Kammgarn (gewollt)', 'Légèrement plus de bouloches (look intentionnel)', '意図的な毛玉', '울렌 대비 약간 더 필링 (의도된 룩)'),
    t('Soft, voluminous drape for blankets and shawls', '蓬松柔软垂感适合毯子和披肩', 'Weicher, voluminöser Fall für Decken und Schals', 'Drapé doux et volumineux pour plaids et châles', 'ブランケット・ショール向け', '담요와 숄에 적합한 부드러운 볼류미늄 드레이프'),
  ],
  applicationScenarios: [
    t('Hand knitting yarns for designers', '设计师手织纱线', 'Handstrickgarne für Designer', 'Fils à tricoter main pour designers', 'デザイナー手編み糸', '디자이너용 수편성 원사'),
    t('Chunky 7-9 gauge knitwear', '粗针 7-9 针针织', 'Grobstrick 7-9 Gauge', 'Tricot chunky 7-9 jauges', '7-9 ゲージ・チャンキー', '청키 7-9 게이지 니트'),
    t('Cashmere blankets and travel throws', '羊绒毯和旅行披巾', 'Kaschmir-Decken und Reiseplaids', 'Plaids cachemire et plaids voyage', 'カシミア・ブランケット', '캐시미어 담요와 여행용 토'),
    t('Artisan dye studios (hand-dyed skeins)', '手工染色工作室（手染绞纱）', 'Handfärbestudios (handgefärbte Strhnen)', 'Studios de teinture artisanale', 'アーティスト染色スタジオ', '공예 염색 스튜디오 (수작업 염색 스킨)'),
    t('Fiber art and textile design education', '纤维艺术和纺织设计教育', 'Faserkunst und Textildesign-Ausbildung', 'Art textile et éducation design', '繊維アート・テキスタイルデザイン教育', '섬유 예술 및 텍스타일 디자인 교육'),
  ],
};

// Cone/industrial yarn (hanks vs cones)
const yarnCone: Partial<ProductDetail> = {
  materialStory: t(
    'Our cashmere yarn ships in two formats: cones (1-2 kg cylindrical, ideal for industrial knitting machines) and skeins/hanks (100-200 g twisted, ideal for hand knitting). Cones are the standard for machine knitting production because they feed smoothly into machine creels without re-spooling. Skeins are used for hand knitting, sample runs, and small-batch sample production. Both formats come from the same yarn lots, ensuring color consistency across formats.',
    '我们的羊绒纱提供两种规格：筒纱（1-2 kg 圆筒形，适合工业针织机）和绞纱（100-200 g 扭绞形，适合手织）。筒纱是机织生产的标准，因能顺畅送入机器纱架无需重绕。绞纱用于手织、打样和小批量样品生产。两种规格来自同一纱批，确保格式间颜色一致。',
    'Unser Kaschmirgarn wird in zwei Formaten versandt: Konen (1-2 kg zylindrisch) und Strangen (100-200 g verdreht).',
    'Notre fil cachemire est livré en deux formats: cônes (1-2 kg cylindrique) et écheveaux (100-200 g torsadé).',
    '当社のカシミア糸は、2 つのフォーマットで出荷：コーン（1-2 kg 円筒）とかせ糸（100-200 g）。',
    '저희 캐시미어 원사는 두 가지 형식으로 출하: 콘 (1-2 kg 원통) 및 skein (100-200 g 꼬임).',
  ),
  whyChooseBullets: [
    t('Cone format: 1-2 kg industrial cylindrical', '筒纱：1-2 kg 工业圆筒形', 'Konenformat: 1-2 kg industrielle Zylinder', 'Format cône: 1-2 kg cylindrique industriel', 'コーン：1-2 kg 工業用', '콘 형: 1-2 kg 산업용 원통'),
    t('Skein format: 100-200 g hand knitting', '绞纱：100-200 g 手织', 'Strangformat: 100-200 g Handstrick', 'Format écheveau: 100-200 g tricot main', 'かせ糸：100-200 g 手編み', 'skein 형: 100-200 g 수편성'),
    t('Same yarn lots, color consistency', '同一纱批，颜色一致', 'Gleiche Garnpartien, Farbkonsistenz', 'Mêmes lots, cohérence couleur', '同一ロット、色一貫性', '동일 로트, 색상 일관성'),
    t('Cone feeds smoothly into machine creels', '筒纱顺畅送入机器纱架', 'Konen führen gleichmäßig in Maschinengatter', 'Cônes s\'alimentent facilement dans cantres', 'コーンは機台にスムーズ供給', '콘은 기계 크릴에 매끄럽게 공급'),
    t('Skeins for hand knitting and small batches', '绞纱用于手织和小批量', 'Strangen für Handstrick und Kleinserien', 'Écheveaux pour tricot main et petits lots', 'かせ糸は手編み・小ロット', 'skein은 수편성 및 소량 배치용'),
    t('Custom packaging (cone label, skein band)', '定制包装（筒纱标、绞纱带）', 'Kundenspezifische Verpackung (Konenetikett, Strangband)', 'Emballage personnalisé', 'カスタム包装', '맞춤 패키징 (콘 라벨, skein 밴드)'),
  ],
  applicationScenarios: [
    t('Industrial machine knitting production', '工业机织生产', 'Industrielle Maschinenstrickproduktion', 'Production tricot machine industrielle', '工業機編み', '산업용 기계 편성 생산'),
    t('Hand knitting studio sales', '手织工坊销售', 'Handstrickstudio-Verkauf', 'Ventes studio tricot main', '手編みスタジオ販売', '수편성 스튜디오 판매'),
    t('Brand-owned knitting mills', '品牌自有针织厂', 'Markeneigene Strickereien', 'Filatures propres aux marques', 'ブランド所有のニット工場', '브랜드 소유 편성 공장',
    t('Small-batch sample runs', '小批量打样', 'Kleinserien-Musterläufe', 'Échantillonnage petits lots', '小ロットサンプル', '소량 배치 샘플 러닝'),
    t('Cashmere yarn wholesale distribution', '羊绒纱批发分销', 'Kaschmirgarn-Großhandelsvertrieb', 'Distribution gros fil cachemire', 'カシミア糸卸売流通', '캐시미어 원사 도매 유통'),
  ],
};

// ============================================================
// SUBTYPE ROUTING
// ============================================================

export type SubTypeKey =
  // scarves
  | 'scarves:printed'
  | 'scarves:shawl'
  | 'scarves:tasseled'
  | 'scarves:hijab'
  // hats
  | 'hats:beanie'
  | 'hats:beret'
  | 'hats:cap'
  // sweaters
  | 'sweaters:pullover'
  | 'sweaters:cardigan'
  | 'sweaters:turtleneck'
  | 'sweaters:vest'
  // accessories
  | 'accessories:socks'
  | 'accessories:pants'
  | 'accessories:gloves'
  // yarn
  | 'yarn:worsted'
  | 'yarn:woolen'
  | 'yarn:cone';

/**
 * Routes a product (by id + name + tags) to a sub-type key.
 * Returns null if the product should fall back to category-level default.
 */
export function getProductSubType(product: {
  id: string;
  name: string;
  tags?: string[];
}): SubTypeKey | null {
  const name = (product.name || '').toLowerCase();
  const tags = (product.tags || []).map((t) => t.toLowerCase().replace(/['"\s]/g, ''));
  const id = product.id || '';

  // ----- SCARVES (206 products) -----
  if (id.startsWith('scarves')) {
    if (/(printed|print(?!ed color)|digital|jacquard(?! shawl)|pattern(?! shawl)|plaid|tartan)/i.test(name)) {
      // Most printed/jacquard scarves share the printed template; only "jacquard shawl"
      // routes to shawl template instead.
      if (/shawl|wrap/i.test(name) && !/printed/i.test(name)) {
        return 'scarves:shawl';
      }
      return 'scarves:printed';
    }
    if (/(shawl|wrap)/i.test(name)) return 'scarves:shawl';
    if (/(tassel|fringe)/i.test(name)) return 'scarves:tasseled';
    if (/(hijab|religious)/i.test(name)) return 'scarves:hijab';
    // Default scarves uses category-level template
    return null;
  }

  // ----- HATS (65 products) -----
  if (id.startsWith('hats')) {
    if (/(beret)/i.test(name)) return 'hats:beret';
    if (/(cap\b|cap$|visor|sport|baseball)/i.test(name)) return 'hats:cap';
    // Everything else (beanie, fold-up, fisherman, pompom, kids, headband, set) -> beanie template
    return 'hats:beanie';
  }

  // ----- SWEATERS (166 products) -----
  if (id.startsWith('sweaters')) {
    if (/(cardigan|button|zipper|buttoned)/i.test(name)) {
      // Almost any "cardigan" or button-up -> cardigan sub-type
      return 'sweaters:cardigan';
    }
    if (/(vest|sleeveless|gilet)/i.test(name)) return 'sweaters:vest';
    if (/(turtleneck|high neck|roll neck|funnel)/i.test(name)) return 'sweaters:turtleneck';
    // Default (pullover, jumper, crew, v-neck, zip-up) -> pullover template
    return 'sweaters:pullover';
  }

  // ----- ACCESSORIES (76 products) -----
  if (id.startsWith('accessories')) {
    if (/(sock|stocking)/i.test(name)) return 'accessories:socks';
    if (/(pant|trouser|legging|tights)/i.test(name)) return 'accessories:pants';
    if (/(glove|mitten)/i.test(name)) return 'accessories:gloves';
    return null;
  }

  // ----- YARN (69 products) -----
  if (id.startsWith('yarn')) {
    // Cone vs skein wins by literal name mention
    if (/(cone\b|hank|small batch)/i.test(name)) return 'yarn:cone';
    if (/(hand\s*knit)/i.test(name) && !/(machine)/i.test(name)) return 'yarn:woolen';
    if (/(woolen|hand|mule)/i.test(name)) return 'yarn:woolen';
    if (/(worsted|machine|ring)/i.test(name)) return 'yarn:worsted';
    // Default = worsted (most common)
    return 'yarn:worsted';
  }

  return null;
}

// ============================================================
// SUBTYPE TEMPLATES MAP (exported)
// ============================================================

export const productSubTypes: Record<SubTypeKey, Partial<ProductDetail>> = {
  // scarves
  'scarves:printed': scarvesPrinted,
  'scarves:shawl': scarvesShawl,
  'scarves:tasseled': scarvesTasseled,
  'scarves:hijab': scarbesHijab,
  // hats
  'hats:beanie': hatsBeanie,
  'hats:beret': hatsBeret,
  'hats:cap': hatsCap,
  // sweaters
  'sweaters:pullover': sweatersPullover,
  'sweaters:cardigan': sweatersCardigan,
  'sweaters:turtleneck': sweatersTurtleneck,
  'sweaters:vest': sweatersVest,
  // accessories
  'accessories:socks': accessoriesSocks,
  'accessories:pants': accessoriesPants,
  'accessories:gloves': accessoriesGloves,
  // yarn
  'yarn:worsted': yarnWorsted,
  'yarn:woolen': yarnWoolen,
  'yarn:cone': yarnCone,
};

/**
 * Merge a category-level ProductDetail with a sub-type Partial<ProductDetail>.
 * Sub-type fields override category fields; sub-type arrays replace category arrays.
 */
export function mergeDetailWithSubType(
  base: ProductDetail,
  subTypePartial: Partial<ProductDetail> | undefined,
): ProductDetail {
  if (!subTypePartial) return base;
  return { ...base, ...subTypePartial } as ProductDetail;
}