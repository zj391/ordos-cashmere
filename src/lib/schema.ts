/**
 * 完整 Schema 库
 * - BreadcrumbList（所有页面）
 * - FAQPage（FAQ 页）
 * - Product（产品页，预留）
 * - WebSite + Organization 已在 BaseLayout 注入
 * - CollectionPage + ItemList（category hub 页，2026-08-19 增）
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

export function faqPageSchema(faqs: FAQItem[] | Array<{ q: string; a: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => {
      // Accept both {question, answer} (canonical FAQItem) and
      // {q, a} (short-form used by SEOFaq.astro for inline FAQ blocks).
      const question = 'question' in f ? f.question : f.q;
      const answer = 'answer' in f ? f.answer : f.a;
      return {
        '@type': 'Question',
        name: question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: answer,
        },
      };
    }),
  };
}

export interface ServiceItem {
  name: string;
  description: string;
  provider: string;
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
        provider: { '@type': 'Organization', name: s.provider, url: SITE_URL },
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
  // Products listing page (pageKey='products') uses this 2-item breadcrumb.
  // Product detail pages intentionally skip this because they emit a richer
  // 4-item breadcrumb (Home → Products → Category → Product) via customSchemas.
  products: (locale) => [
    { name: locale === 'cn' ? '首页' : 'Home', href: '/' },
    { name: locale === 'cn' ? '产品' : 'Products', href: '/products' },
  ],
};

/**
 * 服务列表（用于服务型 Schema）
 */
export const SERVICES: Record<Locale, ServiceItem[]> = {
  en: [
    { name: 'Cashmere Raw Material Sourcing', description: 'A sourcing discussion for cashmere raw-material requirements and product specifications.', provider: 'DONGXIAO® Cashmere', serviceType: 'B2B Sourcing' },
    { name: 'Cashmere Yarn Sourcing', description: 'A sourcing discussion for yarn construction, count, color and required documentation.', provider: 'DONGXIAO® Cashmere', serviceType: 'B2B Sourcing' },
    { name: 'Cashmere Fabric Sourcing', description: 'A sourcing discussion for fabric construction, weight, finish and sampling requirements.', provider: 'DONGXIAO® Cashmere', serviceType: 'B2B Sourcing' },
    { name: 'Cashmere Garment OEM/ODM Discussion', description: 'A written project discussion covering design references, product specifications, sampling and commercial requirements.', provider: 'DONGXIAO® Cashmere', serviceType: 'OEM/ODM Sourcing' },
  ],
  de: [
    { name: 'Kaschmir-Rohmaterial Beschaffung', description: 'Abstimmung zu Rohmaterialanforderungen und Produktspezifikationen.', provider: 'DONGXIAO® Cashmere', serviceType: 'B2B Beschaffung' },
    { name: 'Kaschmirgarn Beschaffung', description: 'Abstimmung zu Garnkonstruktion, Feinheit, Farbe und Dokumenten.', provider: 'DONGXIAO® Cashmere', serviceType: 'B2B Beschaffung' },
    { name: 'Kaschmir-Stoff Beschaffung', description: 'Abstimmung zu Stoffkonstruktion, Gewicht, Ausrüstung und Musteranforderungen.', provider: 'DONGXIAO® Cashmere', serviceType: 'B2B Beschaffung' },
    { name: 'Kaschmir Bekleidung OEM/ODM Abstimmung', description: 'Schriftliche Projektabstimmung zu Referenzen, Spezifikationen, Bemusterung und Geschäftsanforderungen.', provider: 'DONGXIAO® Cashmere', serviceType: 'OEM/ODM Beschaffung' },
  ],
  fr: [
    { name: 'Approvisionnement cachemire brut', description: 'Échange sur les exigences de matière et les spécifications produit.', provider: 'DONGXIAO® Cashmere', serviceType: 'Approvisionnement B2B' },
    { name: 'Approvisionnement fil cachemire', description: 'Échange sur construction, titre, couleur et documents du fil.', provider: 'DONGXIAO® Cashmere', serviceType: 'Approvisionnement B2B' },
    { name: 'Approvisionnement tissu cachemire', description: 'Échange sur construction, poids, finition et échantillonnage.', provider: 'DONGXIAO® Cashmere', serviceType: 'Approvisionnement B2B' },
    { name: 'Discussion OEM/ODM cachemire', description: 'Discussion écrite sur références, spécifications, échantillons et besoins commerciaux.', provider: 'DONGXIAO® Cashmere', serviceType: 'Approvisionnement OEM/ODM' },
  ],
  ja: [
    { name: '原料カシミア調達', description: '原料要件と製品仕様に関する調達相談。', provider: 'DONGXIAO® Cashmere', serviceType: 'B2B調達' },
    { name: 'カシミア糸調達', description: '糸構造、番手、色、必要書類に関する調達相談。', provider: 'DONGXIAO® Cashmere', serviceType: 'B2B調達' },
    { name: 'カシミア生地調達', description: '生地構造、重量、仕上げ、サンプル要件に関する調達相談。', provider: 'DONGXIAO® Cashmere', serviceType: 'B2B調達' },
    { name: 'カシミア OEM/ODM 相談', description: '参考資料、仕様、サンプル、商務要件に関する書面でのプロジェクト相談。', provider: 'DONGXIAO® Cashmere', serviceType: 'OEM/ODM調達' },
  ],
  kr: [
    { name: '원료 캐시미어 소싱', description: '원료 요건과 제품 사양에 관한 소싱 상담.', provider: 'DONGXIAO® Cashmere', serviceType: 'B2B 소싱' },
    { name: '캐시미어 원사 소싱', description: '원사 구조, 번수, 색상, 필요 서류에 관한 소싱 상담.', provider: 'DONGXIAO® Cashmere', serviceType: 'B2B 소싱' },
    { name: '캐시미어 직물 소싱', description: '직물 구조, 중량, 마감, 샘플 요건에 관한 소싱 상담.', provider: 'DONGXIAO® Cashmere', serviceType: 'B2B 소싱' },
    { name: '캐시미어 OEM/ODM 상담', description: '참고 자료, 사양, 샘플, 상업 요건에 관한 서면 프로젝트 상담.', provider: 'DONGXIAO® Cashmere', serviceType: 'OEM/ODM 소싱' },
  ],
  cn: [
    { name: '羊绒原料采购沟通', description: '围绕原料要求与产品规格的采购沟通。', provider: '东霄羊绒', serviceType: 'B2B采购' },
    { name: '羊绒纱线采购沟通', description: '围绕纱线结构、支数、颜色与文件要求的采购沟通。', provider: '东霄羊绒', serviceType: 'B2B采购' },
    { name: '羊绒面料采购沟通', description: '围绕面料结构、克重、后整理与打样要求的采购沟通。', provider: '东霄羊绒', serviceType: 'B2B采购' },
    { name: '羊绒成衣 OEM/ODM 沟通', description: '围绕参考资料、规格、打样与商务需求的书面项目沟通。', provider: '东霄羊绒', serviceType: 'OEM/ODM采购' },
  ],
};


/**
 * 2026-08-19 增: Category hub 页的 CollectionPage + ItemList schema。
 * 用于 /en/products/hats-accessories/ 等 5 个 category hub 页 (6 lang × 5 = 30 个 URL)。
 * 之前这些页面只发 WebPage schema，没有声明自己是"产品集合"型页 — Google 看不到
 * page-type 信号，crawl/index 时归类到普通 hub，影响长尾 query 排名。
 *
 * ItemList 含前 30 个产品 URL（schema.org 官方建议每条 ListItem < 100KB，免得
 * 搜索引擎反感堆叠型 markup）。少于 30 个时按实际数量。
 */
export interface CategoryHubProduct {
  id: string;
  name: string;
  price?: string;
  image?: string;
}

export function categoryHubSchema(
  locale: Locale,
  hubSlug: string,
  hubName: string,
  hubDescription: string,
  products: CategoryHubProduct[]
): Array<Record<string, any>> {
  const pageUrl = `${SITE_URL}/${locale}/products/${hubSlug}/`;
  const size = products.length;
  const top = products.slice(0, 30);

  const collectionPage: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': pageUrl,
    name: hubName,
    description: hubDescription,
    url: pageUrl,
    inLanguage: locale,
    isPartOf: { '@type': 'WebSite', url: SITE_URL, name: 'DONGXIAO® CASHMERE' },
    about: {
      '@type': 'Thing',
      name: hubName,
      description: hubDescription,
    },
  };

  if (top[0]?.image) {
    collectionPage.primaryImageOfPage = { '@type': 'ImageObject', url: top[0].image };
  }

  collectionPage.mainEntity = {
    '@type': 'ItemList',
    numberOfItems: size,
    itemListOrder: 'https://schema.org/ItemListUnordered',
    itemListElement: top.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE_URL}/${locale}/products/${p.id}/`,
      name: p.name,
    })),
  };

  return [collectionPage];
}
