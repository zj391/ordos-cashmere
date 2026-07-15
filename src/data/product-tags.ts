/**
 * Product tagging rules — match products to mega-menu subcategories
 * (byStyle / byMaterial / byUse / byAudience / byType / byPattern / byGauge / byCount / byForm)
 *
 * Used by products.astro to apply ?byStyle=beanies etc. URL params from mega menu.
 *
 * Matching strategy: substring match (case-insensitive) of product.name + product.material + product.tags.
 * Each tag key (e.g. "beanies") maps to an array of substrings; product matches if ANY substring hits.
 */

interface Product {
  id: string;
  name: string;
  material?: string;
  tags?: string[];
  description?: string;
}

interface CategoryRules {
  // groupKey -> subkey -> substrings to match
  [groupKey: string]: {
    [subKey: string]: string[];
  };
}

export const PRODUCT_TAG_RULES: Record<string, CategoryRules> = {
  hats: {
    byStyle: {
      beanies: ['beanie', 'winter hat', 'knit hat'],
      caps: ['cap', 'visor', 'baseball'],
      berets: ['beret', 'baker boy'],
      headbands: ['headband', 'earband', 'ear warmer'],
    },
    byMaterial: {
      '100pct-cashmere': ['100% cashmere', 'pure cashmere', '100 cashmere'],
    },
    byUse: {
      winter: ['winter', 'warm', 'thermal'],
      sport: ['sport', 'outdoor', 'running', 'ski', 'hiking'],
      fashion: ['fashion', 'stylish', 'designer', 'luxury', 'statement'],
    },
    byAudience: {
      women: ['women', 'ladies', 'female', 'girl', 'womens', 'ladies'],
      men: ['men', 'male', 'man', 'mens', 'gentlemen'],
      kids: ['kid', 'child', 'baby', 'infant', 'toddler'],
      unisex: ['unisex', 'adult', 'one size'],
    },
  },

  sweaters: {
    byStyle: {
      cardigan: ['cardigan'],
      pullover: ['pullover', 'pull over'],
      turtleneck: ['turtleneck', 'turtle neck', 'roll neck'],
      vneck: ['v-neck', 'v neck', 'vneck'],
      crew: ['crew neck', 'crewneck', 'round neck'],
      vest: ['vest', 'sleeveless', 'tank'],
      zip: ['zip', 'zipper', 'zip-up'],
    },
    byMaterial: {
      '100pct-cashmere': ['100% cashmere', 'pure cashmere', '100 cashmere'],
      'wool-cashmere': ['wool cashmere', 'wool/cashmere', 'woolen', 'cashmere wool', 'cashmere/wool', 'wool blend'],
      'two-ply': ['2-ply', '2 ply', '4-ply', '4 ply', 'two-ply', 'two ply'],
    },
    byGauge: {
      // Numeric gauge parsed from "16gg", "12gg", "8gg" etc. — categorized by thickness.
      // Heavy/medium (3-9gg) merged into one bucket; fine (12/16gg) kept separate.
      heavy: [],  // sentinel: matched by regex below, see tagProduct()
    },
    byUse: {
      winter: ['winter', 'warm', 'thick'],
      'spring-fall': ['spring', 'fall', 'autumn'],
      transitional: ['transitional', 'mid-season', 'mid season'],
      office: ['office', 'business', 'formal', 'work'],
    },
  },

  scarves: {
    byStyle: {
      scarf: ['scarf', 'muffler'],
      shawl: ['shawl'],
      wrap: ['wrap', 'pashmina'],
      poncho: ['poncho', 'cape'],
      pashmina: ['pashmina'],
    },
    byMaterial: {
      '100pct-cashmere': ['100% cashmere', 'pure cashmere', '100 cashmere'],
      'wool-cashmere': ['wool cashmere', 'wool/cashmere', 'woolen'],
    },
    byPattern: {
      plain: ['plain', 'solid', 'solid color', 'single color'],
      printed: ['print', 'printed', 'digital print'],
      tassel: ['tassel', 'fringed', 'fringe'],
    },
    byUse: {
      winter: ['winter', 'warm'],
      'spring-fall': ['spring', 'fall', 'autumn'],
      travel: ['travel', 'traveling'],
      gift: ['gift', 'present', 'gift box'],
      hijab: ['hijab', 'religious', 'head cover', 'long scarf'],
    },
  },

  accessories: {
    byType: {
      gloves: ['glove', 'mitten'],
      socks: ['sock'],
      leggings: ['legging'],
      pants: ['pant', 'trouser'],
    },
    byMaterial: {
      '100pct-cashmere': ['100% cashmere', 'pure cashmere', '100 cashmere'],
    },
    byUse: {
      winter: ['winter', 'warm'],
      lounge: ['lounge', 'home', 'sleep', 'loungewear'],
    },
  },

  yarn: {
    byCount: {
      // Numeric count parsed from "2/26 Nm", "26nm 2", "26s 2" etc.
      // Product data only contains 26nm so only 2-26 bucket is exposed.
      '2-26': [],  // sentinel: matched by regex, see tagProduct()
    },
    byType: {
      woolen: ['woolen', 'carded'],
    },
    byUse: {
      machine: ['machine knit', 'machine-knitting', 'machine'],
      hand: ['hand knit', 'hand-knitting', 'hand knit', 'handwoven'],
      weaving: ['weaving', 'woven'],
    },
    byForm: {
      cone: ['cone'],
    },
  },
};

// Numeric-gauge and yarn-count matchers (used by tagProduct below).
// These buckets can't be expressed as simple substring lists because the source
// data uses varied syntax ("2/26", "26nm", "26nm 2", "26s 2", etc.).
const GAUGE_HEAVY_REGEX = /(\d+)\s*gg\b/i; // captures the gauge number
function gaugeBucketFor(num: number): string | null {
  // 3-9gg = heavy/medium weight (8gg is the thickest in our product data).
  if (num >= 3 && num <= 9) return 'byGauge=heavy';
  if (num === 12) return 'byGauge=gauge-12';
  if (num === 16) return 'byGauge=gauge-16';
  return null;
}

function yarnCountBucketFor(num: number): string | null {
  // Product data only has 26nm products — keep one bucket and drop 36/48/60.
  if (num >= 24 && num <= 30) return 'byCount=2-26';
  return null;
}

/**
 * Tag a product: returns a Set of subKeys the product matches across all groups for its category.
 * @param product a single product
 * @param categoryId one of: hats | sweaters | scarves | accessories | yarn
 */
export function tagProduct(product: Product, categoryId: string): Set<string> {
  const matches = new Set<string>();
  const rules = PRODUCT_TAG_RULES[categoryId];
  if (!rules) return matches;

  const haystack = [product.name, product.material, product.description, ...(product.tags || [])]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  for (const [groupKey, group] of Object.entries(rules)) {
    for (const [subKey, substrings] of Object.entries(group)) {
      // Skip empty (sentinel) entries — they're matched by the regex hooks below.
      if (substrings.length === 0) continue;
      for (const sub of substrings) {
        if (haystack.includes(sub.toLowerCase())) {
          matches.add(`${groupKey}=${subKey}`);
          break;
        }
      }
    }
  }

  // Numeric-gauge hook for sweaters: match "16gg" / "12gg" / "8gg" etc.
  if (categoryId === 'sweaters') {
    const m = haystack.match(GAUGE_HEAVY_REGEX);
    if (m) {
      const bucket = gaugeBucketFor(parseInt(m[1], 10));
      if (bucket) matches.add(bucket);
    }
  }

  // Numeric-count hook for yarn: match "26nm 2", "2/26", "36nm" etc.
  if (categoryId === 'yarn') {
    // Match standalone numbers like "26nm", "36nm", "48nm" — the count numerator.
    const nmMatches = haystack.matchAll(/(\d+)\s*nm\b/g);
    for (const m of nmMatches) {
      const bucket = yarnCountBucketFor(parseInt(m[1], 10));
      if (bucket) matches.add(bucket);
    }
  }

  return matches;
}

/**
 * Pre-tag all products. Returns a Map<productId, Set<"groupKey=subKey">>.
 */
import productsJson from './products.json';

export function tagAllProducts(): Map<string, Set<string>> {
  const out = new Map<string, Set<string>>();
  const data = productsJson as unknown as { categories: Array<{ id: string; products: Product[] }> };
  for (const cat of data.categories) {
    for (const product of cat.products) {
      out.set(product.id, tagProduct(product, cat.id));
    }
  }
  return out;
}