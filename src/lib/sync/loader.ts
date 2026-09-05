/**
 * ProductPayload loader.
 *
 * Reads the static products.json (same source as [id].astro) and
 * returns a normalized ProductPayload for the sync pipeline.
 *
 * The locale for the payload is supplied by the caller (admin UI
 * picks it; cron job uses a default). The intro is pulled from
 * the locale-specific content object so the LinkedIn post or
 * Xiaohongshu note reads naturally in each market.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ProductPayload } from './types';

interface RawProduct {
  id: string;
  name: string;
  category?: string;
  material?: string;
  micron?: string;
  description?: Record<string, string> | string;
  images?: string[];
  [k: string]: unknown;
}

interface RawCategory {
  id: string;
  name: string;
  products: RawProduct[];
}

interface RawProductsFile {
  categories: RawCategory[];
}

let _cache: RawProductsFile | null = null;
function _load(): RawProductsFile {
  if (_cache) return _cache;
  // In Vercel serverless / dev the products.json lives under src/data/.
  // Both relative-from-cwd and explicit path work; try both.
  const candidates = [
    join(process.cwd(), 'src/data/products.json'),
    join(process.cwd(), 'data/products.json'),
  ];
  for (const p of candidates) {
    try {
      const raw = readFileSync(p, 'utf-8');
      _cache = JSON.parse(raw) as RawProductsFile;
      return _cache;
    } catch {
      // try next
    }
  }
  throw new Error('products.json not found in any known location');
}

const SITE_ORIGIN = 'https://www.erdosdx.com';

function _pickLocale(
  field: Record<string, string> | string | undefined,
  locale: string,
): string {
  if (!field) return '';
  if (typeof field === 'string') return field;
  return field[locale] ?? field.en ?? Object.values(field)[0] ?? '';
}

export function findProduct(id: string): RawProduct | null {
  for (const cat of _load().categories) {
    const p = cat.products.find((p) => p.id === id);
    if (p) {
      // Attach categoryId for context (not on raw shape)
      (p as RawProduct & { _categoryId: string })._categoryId = cat.id;
      (p as RawProduct & { _categoryName: string })._categoryName = cat.name;
      return p;
    }
  }
  return null;
}

export function listAllProductIds(): { id: string; name: string; category: string }[] {
  const out: { id: string; name: string; category: string }[] = [];
  for (const cat of _load().categories) {
    for (const p of cat.products) {
      out.push({ id: p.id, name: p.name, category: cat.name });
    }
  }
  return out;
}

export function toPayload(
  raw: RawProduct,
  locale: string,
  origin: string = SITE_ORIGIN,
): ProductPayload {
  const cat = (raw as RawProduct & { _categoryName?: string })._categoryName ?? raw.category ?? '';
  const intro = _pickLocale(raw.description as Record<string, string> | string | undefined, locale)
    || 'B2B cashmere product from our Ordos factory. Project terms confirmed in writing.';
  const images = (raw.images || [])
    .map((p) => (p.startsWith('http') ? p : `${origin}${p.startsWith('/') ? '' : '/'}${p}`));
  return {
    id: raw.id,
    name: raw.name,
    category: cat,
    intro,
    material: raw.material || undefined,
    micron: raw.micron || undefined,
    images,
    sourceUrl: `${origin}/${locale}/products/${raw.id}/`,
    locale,
  };
}
