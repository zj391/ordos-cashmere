/**
 * Blog hero image picker (2026-08-19 增).
 *
 * Maps blog tag keywords to a curated set of brand-styled hero images
 * from /public/images/. Returns absolute URL + dimensions for use in
 * <meta property="og:image"> and JSON-LD BlogPosting.image.
 *
 * Why this approach:
 * - Each blog post has unique tags (post.data.tags) but no hero image field.
 * - Allocating 1566 individual hero images would cost ~50 MB of static
 *   assets. Curating 10 stock images and matching them by tag gives
 *   visual variety without bloat.
 * - Returning the same image for multiple posts is fine for SEO — Google
 *   only requires the image to be ≥ 1200x630 and relevant. The text
 *   content of the blog post is the primary topical signal.
 *
 * Selection logic:
 * 1. Score each image by tag keyword matches (case-insensitive)
 * 2. Fall back to category inference (from title words)
 * 3. Final fallback = ordos-pasture (broadest cashmere-origin visual)
 *
 * Preserves a stable set of images for tag classes so the same blog
 * post always gets the same hero across rebuilds (deterministic).
 */

import { SITE_URL } from './seo';

const HERO_IMAGES = {
  ordosPasture: '/images/home/ordos-pasture.webp',
  spinningMill: '/images/home/spinning-mill.webp',
  heroFiber: '/images/home/hero-fiber.webp',
  yarnBasket: '/images/home/yarn-basket.webp',
  craftKnit: '/images/home/craft-knit-detail.webp',
  scarfDetail: '/images/home/scarf-detail.webp',
  scarvesFolded: '/images/home/scarves-folded.webp',
  shawlEmbroidered: '/images/home/shawl-embroidered.webp',
  mongoliaGoat: '/images/home/mongolia-goat.webp',
  ordosOrigins: '/images/home/ordos-origins.webp',
  ordosLandscape: '/images/ordos-landscape.webp',
} as const;

type HeroKey = keyof typeof HERO_IMAGES;

// Keyword → hero image scoring (first-hit wins, but we tally all matches
// so multi-tag posts blend visuals).
const KEYWORD_MAP: Array<{ keys: string[]; hero: HeroKey }> = [
  // Ordos / Mongolia / origin / goat / animal / heritage
  { keys: ['ordos', 'mongolia', 'mongolian', 'goat', 'alashan', 'origin', 'heritage', 'pasture', 'landscape', 'region', 'source'], hero: 'ordosPasture' },
  // Fiber / raw material / grading / micron / testing
  { keys: ['fiber', 'raw', 'micron', 'grading', 'dehaired', 'combed', 'fineness', 'quality', 'testing', 'inspection', 'standard'], hero: 'heroFiber' },
  // Yarn / spinning / count / 2-ply / 4-ply / worsted / woolen
  { keys: ['yarn', 'spinning', 'spun', 'spindle', 'count', 'ply', 'worsted', 'woolen', 'nm', 'twist', 'thread'], hero: 'yarnBasket' },
  // Manufacturing / factory / process / production / OEM
  { keys: ['factory', 'manufacturing', 'machine', 'mill', 'production', 'oem', 'odm', 'production', 'workflow', 'supply chain', 'traceability'], hero: 'spinningMill' },
  // Knitwear / knit / garment / sweater / cardigan / pullover
  { keys: ['knit', 'knitwear', 'sweater', 'pullover', 'cardigan', 'pullover', 'garment', 'turtleneck', 'crew', 'vneck', 'v-neck'], hero: 'craftKnit' },
  // Scarf / shawl / wrap / pashmina / hijab / poncho
  { keys: ['scarf', 'shawl', 'wrap', 'pashmina', 'hijab', 'poncho', 'modest', 'travel', 'gift'], hero: 'scarfDetail' },
  // Folded / display / catalog / product
  { keys: ['folded', 'folded', 'product', 'catalog', 'retail', 'display'], hero: 'scarvesFolded' },
  // Embroidery / pattern / custom / logo / private label
  { keys: ['embroidery', 'embroidered', 'pattern', 'jacquard', 'printed', 'custom', 'private label', 'branding', 'woven logo', 'pantone', 'color matching'], hero: 'shawlEmbroidered' },
  // EU / DPP / compliance / regulation / sustainability
  { keys: ['eu', 'dpp', 'compliance', 'regulation', 'sustainability', 'esg', 'environmental', 'circular', 'recycled', 'espr', 'oeko-tex'], hero: 'ordosOrigins' },
  // Pricing / wholesale / MOQ / bulk / business
  { keys: ['price', 'pricing', 'wholesale', 'bulk', 'moq', 'cost', 'commercial', 'b2b', 'b2b buyer', 'sourcing', 'supplier', 'verify', 'verification'], hero: 'ordosLandscape' },
  // Hat / cap / beanie / beret / headband
  { keys: ['hat', 'hats', 'beanie', 'cap', 'beret', 'headband', 'pompom', 'pom'], hero: 'craftKnit' },
  // Glove / sock / leggings / accessory / accessories
  { keys: ['glove', 'gloves', 'mittens', 'sock', 'socks', 'legging', 'leggings', 'pants', 'accessory', 'accessories'], hero: 'scarfDetail' },
];

export interface BlogHeroResult {
  path: string;       // absolute URL
  width: number;
  height: number;
  alt: string;
}

const IMAGE_DIMS: Record<HeroKey, { width: number; height: number; alt: string }> = {
  ordosPasture: { width: 1600, height: 1066, alt: 'Cashmere goats grazing on Ordos pasture, Inner Mongolia' },
  spinningMill: { width: 1599, height: 1066, alt: 'Cashmere spinning mill production line at Ordos factory' },
  heroFiber: { width: 1254, height: 1254, alt: 'Premium raw cashmere fiber being graded for micron and color' },
  yarnBasket: { width: 1066, height: 1600, alt: 'Spools of 2/26 to 2/60 Nm cashmere yarn in Ordos factory' },
  craftKnit: { width: 1200, height: 800, alt: 'Hand-finished cashmere knitwear detail showing craftsmanship' },
  scarfDetail: { width: 900, height: 1350, alt: 'Cashmere scarf close-up showing texture and weaving' },
  scarvesFolded: { width: 1280, height: 1280, alt: 'Folded cashmere scarves retail display' },
  shawlEmbroidered: { width: 1280, height: 1280, alt: 'Cashmere shawl with custom embroidered logo' },
  mongoliaGoat: { width: 800, height: 533, alt: 'Mongolian cashmere goat in Inner Mongolia pasture' },
  ordosOrigins: { width: 1080, height: 686, alt: 'Ordos cashmere production region landscape' },
  ordosLandscape: { width: 1600, height: 1066, alt: 'Inner Mongolia Ordos landscape for cashmere origin' },
};

export function blogHeroImage(tags: readonly string[] = [], title: string = ''): BlogHeroResult {
  const text = [
    ...tags.map((t) => t.toLowerCase()),
    ...title.toLowerCase().split(/\s+/),
  ];

  // Score each hero by counting keyword hits
  const scores: Record<HeroKey, number> = {
    ordosPasture: 0,
    spinningMill: 0,
    heroFiber: 0,
    yarnBasket: 0,
    craftKnit: 0,
    scarfDetail: 0,
    scarvesFolded: 0,
    shawlEmbroidered: 0,
    mongoliaGoat: 0,
    ordosOrigins: 0,
    ordosLandscape: 0,
  };

  for (const { keys, hero } of KEYWORD_MAP) {
    for (const key of keys) {
      // Single-word exact match
      if (text.includes(key)) {
        scores[hero] += 2;
      }
      // Partial substring match (e.g. "mohair" in "cashmere vs mohair")
      // but only for keys >= 4 chars to avoid noise on "a", "the", etc.
      else if (key.length >= 4 && text.some((t) => t.includes(key))) {
        scores[hero] += 1;
      }
    }
  }

  // Find max
  let bestKey: HeroKey = 'ordosPasture';
  let bestScore = 0;
  for (const [k, v] of Object.entries(scores)) {
    if (v > bestScore) {
      bestScore = v;
      bestKey = k as HeroKey;
    }
  }

  const dims = IMAGE_DIMS[bestKey];
  return {
    path: `${SITE_URL}${HERO_IMAGES[bestKey]}`,
    width: dims.width,
    height: dims.height,
    alt: dims.alt,
  };
}

/**
 * For use in JSON-LD BlogPosting.image — returns ImageObject schema.
 */
export function blogHeroImageSchema(tags: readonly string[] = [], title: string = '') {
  const hero = blogHeroImage(tags, title);
  return {
    '@type': 'ImageObject',
    url: hero.path,
    width: hero.width,
    height: hero.height,
    caption: hero.alt,
  };
}
