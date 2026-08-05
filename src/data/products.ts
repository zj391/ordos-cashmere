/**
 * Product schema (7-9 expanded from 13 → 30+ fields per imfieldcashmere model)
 *
 * 591 products × 6 locales × 30+ fields. To keep file size reasonable,
 * we store:
 *   - Core 13 fields inline (id, price, material, micron, etc.)
 *   - Detailed data (origin, process, packaging, FAQ) in shared
 *     detail objects keyed by category, with per-product overrides.
 *
 * Detailed sections per category, each as a {en, cn, de, fr, ja, kr} object
 * to keep the site data in one file but serve localized content.
 */
import productsJson from './products.json';
import { productDetails, type ProductDetail, type ProductDetailMap } from './product-details';

export interface Product {
  id: string;
  name: string;
  price: string;
  currency: string;
  moq: number;
  material: string;
  micron: string;
  colors: string[];
  description: string;
  images: string[];
  weight: string;
  lead: string;
  sample_time: string;
  tags: string[];

  // 7-9 expanded fields (imfieldcashmere-style detail data)
  size?: string;                  // e.g. "200x70cm" or "2/26 Nm"
  weight_grams?: string;          // e.g. "85g" or "200g/m"
  gauge?: string;                 // e.g. "12 gauge" or "Worsted 2/48"
  season?: string;                // e.g. "FW 2026", "Year-round"
  gender?: 'unisex' | 'women' | 'men' | 'all';
  age_group?: 'adult' | 'kids' | 'all';
  packaging?: string;             // default packaging description
  custom_options?: string[];      // e.g. ["Woven label", "Custom color", "Hangtag"]
  sample_policy?: string;         // sample lead time + cost
  payment_terms?: string[];       // e.g. ["T/T 30/70", "L/C at sight"]
  shipping_options?: string[];    // e.g. ["FOB Tianjin", "CIF", "DDP"]
  certifications?: string[];      // e.g. ["ISO 9001", "OEKO-TEX 100"]
  applications?: string[];        // e.g. ["luxury knitwear", "winter collection"]
  customization_services?: string[]; // e.g. ["Pattern development", "Branding"]
  oem_workflow?: string[];        // 3-5 step OEM process
  product_advantages?: string[];  // 3-5 USPs specific to this product
  faq?: Array<{ q: string; a: string }>; // 4-6 product-specific FAQ
  size_chart?: Array<{ label: string; measurements: Record<string, string> }>; // e.g. size chart for garments
  care_instructions?: string;     // e.g. "Dry clean only" / "Hand wash cold"
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  products: Product[];
}

export interface CompanyInfo {
  name: string;
  chineseName: string;
  established: number;
  location: string;
  description: string;
  contact: {
    phone: string;
    email: string;
  };
}

export interface ProductsData {
  company: CompanyInfo;
  categories: Category[];
}

export interface ProductWithCategory extends Product {
  categoryId: string;
  categoryName: string;
  categoryImage: string;
  // Resolved detail data (from product-details.json with overrides)
  detail?: ProductDetail;
}

export const products: ProductsData = productsJson as unknown as ProductsData;

// ===== Phase 1.5: Supabase overlay (build-time) =====
// At build time we fetch the DB catalog once and overlay it onto the static
// catalog: DB rows override matching ids; rows with no static match are added
// as new products (using the category-level detail template). Static data
// remains the fallback when Supabase is unreachable or env vars are missing.

let _dbPromise: Promise<void> | null = null;
const _dbRows = new Map<string, Record<string, unknown>>();

export function ensureDbOverlay(): Promise<void> {
  if (_dbPromise) return _dbPromise;
  _dbPromise = (async () => {
    const url = process.env.PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
    const key = process.env.SUPABASE_SERVICE_KEY || '';
    if (!url || !key) return;
    try {
      const headers = { apikey: key, Authorization: 'Bearer ' + key };
      const prodsRes = await fetch(
        `${url}/rest/v1/products?select=id,category_id,code,name,moq,price,currency,material,micron,lead,description,colors,images,tags,weight,sample_time,updated_at&limit=10000&order=updated_at.desc`,
        { headers }
      );
      if (prodsRes.ok) {
        const rows = (await prodsRes.json()) as Array<Record<string, unknown>>;
        for (const row of rows) _dbRows.set(String(row.id), row);
      }
    } catch (e) {
      console.warn(
        '[catalog] Supabase overlay failed, using static catalog:',
        e instanceof Error ? e.message : e
      );
    }
  })();
  return _dbPromise;
}

const DB_FIELDS = [
  'code', 'name', 'moq', 'price', 'currency', 'material', 'micron', 'lead',
  'description', 'colors', 'images', 'tags', 'weight', 'sample_time',
] as const;

function applyDbOverrides(p: ProductWithCategory, row: Record<string, unknown>): void {
  for (const f of DB_FIELDS) {
    const v = row[f];
    if (v !== null && v !== undefined && v !== '') {
      (p as unknown as Record<string, unknown>)[f] = v;
    }
  }
}

function dbRowToProduct(row: Record<string, unknown>, cat: Category): ProductWithCategory {
  const images = Array.isArray(row.images) ? (row.images as string[]) : [];
  const colors = Array.isArray(row.colors) ? (row.colors as string[]) : [];
  const tags = Array.isArray(row.tags) ? (row.tags as string[]).map(String) : [];
  return {
    id: String(row.id),
    name: String(row.name ?? ''),
    price: row.price != null ? String(row.price) : '',
    currency: row.currency ? String(row.currency) : 'USD',
    moq: typeof row.moq === 'number' ? row.moq : 0,
    material: row.material ? String(row.material) : '',
    micron: row.micron ? String(row.micron) : '',
    colors,
    description: row.description ? String(row.description) : '',
    images,
    weight: row.weight ? String(row.weight) : '',
    lead: row.lead ? String(row.lead) : '',
    sample_time: row.sample_time ? String(row.sample_time) : '',
    tags,
    categoryId: cat.id,
    categoryName: cat.name,
    categoryImage: cat.image,
    detail: productDetails[cat.id] || undefined,
  };
}

// Single in-process caches. Built lazily once per build worker.
// Map lookups turn every O(n) scan into O(1), which matters when getStaticPaths
// and the page body each re-touch all 591 products.
let _allProductsCache: ProductWithCategory[] | null = null;
let _byIdCache: Map<string, ProductWithCategory> | null = null;
let _byCategoryCache: Map<string, ProductWithCategory[]> | null = null;

function buildCaches(): void {
  if (_allProductsCache && _byIdCache && _byCategoryCache) return;
  const all: ProductWithCategory[] = [];
  const byId = new Map<string, ProductWithCategory>();
  const byCategory = new Map<string, ProductWithCategory[]>();
  for (const cat of products.categories) {
    const bucket: ProductWithCategory[] = [];
    for (const p of cat.products) {
      const enriched: ProductWithCategory = {
        ...p,
        categoryId: cat.id,
        categoryName: cat.name,
        categoryImage: cat.image,
        detail: productDetails[p.id] || productDetails[cat.id] || undefined,
      };
      all.push(enriched);
      byId.set(p.id, enriched);
      bucket.push(enriched);
    }
    byCategory.set(cat.id, bucket);
  }
  // Phase 1.5: overlay DB rows (override existing + add new products)
  if (_dbRows.size) {
    for (const [id, row] of _dbRows) {
      const existing = byId.get(id);
      if (existing) {
        applyDbOverrides(existing, row);
      } else {
        const catId = String(row.category_id ?? '');
        const cat = products.categories.find((c) => c.id === catId);
        if (!cat) continue;
        const enriched = dbRowToProduct(row, cat);
        all.push(enriched);
        byId.set(id, enriched);
        const bucket = byCategory.get(catId) || [];
        bucket.push(enriched);
        byCategory.set(catId, bucket);
      }
    }
  }
  _allProductsCache = all;
  _byIdCache = byId;
  _byCategoryCache = byCategory;
}

export function getAllProducts(): ProductWithCategory[] {
  buildCaches();
  return _allProductsCache!;
}

export function getProductsByCategory(categoryId: string): ProductWithCategory[] {
  buildCaches();
  return _byCategoryCache!.get(categoryId) || [];
}

export function getProductById(id: string): ProductWithCategory | null {
  buildCaches();
  return _byIdCache!.get(id) || null;
}

export function getCategoryById(id: string): Category | null {
  return products.categories.find((c) => c.id === id) ?? null;
}

export function getProductImageUrl(imageName: string): string {
  return `/products/mic/${imageName}`;
}

// 轻量摘要，用于 ProductsExplorer 岛 props（避免 1MB+ inline JSON）
export interface ProductSummary {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  image: string;
  price: string;
  material: string;
  moq: number;
}

export function toSummary(p: ProductWithCategory): ProductSummary {
  return {
    id: p.id,
    name: p.name,
    categoryId: p.categoryId,
    categoryName: p.categoryName,
    image: getProductImageUrl(p.images?.[0] || ''),
    price: p.price,
    material: p.material,
    moq: p.moq,
  };
}

export function getCategoryImageUrl(imageName: string): string {
  return `/products/mic/${imageName}`;
}

// Re-export detail types for convenience
export type { ProductDetail, ProductDetailMap };
