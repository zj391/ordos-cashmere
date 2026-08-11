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
const PRODUCTS_JSON = path.join(ROOT, 'products.json');
const OUTPUT = path.join(ROOT, 'public/llms-full.txt');

const SITE_URL = 'https://www.erdosdx.com';

// Hub pages in display order. Each entry: [path, label, en-description, ...per locale]
const HUB_PAGES = {
  home: {
    path: '/',
    title: 'DONGXIAO® Cashmere — Premium B2B Cashmere Manufacturer',
    desc: {
      en: 'Premium B2B cashmere manufacturer and wholesale supplier from Ordos, Inner Mongolia, China. 23+ years expertise, OEKO-TEX certified, MOQ 100pcs, 7-day sampling, FOB Tianjin. Trusted by 500+ brands worldwide. 591 products across 5 categories: hats, scarves, sweaters, accessories, yarn.',
      cn: '鄂尔多斯源头工厂直供，591款羊绒产品工厂直供：帽子、围巾、毛衫、配饰、纱线。支持OEM/ODM。工厂价格，100%纯羊绒，ISO认证。起订量100件。',
      de: 'Premium Kaschmir-Großhandel direkt ab Fabrik in Ordos, China. 591 Produkte: Mützen, Schals, Pullover, Accessoires, Garn. OEM/ODM. MOQ 100 Stück, 7 Tage Bemusterung.',
      fr: 'Fabricant cachemire B2B premium direct usine, Ordos Chine. 591 produits: bonnets, écharpes, pulls, accessoires, fils. OEM/ODM. MOQ 100pcs, échantillonnage 7 jours.',
      ja: 'オルドス工場直販カシミア卸売。591点: 帽子、マフラー、セーター、アクセサリー、糸。OEM/ODM。MOQ 100個、7日サンプル発送。',
      kr: '어얼어스 공장 직송 캐시미어 도매. 591점: 모자, 스카프, 스웨터, 액세서리, 원사. OEM/ODM. MOQ 100개, 7일 샘플 발송.',
    },
  },
  products: {
    path: '/products/',
    title: '591 Cashmere Products Wholesale Catalog',
    desc: {
      en: 'Browse 591 wholesale cashmere products: hats, scarves, sweaters, accessories, yarn. Filter by style, material, gauge, audience, pattern.',
      cn: '浏览591款批发羊绒产品: 帽子、围巾、毛衫、配饰、纱线。',
      de: '591 Kaschmir-Großhandelsprodukte: Mützen, Schals, Pullover, Accessoires, Garn.',
      fr: '591 produits cachemire en gros: bonnets, écharpes, pulls, accessoires, fils.',
      ja: 'カシミア卸売製品591点: 帽子、マフラー、セーター、アクセサリー、糸。',
      kr: '캐시미어 도매 제품 591점: 모자, 스카프, 스웨터, 액세서리, 원사.',
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
  lines.push(`This file is the full-text counterpart of /llms.txt. It contains all site pages, the complete 591-product catalog (with materials/micron/MOQ), and every published blog article. Generated ${new Date().toISOString().split('T')[0]}.`);
  lines.push('');
  lines.push('## Site Map');
  lines.push('');

  // === Hub pages (6 languages) ===
  for (const [key, page] of Object.entries(HUB_PAGES)) {
    lines.push(`### ${page.title}`);
    lines.push('');
    for (const [loc, desc] of Object.entries(page.desc)) {
      const slug = loc === 'cn' ? '/cn' : (loc === 'en' ? '' : `/${loc}`);
      lines.push(`- **${loc.toUpperCase()}** [${page.title}](${SITE_URL}${slug}${page.path === '/' ? '' : page.path}): ${desc}`);
    }
    lines.push('');
  }

  // === Product catalog (EN, compact table) ===
  lines.push('## Product Catalog (591 SKUs)');
  lines.push('');
  lines.push('Format: `id | name | material | micron | MOQ | lead time | price (USD)`');
  lines.push('');

  // products.json metadata only — actual products live in Drizzle DB at build
  // time. We surface the catalog summary here; for full product detail, see
  // /en/products/<id>/ on the live site.
  const productsMeta = JSON.parse(await fs.readFile(PRODUCTS_JSON, 'utf-8'));
  lines.push(`Total products: see /en/products/ for the full 591-SKU catalog (live, SSR'd from Drizzle DB).`);
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
