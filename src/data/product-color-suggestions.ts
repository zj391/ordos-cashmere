// Product color names -> matching palette swatch codes.
// Used by the PDP color picker to suggest in-stock shades matching each
// product's actual available color (instead of dumping the full 25-swatch
// library, which misleads buyers into believing every shade is in stock).
import { colorSeries, type ColorSwatch } from './color-cards';

export const PRODUCT_COLOR_FAMILIES = {
  White: ['W0003', 'W9260', 'R5333', 'W9599'],
  Black: ['W9789', 'C9575'],
  Gray: ['W9260', 'N8642', 'C9575', 'R9387'],
  Beige: ['R9387', 'W9528', 'R5822', 'W9599'],
  Camel: ['R5822', 'W9528', 'R9387'],
  Brown: ['R5822', 'W9528', 'N8642', 'C9575'],
  Pink: [],
  Red: [],
  Green: [],
  Blue: [],
  Navy: [],
  Orange: [],
  Purple: [],
  Yellow: [],
} as Record<string, string[]>;

const FAMILY_LOOKUP: Record<string, string[]> = {
  white: 'White',
  ivory: 'White',
  cream: 'Beige',
  gray: 'Gray',
  grey: 'Gray',
  black: 'Black',
  beige: 'Beige',
  camel: 'Camel',
  brown: 'Brown',
  tan: 'Beige',
  pink: 'Pink',
  red: 'Red',
  green: 'Green',
  blue: 'Blue',
  navy: 'Navy',
  orange: 'Orange',
  yellow: 'Yellow',
  purple: 'Purple',
} as Record<string, string>;

export function suggestedSwatchesForProduct(productColors: string[] | undefined): ColorSwatch[] {
  const palette = colorSeries.flatMap((s) => s.swatches);
  const fallback = palette.slice(0, 6);
  if (!productColors || productColors.length === 0) return fallback;
  const wanted = new Set<string>();
  for (const raw of productColors) {
    const key = raw.toLowerCase().trim();
    const family = FAMILY_LOOKUP[key];
    if (family) {
      for (const code of PRODUCT_COLOR_FAMILIES[family] || []) wanted.add(code);
    }
  }
  if (wanted.size === 0) return fallback;
  const matched = palette.filter((sw) => wanted.has(sw.code));
  return matched.length > 0 ? matched : fallback;
}