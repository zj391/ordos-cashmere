/**
 * GEO SEO 配置中心
 * 每个语种独立：TDK / 地域关键词 / Schema / Sitemap
 */

import { LOCALE_HREFLANG, type Locale } from './i18n';
import { SEO_KEYWORDS, getSeoKeywords } from '@/data/seo-keywords';

// Canonical hostname must match astro.config.mjs `site` and public/robots.txt
// Sitemap line. Vercel 308-redirects the apex (erdosdx.com) to www, so all
// outbound URL emission (canonical, hreflang, JSON-LD schema, OG) goes to www.
export const SITE_URL = 'https://www.erdosdx.com';

export const SITE_INFO = {
  name: 'DONGXIAO® CASHMERE',
  legalName: 'Ordos Dongxiao Cashmere Co., Ltd.',
  foundingYear: 2002,
  country: 'CN',
  city: 'Ordos',
  region: 'Inner Mongolia',
  address: 'Ordos Industrial Park, Inner Mongolia, China',
  phone: '+86-156-6185-3999',
  whatsapp: '+8615661853999',
  email: 'dongxiaocashmere@erdosdx.com',
  wechatId: 'dongxiaocashmere',
  // 地图坐标（鄂尔多斯）
  latitude: 39.6086,
  longitude: 109.7813,
  // 工厂规模
  scale: {
    annualCapacity: '1,200+ tons dehairing cashmere',
    employees: '500+',
    factoryArea: '38,000 sqm',
    countries: '50+',
    yearsExperience: '23+',
  },
  social: {
    linkedin: 'https://www.linkedin.com/company/dongxiao-cashmere',
    instagram: 'https://www.instagram.com/dongxiaocashmere',
    facebook: 'https://www.facebook.com/dongxiaocashmere',
    youtube: 'https://www.youtube.com/@dongxiaocashmere',
  },
};

/**
 * 每个语种的 TDK 配置
 * 关键词已经按地域差异化布局
 */
export interface PageSEO {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
}

export interface LocaleSEO {
  locale: Locale;
  hreflang: string;
  currency: string;
  region: string;
  market: string;
  home: PageSEO;
  rawMaterial: PageSEO;
  yarnFabric: PageSEO;
  garmentOem: PageSEO;
  factory: PageSEO;
  ordosOrigin: PageSEO;
  contact: PageSEO;
  blog: PageSEO;
  download: PageSEO;
  faq: PageSEO;
  privacy: PageSEO;
}

export const SEO: Record<Locale, LocaleSEO> = {
  en: {
    locale: 'en',
    hreflang: 'en',
    currency: 'USD',
    region: 'Global',
    market: 'Global / Europe / North America',
    home: {
      title: 'Erdos Cashmere Manufacturer | China Factory Direct | 23-Year | DONGXIAO®',
      description: 'Erdos cashmere clothing manufacturer direct from Ordos, Inner Mongolia. 23-year factory: cashmere hats, sweaters, scarves, yarn for 50+ countries. ISO 9001 + OEKO-TEX certified.',
      keywords: ['cashmere manufacturer', 'B2B cashmere supplier', 'Ordos cashmere factory', 'Inner Mongolia cashmere', 'wholesale cashmere yarn', 'cashmere OEM', 'luxury knitwear manufacturer', 'Europe cashmere supplier', 'USA cashmere wholesale', 'erdos cashmere manufacturer', 'erdos clothing website', 'erdos cashmere clothing', 'ordos cashmere clothing'],
    },
    rawMaterial: {
      title: 'Premium Raw Cashmere Material | White, Brown, Grey | Direct from Ordos Factory',
      description: 'Buy premium raw cashmere fiber directly from Ordos factory. White, brown (qing), purple (zi) cashmere. 14.5-16.5μm fineness. Bulk pricing for global B2B buyers.',
      keywords: ['raw cashmere fiber', 'white cashmere', 'brown cashmere', 'cashmere raw material wholesale',
        'dehaired cashmere', 'combed cashmere',
        'dehaired cashmere tops', 'greasy cashmere goat wool', '14.5μm superfine cashmere',
        'white raw cashmere bulk supply', 'cashmere noil', 'cashmere combed top wholesale',
        'Ordos dehaired cashmere', 'Mongolian greasy cashmere fiber',
        'where to buy bulk raw Mongolian cashmere', 'best Ordos cashmere fiber supplier China',
        'superfine white cashmere dehaired top factory', 'eco-friendly scoured cashmere fiber wholesale',
      ],
    },
    yarnFabric: {
      title: 'Cashmere Yarn Wholesale: Greige / Dyed | 26/2-48/2 | Inner Mongolia',
      description: 'Wholesale cashmere yarn direct from Ordos mill. Greige (undyed natural white/brown/purple) + dyed options. Counts 26/2 to 48/2. 100% cashmere or blends. For brands that dye in-house. Free hand-loom sample.',
      keywords: ['cashmere yarn wholesale', 'undyed cashmere yarn wholesale', 'greige cashmere yarn', 'raw white cashmere yarn', 'brown cashmere yarn qing', 'purple cashmere yarn zi', 'natural cashmere yarn for dyers', 'cashmere yarn 26/2', 'cashmere yarn 28/2', 'cashmere yarn 36/2', 'cashmere yarn 48/2', 'worsted cashmere yarn', 'woolen cashmere yarn', '100% cashmere yarn', 'wool cashmere blend yarn', 'hand knitting cashmere yarn', 'dyed cashmere yarn manufacturer', 'fine count cashmere yarn 2/48Nm 2/60Nm', 'cashmere yarn for sweater making', 'mixed Ordos Mongolian cashmere yarn', 'high quality worsted cashmere yarn from Inner Mongolia', 'anti-pilling cashmere blend yarn for knitwear brand', 'customized color cashmere yarn bulk order supplier', 'cashmere yarn moq 20kg', 'cashmere yarn sample',
        'cashmere coating fabric', 'woven cashmere fabric', 'cashmere jacquard fabric',
        'lightweight cashmere fabric', 'cashmere silk blend fabric', 'thick cashmere wool fabric for coats',
        'soft cashmere woven fabric for luxury overcoat',
        'sustainable cashmere silk fabric manufacturer OEM',
        'lightweight cashmere fabric for women clothing',
      ],
    },
    garmentOem: {
      title: 'Cashmere Garment OEM/ODM | Sweater, Coat & Dress Manufacturer',
      description: 'Full-service cashmere garment OEM/ODM: sweaters, cardigans, coats, dresses, scarves. Custom design, sampling, production. MOQ 100pcs. 23+ years experience serving global brands.',
      keywords: ['cashmere sweater OEM', 'cashmere garment manufacturer', 'private label cashmere',
        'custom cashmere knitwear', 'cashmere coat manufacturer',
        'custom cashmere sweater wholesale', 'cashmere coat manufacturer',
        'cashmere scarf shawl factory', 'private label cashmere knitwear',
        'cashmere hat glove wholesale', 'luxury cashmere blanket supplier',
        'private label cashmere sweater factory Ordos China',
        'small MOQ cashmere coat manufacturer',
        'wholesale cashmere shawl with custom logo',
        'OEKO-TEX certified cashmere clothing supplier',
      ],
    },
    factory: {
      title: 'Factory Strength | 23+ Years Cashmere Production | Ordos Industrial Park',
      description: '38,000 sqm Ordos factory. 500+ employees. 1,200+ tons annual capacity. ISO 9001, OEKO-TEX, GCS certified. Direct from source, no middleman.',
      keywords: ['cashmere factory', 'Ordos manufacturer', 'ISO certified cashmere', 'OEKO-TEX cashmere',
        'Ordos cashmere factory', 'Mongolian cashmere supplier', 'Inner Mongolia cashmere mill',
        'China cashmere manufacturer', 'full chain cashmere factory', 'raw cashmere factory',
        'cashmere yarn spinning mill', 'custom cashmere clothing factory',
        'wholesale cashmere supplier', 'cashmere OEM ODM factory',
        'bulk cashmere raw material supplier', 'sustainable cashmere factory',
        'full industrial chain cashmere manufacturer Ordos',
        'cashmere factory with Mongolia raw material source',
        'direct cashmere mill no middleman', 'large capacity cashmere factory bulk export',
        'ISO OEKO-TEX cashmere supplier China',
      ],
    },
    ordosOrigin: {
      title: 'Ordos Cashmere Origin | Inner Mongolia Heritage & Quality',
      description: "Discover why Ordos, Inner Mongolia is the world's premium cashmere origin. Albus goat breeding, climate, traceability, and sustainable grazing practices.",
      keywords: ['Ordos cashmere origin', 'Inner Mongolia cashmere', 'Albus goat', 'cashmere terroir', 'sustainable cashmere',
        'Ordos & Mongolian cashmere supplier', '100% Ordos cashmere',
        'pure Mongolian raw cashmere', 'Inner Mongolia Ordos cashmere factory',
        'mixed Ordos Mongolian cashmere yarn', 'premium cashmere from Ordos and Mongolia',
      ],
    },
    contact: {
      title: 'Contact Dongxiao Cashmere | WhatsApp +86-156-6185-3999',
      description: 'Contact our cashmere specialists directly via WhatsApp, WeChat, email or phone. Response within 24 hours. English & Chinese speaking team.',
      keywords: ['contact cashmere supplier', 'cashmere inquiry', 'WhatsApp cashmere'],
    },
    blog: {
      title: 'Cashmere B2B Insights & Sourcing Guides | DONGXIAO Blog',
      description: 'Industry insights, cashmere sourcing guides, MOQ/lead-time/shipping tips for global B2B buyers. Updated weekly by Ordos factory experts.',
      keywords: ['cashmere blog', 'B2B sourcing guide', 'cashmere industry insights'],
    },
    download: {
      title: 'Download Center | Catalog, Specs, Certifications | Dongxiao Cashmere',
      description: 'Download cashmere product catalogs, technical specifications, certifications (ISO, OEKO-TEX, GCS), and factory audit reports. B2B buyers only.',
      keywords: ['cashmere catalog download', 'cashmere certifications', 'factory audit report'],
    },
    faq: {
      title: 'B2B Cashmere Sourcing FAQ | MOQ, Lead Time, Samples, Payment',
      description: 'Common questions about cashmere sourcing: MOQ, lead time, sample policy, payment terms, shipping, customs. B2B buyer guide.',
      keywords: ['cashmere MOQ', 'cashmere lead time', 'cashmere sample policy', 'B2B cashmere FAQ'],
    },
    privacy: {
      title: 'Privacy Policy | Dongxiao Cashmere',
      description: 'Privacy policy for Dongxiao Cashmere website and services.',
      keywords: ['privacy policy', 'GDPR'],
    },
  },
  de: {
    locale: 'de',
    hreflang: 'de',
    currency: 'EUR',
    region: 'Germany / EU',
    market: 'Deutschland / EU',
    home: {
      title: 'Kaschmir Hersteller Ordos | Innere Mongolei B2B | 23+ Jahre',
      description: 'Erdos Kaschmir Hersteller aus der Inneren Mongolei, China. 23+ Jahre Erfahrung: Rohkaschmir, Kaschmirgarn, Kaschmirstoff & OEM-Strickwaren für deutsche und EU-Marken. ISO 9001 + OEKO-TEX zertifiziert. Kleine MOQ möglich.',
      keywords: ['Kaschmir Hersteller', 'B2B Kaschmir Lieferant', 'Kaschmir Großhandel', 'Ordos Kaschmir', 'Innere Mongolei Kaschmir', 'Kaschmir Garn', 'Kaschmir stricken', 'Kaschmir Erdos', 'Kaschmir Hersteller Ordos', 'Erdos Kaschmir Hersteller', 'Kaschmir Großhandel Deutschland'],
    },
    rawMaterial: {
      title: 'Premium Rohkaschmir | Weiß, Braun, Grau | Direkt ab Werk Ordos',
      description: 'Premium-Rohkaschmir direkt ab Werk Ordos kaufen. Weiß, Braun, Lila Kaschmir. 14.5-16.5μm Feinheit. Mengenpreise für B2B-Käufer.',
      keywords: getSeoKeywords('de', 'raw'),
    },
    yarnFabric: {
      title: 'Kaschmirgarn & Webstoff | Kammgarn & Streichgarn | B2B',
      description: 'Premium-Kaschmirgarn und Webstoff für B2B-Käufer. Individuelle Feinheiten, Farben, Mischungen. Direkt aus der Ordos-Spinnerei.',
      keywords: getSeoKeywords('de', 'yarn'),
    },
    garmentOem: {
      title: 'Kaschmir-Strickwaren OEM/ODM | Pullover, Mantel Hersteller',
      description: 'Full-Service Kaschmir-Strickwaren OEM/ODM: Pullover, Strickjacken, Mäntel, Kleider, Schals. Eigenes Design, Muster, Produktion. MOQ 100 Stk.',
      keywords: getSeoKeywords('de', 'garment'),
    },
    factory: {
      title: 'Fabrikstärke | 23+ Jahre Kaschmirproduktion | Ordos Industriepark',
      description: '38.000 qm Fabrik in Ordos. 500+ Mitarbeiter. 1.200+ Tonnen Jahreskapazität. ISO 9001, OEKO-TEX zertifiziert. Direkt vom Erzeuger.',
      keywords: getSeoKeywords('de', 'factory'),
    },
    ordosOrigin: {
      title: 'Ordos Kaschmir Herkunft | Innere Mongolei Erbe & Qualität',
      description: 'Erfahren Sie, warum Ordos, Innere Mongolei die Premium-Kaschmirherkunft der Welt ist. Albus-Ziegen, Klima, Rückverfolgbarkeit.',
      keywords: getSeoKeywords('de', 'origin'),
    },
    contact: {
      title: 'Kontakt | Dongxiao Cashmere | WhatsApp +86-156-6185-3999',
      description: 'Kontaktieren Sie unsere Kaschmir-Spezialisten direkt per WhatsApp, WeChat, E-Mail oder Telefon. Antwort innerhalb von 24 Stunden.',
      keywords: ['Kaschmir Kontakt', 'Kaschmir Anfrage'],
    },
    blog: {
      title: 'Kaschmir Einblicke & B2B Beschaffungsratgeber | DONGXIAO Blog',
      description: 'Branchen-Einblicke, Kaschmir-Beschaffungsratgeber, MOQ/Lieferzeit/Versand-Tipps für globale B2B-Käufer. Wöchentlich aktualisiert.',
      keywords: ['Kaschmir Blog', 'B2B Beschaffung'],
    },
    download: {
      title: 'Download Center | Katalog, Spezifikationen, ISO/OEKO-TEX Zertifikate',
      description: 'Laden Sie Kaschmir-Produktkataloge, technische Spezifikationen, ISO 9001 und OEKO-TEX Zertifikate sowie Fabrik-Auditberichte herunter. Nur für B2B-Käufer.',
      keywords: ['Kaschmir Katalog', 'Kaschmir Zertifikate'],
    },
    faq: {
      title: 'B2B Kaschmir Beschaffung FAQ | MOQ, Lieferzeit, Muster',
      description: 'Häufige Fragen zur Kaschmir-Beschaffung: MOQ, Lieferzeit, Musterpolitik, Zahlungsbedingungen, Versand.',
      keywords: ['Kaschmir MOQ', 'Kaschmir Lieferzeit'],
    },
    privacy: {
      title: 'Datenschutzerklärung | Dongxiao Cashmere',
      description: 'Datenschutzerklärung für Dongxiao Cashmere.',
      keywords: ['Datenschutz', 'DSGVO'],
    },
  },
  fr: {
    locale: 'fr',
    hreflang: 'fr',
    currency: 'EUR',
    region: 'France / EU',
    market: 'France / UE',
    home: {
      title: 'Cachemire Erdos Fabricant | Mongolie Intérieure B2B | 23+ ans',
      description: "Fabricant cachemire Erdos basé en Mongolie Intérieure, Chine. 23+ ans d'expérience: cachemire brut, fil à tricoter, tissu cachemire et OEM maille pour marques françaises et EU. Certifié ISO 9001 + OEKO-TEX. Petites MOQ acceptées. Échantillon gratuit.",
      keywords: ['fabricant cachemire', 'fournisseur cachemire B2B', 'cachemire Ordos', 'Mongolie Intérieure cachemire', 'gros cachemire', 'cachemire OEM', 'cachemire Erdos', 'cachemire Ordos fabricant', 'Mongolie Intérieure cachemire fournisseur', 'cachemire France grossiste'],
    },
    rawMaterial: {
      title: "Cachemire Brut Premium | Blanc, Brun, Gris | Usine Ordos",
      description: "Achetez du cachemire brut directement de l'usine d'Ordos. Blanc, brun, violet. Finesse 14.5-16.5μm. Prix de gros pour acheteurs B2B.",
      keywords: getSeoKeywords('fr', 'raw'),
    },
    yarnFabric: {
      title: "Fil & Tissu Cachemire | Peigné & Cardé | B2B Grossiste | Ordos",
      description: "Fil et tissu de cachemire premium pour acheteurs B2B. Titres, couleurs, mélanges personnalisés. Directement de la filature d'Ordos, Mongolie Intérieure. Échantillon gratuit.",
      keywords: getSeoKeywords('fr', 'yarn'),
    },
    garmentOem: {
      title: "Vêtements Cachemire OEM/ODM | Pull, Manteau, Robe Fabricant | MOQ 100",
      description: "Service complet OEM/ODM vêtements cachemire: pulls, cardigans, manteaux, robes, écharpes. Design, prototypage, production. MOQ 100 pièces. 23+ ans d'expérience.",
      keywords: getSeoKeywords('fr', 'garment'),
    },
    factory: {
      title: "Force de l'Usine | 23+ Ans Production Cachemire | Ordos",
      description: 'Usine de 38 000 m² à Ordos. 500+ employés. 1 200+ tonnes de capacité annuelle. Certifié ISO, OEKO-TEX.',
      keywords: getSeoKeywords('fr', 'factory'),
    },
    ordosOrigin: {
      title: 'Origine Cachemire Ordos | Patrimoine Mongolie Intérieure | Traçabilité',
      description: "Découvrez pourquoi Ordos, Mongolie Intérieure est l'origine premium du cachemire mondial. Chèvres Albas, climat, traçabilité de la fibre au produit fini.",
      keywords: getSeoKeywords('fr', 'origin'),
    },
    contact: {
      title: 'Contact | DONGXIAO Cachemire | WhatsApp +86-156-6185-3999 | Réponse 24h',
      description: 'Contactez nos spécialistes cachemire par WhatsApp, WeChat, email ou téléphone. Équipe bilingue français-anglais. Réponse sous 24h, devis sous 48h.',
      keywords: ['contact cachemire'],
    },
    blog: {
      title: "Aperçus Cachemire & Guides d'Approvisionnement B2B | Blog DONGXIAO",
      description: "Analyses du secteur, guides d'approvisionnement cachemire, conseils MOQ/délai/expédition pour acheteurs B2B. Mis à jour chaque semaine.",
      keywords: ['blog cachemire'],
    },
    download: {
      title: 'Centre de Téléchargement | Catalogue, Specs, Certifications ISO/OEKO-TEX',
      description: "Téléchargez catalogues produits cachemire, spécifications techniques, certifications ISO 9001 et OEKO-TEX, rapports d'audit usine. Réservé aux acheteurs B2B.",
      keywords: ['catalogue cachemire'],
    },
    faq: {
      title: "FAQ Approvisionnement Cachemire B2B | MOQ, Délai, Échantillon, Paiement",
      description: "Questions fréquentes sur l'approvisionnement en cachemire: MOQ, délai de livraison, politique d'échantillon, conditions de paiement, douanes.",
      keywords: ['cachemire MOQ'],
    },
    privacy: {
      title: 'Politique de Confidentialité | Dongxiao Cashmere',
      description: 'Politique de confidentialité du site Dongxiao Cashmere.',
      keywords: ['confidentialité', 'RGPD'],
    },
  },
  ja: {
    locale: 'ja',
    hreflang: 'ja',
    currency: 'JPY',
    region: 'Japan',
    market: '日本市場',
    home: {
      title: 'オルドス カシミア製造元 | 内モンゴル B2B 卸売 | 23年以上の実績',
      description: 'オルドス（内モンゴル）発のカシミア製造元・卸売サプライヤー。23年以上の歴史。原料カシミア・紡績糸・生地・OEMニットを日本・アジア・欧米ブランドへ直送。ISO 9001・OEKO-TEX 認証。MOQ 小ロット対応。',
      keywords: ['カシミア製造元', 'B2B カシミア サプライヤー', 'オルドス カシミア', '内モンゴル カシミア', 'カシミア 卸売', 'カシミア OEM', '日本 カシミア', 'オルドス カシミア製造', 'オルドス 内モンゴル カシミア', 'カシミア 卸売業者 日本向け'],
    },
    rawMaterial: {
      title: 'プレミアム原料カシミア | 白・青・紫 | オルドス工場直送 | B2B',
      description: 'オルドス（内モンゴル）工場から直接原料カシミアを購入。白、青、紫カシミア、繊維径14.5-16.5μm。B2Bバイヤー向けロット価格、即時見積もり対応。',
      keywords: getSeoKeywords('ja', 'raw'),
    },
    yarnFabric: {
      title: 'カシミア糸・生地 | 梳毛・紡毛 | B2B卸売 | オルドス紡績',
      description: 'B2Bバイヤー向けプレミアムカシミア糸（26/2〜48/2）と織物。カスタム番手・色・混紡対応。オルドス紡績工場直送、無料サンプル提供。',
      keywords: getSeoKeywords('ja', 'yarn'),
    },
    garmentOem: {
      title: 'カシミア衣料 OEM/ODM | セーター・コート製造 | MOQ 100枚〜',
      description: 'カシミア衣料のフルサービス OEM/ODM：セーター、カーディガン、コート、ドレス、ショール。デザイン・サンプル・量産。MOQ 100枚、23年以上の実績。',
      keywords: getSeoKeywords('ja', 'garment'),
    },
    factory: {
      title: '工場の強み | 23年以上カシミア生産 | オルドス工業団地 38,000㎡',
      description: '38,000平方メートルのオルドス工場。500名以上の従業員。年間1,200トン以上の生産能力。ISO 9001・OEKO-TEX 認証取得。工場見学歓迎。',
      keywords: getSeoKeywords('ja', 'factory'),
    },
    ordosOrigin: {
      title: 'オルドス カシミアの起源 | 内モンゴルの遺産と品質保証',
      description: 'オルドス（内モンゴル）が世界の高級カシミア産地である理由を発見。アルバス白山羊、気候、放牧、繊維から製品までのトレーサビリティ。',
      keywords: getSeoKeywords('ja', 'origin'),
    },
    contact: {
      title: 'お問い合わせ | DONGXIAO カシミア | WhatsApp +86-156-6185-3999',
      description: 'WhatsApp、WeChat、メールでカシミア専門家に直接お問い合わせください。日本市場専任チーム、24時間以内に返信、無料サンプル対応。',
      keywords: ['カシミア お問い合わせ'],
    },
    blog: {
      title: 'カシミア インサイト & B2B調達ガイド | DONGXIAO ブログ',
      description: '業界インサイト、カシミア調達ガイド、MOQ・リードタイム・配送のポイントをグローバルB2Bバイヤー向けに毎週更新。',
      keywords: ['カシミア ブログ'],
    },
    download: {
      title: 'ダウンロードセンター | カタログ・仕様書・ISO/OEKO-TEX認証',
      description: 'カシミア製品カタログ、技術仕様書、ISO 9001・OEKO-TEX認証、工場監査レポートをダウンロード。B2Bバイヤー限定。',
      keywords: ['カシミア カタログ'],
    },
    faq: {
      title: 'B2B カシミア調達 FAQ | MOQ・リードタイム・サンプル・支払条件',
      description: 'カシミア調達のよくある質問：MOQ、リードタイム、サンプルポリシー、支払条件、輸送、通関手続きについて。',
      keywords: ['カシミア MOQ'],
    },
    privacy: {
      title: 'プライバシーポリシー | Dongxiao Cashmere',
      description: 'Dongxiao Cashmere のプライバシーポリシー。',
      keywords: ['プライバシー'],
    },
  },
  kr: {
    locale: 'kr',
    hreflang: 'ko',
    currency: 'KRW',
    region: 'Korea',
    market: '한국 시장',
    home: {
      title: '오르도스 캐시미어 제조사 | 내몽골 B2B 도매 | 23년 이상의 경험',
      description: '내몽골 오르도스 기반의 B2B 캐시미어 제조·도매 업체. 23년 이상의 업력으로 프리미엄 원료 캐시미아, 방모사·소모사, 원단, OEM 니트웨어를 한국·아시아·유럽·미국 브랜드에 직송합니다. ISO 9001·OEKO-TEX 인증. 소량 MOQ 가능.',
      keywords: ['캐시미어 제조사', 'B2B 캐시미어 공급', '오르도스 캐시미어', '내몽골 캐시미어', '캐시미어 도매', '캐시미어 OEM', '오르도스 캐시미어 공장', '내몽골 캐시미어 도매', '한국 캐시미어 수입'],
    },
    rawMaterial: {
      title: '프리미엄 원료 캐시미어 | 백색·청색·자색 | 오르도스 공장 직송 | B2B',
      description: '오르도스(내몽골) 공장에서 직접 프리미엄 원료 캐시미어 구매. 백색, 청색, 자색, 섬유경 14.5-16.5μm. B2B 바이어 대상 lot 견적, 빠른 샘플 발송.',
      keywords: getSeoKeywords('kr', 'raw'),
    },
    yarnFabric: {
      title: '캐시미어 원사 & 직물 | 소모사 & 방모사 | B2B 도매 | 오르도스 방적',
      description: 'B2B 바이어를 위한 프리미엄 캐시미어 원사(26/2~48/2) 및 직물. 맞춤 번수·색상·혼방. 오르도스 방적 공장 직송, 무료 샘플 제공.',
      keywords: getSeoKeywords('kr', 'yarn'),
    },
    garmentOem: {
      title: '캐시미어 의류 OEM/ODM | 스웨터·코트 제조 | MOQ 100장부터',
      description: '캐시미어 의류 풀서비스 OEM/ODM: 스웨터, 카디건, 코트, 드레스, 숄. 디자인·샘플·양산. MOQ 100장, 23년 이상의 업력.',
      keywords: getSeoKeywords('kr', 'garment'),
    },
    factory: {
      title: '공장 강점 | 23년 이상의 캐시미어 생산 | 오르도스 산업단지 38,000㎡',
      description: '38,000 sqm 오르도스 공장. 500명 이상 직원. 연 1,200톤 이상 생산 능력. ISO 9001·OEKO-TEX 인증. 공장 방문 환영.',
      keywords: getSeoKeywords('kr', 'factory'),
    },
    ordosOrigin: {
      title: '오르도스 캐시미어 원산지 | 내몽골 유산과 품질 보증',
      description: '오르도스, 내몽골이 세계 최고급 캐시미어 원산지인 이유를 알아보세요. 알버스 흰산양, 기후, 방목, 섬유에서 완제품까지 이력 추적.',
      keywords: getSeoKeywords('kr', 'origin'),
    },
    contact: {
      title: '문의 | DONGXIAO 캐시미어 | WhatsApp +86-156-6185-3999 | 24시간 회신',
      description: 'WhatsApp, WeChat, 이메일로 캐시미어 전문가에게 직접 문의하세요. 한국 시장 전담팀, 24시간 이내 회신, 무료 샘플 지원.',
      keywords: ['캐시미어 문의'],
    },
    blog: {
      title: '캐시미어 인사이트 & B2B 소싱 가이드 | DONGXIAO 블로그',
      description: '산업 인사이트, 캐시미어 소싱 가이드, MOQ·리드타임·배송 팁을 글로벌 B2B 바이어에게 매주 업데이트.',
      keywords: ['캐시미어 블로그'],
    },
    download: {
      title: '다운로드 센터 | 카탈로그·사양서·ISO/OEKO-TEX 인증',
      description: '캐시미어 제품 카탈로그, 기술 사양, ISO 9001·OEKO-TEX 인증서, 공장 감사 보고서 다운로드. B2B 바이어 한정.',
      keywords: ['캐시미어 카탈로그'],
    },
    faq: {
      title: 'B2B 캐시미어 소싱 FAQ | MOQ·리드타임·샘플·결제 조건',
      description: '캐시미어 소싱에 대한 자주 묻는 질문: MOQ, 리드타임, 샘플 정책, 결제 조건, 배송, 통관 절차.',
      keywords: ['캐시미어 MOQ'],
    },
    privacy: {
      title: '개인정보 처리방침 | Dongxiao Cashmere',
      description: 'Dongxiao Cashmere 웹사이트 개인정보 처리방침.',
      keywords: ['개인정보'],
    },
  },
  cn: {
    locale: 'cn',
    hreflang: 'zh-CN',
    currency: 'CNY',
    region: 'China',
    market: '中国 / 跨境贸易',
    home: {
      title: '鄂尔多斯羊绒源头工厂 | 内蒙古B2B出口 | 23年ISO认证 | 东霄',
      description: '内蒙古鄂尔多斯羊绒源头工厂，23年专注B2B出口。直供白绒/青绒/紫绒原料、精纺/粗纺羊绒纱线、羊绒面料、羊绒成衣OEM/ODM代工。ISO 9001+OEKO-TEX认证，年产能1200吨，服务全球50+国家。MOQ 100件起，免费打样。',
      keywords: ['鄂尔多斯羊绒源头工厂', '内蒙古羊绒原料基地', '羊绒纱线出口工厂', '羊绒大衣代工', '羊绒衫代工', 'B2B羊绒供应商', '羊绒OEM', '鄂尔多斯羊绒厂家', '内蒙古羊绒纱线', '羊绒原料批发', '羊绒成衣代工厂', '山羊绒分梳', '羊绒OEM代工', '中国羊绒出口'],
    },
    rawMaterial: {
      title: '羊绒原料批发 | 白绒/青绒/紫绒 | 鄂尔多斯源头工厂直供 | B2B出口',
      description: '内蒙古鄂尔多斯羊绒原料源头工厂直供。白绒、青绒、紫绒，细度14.5-16.5μm。B2B批发、全球出口、当年剪毛新鲜货源。MOQ 100kg起。',
      keywords: ['白绒', '青绒', '紫绒', '羊绒原料', '分梳山羊绒', '山羊原绒'],
    },
    yarnFabric: {
      title: '羊绒纱线/羊绒面料批发 | 精纺/粗纺 | B2B工厂直供 | 出口',
      description: '羊绒纱线（26/2、28/2、36/2、48/2）和羊绒面料（精纺/粗纺）源头工厂直供。可定制支数、颜色、混纺。MOQ 20kg起，免费色卡与样品。',
      keywords: ['羊绒纱线', '羊绒面料', '精纺羊绒', '粗纺羊绒', '羊绒纱线26支', '羊绒纱线28支'],
    },
    garmentOem: {
      title: '羊绒成衣代工OEM/ODM | 大衣/衫/裙源头工厂 | MOQ 100件 | 23年',
      description: '羊绒成衣代工源头工厂：羊绒大衣、羊绒衫、羊绒裙、羊绒围巾。设计、打样、生产一站式。MOQ 100件起，服务全球品牌23年。',
      keywords: ['羊绒大衣代工', '羊绒衫代工', '羊绒围巾代工', '羊绒OEM代工', '羊绒ODM', '羊绒服装定制'],
    },
    factory: {
      title: '工厂实力 | 23年羊绒生产 | 鄂尔多斯38,000㎡产业园 | ISO认证',
      description: '38,000平米鄂尔多斯生产基地，500+员工，年产能1200+吨分梳羊绒。ISO 9001、OEKO-TEX、GCS认证。源头直供无中间商，工厂视频可看。',
      keywords: ['羊绒工厂', '鄂尔多斯羊绒厂', '羊绒生产基地'],
    },
    ordosOrigin: {
      title: '鄂尔多斯羊绒产地 | 内蒙古地理优势 | 阿尔巴斯白绒山羊溯源',
      description: '鄂尔多斯羊绒产区的地理优势、阿尔巴斯白绒山羊、牧场、可持续放牧、产地溯源全流程。原产地证书可查，纤维到成衣可追溯。',
      keywords: ['鄂尔多斯羊绒产地', '阿尔巴斯白绒山羊', '内蒙古羊绒产区'],
    },
    contact: {
      title: '联系我们 | 东霄羊绒 | 微信/WhatsApp +86-156-6185-3999 | 24小时回复',
      description: '通过微信、WhatsApp、邮件、电话联系我们的羊绒专家团队。中英双语，24小时内回复，48小时内出报价，免费打样。',
      keywords: ['羊绒供应商联系', '羊绒询盘'],
    },
    blog: {
      title: '羊绒行业洞察 & B2B采购指南 | 东霄博客',
      description: '羊绒行业洞察、采购指南、趋势分析、MOQ/交期/物流实操。面向跨境B2B买家，每周更新。',
      keywords: ['羊绒博客', '羊绒采购指南'],
    },
    download: {
      title: '资料下载中心 | 羊绒目录/规格/ISO/OEKO-TEX/GCS认证',
      description: '羊绒产品目录、技术规格、认证资料（ISO 9001/OEKO-TEX/GCS）、工厂审计报告下载。B2B买家限定，提供中英文版本。',
      keywords: ['羊绒目录下载', '羊绒认证'],
    },
    faq: {
      title: '羊绒采购常见问题 | MOQ/交期/打样/付款/物流/清关',
      description: '羊绒采购常见问题：起订量、交期、打样政策、付款方式、物流、清关、出口退税等全流程解答。',
      keywords: ['羊绒MOQ', '羊绒交期'],
    },
    privacy: {
      title: '隐私政策 | 东霄羊绒',
      description: '东霄羊绒网站隐私政策。',
      keywords: ['隐私政策'],
    },
  },
};

/**
 * 生成 hreflang 链接集合（每个实际存在的语种 + x-default）。
 *
 * 全站采用 trailingSlash: 'always'，所以这里始终输出带尾斜杠的首选 URL。
 * 动态内容（如博客）可传入实际拥有该 slug 的语种，避免向搜索引擎声明
 * 不存在的翻译页；静态页面不传参数时保留全部语种的既有行为。
 */
export function generateHreflangs(
  path: string,
  availableLocales: Locale[] = Object.keys(SEO) as Locale[],
): Array<{ lang: string; href: string }> {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const canonicalPath = normalizedPath.endsWith('/') ? normalizedPath : `${normalizedPath}/`;
  const locales = Array.from(new Set(availableLocales)).filter((locale) => Boolean(SEO[locale]));
  const resolvedLocales = locales.length ? locales : ['en' as Locale];
  const fallbackLocale = resolvedLocales.includes('en') ? 'en' : resolvedLocales[0];

  const list = resolvedLocales.map((locale) => ({
    lang: SEO[locale].hreflang,
    href: `${SITE_URL}/${locale}${canonicalPath}`,
  }));
  list.push({ lang: 'x-default', href: `${SITE_URL}/${fallbackLocale}${canonicalPath}` });
  return list;
}
