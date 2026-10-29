#!/usr/bin/env node
/**
 * llms-full.txt generator
 * Build-time aggregator of all site content into one big markdown file
 * for AI crawlers (ChatGPT/Claude/Perplexity/etc).
 *
 * Output: public/llms-full.txt
 *
 * Format follows llmstxt.org spec:
 *   # Site title
 *   > One-line summary
 *   ## Section
 *   - [link](url): description
 *   ### Full content (optional)
 *   <markdown body>
 *
 * What goes in:
 *   - EN: full blog markdown bodies (44 posts)
 *   - All locales: home + 6 hub pages (compressed descriptions)
 *   - Product list (591 SKUs, EN only) with id/name/material/micron/MOQ
 *   - Each section sorted by importance for crawler chunking
 *
 * Size: ~800KB. AI crawlers (Anthropic/GPTBot) accept up to 10MB
 * single-shot, so this is well within limits.
 */
import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BLOG_DIR = path.join(ROOT, 'src/content/blog');
// The live catalogue. The root-level products.json is a stale snapshot from
// August (591 SKUs, 5 categories) that predates every product batch since;
// reading it made the generated llms-full.txt describe a catalogue that no
// longer exists.
const PRODUCTS_JSON = path.join(ROOT, 'src/data/products.json');
const OUTPUT = path.join(ROOT, 'public/llms-full.txt');

const SITE_URL = 'https://www.erdosdx.com';

// Catalogue size, read from the live catalogue so it never goes stale.
const productsMeta = JSON.parse(await fs.readFile(PRODUCTS_JSON, 'utf-8'));
const PRODUCT_COUNT = (productsMeta.categories || []).reduce(
  (total, c) => total + (c.products?.length ?? 0), 0);
const PRODUCT_COUNT_STR = PRODUCT_COUNT.toLocaleString('en-US');
// Category list, derived from the catalogue so it stays correct when a
// category is added (blankets was missing from the hardcoded list). The
// catalogue names are too long for a meta description ("Cashmere Hats &
// Beanies"), so each category id maps to a short word per locale instead.
const CATEGORY_SLUGS = (productsMeta.categories || [])
  .map(c => c.id)
  .filter(Boolean);
const CATEGORY_WORDS = {
  en: { hats: 'hats', scarves: 'scarves', sweaters: 'sweaters', accessories: 'accessories', blankets: 'blankets', yarn: 'yarn' },
  cn: { hats: '帽子', scarves: '围巾', sweaters: '毛衫', accessories: '配饰', blankets: '毯子', yarn: '纱线' },
  de: { hats: 'Mützen', scarves: 'Schals', sweaters: 'Pullover', accessories: 'Accessoires', blankets: 'Decken', yarn: 'Garn' },
  fr: { hats: 'bonnets', scarves: 'écharpes', sweaters: 'pulls', accessories: 'accessoires', blankets: 'plaids', yarn: 'fils' },
  ja: { hats: '帽子', scarves: 'マフラー', sweaters: 'セーター', accessories: 'アクセサリー', blankets: 'ブランケット', yarn: '糸' },
  kr: { hats: '모자', scarves: '스카프', sweaters: '스웨터', accessories: '액세서리', blankets: '블랭킷', yarn: '원사' },
};
const CATEGORY_COUNT = CATEGORY_SLUGS.length;
/** The category list in one locale, in catalogue order. */
function categoryNames(locale) {
  const words = CATEGORY_WORDS[locale] || CATEGORY_WORDS.en;
  return CATEGORY_SLUGS.map(id => words[id] || id).join(', ');
}
const CATEGORY_NAMES = categoryNames('en');
const CATEGORY_NAMES_CN = categoryNames('cn');
const CATEGORY_NAMES_DE = categoryNames('de');
const CATEGORY_NAMES_FR = categoryNames('fr');
const CATEGORY_NAMES_JA = categoryNames('ja');
const CATEGORY_NAMES_KR = categoryNames('kr');

// Hub pages in display order. Each entry: [path, label, en-description, ...per locale]
const HUB_PAGES = {
  home: {
    path: '/',
    title: 'DONGXIAO® Cashmere — Premium B2B Cashmere Manufacturer',
    desc: {
      en: `Premium B2B cashmere manufacturer and wholesale supplier from Ordos, Inner Mongolia, China. 23+ years expertise, OEKO-TEX certified, MOQ 100pcs, 7-day sampling, FOB Tianjin. Trusted by 500+ brands worldwide. ${PRODUCT_COUNT_STR} products across ${CATEGORY_COUNT} categories: ${CATEGORY_NAMES}.`,
      cn: `鄂尔多斯源头工厂直供，${PRODUCT_COUNT_STR}款羊绒产品工厂直供：${CATEGORY_NAMES_CN}。支持OEM/ODM。工厂价格，100%纯羊绒，ISO认证。起订量100件。`,
      de: `Premium Kaschmir-Großhandel direkt ab Fabrik in Ordos, China. ${PRODUCT_COUNT_STR} Produkte: ${CATEGORY_NAMES_DE}. OEM/ODM. MOQ 100 Stück, 7 Tage Bemusterung.`,
      fr: `Fabricant cachemire B2B premium direct usine, Ordos Chine. ${PRODUCT_COUNT_STR} produits: ${CATEGORY_NAMES_FR}. OEM/ODM. MOQ 100pcs, échantillonnage 7 jours.`,
      ja: `オルドス工場直販カシミア卸売。${PRODUCT_COUNT_STR}点: ${CATEGORY_NAMES_JA}.OEM/ODM。MOQ 100個、7日サンプル発送。`,
      kr: `어얼어스 공장 직송 캐시미어 도매. ${PRODUCT_COUNT_STR}점: ${CATEGORY_NAMES_KR}. OEM/ODM. MOQ 100개, 7일 샘플 발송.`,
    },
  },
  products: {
    path: '/products/',
    title: `${PRODUCT_COUNT_STR} Cashmere Products Wholesale Catalog`,
    desc: {
      en: `Browse ${PRODUCT_COUNT_STR} wholesale cashmere products: ${CATEGORY_NAMES}. Filter by style, material, gauge, audience, pattern.`,
      cn: `浏览${PRODUCT_COUNT_STR}款批发羊绒产品: ${CATEGORY_NAMES_CN}。`,
      de: `${PRODUCT_COUNT_STR} Kaschmir-Großhandelsprodukte: ${CATEGORY_NAMES_DE}.`,
      fr: `${PRODUCT_COUNT_STR} produits cachemire en gros: ${CATEGORY_NAMES_FR}.`,
      ja: `カシミア卸売製品${PRODUCT_COUNT_STR}点: ${CATEGORY_NAMES_JA}。`,
      kr: `캐시미어 도매 제품 ${PRODUCT_COUNT_STR}점: ${CATEGORY_NAMES_KR}.`,
    },
  },
  factory: {
    path: '/factory/',
    title: 'Ordos Cashmere Factory Tour',
    desc: {
      en: '23-year-old B2B source factory in Ordos, Inner Mongolia. 38,000 sqm, ISO 9001 + OEKO-TEX certified, 1,200+ tons annual capacity. German STOLL fully-fashioned knitting machines.',
      cn: '23年鄂尔多斯源头工厂，38,000平方米，ISO 9001 + OEKO-TEX 认证，年产能 1,200+ 吨。德国 STOLL 全成型针织机。',
      de: '23-jährige Kaschmir-Quellefabrik in Ordos, China. 38.000 m², ISO 9001 + OEKO-TEX, 1.200+ Tonnen Jahreskapazität. STOLL Strickmaschinen.',
      fr: 'Usine source cachemire à Ordos depuis 23 ans. 38.000 m², ISO 9001 + OEKO-TEX, capacité annuelle 1.200+ tonnes. Machines à tricoter STOLL allemandes.',
      ja: 'オルドス23年のカシミア源泉工場。38,000㎡、ISO 9001 + OEKO-TEX 認証、年産 1,200+ トン。ドイツSTOLL 編み機。',
      kr: '어얼어스 23년 캐시미어 원천 공장. 38,000㎡, ISO 9001 + OEKO-TEX 인증, 연 생산능력 1,200+ 톤. 독일 STOLL 편직기.',
    },
  },
  rawMaterial: {
    path: '/raw-material/',
    title: 'Raw Cashmere Fiber (Dehaired)',
    desc: {
      en: 'Dehaired cashmere fiber: combed top (worsted spinning), roving (woolen spinning), noil (blends). White, brown (qing), purple (zi) cashmere. MOQ 10kg per color. Lead time 7-15 days (stock) / 25-35 days (custom dye).',
      cn: '分梳羊绒纤维：精梳条（精纺）、粗纱（粗纺）、落毛（混纺）。白、青、紫三色。MOQ 10kg/色。',
      de: 'Entgranntes Kaschmir: Kammzug (Kammgarn), Vorgarn (Streichgarn), Werg (Mischungen). Weiß, Braun, Lila.',
      fr: 'Cachemire dégrillé: ruban peigné, mèche, blousse. Blanc, brun, violet. MOQ 10kg/couleur.',
      ja: 'カシミア分梳繊維: 梳毛トップ、粗紡、ノイル。白、茶、紫。MOQ 10kg/色。',
      kr: '캐시미어 분梳理수: 소면사, 방면사, 노일. 흰색, 갈색, 보라색. MOQ 10kg/색상.',
    },
  },
  yarnFabric: {
    path: '/yarn-fabric/',
    title: 'Cashmere Yarn & Fabric',
    desc: {
      en: 'Cashmere yarn on cones: 2/26 to 2/60 Nm, worsted and woolen, custom blends (cashmere/wool, cashmere/silk, cashmere/cotton). MOQ 1kg sampling, 20kg+ bulk.',
      cn: '筒子纱羊绒纱线：2/26 至 2/60 Nm，精纺和粗纺，定制混纺（羊绒/羊毛、羊绒/丝、羊绒/棉）。',
      de: 'Kaschmirgarn auf Konen: 2/26 bis 2/60 Nm, Kammgarn und Streichgarn, Mischungen.',
      fr: 'Fil cachemire sur cônes: 2/26 à 2/60 Nm, peigné et cardé, mélanges personnalisés.',
      ja: 'コーン巻きカシミア糸: 2/26～2/60 Nm、梳毛紡績と紡毛紡績、カスタム混紡。',
      kr: '콘사 캐시미어 원사: 2/26~2/60 Nm, 소면방적과 방면방적, 커스텀 블렌드.',
    },
  },
  garmentOem: {
    path: '/garment-oem/',
    title: 'Garment OEM & Private Label Cashmere',
    desc: {
      en: 'Full-package OEM/ODM cashmere knitwear. Pattern development, branding (woven label, leather patch, hangtag), sampling in 7-10 days, bulk in 30-35 days. 100 pcs MOQ per style.',
      cn: '羊绒成衣 OEM/ODM 全包。款式开发、品牌定制、7-10天打样、30-35天大货。',
      de: 'Kaschmir-Strickwaren OEM/ODM Komplettpaket. Schnittentwicklung, Branding, 7-10 Tage Bemusterung.',
      fr: 'Vêtements cachemire OEM/ODM clé en main. Développement patron, branding, échantillonnage 7-10 jours.',
      ja: 'カシミア衣料 OEM/ODM フルパッケージ。パターン開発、ブランド、7-10日サンプル、30-35日量産。',
      kr: '캐시미어 의류 OEM/ODM 풀패키지. 패턴 개발, 브랜딩, 7-10일 샘플, 30-35일 양산.',
    },
  },
};

function readBlog(filepath) {
  const content = fsSync.readFileSync(filepath, 'utf-8');
  const parts = content.split('---');
  if (parts.length < 3) return null;
  const fm = parts[1];
  const body = parts.slice(2).join('---').trim();
  // 抽 title + excerpt
  const title = fm.match(/^title:\s*"?([^"\n]+)"?/m)?.[1] || '';
  const excerpt = fm.match(/^excerpt:\s*"?([^"\n]+)"?/m)?.[1] || '';
  const date = fm.match(/^publishDate:\s*"?([^"\n]+)"?/m)?.[1] || '';
  return { title, excerpt, date, body };
}

async function main() {
  const lines = [];

  // === Header ===
  lines.push('# DONGXIAO® Cashmere');
  lines.push('');
  lines.push('> Premium B2B cashmere manufacturer and wholesale supplier from Ordos, Inner Mongolia, China. 23+ years expertise, OEKO-TEX certified, MOQ 100pcs, 7-day sampling, FOB Tianjin. Trusted by 500+ brands worldwide.');
  lines.push('');
  lines.push(`This file is the full-text counterpart of /llms.txt. It contains all site pages, the complete ${PRODUCT_COUNT_STR}-product catalog (with materials/micron/MOQ), and every published blog article. Generated ${new Date().toISOString().split('T')[0]}.`);
  lines.push('');
  lines.push('## Site Map');
  lines.push('');

  // === Hub pages (6 languages) ===
  for (const [key, page] of Object.entries(HUB_PAGES)) {
    lines.push(`### ${page.title}`);
    lines.push('');
    for (const [loc, desc] of Object.entries(page.desc)) {
      // 2026-10-20 SEO fix: the English variant previously rendered as
      // https://www.erdosdx.com/products/ (no /en prefix) because the slug
      // expression mapped 'en' to ''. That URL has no direct route — vercel.json
      // only defines /products/sweaters/, /products/hats/,
      // /products/accessories/ and /products/:id/ redirects, so /products/
      // itself hits the SSR function and (per the middleware-redirect fix)
      // 404s at the edge. Every AI crawler that read llms-full.txt therefore
      // followed a dead link for the 591-SKU catalog.
      // The site's canonical English home lives at /en/ (middleware 308s
      // '/' -> '/en/'), so English hub pages must carry the /en prefix too.
      const slug = `/${loc === 'cn' ? 'cn' : loc === 'ko' ? 'kr' : loc}`;
      lines.push(`- **${loc.toUpperCase()}** [${page.title}](${SITE_URL}${slug}${page.path === '/' ? '/' : page.path}): ${desc}`);
    }
    lines.push('');
  }

  // === Product catalog (EN, compact table) ===
  lines.push(`## Product Catalog (${PRODUCT_COUNT_STR} SKUs)`);
  lines.push('');
  lines.push('Format: `id | name | material | micron | MOQ | lead time | price (USD)`');
  lines.push('');

  // products.json metadata only — actual products live in Drizzle DB at build
  // time. We surface the catalog summary here; for full product detail, see
  // /en/products/<id>/ on the live site.
  lines.push(`Total products: see /en/products/ for the full ${PRODUCT_COUNT_STR}-SKU catalog (live, SSR'd from Drizzle DB).`);
  lines.push(`Categories: ${(productsMeta.categories || []).map(c => c.name || c.id).join(', ')}`);
  lines.push('');

  // === Blog articles (EN full body) ===
  lines.push('## Blog Articles (English, full text)');
  lines.push('');

  const enBlogDir = path.join(BLOG_DIR, 'en');
  let enFiles = [];
  try {
    enFiles = await fs.readdir(enBlogDir);
  } catch (e) {
    lines.push(`(no blog directory found at ${enBlogDir})`);
  }
  enFiles = enFiles.filter(f => f.endsWith('.md'));

  // Sort by publishDate desc (most recent first)
  const blogs = enFiles.map(f => ({ f, ...readBlog(path.join(enBlogDir, f)) })).filter(Boolean);
  blogs.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  for (const b of blogs) {
    lines.push(`### ${b.title}`);
    lines.push('');
    lines.push(`*Published ${b.date}*`);
    lines.push('');
    if (b.excerpt) {
      lines.push(b.excerpt);
      lines.push('');
    }
    lines.push(b.body);
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  // === Other language blogs (title + excerpt only, to keep file size sane) ===
  const otherLocs = ['cn', 'de', 'fr', 'ja', 'kr'];
  for (const loc of otherLocs) {
    const locDir = path.join(BLOG_DIR, loc);
    let locFiles = [];
    try {
      locFiles = (await fs.readdir(locDir)).filter(f => f.endsWith('.md'));
    } catch (e) { continue; }
    if (locFiles.length === 0) continue;
    const locBlogs = locFiles.map(f => ({ f, ...readBlog(path.join(locDir, f)) })).filter(Boolean);
    locBlogs.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    lines.push(`## Blog Articles (${loc.toUpperCase()} — title + excerpt only; full text in /${loc}/blog/<slug>/)`);
    lines.push('');
    for (const b of locBlogs) {
      const slug = b.f.replace(/\.md$/, '');
      lines.push(`- [${b.title}](${SITE_URL}/${loc}/blog/${slug}/): ${b.excerpt}`);
    }
    lines.push('');
  }

  // === Footer ===
  lines.push('## Technical & Contact');
  lines.push('');
  lines.push('- Sitemap: https://www.erdosdx.com/sitemap-index.xml (3,901 URLs across 6 locales)');
  lines.push('- robots.txt: https://www.erdosdx.com/robots.txt (AI crawlers GPTBot/ClaudeBot/PerplexityBot/Google-Extended allowed)');
  lines.push('- WhatsApp: +86-156-6185-3999');
  lines.push('- Email: sales@erdosdx.com');
  lines.push('- Address: Industrial Park, Dongsheng District, Ordos, Inner Mongolia 017000, China');
  lines.push('');

  const content = lines.join('\n');
  await fs.mkdir(path.dirname(OUTPUT), { recursive: true });
  await fs.writeFile(OUTPUT, content);

  const size = content.length;
  console.log(`✓ llms-full.txt: ${(size / 1024).toFixed(0)} KB, ${blogs.length} EN blog bodies + ${otherLocs.length} locale summary sections`);
}

main().catch(e => { console.error(e); process.exit(1); });
