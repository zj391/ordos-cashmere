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
      title: 'Ordos Cashmere Product Catalogue | Raw Material, Yarn, Fabric & Knitwear | DONGXIAO®',
      description: 'Explore the DONGXIAO Ordos cashmere product catalogue for raw material, yarn, fabric, knitwear, scarves and accessories. Share a product reference, quantity, destination and required specifications for a written discussion.',
      keywords: ['cashmere manufacturer', 'B2B cashmere supplier', 'Ordos cashmere catalogue', 'Ordos cashmere scarves', 'Inner Mongolia cashmere', 'wholesale cashmere yarn', 'cashmere OEM', 'luxury knitwear manufacturer', 'Europe cashmere supplier', 'USA cashmere wholesale', 'erdos cashmere manufacturer', 'erdos clothing website', 'erdos cashmere clothing', 'ordos cashmere clothing'],
    },
    rawMaterial: {
      title: 'Raw Cashmere Material Sourcing | White, Brown & Purple Fiber | DONGXIAO®',
      description: 'Discuss white, brown or purple cashmere requirements with the intended use, quantity, destination and requested fiber documentation.',
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
      title: 'Cashmere Yarn & Fabric Sourcing | Greige, Dyed & Woven | DONGXIAO®',
      description: 'Discuss yarn and fabric construction, color direction, quantity, destination and required documentation for a written sourcing review.',
      keywords: ['cashmere yarn wholesale', 'undyed cashmere yarn wholesale', 'greige cashmere yarn', 'raw white cashmere yarn', 'brown cashmere yarn qing', 'purple cashmere yarn zi', 'natural cashmere yarn for dyers', 'cashmere yarn 26/2', 'cashmere yarn 28/2', 'cashmere yarn 36/2', 'cashmere yarn 48/2', 'worsted cashmere yarn', 'woolen cashmere yarn', '100% cashmere yarn', 'wool cashmere blend yarn', 'hand knitting cashmere yarn', 'dyed cashmere yarn manufacturer', 'fine count cashmere yarn 2/48Nm 2/60Nm', 'cashmere yarn for sweater making', 'mixed Ordos Mongolian cashmere yarn', 'high quality worsted cashmere yarn from Inner Mongolia', 'anti-pilling cashmere blend yarn for knitwear brand', 'customized color cashmere yarn bulk order supplier', 'cashmere yarn project terms', 'cashmere yarn sample discussion',
        'cashmere coating fabric', 'woven cashmere fabric', 'cashmere jacquard fabric',
        'lightweight cashmere fabric', 'cashmere silk blend fabric', 'thick cashmere wool fabric for coats',
        'soft cashmere woven fabric for luxury overcoat',
        'cashmere silk fabric manufacturer OEM',
        'lightweight cashmere fabric for women clothing',
      ],
    },
    garmentOem: {
      title: 'Cashmere Garment OEM/ODM | Sweater, Coat & Dress Manufacturer',
      description: 'Discuss cashmere garment OEM/ODM requirements with product references, specifications, quantity, destination, sampling and required documentation.',
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
      title: 'Contact Dongxiao Cashmere | Product & Quote Inquiries',
      description: 'Contact DONGXIAO Cashmere by WhatsApp, WeChat, email or phone. Include product, quantity, destination and specification requirements for a written sourcing discussion.',
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
      title: 'Kaschmir Beschaffung | Rohmaterial, Garn, Stoff & Strick | DONGXIAO®',
      description: 'Entdecken Sie Rohmaterial, Garn, Stoff und Strickwaren für die B2B-Beschaffung. Produktreferenz, Menge, Zielort und Spezifikationen werden schriftlich abgestimmt.',
      keywords: ['Kaschmir Hersteller', 'B2B Kaschmir Lieferant', 'Kaschmir Großhandel', 'Ordos Kaschmir', 'Innere Mongolei Kaschmir', 'Kaschmir Garn', 'Kaschmir stricken', 'Kaschmir Erdos', 'Kaschmir Hersteller Ordos', 'Erdos Kaschmir Hersteller', 'Kaschmir Großhandel Deutschland'],
    },
    rawMaterial: {
      title: 'Premium Rohkaschmir | Weiß, Braun, Grau | Direkt ab Werk Ordos',
      description: 'Beschaffungsgespräch für weißen, braunen oder violetten Kaschmir mit Einsatz, Menge, Zielort und Dokumentenbedarf.',
      keywords: getSeoKeywords('de', 'raw'),
    },
    yarnFabric: {
      title: 'Kaschmirgarn & Webstoff | Kammgarn & Streichgarn | B2B',
      description: 'Premium-Kaschmirgarn und Webstoff für B2B-Käufer. Individuelle Feinheiten, Farben, Mischungen. Direkt aus der Ordos-Spinnerei.',
      keywords: getSeoKeywords('de', 'yarn'),
    },
    garmentOem: {
      title: 'Kaschmir-Strickwaren OEM/ODM | Pullover, Mantel Hersteller',
      description: 'OEM/ODM-Beschaffungsgespräch für Kaschmirbekleidung mit Referenzen, Spezifikationen, Menge, Zielort und Dokumentenbedarf.',
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
      description: 'Kontaktieren Sie DONGXIAO Cashmere per WhatsApp, WeChat, E-Mail oder Telefon. Nennen Sie Produkt, Menge, Zielort und Spezifikationen für eine schriftliche Beschaffungsabstimmung.',
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
      title: 'Approvisionnement cachemire | Matière, fil, tissu & maille | DONGXIAO®',
      description: 'Explorez matière, fil, tissu et maille pour l’approvisionnement B2B. Les conditions sont confirmées par écrit selon le produit, la quantité, la destination et les spécifications.',
      keywords: ['fabricant cachemire', 'fournisseur cachemire B2B', 'cachemire Ordos', 'Mongolie Intérieure cachemire', 'gros cachemire', 'cachemire OEM', 'cachemire Erdos', 'cachemire Ordos fabricant', 'Mongolie Intérieure cachemire fournisseur', 'cachemire France grossiste'],
    },
    rawMaterial: {
      title: "Cachemire Brut Premium | Blanc, Brun, Gris | Usine Ordos",
      description: 'Échange sur cachemire blanc, brun ou violet avec usage, quantité, destination et documents requis.',
      keywords: getSeoKeywords('fr', 'raw'),
    },
    yarnFabric: {
      title: "Fil & Tissu Cachemire | Peigné & Cardé | B2B Grossiste | Ordos",
      description: "Fil et tissu de cachemire premium pour acheteurs B2B. Titres, couleurs, mélanges personnalisés. Directement de la filature d'Ordos, Mongolie Intérieure. Échantillon gratuit.",
      keywords: getSeoKeywords('fr', 'yarn'),
    },
    garmentOem: {
      title: 'Vêtements cachemire OEM/ODM | Discussion d’approvisionnement',
      description: 'Échange OEM/ODM pour vêtements cachemire avec références, spécifications, quantité, destination, échantillonnage et documents requis.',
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
      title: 'Contact | DONGXIAO Cachemire | Demandes de produits et devis',
      description: 'Contactez DONGXIAO Cachemire par WhatsApp, WeChat, email ou téléphone. Indiquez produit, quantité, destination et spécifications pour une discussion écrite.',
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
      title: 'カシミア調達 | 原料・糸・生地・ニット | DONGXIAO®',
      description: '原料、糸、生地、ニットウェアの B2B 調達情報。製品参考、数量、仕向地、必要仕様をもとに書面で相談します。',
      keywords: ['カシミア製造元', 'B2B カシミア サプライヤー', 'オルドス カシミア', '内モンゴル カシミア', 'カシミア 卸売', 'カシミア OEM', '日本 カシミア', 'オルドス カシミア製造', 'オルドス 内モンゴル カシミア', 'カシミア 卸売業者 日本向け'],
    },
    rawMaterial: {
      title: 'プレミアム原料カシミア | 白・青・紫 | オルドス工場直送 | B2B',
      description: '白・青・紫カシミアについて、用途、数量、仕向地、必要書類を含めて調達相談します。',
      keywords: getSeoKeywords('ja', 'raw'),
    },
    yarnFabric: {
      title: 'カシミア糸・生地 | 梳毛・紡毛 | B2B卸売 | オルドス紡績',
      description: 'B2Bバイヤー向けプレミアムカシミア糸（26/2〜48/2）と織物。カスタム番手・色・混紡対応。オルドス紡績工場直送、無料サンプル提供。',
      keywords: getSeoKeywords('ja', 'yarn'),
    },
    garmentOem: {
      title: 'カシミア衣料・コート OEM/ODM | 調達相談 | DONGXIAO®',
      description: '製品参考、仕様、数量、仕向地、サンプル、必要書類を含むカシミア衣料 OEM/ODM の書面相談。',
      keywords: [...getSeoKeywords('ja', 'garment'), 'ODM コート', 'カシミアコート OEM'],
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
      description: 'WhatsApp、WeChat、メール、電話で DONGXIAO カシミアへお問い合わせください。製品、数量、仕向地、必要仕様を記載して書面で調達相談を開始できます。',
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
      title: '캐시미어 소싱 | 원료·원사·직물·니트웨어 | DONGXIAO®',
      description: '원료, 원사, 직물, 니트웨어의 B2B 소싱 정보를 확인하세요. 제품 참고, 수량, 목적지, 필요 사양을 바탕으로 서면 협의합니다.',
      keywords: ['캐시미어 제조사', 'B2B 캐시미어 공급', '오르도스 캐시미어', '내몽골 캐시미어', '캐시미어 도매', '캐시미어 OEM', '오르도스 캐시미어 공장', '내몽골 캐시미어 도매', '한국 캐시미어 수입'],
    },
    rawMaterial: {
      title: '프리미엄 원료 캐시미어 | 백색·청색·자색 | 오르도스 공장 직송 | B2B',
      description: '백색, 청색, 자색 캐시미어에 대해 용도, 수량, 목적지, 필요 서류를 포함해 소싱 상담을 진행합니다.',
      keywords: getSeoKeywords('kr', 'raw'),
    },
    yarnFabric: {
      title: '캐시미어 원사 & 직물 | 소모사 & 방모사 | B2B 도매 | 오르도스 방적',
      description: 'B2B 바이어를 위한 프리미엄 캐시미어 원사(26/2~48/2) 및 직물. 맞춤 번수·색상·혼방. 오르도스 방적 공장 직송, 무료 샘플 제공.',
      keywords: getSeoKeywords('kr', 'yarn'),
    },
    garmentOem: {
      title: '캐시미어 의류 OEM/ODM | 소싱 상담 | DONGXIAO®',
      description: '제품 참고, 사양, 수량, 목적지, 샘플, 필요 서류를 포함한 캐시미어 의류 OEM/ODM 서면 상담입니다.',
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
      title: '문의 | DONGXIAO 캐시미어 | 제품 및 견적 문의',
      description: 'WhatsApp, WeChat, 이메일 또는 전화로 DONGXIAO 캐시미어에 문의하세요. 제품, 수량, 목적지, 필요 사양을 포함해 서면 소싱 상담을 시작할 수 있습니다.',
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
      title: '羊绒 B2B 采购 | 原料、纱线、面料与成衣 | 东霄羊绒',
      description: '浏览羊绒原料、纱线、面料与针织成衣的采购信息。请提供产品参考、数量、目的地和所需规格，以书面方式确认项目条件。',
      keywords: ['鄂尔多斯羊绒源头工厂', '内蒙古羊绒原料基地', '羊绒纱线出口工厂', '羊绒大衣代工', '羊绒衫代工', 'B2B羊绒供应商', '羊绒OEM', '鄂尔多斯羊绒厂家', '内蒙古羊绒纱线', '羊绒原料批发', '羊绒成衣代工厂', '山羊绒分梳', '羊绒OEM代工', '中国羊绒出口'],
    },
    rawMaterial: {
      title: '羊绒原料批发 | 白绒/青绒/紫绒 | 鄂尔多斯源头工厂直供 | B2B出口',
      description: '围绕白绒、青绒或紫绒的采购需求沟通用途、数量、目的地与所需纤维文件。',
      keywords: ['白绒', '青绒', '紫绒', '羊绒原料', '分梳山羊绒', '山羊原绒'],
    },
    yarnFabric: {
      title: '羊绒纱线/羊绒面料批发 | 精纺/粗纺 | B2B工厂直供 | 出口',
      description: '围绕纱线和面料结构、颜色方向、数量、目的地与文件需求发起书面采购沟通。',
      keywords: ['羊绒纱线', '羊绒面料', '精纺羊绒', '粗纺羊绒', '羊绒纱线26支', '羊绒纱线28支'],
    },
    garmentOem: {
      title: '羊绒成衣 OEM/ODM | 采购沟通 | 东霄羊绒',
      description: '围绕产品参考、规格、数量、目的地、打样和文件需求发起羊绒成衣 OEM/ODM 书面项目沟通。',
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
      title: '联系我们 | 东霄羊绒 | 产品与报价询盘',
      description: '通过微信、WhatsApp、邮件或电话联系东霄羊绒。请提供产品、数量、目的地和所需规格，以启动书面采购沟通。',
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
