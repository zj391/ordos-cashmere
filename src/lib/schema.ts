/**
 * 完整 Schema 库
 * - BreadcrumbList（所有页面）
 * - FAQPage（FAQ 页）
 * - Product（产品页，预留）
 * - WebSite + Organization 已在 BaseLayout 注入
 */
import { SITE_URL } from './seo';
import type { Locale } from './i18n';

export interface BreadcrumbItem {
  name: string;
  href: string;
}

export function breadcrumbSchema(locale: Locale, items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}/${locale}${item.href}`,
    })),
  };
}

export interface FAQItem {
  question: string;
  answer: string;
}

export function faqPageSchema(faqs: FAQItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  };
}

export interface ServiceItem {
  name: string;
  description: string;
  provider: string;
  areaServed: string[];
  serviceType: string;
}

export function servicesSchema(services: ServiceItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: services.map((s, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Service',
        name: s.name,
        description: s.description,
        provider: { '@type': 'Organization', name: s.provider },
        areaServed: s.areaServed.map((a) => ({ '@type': 'Country', name: a })),
        serviceType: s.serviceType,
      },
    })),
  };
}

/**
 * 全部页面的标准 breadcrumb
 */
export const PAGE_BREADCRUMB: Record<string, (locale: Locale) => BreadcrumbItem[]> = {
  home: (locale) => [
    { name: locale === 'cn' ? '首页' : 'Home', href: '/' },
  ],
  rawMaterial: (locale) => [
    { name: locale === 'cn' ? '首页' : 'Home', href: '/' },
    { name: locale === 'cn' ? '羊绒原料' : locale === 'de' ? 'Rohmaterial' : locale === 'fr' ? 'Matière Première' : locale === 'ja' ? '原料' : locale === 'kr' ? '원료' : 'Raw Material', href: '/raw-material' },
  ],
  yarnFabric: (locale) => [
    { name: locale === 'cn' ? '首页' : 'Home', href: '/' },
    { name: locale === 'cn' ? '纱线/面料' : locale === 'de' ? 'Garn & Stoff' : locale === 'fr' ? 'Fil & Tissu' : locale === 'ja' ? '糸・生地' : locale === 'kr' ? '원사·직물' : 'Yarn & Fabric', href: '/yarn-fabric' },
  ],
  garmentOem: (locale) => [
    { name: locale === 'cn' ? '首页' : 'Home', href: '/' },
    { name: locale === 'cn' ? '成衣代工' : locale === 'de' ? 'Bekleidung OEM' : locale === 'fr' ? 'Vêtement OEM' : locale === 'ja' ? '衣料OEM' : locale === 'kr' ? '의류 OEM' : 'Garment OEM', href: '/garment-oem' },
  ],
  factory: (locale) => [
    { name: locale === 'cn' ? '首页' : 'Home', href: '/' },
    { name: locale === 'cn' ? '工厂实力' : locale === 'de' ? 'Fabrik' : locale === 'fr' ? 'Usine' : locale === 'ja' ? '工場' : locale === 'kr' ? '공장' : 'Factory', href: '/factory' },
  ],
  ordosOrigin: (locale) => [
    { name: locale === 'cn' ? '首页' : 'Home', href: '/' },
    { name: locale === 'cn' ? '鄂尔多斯产地' : 'Ordos Origin', href: '/ordos-origin' },
  ],
  contact: (locale) => [
    { name: locale === 'cn' ? '首页' : 'Home', href: '/' },
    { name: locale === 'cn' ? '联系我们' : 'Contact', href: '/contact' },
  ],
  blog: (locale) => [
    { name: locale === 'cn' ? '首页' : 'Home', href: '/' },
    { name: locale === 'cn' ? '博客' : 'Blog', href: '/blog' },
  ],
  download: (locale) => [
    { name: locale === 'cn' ? '首页' : 'Home', href: '/' },
    { name: locale === 'cn' ? '下载中心' : 'Download', href: '/download' },
  ],
  faq: (locale) => [
    { name: locale === 'cn' ? '首页' : 'Home', href: '/' },
    { name: locale === 'cn' ? '常见问题' : 'FAQ', href: '/faq' },
  ],
  privacy: (locale) => [
    { name: locale === 'cn' ? '首页' : 'Home', href: '/' },
    { name: locale === 'cn' ? '隐私政策' : 'Privacy Policy', href: '/privacy-policy' },
  ],
};

/**
 * 服务列表（用于服务型 Schema）
 */
export const SERVICES: Record<Locale, ServiceItem[]> = {
  en: [
    { name: 'Cashmere Raw Material Supply', description: 'Premium white, brown, purple cashmere fiber direct from Ordos source factory', provider: 'DONGXIAO® Cashmere', areaServed: ['EU', 'USA', 'Japan', 'Korea', 'UK'], serviceType: 'B2B Wholesale' },
    { name: 'Cashmere Yarn Manufacturing', description: 'Worsted & woolen cashmere yarn (26/2, 28/2, 36/2, 48/2 counts)', provider: 'DONGXIAO® Cashmere', areaServed: ['EU', 'USA', 'Japan', 'Korea'], serviceType: 'Manufacturing' },
    { name: 'Cashmere Woven Fabric', description: 'Premium cashmere fabric 180-450 g/m², custom weave and finish', provider: 'DONGXIAO® Cashmere', areaServed: ['EU', 'USA', 'Japan', 'Korea'], serviceType: 'Manufacturing' },
    { name: 'Cashmere Garment OEM/ODM', description: 'Full-service garment OEM/ODM from design to shipment. MOQ 100pcs.', provider: 'DONGXIAO® Cashmere', areaServed: ['Worldwide'], serviceType: 'OEM Manufacturing' },
  ],
  de: [
    { name: 'Kaschmir-Rohmaterial', description: 'Premium Weiß, Braun, Lila Kaschmir aus Ordos', provider: 'DONGXIAO® Cashmere', areaServed: ['EU', 'USA', 'Japan', 'Korea'], serviceType: 'B2B Großhandel' },
    { name: 'Kaschmirgarn-Herstellung', description: 'Kammgarn & Streichgarn Kaschmir', provider: 'DONGXIAO® Cashmere', areaServed: ['EU', 'USA', 'Japan', 'Korea'], serviceType: 'Herstellung' },
    { name: 'Kaschmir-Webstoff', description: 'Premium Kaschmir-Stoff 180-450 g/m²', provider: 'DONGXIAO® Cashmere', areaServed: ['EU', 'USA', 'Japan', 'Korea'], serviceType: 'Herstellung' },
    { name: 'Kaschmir-Bekleidung OEM/ODM', description: 'Full-Service OEM/ODM', provider: 'DONGXIAO® Cashmere', areaServed: ['Weltweit'], serviceType: 'OEM Herstellung' },
  ],
  fr: [
    { name: 'Cachemire brut', description: 'Cachemire blanc, brun, violet d\'Ordos', provider: 'DONGXIAO® Cashmere', areaServed: ['UE', 'USA', 'Japon', 'Corée'], serviceType: 'B2B Gros' },
    { name: 'Fil cachemire', description: 'Peigné & cardé', provider: 'DONGXIAO® Cashmere', areaServed: ['UE', 'USA', 'Japon', 'Corée'], serviceType: 'Fabrication' },
    { name: 'Tissu cachemire', description: 'Tissu premium 180-450 g/m²', provider: 'DONGXIAO® Cashmere', areaServed: ['UE', 'USA', 'Japon', 'Corée'], serviceType: 'Fabrication' },
    { name: 'Vêtement cachemire OEM/ODM', description: 'Service complet OEM/ODM', provider: 'DONGXIAO® Cashmere', areaServed: ['Monde'], serviceType: 'Fabrication OEM' },
  ],
  ja: [
    { name: '原料カシミア供給', description: '白・青・紫カシミア', provider: 'DONGXIAO® Cashmere', areaServed: ['EU', 'USA', '日本', '韓国'], serviceType: 'B2B卸売' },
    { name: 'カシミア糸製造', description: '梳毛・紡毛', provider: 'DONGXIAO® Cashmere', areaServed: ['EU', 'USA', '日本', '韓国'], serviceType: '製造' },
    { name: 'カシミア織物', description: 'プレミアム 180-450 g/m²', provider: 'DONGXIAO® Cashmere', areaServed: ['EU', 'USA', '日本', '韓国'], serviceType: '製造' },
    { name: '衣料OEM/ODM', description: 'フルサービス', provider: 'DONGXIAO® Cashmere', areaServed: ['世界中'], serviceType: 'OEM製造' },
  ],
  kr: [
    { name: '원료 캐시미어 공급', description: '백색, 청색, 자색 캐시미어', provider: 'DONGXIAO® Cashmere', areaServed: ['EU', 'USA', '일본', '한국'], serviceType: 'B2B 도매' },
    { name: '캐시미어 원사 제조', description: '소모사·방모사', provider: 'DONGXIAO® Cashmere', areaServed: ['EU', 'USA', '일본', '한국'], serviceType: '제조' },
    { name: '캐시미어 직물', description: '프리미엄 180-450 g/m²', provider: 'DONGXIAO® Cashmere', areaServed: ['EU', 'USA', '일본', '한국'], serviceType: '제조' },
    { name: '의류 OEM/ODM', description: '풀서비스 OEM/ODM', provider: 'DONGXIAO® Cashmere', areaServed: ['전세계'], serviceType: 'OEM 제조' },
  ],
  cn: [
    { name: '羊绒原料供应', description: '白绒/青绒/紫绒，鄂尔多斯源头直供', provider: '东霄羊绒', areaServed: ['欧盟', '美国', '日本', '韩国'], serviceType: 'B2B批发' },
    { name: '羊绒纱线制造', description: '精纺/粗纺羊绒纱线', provider: '东霄羊绒', areaServed: ['欧盟', '美国', '日本', '韩国'], serviceType: '制造' },
    { name: '羊绒面料织造', description: '180-450g/m² 高级羊绒面料', provider: '东霄羊绒', areaServed: ['欧盟', '美国', '日本', '韩国'], serviceType: '制造' },
    { name: '羊绒成衣代工', description: '全流程 OEM/ODM 代工服务', provider: '东霄羊绒', areaServed: ['全球'], serviceType: 'OEM代工' },
  ],
};
