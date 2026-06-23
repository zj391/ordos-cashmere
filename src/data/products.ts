import productsJson from "./products.json";

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
}

export interface Category {
  id: string;
  name: string;
  description: string;
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
}

export const products: ProductsData = productsJson as unknown as ProductsData;

export function getAllProducts(): ProductWithCategory[] {
  return products.categories.flatMap((cat) =>
    cat.products.map((p) => ({ ...p, categoryId: cat.id, categoryName: cat.name }))
  );
}

export function getProductById(id: string): ProductWithCategory | null {
  for (const cat of products.categories) {
    const found = cat.products.find((p) => p.id === id);
    if (found) return { ...found, categoryId: cat.id, categoryName: cat.name };
  }
  return null;
}

export function getCategoryById(id: string): Category | null {
  return products.categories.find((c) => c.id === id) ?? null;
}

export function getProductImageUrl(imageName: string): string {
  return `/products/mic/${imageName}`;
}
