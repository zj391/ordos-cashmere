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

export function getAllProducts(): ProductWithCategory[] {
  return products.categories.flatMap((cat) =>
    cat.products.map((p) => ({
      ...p,
      categoryId: cat.id,
      categoryName: cat.name,
      categoryImage: cat.image,
      detail: productDetails[p.id] || productDetails[cat.id] || undefined,
    })),
  );
}

export function getProductById(id: string): ProductWithCategory | null {
  for (const cat of products.categories) {
    const found = cat.products.find((p) => p.id === id);
    if (found) {
      return {
        ...found,
        categoryId: cat.id,
        categoryName: cat.name,
        categoryImage: cat.image,
        detail: productDetails[id] || productDetails[cat.id] || undefined,
      };
    }
  }
  return null;
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