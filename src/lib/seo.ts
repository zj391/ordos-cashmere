/**
 * GEO SEO 配置中心
 * 每个语种独立：TDK / 地域关键词 / Schema / Sitemap
 */

import { LOCALE_HREFLANG, type Locale } from './i18n';
import { SEO_KEYWORDS, getSeoKeywords } from '@/data/seo-keywords';

export const SITE_URL = 'https://erdosdx.com';

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
      title: 'DONGXIAO® Cashmere | Premium B2B Cashmere Manufacturer | Ordos, Inner Mongolia',
      description: 'Leading B2B cashmere manufacturer from Ordos, Inner Mongolia, China. 23+ years producing premium raw cashmere, yarn, fabric & OEM knitwear for global brands. ISO certified, 50+ countries.',
      keywords: ['cashmere manufacturer', 'B2B cashmere supplier', 'Ordos cashmere factory', 'Inner Mongolia cashmere', 'wholesale cashmere yarn', 'cashmere OEM', 'luxury knitwear manufacturer', 'Europe cashmere supplier', 'USA cashmere wholesale'],
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
      title: 'Cashmere Yarn & Woven Fabric | Worsted & Woolen | B2B Wholesale',
      description: 'Premium cashmere yarn (26/2, 28/2, 36/2) and woven fabric (worsted & woolen) for B2B buyers. Custom counts, colors, blends. Direct from Ordos spinning mill.',
      keywords: ['cashmere yarn wholesale', 'cashmere woven fabric', 'worsted cashmere', 'woolen cashmere',
        'cashmere yarn 26/2', 'cashmere yarn 28/2',
        '100% cashmere yarn', 'worsted cashmere yarn', 'wool cashmere blend yarn',
        'hand knitting cashmere yarn', 'dyed cashmere yarn manufacturer',
        'fine count cashmere yarn 2/48Nm 2/60Nm', 'cashmere yarn for sweater making',
        'mixed Ordos Mongolian cashmere yarn',
        'high quality worsted cashmere yarn from Inner Mongolia',
        'anti-pilling cashmere blend yarn for knitwear brand',
        'customized color cashmere yarn bulk order supplier',
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
      description: 'Discover why Ordos, Inner Mongolia is the world\'s premium cashmere origin. Albus goat breeding, climate, traceability, and sustainable grazing practices.',
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
      title: 'Cashmere Insights & B2B Guides | Dongxiao Cashmere Blog',
      description: 'Industry insights, cashmere guides, sourcing tips for B2B buyers. Updated weekly.',
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
      title: 'DONGXIAO® Cashmere | B2B Kaschmir Hersteller | Ordos, Innere Mongolei',
      description: 'Führender B2B-Kaschmirhersteller aus Ordos, Innere Mongolei. 23+ Jahre Erfahrung in Premium-Rohkaschmir, Garn, Stoff & OEM-Strickwaren für globale Marken. ISO-zertifiziert.',
      keywords: ['Kaschmir Hersteller', 'B2B Kaschmir Lieferant', 'Kaschmir Großhandel', 'Ordos Kaschmir', 'Innere Mongolei Kaschmir', 'Kaschmir Garn', 'Kaschmir stricken'],
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
      title: 'Kaschmir Einblicke & B2B Ratgeber | Blog',
      description: 'Brancheneinblicke, Kaschmir-Ratgeber, Beschaffungstipps für B2B-Käufer.',
      keywords: ['Kaschmir Blog', 'B2B Beschaffung'],
    },
    download: {
      title: 'Download Center | Katalog, Spezifikationen, Zertifikate',
      description: 'Laden Sie Kaschmir-Produktkataloge, technische Spezifikationen, Zertifikate herunter.',
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
      title: 'DONGXIAO® Cachemire | Fabricant B2B | Ordos, Mongolie Intérieure',
      description: 'Fabricant leader de cachemire B2B à Ordos, Mongolie Intérieure, Chine. 23+ ans d\'expérience. Cachemire brut, fil, tissu et OEM. Certifié ISO.',
      keywords: ['fabricant cachemire', 'fournisseur cachemire B2B', 'cachemire Ordos', 'Mongolie Intérieure cachemire', 'gros cachemire', 'cachemire OEM'],
    },
    rawMaterial: {
      title: 'Cachemire Brut Premium | Blanc, Brun, Gris | Usine Ordos',
      description: 'Achetez du cachemire brut directement de l\'usine d\'Ordos. Blanc, brun, violet. Finesse 14.5-16.5μm. Prix de gros pour acheteurs B2B.',
      keywords: getSeoKeywords('fr', 'raw'),
    },
    yarnFabric: {
      title: 'Fil & Tissu Cachemire | Peigné & Cardé | B2B',
      description: 'Fil et tissu de cachemire premium pour acheteurs B2B. Titres, couleurs, mélanges personnalisés.',
      keywords: getSeoKeywords('fr', 'yarn'),
    },
    garmentOem: {
      title: 'Vêtements Cachemire OEM/ODM | Pull, Manteau Fabricant',
      description: 'Service complet OEM/ODM vêtements cachemire: pulls, cardigans, manteaux, robes. MOQ 100pcs.',
      keywords: getSeoKeywords('fr', 'garment'),
    },
    factory: {
      title: 'Force de l\'Usine | 23+ Ans Production Cachemire | Ordos',
      description: 'Usine de 38 000 m² à Ordos. 500+ employés. 1 200+ tonnes de capacité annuelle. Certifié ISO, OEKO-TEX.',
      keywords: getSeoKeywords('fr', 'factory'),
    },
    ordosOrigin: {
      title: 'Origine Cachemire Ordos | Patrimoine Mongolie Intérieure',
      description: 'Découvrez pourquoi Ordos, Mongolie Intérieure est l\'origine premium du cachemire mondial.',
      keywords: getSeoKeywords('fr', 'origin'),
    },
    contact: {
      title: 'Contact | Dongxiao Cashmere | WhatsApp +86-156-6185-3999',
      description: 'Contactez nos spécialistes cachemire par WhatsApp, WeChat, email. Réponse sous 24h.',
      keywords: ['contact cachemire'],
    },
    blog: {
      title: 'Aperçus Cachemire & Guides B2B',
      description: 'Analyses du secteur, guides cachemire, conseils d\'approvisionnement B2B.',
      keywords: ['blog cachemire'],
    },
    download: {
      title: 'Centre de Téléchargement | Catalogue, Specs, Certifications',
      description: 'Téléchargez catalogues, spécifications techniques, certifications.',
      keywords: ['catalogue cachemire'],
    },
    faq: {
      title: 'FAQ Approvisionnement Cachemire B2B | MOQ, Délai',
      description: 'Questions fréquentes sur l\'approvisionnement en cachemire: MOQ, délai, échantillons, paiement.',
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
      title: 'DONGXIAO® カシミア | B2B 製造元 | 内モンゴル・オルドス',
      description: 'オルドス（内モンゴル）に本拠を構える大手B2Bカシミア製造元。23年以上の実績。原料・糸・生地・OEMニットをグローバルブランドへ供給。ISO認証取得。',
      keywords: ['カシミア製造元', 'B2B カシミア サプライヤー', 'オルドス カシミア', '内モンゴル カシミア', 'カシミア 卸売', 'カシミア OEM', '日本 カシミア'],
    },
    rawMaterial: {
      title: 'プレミアム原料カシミア | 白・青・紫 | オルドス工場直送',
      description: 'オルドス工場から直接原料カシミアを購入。白、青、紫カシミア。14.5-16.5μm。大量ロット価格でグローバル B2B バイヤーへ。',
      keywords: getSeoKeywords('ja', 'raw'),
    },
    yarnFabric: {
      title: 'カシミア糸・生地 | 梳毛・紡毛 | B2B 卸売',
      description: 'B2B バイヤー向けプレミアムカシミア糸と織物。カスタム番手・色・混紡。オルドス紡績工場直送。',
      keywords: getSeoKeywords('ja', 'yarn'),
    },
    garmentOem: {
      title: 'カシミア衣料 OEM/ODM | セーター・コート製造',
      description: 'カシミア衣料のフルサービス OEM/ODM：セーター、カーディガン、コート、ドレス。マザーム OEM 100枚から対応。',
      keywords: getSeoKeywords('ja', 'garment'),
    },
    factory: {
      title: '工場の強み | 23年以上のカシミア生産 | オルドス工業団地',
      description: '38,000平方メートル のオルドス工場。500名以上の従業員。年間1,200トン以上の生産能力。ISO、OEKO-TEX 認証取得。',
      keywords: getSeoKeywords('ja', 'factory'),
    },
    ordosOrigin: {
      title: 'オルドス カシミアの起源 | 内モンゴルの遺産と品質',
      description: 'オルドス（内モンゴル）が世界の高級カシミア産地である理由を発見してください。',
      keywords: getSeoKeywords('ja', 'origin'),
    },
    contact: {
      title: 'お問い合わせ | Dongxiao Cashmere | WhatsApp +86-156-6185-3999',
      description: 'WhatsApp、WeChat、メールでカシミア専門家に直接お問い合わせください。24時間以内に返信。',
      keywords: ['カシミア お問い合わせ'],
    },
    blog: {
      title: 'カシミア インサイト & B2B ガイド',
      description: '業界インサイト、カシミア ガイド、B2B バイヤーの調達ヒント。',
      keywords: ['カシミア ブログ'],
    },
    download: {
      title: 'ダウンロードセンター | カタログ、仕様、認証',
      description: 'カシミア製品カタログ、技術仕様、認証をダウンロード。',
      keywords: ['カシミア カタログ'],
    },
    faq: {
      title: 'B2B カシミア調達 FAQ | MOQ、リードタイム',
      description: 'カシミア調達のよくある質問：MOQ、リードタイム、サンプル、支払い条件。',
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
      title: 'DONGXIAO® 캐시미어 | B2B 제조사 | 내몽골 오르도스',
      description: '내몽골 오르도스 기반의 주요 B2B 캐시미어 제조사. 23년 이상의 경험. 프리미엄 원료, 원단, OEM 니트웨어를 글로벌 브랜드에 공급. ISO 인증.',
      keywords: ['캐시미어 제조사', 'B2B 캐시미어 공급', '오르도스 캐시미어', '내몽골 캐시미어', '캐시미어 도매', '캐시미어 OEM'],
    },
    rawMaterial: {
      title: '프리미엄 원료 캐시미어 | 백색, 청색, 자색 | 오르도스 공장 직송',
      description: '오르도스 공장에서 직접 프리미엄 원료 캐시미어 구매. 백색, 청색, 자색. 14.5-16.5μm.',
      keywords: getSeoKeywords('kr', 'raw'),
    },
    yarnFabric: {
      title: '캐시미어 원사 & 직물 | 소모사 & 방모사 | B2B 도매',
      description: 'B2B 바이어를 위한 프리미엄 캐시미어 원사 및 직물.',
      keywords: getSeoKeywords('kr', 'yarn'),
    },
    garmentOem: {
      title: '캐시미어 의류 OEM/ODM | 스웨터, 코트 제조',
      description: '캐시미어 의류 풀서비스 OEM/ODM: 스웨터, 카디건, 코트, 드레스.',
      keywords: getSeoKeywords('kr', 'garment'),
    },
    factory: {
      title: '공장 강점 | 23년 이상의 캐시미어 생산',
      description: '38,000 sqm 오르도스 공장. 500명 이상 직원. 연 1,200톤 이상 생산 능력. ISO, OEKO-TEX 인증.',
      keywords: getSeoKeywords('kr', 'factory'),
    },
    ordosOrigin: {
      title: '오르도스 캐시미어 원산지 | 내몽골 유산',
      description: '오르도스, 내몽골이 세계 최고급 캐시미어 원산지인 이유를 알아보세요.',
      keywords: getSeoKeywords('kr', 'origin'),
    },
    contact: {
      title: '문의 | Dongxiao Cashmere | WhatsApp +86-156-6185-3999',
      description: 'WhatsApp, WeChat, 이메일로 캐시미어 전문가에게 직접 문의하세요.',
      keywords: ['캐시미어 문의'],
    },
    blog: {
      title: '캐시미어 인사이트 & B2B 가이드',
      description: '산업 인사이트, 캐시미어 가이드, B2B 바이어를 위한 소싱 팁.',
      keywords: ['캐시미어 블로그'],
    },
    download: {
      title: '다운로드 센터 | 카탈로그, 사양, 인증',
      description: '캐시미어 제품 카탈로그, 기술 사양, 인증을 다운로드하세요.',
      keywords: ['캐시미어 카탈로그'],
    },
    faq: {
      title: 'B2B 캐시미어 소싱 FAQ | MOQ, 리드타임',
      description: '캐시미어 소싱에 대한 자주 묻는 질문: MOQ, 리드타임, 샘플 정책.',
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
      title: '东霄羊绒 | 鄂尔多斯源头工厂 | 23年B2B羊绒供应商',
      description: '内蒙古鄂尔多斯羊绒源头工厂，23年专注B2B出口。提供白绒/青绒/紫绒原料、精纺/粗纺羊绒纱线面料、羊绒成衣OEM/ODM代工。ISO认证，服务全球50+国家。',
      keywords: ['鄂尔多斯羊绒源头工厂', '内蒙古羊绒原料基地', '羊绒纱线出口工厂', '羊绒大衣代工', '羊绒衫代工', 'B2B羊绒供应商', '羊绒OEM'],
    },
    rawMaterial: {
      title: '羊绒原料 | 白绒/青绒/紫绒 | 源头工厂直供',
      description: '内蒙古鄂尔多斯羊绒原料源头工厂直供。白绒、青绒、紫绒，细度14.5-16.5μm。B2B批发，全球出口。',
      keywords: ['白绒', '青绒', '紫绒', '羊绒原料', '分梳山羊绒', '山羊原绒'],
    },
    yarnFabric: {
      title: '羊绒纱线 / 羊绒面料 | 精纺 / 粗纺 | B2B批发',
      description: '羊绒纱线（26/2、28/2、36/2）和羊绒面料（精纺/粗纺）源头工厂直供。可定制支数、颜色、混纺。',
      keywords: ['羊绒纱线', '羊绒面料', '精纺羊绒', '粗纺羊绒', '羊绒纱线26支', '羊绒纱线28支'],
    },
    garmentOem: {
      title: '羊绒成衣代工 OEM/ODM | 大衣/衫/裙源头工厂',
      description: '羊绒成衣代工源头工厂：羊绒大衣、羊绒衫、羊绒裙、羊绒围巾。设计、打样、生产一站式。MOQ 100件起。',
      keywords: ['羊绒大衣代工', '羊绒衫代工', '羊绒围巾代工', '羊绒OEM代工', '羊绒ODM', '羊绒服装定制'],
    },
    factory: {
      title: '工厂实力 | 23年羊绒生产 | 鄂尔多斯产业园',
      description: '38,000平米鄂尔多斯生产基地，500+员工，年产能1200+吨分梳羊绒。ISO 9001、OEKO-TEX、GCS认证。源头直供，无中间商。',
      keywords: ['羊绒工厂', '鄂尔多斯羊绒厂', '羊绒生产基地'],
    },
    ordosOrigin: {
      title: '鄂尔多斯羊绒产地 | 内蒙古地理优势',
      description: '鄂尔多斯羊绒产区的地理优势、阿尔巴斯白绒山羊、牧场、可持续放牧、产地溯源。',
      keywords: ['鄂尔多斯羊绒产地', '阿尔巴斯白绒山羊', '内蒙古羊绒产区'],
    },
    contact: {
      title: '联系我们 | 东霄羊绒 | 微信/WhatsApp +86-156-6185-3999',
      description: '通过微信、WhatsApp、邮件、电话联系我们的羊绒专家团队。24小时内回复。',
      keywords: ['羊绒供应商联系', '羊绒询盘'],
    },
    blog: {
      title: '羊绒行业洞察 & B2B采购指南',
      description: '羊绒行业洞察、采购指南、趋势分析。',
      keywords: ['羊绒博客', '羊绒采购指南'],
    },
    download: {
      title: '资料下载中心 | 目录/规格/认证',
      description: '羊绒产品目录、技术规格、认证资料（ISO/OEKO-TEX/GCS）下载。',
      keywords: ['羊绒目录下载', '羊绒认证'],
    },
    faq: {
      title: '羊绒采购常见问题 | MOQ/交期/打样',
      description: '羊绒采购常见问题：起订量、交期、打样政策、付款方式、物流。',
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
 * 生成 hreflang 链接集合（每个语种 + x-default）
 */
export function generateHreflangs(path: string): Array<{ lang: string; href: string }> {
  const list = Object.keys(SEO).map((loc) => {
    const l = loc as Locale;
    return {
      lang: SEO[l].hreflang,
      href: `${SITE_URL}/${l}${path}`,
    };
  });
  list.push({ lang: 'x-default', href: `${SITE_URL}/en${path}` });
  return list;
}
