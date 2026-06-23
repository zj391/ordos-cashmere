import en from "@/i18n/en/translation.json";
import de from "@/i18n/de/translation.json";
import fr from "@/i18n/fr/translation.json";
import ja from "@/i18n/ja/translation.json";
import kr from "@/i18n/kr/translation.json";
import cn from "@/i18n/cn/translation.json";

export type Locale = "en" | "de" | "fr" | "ja" | "kr" | "cn";

const bundles: Record<Locale, any> = { en, de, fr, ja, kr, cn };

export function getProductLabels(locale: Locale) {
  const t = bundles[locale] || en;
  return {
    title: t.products?.title || "Products",
    subtitle: t.products?.subtitle || "Premium cashmere products direct from our factory",
    filterAll: t.products?.filterAll || "All Products",
    searchPlaceholder: t.products?.searchPlaceholder || "Search by name, ID, material...",
    sortBy: t.products?.sortBy || "Sort by",
    sortOptions: [
      { label: t.products?.sortDefault || "Default", value: "default" },
      { label: t.products?.sortPriceAsc || "Price: Low to High", value: "price-asc" },
      { label: t.products?.sortPriceDesc || "Price: High to Low", value: "price-desc" },
      { label: t.products?.sortMoqAsc || "MOQ: Low to High", value: "moq-asc" },
    ],
    moq: t.products?.moq || "MOQ",
    material: t.products?.material || "Material",
    micron: t.products?.micron || "Micron",
    colors: t.products?.colors || "Colors",
    requestQuote: t.products?.requestQuote || "Request Quote",
    viewDetails: t.products?.viewDetails || "View Details",
    noResults: t.products?.noResults || "No products match your filters",
    showingProducts: (n: number) => `${n}`,
    closeButton: t.products?.closeButton || "Close",
    productSpecs: t.products?.productSpecs || "Product Specifications",
    leadTime: t.products?.leadTime || "Lead Time",
    sampleTime: t.products?.sampleTime || "Sample Time",
    price: t.products?.price || "Price",
    selectColor: t.products?.selectColor || "Color",
    selectColorPrompt: t.products?.selectColorPrompt || "Choose color variant",
    requestInquiry: t.products?.requestInquiry || "Request Inquiry Now",
    inquiryNote: t.products?.inquiryNote || "We'll respond within 24 hours with a quote",
    productIdLabel: t.products?.productIdLabel || "Product ID",
  };
}
