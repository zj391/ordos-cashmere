// Category landing page SEO copy. Each category gets unique title/description/H1
// that targets long-tail keywords. Lives in a separate .ts file to keep the
// Astro frontmatter small (which esbuild parses character-by-character and
// can give cryptic "col 101" errors on long unicode strings).
import type { Locale } from '@/lib/i18n';

export type CategorySeoEntry = {
  title: string;
  description: string;
  h1: string;
  intro: string;
  keywords: string[];
};

export const CATEGORY_SEO: Record<string, Record<Locale, CategorySeoEntry>> = {
  hats: {
    en: {
      title: 'Cashmere Hats & Beanies Wholesale | Ordos Knitted Hat Manufacturer | DONGXIAO®',
      description: 'Wholesale cashmere hats, beanies, berets, caps and headbands. 14–15.5µm Grade A Mongolian cashmere, knit construction. MOQ 50–100, sample 7–10 days. Project terms confirmed in writing.',
      h1: 'Cashmere Hats & Beanies Wholesale',
      intro: 'Browse selected cashmere hats, beanies, berets, headbands and caps from our Ordos facility. Each style is built from Grade A 14–15.5µm Mongolian cashmere, knit on 12–14 gauge machines, with documented origin, micron range and finishing records available per shipment.',
      keywords: ['cashmere hats', 'cashmere beanies', 'cashmere berets', 'cashmere headbands', 'wholesale cashmere hats', 'knit cashmere hats', 'cashmere hat manufacturer', 'Mongolian cashmere hats'],
    },
    de: {
      title: 'Kaschmir-Mützen & Beanies Großhandel | DONGXIAO®',
      description: 'Großhandel Kaschmir-Mützen, Beanies, Baskenmützen, Caps und Stirnbänder. 14–15.5µm mongolisches Kaschmir, gestrickt. MOQ 50–100, Muster 7–10 Tage.',
      h1: 'Kaschmir-Mützen & Beanies Großhandel',
      intro: 'Ausgewählte Kaschmir-Mützen, Beanies, Baskenmützen, Stirnbänder und Caps aus unserer Ordos-Fabrik.',
      keywords: ['Kaschmir Mützen', 'Kaschmir Beanies', 'Kaschmir Baskenmützen', 'Kaschmir Großhandel', 'gestrickte Kaschmir Mützen'],
    },
    fr: {
      title: 'Bonnets et Beanies en Cachemire en Gros | Fabricant DONGXIAO®',
      description: 'Bonnets, beanies, bérets, casquettes et bandeaux en cachemire en gros. Cachemire mongol 14–15.5µm, tricoté. MOQ 50–100, échantillon 7–10 jours.',
      h1: 'Bonnets et Beanies en Cachemire en Gros',
      intro: 'Sélection de bonnets, beanies, bérets, casquettes et bandeaux en cachemire de notre usine d\'Ordos.',
      keywords: ['bonnets cachemire', 'beanies cachemire', 'bérets cachemire', 'grossiste cachemire', 'bonnets cachemire tricotés'],
    },
    ja: {
      title: 'カシミア帽子・ビーニー卸売り | DONGXIAO® オルドス工場',
      description: 'カシミア帽子、ビーニー、ベレー、キャップ、ヘッドバンド卸売り。14–15.5µmモンゴル産カシミア、ニット製。MOQ 50–100、サンプル7–10日。',
      h1: 'カシミア帽子・ビーニー卸売り',
      intro: 'オルドス工場から厳選したカシミア帽子、ビーニー、ベレー、キャップ、ヘッドバンド。',
      keywords: ['カシミア帽子', 'カシミアビーニー', 'カシミアベレー', 'カシミア卸売り', 'ニット カシミア帽子'],
    },
    kr: {
      title: '캐시미어 모자·비니 도매 | DONGXIAO®',
      description: '캐시미어 모자, 비니, 베레, 캡, 헤드밴드 도매. 14–15.5µm 몽골 캐시미어, 니트 제작. MOQ 50–100, 샘플 7–10일.',
      h1: '캐시미어 모자·비니 도매',
      intro: '오르도스 공장에서 선별한 캐시미어 모자, 비니, 베레, 캡, 헤드밴드를 둘러보세요.',
      keywords: ['캐시미어 모자', '캐시미어 비니', '캐시미어 베레', '캐시미어 도매', '니트 캐시미어 모자'],
    },
    cn: {
      title: '羊绒帽·毛线帽批发 | 东霄 DONGXIAO® 鄂尔多斯工厂',
      description: '羊绒帽、毛线帽、贝雷帽、鸭舌帽、束发带批发。14–15.5µm 蒙古 Grade A 羊绒，针织工艺。MOQ 50–100 件，打样 7–10 天。项目条件以书面方式确认。',
      h1: '羊绒帽·毛线帽批发',
      intro: '浏览鄂尔多斯工厂精选的羊绒帽、毛线帽、贝雷帽、鸭舌帽、束发带。每款采用 14–15.5µm 蒙古 Grade A 羊绒，针织机织造，可按批提供产地、细度与工艺记录。',
      keywords: ['羊绒帽', '羊绒毛线帽', '羊绒贝雷帽', '羊绒帽子批发', '针织羊绒帽', '羊绒帽子厂家'],
    },
  },
  sweaters: {
    en: {
      title: 'Cashmere Sweaters & Knitwear Wholesale | OEM Cardigans & Pullovers | DONGXIAO®',
      description: 'Wholesale cashmere sweaters, cardigans, pullovers and vests. V-neck, crew neck, turtleneck, cable knit, 12gg fine gauge to 3gg heavy. Ordos facility, OEM/private label, MOQ 100–200.',
      h1: 'Cashmere Sweaters & Knitwear Wholesale',
      intro: 'Browse cashmere knitwear from our Ordos facility: cardigans, pullovers, vests and turtlenecks in 12–14 gauge fine knit and 3–7gg heavy knit. Available in 100% cashmere, cashmere-merino blends and cashmere-wool combinations. OEM and private label programs supported.',
      keywords: ['cashmere sweaters', 'cashmere cardigans', 'cashmere pullovers', 'cashmere vests', 'cashmere knitwear wholesale', 'cashmere OEM', 'private label cashmere', '12gg cashmere', 'cable knit cashmere'],
    },
    de: {
      title: 'Kaschmir-Pullover & Strickwaren Großhandel | DONGXIAO®',
      description: 'Kaschmir-Pullover, Cardigans, Westen. V-Ausschnitt, Rundhals, Rolkragen, Zopfmuster, 12gg bis 3gg. OEM/Private Label.',
      h1: 'Kaschmir-Pullover & Strickwaren Großhandel',
      intro: 'Kaschmir-Strickwaren aus unserer Ordos-Fabrik: Cardigans, Pullover, Westen.',
      keywords: ['Kaschmir Pullover', 'Kaschmir Cardigans', 'Kaschmir Westen', 'Kaschmir Strickwaren Großhandel', 'Kaschmir OEM'],
    },
    fr: {
      title: 'Pulls et Cardigans en Cachemire en Gros | OEM DONGXIAO®',
      description: 'Pulls, cardigans, gilets en cachemire en gros. Col en V, col rond, col roulé, torsades, 12gg à 3gg. OEM/marque privée.',
      h1: 'Pulls et Cardigans en Cachemire en Gros',
      intro: 'Pulls en cachemire de notre usine d\'Ordos : cardigans, pulls, gilets et cols roulés.',
      keywords: ['pulls cachemire', 'cardigans cachemire', 'gilets cachemire', 'pulls cachemire gros', 'cachemire OEM'],
    },
    ja: {
      title: 'カシミアセーター・カーディガン卸売り | DONGXIAO®',
      description: 'カシミアセーター、カーディガン、プルオーバー、ベスト。Vネック、クルーネック、タートル、ケーブルニット、12gg～3gg。OEM/プライベートブランド。',
      h1: 'カシミアセーター・カーディガン卸売り',
      intro: 'オルドス工場のカシミアニット：カーディガン、プルオーバー、ベスト、タートルネック。',
      keywords: ['カシミアセーター', 'カシミアカーディガン', 'カシミア卸売り', 'カシミア OEM'],
    },
    kr: {
      title: '캐시미어 스웨터·가디건 도매 | DONGXIAO®',
      description: '캐시미어 스웨터, 가디건, 풀오버, 베스트. V넥, 크루넥, 터틀넥, 케이블 니트, 12gg~3gg. OEM/프라이빗 라벨.',
      h1: '캐시미어 스웨터·가디건 도매',
      intro: '오르도스 공장의 캐시미어 니트웨어: 가디건, 풀오버, 베스트, 터틀넥.',
      keywords: ['캐시미어 스웨터', '캐시미어 가디건', '캐시미어 도매', '캐시미어 OEM'],
    },
    cn: {
      title: '羊绒衫·开衫批发 | 东霄 DONGXIAO® 鄂尔多斯针织厂',
      description: '羊绒衫、开衫、套头衫、背心批发。V 领、圆领、高领、麻花、12gg 细针到 3gg 粗针。OEM/贴牌。MOQ 100–200。',
      h1: '羊绒衫·开衫批发',
      intro: '浏览鄂尔多斯工厂精选羊绒针织衫：开衫、套头衫、背心、高领衫，覆盖 12–14 针细针织到 3–7 针粗针织。可做 100% 羊绒、羊绒/羊毛混纺、羊绒/美丽奴混纺。OEM 与贴牌项目均可承接。',
      keywords: ['羊绒衫', '羊绒开衫', '羊绒套头衫', '羊绒针织衫批发', '羊绒 OEM', '羊绒贴牌', '12 针羊绒', '麻花羊绒'],
    },
  },
  scarves: {
    en: {
      title: 'Cashmere Scarves, Wraps & Shawls Wholesale | Ordos Manufacturer | DONGXIAO®',
      description: 'Wholesale cashmere scarves, shawls, wraps, ponchos and pashminas. 100% Mongolian cashmere, woven and knit constructions. Custom dimensions, Pantone matching, private label. MOQ 50–100.',
      h1: 'Cashmere Scarves, Wraps & Shawls Wholesale',
      intro: 'Browse cashmere scarves, shawls, wraps, ponchos and pashminas from our Ordos facility. Available in woven, knit and printed constructions. Custom dimensions and Pantone color matching available for orders 100+ pieces.',
      keywords: ['cashmere scarves', 'cashmere shawls', 'cashmere wraps', 'cashmere pashmina', 'cashmere scarves wholesale', 'cashmere scarf manufacturer', 'woven cashmere shawl', 'printed cashmere scarf'],
    },
    de: {
      title: 'Kaschmir-Schals, Tücher & Wraps Großhandel | DONGXIAO®',
      description: 'Großhandel Kaschmir-Schals, Shawls, Wraps, Ponchos. Mongolisches Kaschmir, gewebt und gestrickt. Sondermaße, Pantone.',
      h1: 'Kaschmir-Schals, Tücher & Wraps Großhandel',
      intro: 'Kaschmir-Schals, Shawls, Wraps, Ponchos aus unserer Ordos-Fabrik.',
      keywords: ['Kaschmir Schals', 'Kaschmir Tücher', 'Kaschmir Shawls', 'Kaschmir Großhandel'],
    },
    fr: {
      title: 'Écharpes et Châles en Cachemire en Gros | DONGXIAO®',
      description: 'Écharpes, châles, étoles, ponchos en cachemire en gros. Cachemire mongol, tissé et tricoté. Dimensions sur mesure, Pantone.',
      h1: 'Écharpes et Châles en Cachemire en Gros',
      intro: 'Écharpes, châles, étoles, ponchos en cachemire de notre usine d\'Ordos.',
      keywords: ['écharpes cachemire', 'châles cachemire', 'wraps cachemire', 'grossiste cachemire'],
    },
    ja: {
      title: 'カシミアスカーフ・ショール・ストール卸売り | DONGXIAO®',
      description: 'カシミアスカーフ、ショール、ストール、ポンチョ卸売り。モンゴル産カシミア、織りと編み。カスタムサイズ、Pantone対応。',
      h1: 'カシミアスカーフ・ショール・ストール卸売り',
      intro: 'オルドス工場のカシミアスカーフ、ショール、ストール、ポンチョ。',
      keywords: ['カシミアスカーフ', 'カシミアショール', 'カシミアストール', 'カシミア卸売り'],
    },
    kr: {
      title: '캐시미어 스카프·숄·랩 도매 | DONGXIAO®',
      description: '캐시미어 스카프, 숄, 랩, 판초 도매. 몽골 캐시미어, 직물과 니트. 맞춤 사이즈, Pantone 매칭.',
      h1: '캐시미어 스카프·숄·랩 도매',
      intro: '오르도스 공장의 캐시미어 스카프, 숄, 랩, 판초.',
      keywords: ['캐시미어 스카프', '캐시미어 숄', '캐시미어 랩', '캐시미어 도매'],
    },
    cn: {
      title: '羊绒围巾·披肩·方巾批发 | 东霄 DONGXIAO® 鄂尔多斯织造',
      description: '羊绒围巾、披肩、方巾、斗篷批发。蒙古羊绒，机织与针织工艺。定制尺寸、Pantone 色匹配、贴牌。MOQ 50–100。',
      h1: '羊绒围巾·披肩·方巾批发',
      intro: '浏览鄂尔多斯工厂精选羊绒围巾、披肩、方巾与斗篷。机织与针织工艺。100 件起可定制尺寸与 Pantone 色匹配。',
      keywords: ['羊绒围巾', '羊绒披肩', '羊绒方巾', '羊绒斗篷', '羊绒围巾批发', '羊绒围巾厂家', '机织羊绒披肩', '印花羊绒围巾'],
    },
  },
  accessories: {
    en: {
      title: 'Cashmere Accessories Wholesale | Gloves, Socks, Leggings | DONGXIAO®',
      description: 'Wholesale cashmere gloves, mittens, socks, leggings, pants, hijabs and knit accessories. 14–15.5µm Mongolian cashmere, knit construction. Custom sizes and colors available.',
      h1: 'Cashmere Accessories Wholesale',
      intro: 'Browse cashmere accessories from our Ordos facility: gloves, mittens, socks, leggings, pants, hijabs and knit accessories. Each piece is built from 14–15.5µm Mongolian cashmere with documented construction records.',
      keywords: ['cashmere gloves', 'cashmere socks', 'cashmere leggings', 'cashmere pants', 'cashmere hijabs', 'cashmere accessories wholesale', 'cashmere accessories manufacturer'],
    },
    de: {
      title: 'Kaschmir-Accessoires Großhandel | Handschuhe, Socken, Leggings | DONGXIAO®',
      description: 'Kaschmir-Handschuhe, Socken, Leggings, Hosen, Hijabs und Strick-Accessoires.',
      h1: 'Kaschmir-Accessoires Großhandel',
      intro: 'Kaschmir-Accessoires aus unserer Ordos-Fabrik.',
      keywords: ['Kaschmir Handschuhe', 'Kaschmir Socken', 'Kaschmir Leggings', 'Kaschmir Großhandel'],
    },
    fr: {
      title: 'Accessoires en Cachemire en Gros | Gants, Chaussettes, Leggings | DONGXIAO®',
      description: 'Gants, chaussettes, leggings, pantalons, hijabs en cachemire en gros.',
      h1: 'Accessoires en Cachemire en Gros',
      intro: 'Accessoires en cachemire de notre usine d\'Ordos.',
      keywords: ['gants cachemire', 'chaussettes cachemire', 'leggings cachemire', 'grossiste cachemire'],
    },
    ja: {
      title: 'カシミアアクセサリー卸売り | 手袋・靴下・レギンス | DONGXIAO®',
      description: 'カシミア手袋、ミトン、靴下、レギンス、パンツ、ヒジャブ、ニットアクセサリー。',
      h1: 'カシミアアクセサリー卸売り',
      intro: 'オルドス工場のカシミアアクセサリー。',
      keywords: ['カシミア手袋', 'カシミア靴下', 'カシミアレギンス', 'カシミア卸売り'],
    },
    kr: {
      title: '캐시미어 액세서리 도매 | 장갑·양말·레깅스 | DONGXIAO®',
      description: '캐시미어 장갑, 버니어, 양말, 레깅스, 팬츠, 히잡, 니트 액세서리.',
      h1: '캐시미어 액세서리 도매',
      intro: '오르도스 공장의 캐시미어 액세서리.',
      keywords: ['캐시미어 장갑', '캐시미어 양말', '캐시미어 레깅스', '캐시미어 도매'],
    },
    cn: {
      title: '羊绒配饰批发 | 手套·袜子·打底裤 | 东霄 DONGXIAO®',
      description: '羊绒手套、袜子、打底裤、长裤、头巾与针织配饰批发。14–15.5µm 蒙古羊绒，针织工艺。定制尺寸与颜色。',
      h1: '羊绒配饰批发',
      intro: '浏览鄂尔多斯工厂精选羊绒配饰：手套、袜子、打底裤、长裤、头巾、针织配件。每款采用 14–15.5µm 蒙古羊绒。',
      keywords: ['羊绒手套', '羊绒袜子', '羊绒打底裤', '羊绒长裤', '羊绒头巾', '羊绒配饰批发'],
    },
  },
  yarn: {
    en: {
      title: 'Cashmere Yarn & Fiber Wholesale | Cone, Hank, Knitting | DONGXIAO®',
      description: 'Wholesale cashmere yarn, fiber, cones and hanks for machine knitting, hand knitting and weaving. 14–15.5µm Grade A Mongolian cashmere. Nm 2/26 to Nm 2/60 counts. Cone 50–150g, Hank 100–500g.',
      h1: 'Cashmere Yarn & Fiber Wholesale',
      intro: 'Browse cashmere yarn and fiber from our Ordos facility: cone yarn, hank yarn, knitting yarn, weaving yarn and undyed raw fiber. Available counts Nm 2/26 to Nm 2/60. Sold by the kg for resale and industrial use.',
      keywords: ['cashmere yarn', 'cashmere fiber', 'cashmere cone yarn', 'cashmere hank', 'cashmere knitting yarn', 'cashmere weaving yarn', 'wholesale cashmere yarn', 'Mongolian cashmere yarn', 'cashmere yarn manufacturer'],
    },
    de: {
      title: 'Kaschmirgarn & Faser Großhandel | Cone, Hank, Stricken | DONGXIAO®',
      description: 'Großhandel Kaschmirgarn, Faser, Cones und Stränge für Maschinenstricken, Handstricken und Weben.',
      h1: 'Kaschmirgarn & Faser Großhandel',
      intro: 'Kaschmirgarn aus unserer Ordos-Fabrik.',
      keywords: ['Kaschmirgarn', 'Kaschmir Faser', 'Kaschmir Großhandel', 'Kaschmir Garn Hersteller'],
    },
    fr: {
      title: 'Fil et Fibre de Cachemire en Gros | Cône, Écheveau | DONGXIAO®',
      description: 'Fil, fibre, cônes et écheveaux en cachemire en gros pour tricot machine, tricot main et tissage.',
      h1: 'Fil et Fibre de Cachemire en Gros',
      intro: 'Fil en cachemire de notre usine d\'Ordos.',
      keywords: ['fil cachemire', 'fibre cachemire', 'cône cén', 'écheveau cachemire', 'grossiste cachemire'],
    },
    ja: {
      title: 'カシミア糸・繊維卸売り | コーン・かせ・編み物 | DONGXIAO®',
      description: 'カシミア糸、繊維、コーン、かせ卸売り。マシン編み、手編み、織物用。',
      h1: 'カシミア糸・繊維卸売り',
      intro: 'オルドス工場のカシミア糸、繊維。',
      keywords: ['カシミア糸', 'カシミア繊維', 'カシミア卸売り', 'カシミア糸メーカー'],
    },
    kr: {
      title: '캐시미어 원사·섬유 도매 | 콘·타래·편물 | DONGXIAO®',
      description: '캐시미어 원사, 섬유, 콘, 타래 도매. 기계 편물, 수 편물, 직물용.',
      h1: '캐시미어 원사·섬유 도매',
      intro: '오르도스 공장의 캐시미어 원사, 섬유.',
      keywords: ['캐시미어 원사', '캐시미어 섬유', '캐시미어 도매', '캐시미어 원사 제조사'],
    },
    cn: {
      title: '羊绒纱线·纤维批发 | 筒纱·绞纱·针织 | 东霄 DONGXIAO®',
      description: '羊绒纱线、纤维、筒纱、绞纱批发。机器针织、手工针织、机织用。14–15.5µm 蒙古 Grade A 羊绒。支数 Nm 2/26 到 Nm 2/60。筒纱 50–150g，绞纱 100–500g。',
      h1: '羊绒纱线·纤维批发',
      intro: '浏览鄂尔多斯工厂精选羊绒纱线与纤维：筒纱、绞纱、针织纱、机织纱、未经染整的原料纤维。支数 Nm 2/26 到 Nm 2/60。按公斤销售，适用于分销与工业用途。',
      keywords: ['羊绒纱线', '羊绒纤维', '羊绒筒纱', '羊绒绞纱', '羊绒针织纱', '羊绒机织纱', '羊绒纱线批发', '蒙古羊绒纱线', '羊绒纱线厂家'],
    },
  },
};

// Static URL slug → categoryId map for /[locale]/category/[slug]/ routing.
export const CATEGORY_SLUGS: Record<string, string> = {
  'cashmere-hats': 'hats',
  'cashmere-sweaters': 'sweaters',
  'cashmere-scarves': 'scarves',
  'cashmere-accessories': 'accessories',
  'cashmere-yarn': 'yarn',
};

// Display name per category (used for schema + chip labels).
export const CATEGORY_DISPLAY: Record<string, string> = {
  hats: 'Cashmere Hats & Beanies',
  sweaters: 'Cashmere Sweaters & Knitwear',
  scarves: 'Cashmere Scarves & Wraps',
  accessories: 'Cashmere Accessories',
  yarn: 'Cashmere Yarn & Fiber',
};