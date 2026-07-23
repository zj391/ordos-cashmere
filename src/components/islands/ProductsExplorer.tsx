import { useState, useMemo, useEffect } from "react";
import type { Product, Category } from "@/data/products";

// 轻量摘要（用于卡片列表展示，节省 props 体积）
// 字段极度精简：id+name 用于卡片标题，categoryId 用于筛选，price 用于排序
// 其他字段（image/material/moq 等）从 /data/products.json 异步加载后填充
interface ProductSummary {
  id: string;
  name: string;
  categoryId: string;
  price: string;
}

// 卡片用视图模型（summary + 详情合并）
interface ProductCardItem extends ProductSummary {
  categoryName: string;
  image: string;
  material: string;
  micron: string;
  currency: string;
  moq: number;
}

interface Props {
  summaries: ProductSummary[];          // 轻量：每产品 ~200 字节
  categories: Array<Pick<Category, 'id' | 'name'>>;
  labels: {
    filterAll: string;
    searchPlaceholder: string;
    sortBy: string;
    sortOptions: { label: string; value: string }[];
    moq: string;
    material: string;
    micron: string;
    colors: string;
    requestQuote: string;
    viewDetails: string;
    noResults: string;
    showingProducts: (n: number) => string;
    closeButton: string;
    productSpecs: string;
    leadTime: string;
    sampleTime: string;
    price: string;
    selectColor: string;
    selectColorPrompt: string;
    requestInquiry: string;
    inquiryNote: string;
    productIdLabel: string;
  };
}

export default function ProductsExplorer({ summaries, categories, labels }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("default");
  // selectedProduct 可以是 summary 派生对象（点击瞬间）或 full Product（详情加载后）
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  // 帮助函数：把任意入口（含 summary）转成 Product 形状（缺失字段填空字符串），modal 能立即渲染
  const openProduct = (item: ProductCardItem | Product) => {
    // 优先用 allDetails 里的全量；否则用 item 字段兜底（缺失则空）
    const full = allDetails?.[item.id];
    if (full) {
      setSelectedProduct(full);
    } else {
      // 详情 JSON 还没回来，用 card item 字段拼一个最小 Product
      const card = item as ProductCardItem;
      setSelectedProduct({
        id: card.id,
        name: card.name,
        price: card.price,
        currency: card.currency,
        moq: card.moq,
        material: card.material,
        micron: card.micron,
        colors: [],
        description: '',
        images: card.image ? [card.image] : [],
        weight: '',
        lead: '',
        sample_time: '',
        tags: [],
        categoryName: card.categoryName,
      } as Product);
    }
  };
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  // 全量产品缓存：id → 完整 Product（详情懒加载用）
  const [allDetails, setAllDetails] = useState<Record<string, Product> | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // 岛 hydrate 后立即 fetch 完整产品 JSON（24KB gz，远小于 1.1MB inline props）
  useEffect(() => {
    if (allDetails !== null) return;
    let cancelled = false;
    setDetailsLoading(true);
    fetch('/data/products.json')
      .then(r => r.ok ? r.json() : Promise.reject(r.statusText))
      .then((data: { categories: (Category & { products: Product[] })[] }) => {
        if (cancelled) return;
        const map: Record<string, Product> = {};
        const catNameMap: Record<string, string> = {};
        for (const cat of data.categories) {
          catNameMap[cat.id] = cat.name;
          for (const p of cat.products) {
            map[p.id] = { ...p, categoryName: cat.name };
          }
        }
        setAllDetails(map);
      })
      .catch(err => console.error('Failed to load products:', err))
      .finally(() => { if (!cancelled) setDetailsLoading(false); });
    return () => { cancelled = true; };
  }, [allDetails]);

  // 打开 modal 时用缓存查详情（如果 details 已就绪，把 summary 替换为 full Product）
  useEffect(() => {
    if (selectedProduct && allDetails) {
      const full = allDetails[selectedProduct.id];
      if (full && full !== selectedProduct) {
        setSelectedProduct(full);
      }
    }
  }, [allDetails, selectedProduct]);

  // 派生卡片视图模型：合并 summary + allDetails
  const cards: ProductCardItem[] = useMemo(() => {
    if (!allDetails) {
      // 详情还没加载：先渲染基础骨架（id + name + categoryId），图/material 等留空
      return summaries.map((s) => ({
        ...s,
        categoryName: '',
        image: '',
        material: '',
        micron: '',
        currency: 'USD',
        moq: 0,
      }));
    }
    return summaries.map((s) => {
      const full = allDetails[s.id];
      return {
        id: s.id,
        name: s.name,
        categoryId: s.categoryId,
        price: s.price,
        categoryName: full?.categoryName || '',
        image: full?.images?.[0] || '',
        material: full?.material || '',
        micron: full?.micron || '',
        currency: full?.currency || 'USD',
        moq: full?.moq || 0,
      };
    });
  }, [summaries, allDetails]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedProduct) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedProduct]);

  // Reset image index when modal opens
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [selectedProduct]);

  // ESC key closes modal
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedProduct(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const filtered = useMemo(() => {
    let result = activeCategory === "all" ? cards : cards.filter((p) => p.categoryId === activeCategory);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          (p.material && p.material.toLowerCase().includes(q))
      );
    }

    if (sortBy === "price-asc") {
      result = [...result].sort((a, b) => parseFloat(a.price.split("-")[0]) - parseFloat(b.price.split("-")[0]));
    } else if (sortBy === "price-desc") {
      result = [...result].sort((a, b) => parseFloat(b.price.split("-")[0]) - parseFloat(a.price.split("-")[0]));
    } else if (sortBy === "moq-asc") {
      result = [...result].sort((a, b) => a.moq - b.moq);
    }

    return result;
  }, [cards, activeCategory, searchQuery, sortBy]);

  const [displayCount, setDisplayCount] = useState(24);

  // Reset display count when filters change
  useEffect(() => {
    setDisplayCount(24);
  }, [activeCategory, searchQuery, sortBy]);

  const displayed = filtered.slice(0, displayCount);
  const hasMore = filtered.length > displayCount;

  const loadMore = () => setDisplayCount((c) => c + 24);

  return (
    <div className="w-full">
      {/* Filter bar */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8 lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-4 py-2 text-sm border transition-colors ${
              activeCategory === "all"
                ? "bg-stone-900 text-white border-stone-900"
                : "bg-white text-stone-700 border-stone-300 hover:border-stone-900"
            }`}
          >
            {labels.filterAll} ({summaries.length})
          </button>
          {categories.map((cat) => {
            const count = summaries.filter((p) => p.categoryId === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 text-sm border transition-colors ${
                  activeCategory === cat.id
                    ? "bg-stone-900 text-white border-stone-900"
                    : "bg-white text-stone-700 border-stone-300 hover:border-stone-900"
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder={labels.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 text-sm border border-stone-300 bg-white focus:outline-none focus:border-stone-900 min-w-[200px]"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 text-sm border border-stone-300 bg-white focus:outline-none focus:border-stone-900"
          >
            {labels.sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Result count */}
      <p className="text-sm text-stone-600 mb-4">{labels.showingProducts(filtered.length)}</p>

      {/* Grid */}
      {displayed.length === 0 ? (
        <p className="text-center text-stone-500 py-16">{labels.noResults}</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayed.map((p) => (
            <div
              key={p.id}
              className="bg-white border border-stone-200 overflow-hidden hover:shadow-lg transition-shadow group"
            >
              <div
                className="aspect-square bg-stone-100 cursor-pointer overflow-hidden"
                onClick={() => openProduct(p)}
              >
                <img
                  src={`/products/mic/${p.image}`}
                  alt={p.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">{p.categoryName}</p>
                <h3
                  className="text-sm font-medium text-stone-900 mb-2 line-clamp-2 cursor-pointer hover:text-amber-700"
                  onClick={() => openProduct(p)}
                >
                  {p.name}
                </h3>
                <div className="space-y-1 text-xs text-stone-600 mb-3">
                  <div className="flex justify-between">
                    <span>{labels.material}:</span>
                    <span className="font-medium">{p.material}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{labels.micron}:</span>
                    <span className="font-medium">{p.micron}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{labels.price}:</span>
                    <span className="font-medium text-amber-700">
                      ${p.price} {p.currency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{labels.moq}:</span>
                    <span className="font-medium">{p.moq} pcs</span>
                  </div>
                </div>
                <p className="text-xs text-stone-500 mb-2">{labels.colorCardPreview}</p>
                <button
                  onClick={() => openProduct(p)}
                  className="w-full px-3 py-2 bg-stone-900 text-white text-xs hover:bg-amber-700 transition-colors"
                >
                  {labels.requestQuote}
                </button>
              </div>
            </div>
          ))}
          </div>
          {hasMore && (
            <div className="text-center mt-8">
              <button
                onClick={loadMore}
                className="px-8 py-3 bg-stone-900 text-white hover:bg-amber-700 transition-colors text-sm"
              >
                {(labels as any).loadMore
                  ? `${(labels as any).loadMore} (${filtered.length - displayCount})`
                  : `Load More (${filtered.length - displayCount})`}
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="bg-white max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">
                    {selectedProduct.categoryName}
                  </p>
                  <h2 className="text-xl sm:text-2xl font-serif text-stone-900">{selectedProduct.name}</h2>
                  <p className="text-xs text-stone-500 mt-1">{labels.productIdLabel}: {selectedProduct.id}</p>
                </div>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="text-stone-500 hover:text-stone-900 text-2xl leading-none"
                  aria-label={labels.closeButton}
                >
                  ×
                </button>
              </div>

              {/* Image gallery */}
              <div className="aspect-square bg-stone-100 mb-4 overflow-hidden">
                <img
                  src={`/products/mic/${selectedProduct.images[currentImageIndex]}`}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {selectedProduct.images.length > 1 && (
                <div className="flex gap-2 mb-4 overflow-x-auto">
                  {selectedProduct.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImageIndex(i)}
                      className={`flex-shrink-0 w-16 h-16 border-2 ${
                        i === currentImageIndex ? "border-amber-700" : "border-stone-200"
                      }`}
                    >
                      <img
                        src={`/products/mic/${img}`}
                        alt={`${selectedProduct.name} ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Specs */}
              <div className="border-t border-stone-200 pt-4">
                <h3 className="text-sm font-medium text-stone-900 mb-3">{labels.productSpecs}</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-stone-500">{labels.material}</p>
                    <p className="font-medium">{selectedProduct.material}</p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-500">{labels.micron}</p>
                    <p className="font-medium">{selectedProduct.micron}</p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-500">{labels.price}</p>
                    <p className="font-medium text-amber-700">
                      ${selectedProduct.price} {selectedProduct.currency}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-500">{labels.moq}</p>
                    <p className="font-medium">{selectedProduct.moq} pcs</p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-500">{labels.leadTime}</p>
                    <p className="font-medium">{selectedProduct.lead}</p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-500">{labels.sampleTime}</p>
                    <p className="font-medium">{selectedProduct.sample_time}</p>
                  </div>
                  {selectedProduct.weight && (
                    <div className="col-span-2">
                      <p className="text-xs text-stone-500">Weight</p>
                      <p className="font-medium">{selectedProduct.weight}</p>
                    </div>
                  )}
                </div>

                <a
                  href={`/${(window as any).__LOCALE__ || 'en'}/products/${selectedProduct.id}/`}
                  onClick={(e) => { e.stopPropagation(); setSelectedProduct(null); }}
                  className="mt-4 inline-block text-xs px-3 py-1.5 border border-amber-700 text-amber-700 hover:bg-amber-700 hover:text-white transition-colors"
                >
                  {labels.colorCardPreview}
                </a>

                <p className="mt-4 text-sm text-stone-700 leading-relaxed">{selectedProduct.description}</p>

                <button
                  className="w-full mt-6 px-6 py-3 bg-amber-700 text-white hover:bg-amber-800 transition-colors"
                  onClick={() => {
                    const subject = encodeURIComponent(`Inquiry: ${selectedProduct.name} (${selectedProduct.id})`);
                    const body = encodeURIComponent(
                      `Hi,\n\nI'm interested in: ${selectedProduct.name}\nProduct ID: ${selectedProduct.id}\nCategory: ${selectedProduct.categoryName}\nMaterial: ${selectedProduct.material}\nMOQ: ${selectedProduct.moq} pcs\n\nPlease send me more details, pricing, and lead time.\n\nThank you.`
                    );
                    window.location.href = `/contact?subject=${subject}&body=${body}`;
                  }}
                >
                  {labels.requestInquiry}
                </button>
                <p className="text-xs text-stone-500 text-center mt-2">{labels.inquiryNote}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
