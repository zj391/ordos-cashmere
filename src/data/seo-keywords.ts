/**
 * SEO keyword placement map (7-8)
 *
 * 把 zj 给的 60+ 长尾词按页面分配 + 6 国翻译。
 * 用法: 各页面 import { SEO_KEYWORDS } from '@/data/seo-keywords';
 *
 * 分配原则:
 * - 工厂类 -> factory.astro
 * - 原料类 -> raw-material.astro (新建 dehaired-cashmere, cashmere-grades)
 * - 纱线类 -> yarn-fabric.astro (新建 cashmere-yarn-types)
 * - 面料类 -> 新建 cashmere-fabric-types
 * - 成衣/私人标签 -> garment-oem.astro (新建 private-label-cashmere)
 * - 资质类 -> 新建 certifications
 * - 产地差异化 -> ordos-origin.astro (扩展 dual-origin)
 */

export const SEO_KEYWORDS = {
  // ============ EN (English) - primary ============
  en: {
    factory: [
      'Ordos cashmere factory',
      'Mongolian cashmere supplier',
      'Inner Mongolia cashmere mill',
      'China cashmere manufacturer',
      'full chain cashmere factory',
      'raw cashmere factory',
      'cashmere yarn spinning mill',
      'custom cashmere clothing factory',
      'wholesale cashmere supplier',
      'cashmere OEM ODM factory',
      'bulk cashmere raw material supplier',
      'sustainable cashmere factory',
      'full industrial chain cashmere manufacturer Ordos',
      'cashmere factory with Mongolia raw material source',
      'direct cashmere mill no middleman',
      'large capacity cashmere factory bulk export',
      'ISO OEKO-TEX cashmere supplier China',
    ],
    origin: [
      'Ordos & Mongolian cashmere supplier',
      '100% Ordos cashmere',
      'pure Mongolian raw cashmere',
      'Inner Mongolia Ordos cashmere factory',
      'mixed Ordos Mongolian cashmere yarn',
      'premium cashmere from Ordos and Mongolia',
    ],
    raw: [
      'raw cashmere fiber',
      'dehaired cashmere tops',
      'greasy cashmere goat wool',
      '14.5μm superfine cashmere',
      'white raw cashmere bulk supply',
      'cashmere noil',
      'cashmere combed top wholesale',
      'Ordos dehaired cashmere',
      'Mongolian greasy cashmere fiber',
      'where to buy bulk raw Mongolian cashmere',
      'best Ordos cashmere fiber supplier China',
      'superfine white cashmere dehaired top factory',
      'eco-friendly scoured cashmere fiber wholesale',
    ],
    yarn: [
      '100% cashmere yarn',
      'worsted cashmere yarn',
      'wool cashmere blend yarn',
      'hand knitting cashmere yarn',
      'dyed cashmere yarn manufacturer',
      'fine count cashmere yarn 2/48Nm 2/60Nm',
      'cashmere yarn for sweater making',
      'mixed Ordos Mongolian cashmere yarn',
      'high quality worsted cashmere yarn from Inner Mongolia',
      'anti-pilling cashmere blend yarn for knitwear brand',
      'customized color cashmere yarn bulk order supplier',
    ],
    fabric: [
      'cashmere coating fabric',
      'woven cashmere fabric',
      'cashmere jacquard fabric',
      'lightweight cashmere fabric',
      'cashmere silk blend fabric',
      'thick cashmere wool fabric for coats',
      'soft cashmere woven fabric for luxury overcoat',
      'sustainable cashmere silk fabric manufacturer OEM',
      'lightweight cashmere fabric for women clothing',
    ],
    garment: [
      'custom cashmere sweater wholesale',
      'cashmere coat manufacturer',
      'cashmere scarf shawl factory',
      'private label cashmere knitwear',
      'cashmere hat glove wholesale',
      'luxury cashmere blanket supplier',
      'private label cashmere sweater factory Ordos China',
      'small MOQ cashmere coat manufacturer',
      'wholesale cashmere shawl with custom logo',
      'OEKO-TEX certified cashmere clothing supplier',
    ],
    certs: [
      'ISO OEKO-TEX cashmere supplier China',
      'OEKO-TEX certified cashmere clothing supplier',
    ],
  },
};

// Per-locale translations of key phrases for tag/headline use.
// Maps the most important EN terms to their translations so pages
// can render localized meta tags and H1s for non-EN locales.

export const SEO_TERMS_I18N = {
  factory: {
    en: 'cashmere factory',
    cn: '羊绒工厂',
    de: 'Kaschmir-Fabrik',
    fr: 'usine de cachemire',
    ja: 'カシミア工場',
    kr: '캐시미어 공장',
  },
  supplier: {
    en: 'supplier',
    cn: '供应商',
    de: 'Lieferant',
    fr: 'fournisseur',
    ja: 'サプライヤー',
    kr: '공급업체',
  },
  orgin: {
    en: 'Ordos & Mongolian',
    cn: '鄂尔多斯 + 蒙古',
    de: 'Ordos & Mongolisch',
    fr: 'Ordos et Mongolie',
    ja: 'オルドス・モンゴル',
    kr: '오르도스·몽골',
  },
  oem: {
    en: 'OEM/ODM',
    cn: 'OEM/ODM 代工',
    de: 'OEM/ODM',
    fr: 'OEM/ODM',
    ja: 'OEM/ODM',
    kr: 'OEM/ODM',
  },
  yarn: {
    en: 'cashmere yarn',
    cn: '羊绒纱线',
    de: 'Kaschmirgarn',
    fr: 'fil de cachemire',
    ja: 'カシミア糸',
    kr: '캐시미어 원사',
  },
  raw: {
    en: 'raw cashmere',
    cn: '羊绒原料',
    de: 'Rohkaschmir',
    fr: 'cachemire brut',
    ja: 'カシミア原毛',
    kr: '캐시미어 원료',
  },
  fabric: {
    en: 'cashmere fabric',
    cn: '羊绒面料',
    de: 'Kaschmirstoff',
    fr: 'tissu cachemire',
    ja: 'カシミア生地',
    kr: '캐시미어 원단',
  },
  garment: {
    en: 'cashmere garments',
    cn: '羊绒成衣',
    de: 'Kaschmir-Bekleidung',
    fr: 'vêtements en cachemire',
    ja: 'カシミア衣料',
    kr: '캐시미어 의류',
  },
  certs: {
    en: 'ISO 9001 & OEKO-TEX certified',
    cn: 'ISO 9001 + OEKO-TEX 认证',
    de: 'ISO 9001 & OEKO-TEX zertifiziert',
    fr: 'Certifié ISO 9001 & OEKO-TEX',
    ja: 'ISO 9001 & OEKO-TEX 認証取得',
    kr: 'ISO 9001 & OEKO-TEX 인증',
  },
};

/**
 * Build a page-specific meta description that includes relevant keywords.
 * Picks top 3 keywords from a list and weaves them into a natural sentence.
 */
export function buildSeoDescription(locale: string, pageKind: keyof typeof SEO_KEYWORDS.en, maxLen = 160): string {
  const kws = (SEO_KEYWORDS.en[pageKind] || []).slice(0, 3);
  if (kws.length === 0) return '';
  // For non-EN locales, keep keywords in EN (B2B buyers search in EN)
  // but translate the rest of the sentence.
  const templates: Record<string, string> = {
    en: `Direct from our Ordos factory: ${kws.join(', ')}. Factory pricing, ISO certified, OEM/ODM available.`,
    cn: `鄂尔多斯源头工厂直供：${kws.join(', ')}。工厂价格，ISO 认证，支持 OEM/ODM。`,
    de: `Direkt aus unserer Ordos-Fabrik: ${kws.join(', ')}. Fabrikpreise, ISO-zertifiziert, OEM/ODM verfügbar.`,
    fr: `Directement de notre usine d'Ordos: ${kws.join(', ')}. Prix d'usine, certifié ISO, OEM/ODM disponible.`,
    ja: `オルドス工場直送：${kws.join(', ')}。工場価格、ISO 認証、OEM/ODM 対応。`,
    kr: `오르도스 공장 직송: ${kws.join(', ')}. 공장 가격, ISO 인증, OEM/ODM 가능.`,
  };
  const out = templates[locale] || templates.en;
  return out.length > maxLen ? out.slice(0, maxLen - 1) + '…' : out;
}
