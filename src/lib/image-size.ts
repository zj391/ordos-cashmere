/**
 * Real pixel size of a site image.
 *
 * The pages used to hardcode width/height on their <img> tags — 750x750
 * for a product gallery whose assets range from 271x400 to 750x750, and
 * 750x750 for the homepage category samples that are actually 489x550 and
 * 543x550. The browser then reserves a box of the wrong shape, so the
 * picture and the text beside it are out of alignment until the image
 * loads, and the layout shifts once it does.
 *
 * scripts/generate_image_dimensions.py reads the actual pixels from disk
 * and writes src/data/image-dimensions.json; this module is the lookup.
 * Nothing here can drift from the assets, because the table is generated
 * from them.
 */
import imageDimensions from '@/data/image-dimensions.json';

const TABLE = imageDimensions as Record<string, { w: number; h: number }>;

/** The default box when an image is not in the table. */
const FALLBACK = { w: 750, h: 750 };

/**
 * The real pixel size of a site-relative image path.
 *
 * @param src site-relative path, e.g. "/products/mic/prod_000_00.webp"
 */
export function imageSize(src: string): { w: number; h: number } {
  if (!src) return FALLBACK;
  const entry = TABLE[src];
  return entry ?? FALLBACK;
}

/**
 * Whether the size for this path is known, i.e. whether the fallback is
 * being used. Pages can use this to decide if they need to look harder.
 */
export function hasKnownImageSize(src: string): boolean {
  return Boolean(src) && src in TABLE;
}
