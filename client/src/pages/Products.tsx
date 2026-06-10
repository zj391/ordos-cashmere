import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import InquiryForm from '@/components/InquiryForm';
import EnhancedInquiryForm from '@/components/EnhancedInquiryForm';
import FAQ from '@/components/FAQ';
import { useProducts } from '@/hooks/useProducts';
import { ChevronDown, Search, ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 18;

function normalize(s: string): string {
  return (s || '').toLowerCase().trim();
}

function matchProduct(p: any, query: string): boolean {
  if (!query) return true;
  const q = normalize(query);
  const fields = [
    p.name, p.description, p.material, p.micron,
    ...(p.colors || []),
    ...(p.tags || []),
    String(p.moq || ''),
    String(p.price || ''),
  ].map(normalize);
  return fields.some(f => f.includes(q));
}

export default function Products() {
  const { t } = useTranslation();
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const urlCat = searchParams.get('category') || 'all';
  const [selectedCat, setSelectedCat] = useState(urlCat);
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const { data: productsData, loading } = useProducts();

  const filtered = useMemo(() => {
    if (!productsData) return [];
    let list = selectedCat === 'all'
      ? productsData.categories.flatMap((cat: any) => cat.products)
      : (productsData.categories.find((cat: any) => cat.id === selectedCat)?.products ?? []);

    if (searchQuery.trim()) {
      list = list.filter((p: any) => matchProduct(p, searchQuery));
    }
    return list;
  }, [productsData, selectedCat, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function handleCatChange(cid: string) {
    setSelectedCat(cid);
    setPage(1);
    setSearchQuery('');
  }

  function handleSearch(q: string) {
    setSearchQuery(q);
    setPage(1);
  }

  function getImageUrl(product: any): string {
    const images: string[] = product.images || [];
    if (images.length === 0) return '';
    const fname = images[0].split('/').pop() || '';
    return `/products/mic/${fname}`;
  }

  const handleRequestQuote = (product: any) => {
    setSelectedProduct(product);
    setShowInquiryForm(true);
    setTimeout(() => {
      document.getElementById('inquiry-form-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <>
      <Helmet>
        <title>Premium Cashmere Products | DONGXIAO® Wholesale Knitwear Supplier</title>
        <meta name="description" content="Browse our complete collection of premium wholesale cashmere products including sweaters, scarves, hats, and accessories. B2B pricing and bulk orders available." />
        <meta property="og:title" content="Premium Cashmere Products | DONGXIAO® Wholesale Knitwear Supplier" />
        <meta property="og:description" content="Browse our complete collection of premium wholesale cashmere products including sweaters, scarves, hats, and accessories. B2B pricing and bulk orders available." />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Premium Cashmere Products | DONGXIAO® Wholesale Knitwear Supplier" />
        <meta name="twitter:description" content="Browse our complete collection of premium wholesale cashmere products including sweaters, scarves, hats, and accessories. B2B pricing and bulk orders available." />
      </Helmet>
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Page Header */}
      <section className="py-16 bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-foreground">{t('products.title')}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            {t('products.description')}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

            {/* Sidebar - Categories */}
            <div className="md:col-span-1">
              <div className="sticky top-24 space-y-4">
                {/* Search */}
                <div className="bg-card rounded-lg border border-border p-4">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder={t('products.searchPlaceholder')}
                      value={searchQuery}
                      onChange={e => handleSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
                    />
                  </div>
                  {searchQuery && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {t('products.searchResults', { count: filtered.length, query: searchQuery })}
                    </p>
                  )}
                </div>

                {/* Categories */}
                <div className="bg-card rounded-lg border border-border p-6">
                  <h3 className="text-lg font-bold mb-4 text-foreground">{t('products.categoriesLabel')}</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleCatChange('all')}
                      className={`w-full text-left px-4 py-2 rounded-md transition-colors flex justify-between items-center ${
                        selectedCat === 'all'
                          ? 'bg-accent text-accent-foreground'
                          : 'hover:bg-muted text-foreground'
                      }`}
                    >
                      <span>{t('products.categories.all')}</span>
                      <span className="text-xs opacity-70">
                        {productsData ? productsData.categories.flatMap((c: any) => c.products).length : 0}
                      </span>
                    </button>
                    {productsData && productsData.categories.map((category: any) => (
                      <button
                        key={category.id}
                        onClick={() => handleCatChange(category.id)}
                        className={`w-full text-left px-4 py-2 rounded-md transition-colors flex justify-between items-center ${
                          selectedCat === category.id
                            ? 'bg-accent text-accent-foreground'
                            : 'hover:bg-muted text-foreground'
                        }`}
                      >
                        <span>{category.name}</span>
                        <span className="text-xs opacity-70">{category.products.length}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="md:col-span-3">
              {/* Pagination info */}
              {!loading && filtered.length > 0 && (
                <div className="flex justify-between items-center mb-4 text-sm text-muted-foreground">
                  <span>{t('products.showingProducts', { start: (currentPage - 1) * PAGE_SIZE + 1, end: Math.min(currentPage * PAGE_SIZE, filtered.length), total: filtered.length })}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pageItems.map((product: any) => {
                  const imgUrl = getImageUrl(product);
                  return (
                    <div
                      key={product.id}
                      className="bg-card rounded-lg border border-border overflow-hidden hover:border-accent transition-colors group"
                    >
                      {/* Product Image */}
                      {imgUrl ? (
                        <div className="h-48 bg-gradient-to-br from-accent/10 to-secondary/10 overflow-hidden">
                          <img
                            src={imgUrl}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={e => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="h-48 bg-gradient-to-br from-accent/10 to-secondary/10 flex items-center justify-center group-hover:from-accent/20 group-hover:to-secondary/20 transition-colors">
                          <div className="text-center">
                            <div className="text-4xl mb-2">🧶</div>
                            <p className="text-xs text-muted-foreground">{t('products.premiumCashmere')}</p>
                          </div>
                        </div>
                      )}

                      {/* Product Info */}
                      <div className="p-6">
                        <h3 className="font-bold text-lg mb-2 line-clamp-2 text-foreground">{product.name}</h3>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{product.description}</p>

                        {/* Product Details */}
                        <div className="space-y-2 mb-4 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('products.material')}:</span>
                            <span className="font-semibold text-foreground">{product.material}</span>
                          </div>
                          {product.micron && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">{t('products.micron')}:</span>
                              <span className="font-semibold text-foreground">{product.micron}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('products.price')}:</span>
                            <span className="font-semibold text-accent">${product.price} {product.currency}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('products.moq')}:</span>
                            <span className="font-semibold text-foreground">{product.moq} pcs</span>
                          </div>
                        </div>

                        {/* Colors */}
                        {product.colors && product.colors.length > 0 && (
                          <div className="mb-4">
                            <p className="text-xs text-muted-foreground mb-2">{t('products.colors')}:</p>
                            <div className="flex flex-wrap gap-2">
                              {product.colors.slice(0, 6).map((color: string, idx: number) => (
                                <span key={idx} className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                                  {color}
                                </span>
                              ))}
                              {product.colors.length > 6 && (
                                <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                                  +{product.colors.length - 6}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* CTA */}
                        <button
                          onClick={() => handleRequestQuote(product)}
                          className="w-full px-4 py-2 bg-accent text-accent-foreground rounded-md font-semibold hover:bg-[#C9A227] transition-colors text-sm"
                        >
                          {t('products.requestQuote')}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {loading && (
                <div className="text-center py-12">
                  <p className="text-lg text-muted-foreground">{t('products.loading')}</p>
                </div>
              )}
              {!loading && filtered.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-lg text-muted-foreground">{t('products.noProductsFound')}</p>
                  {searchQuery && (
                    <button
                      onClick={() => handleSearch('')}
                      className="mt-4 text-accent hover:underline text-sm"
                    >
                      {t('products.clearSearch')}
                    </button>
                  )}
                </div>
              )}

              {/* Pagination Controls */}
              {!loading && totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-md border border-border hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                    .reduce<(number | '...')[]>((acc, p, i, arr) => {
                      if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('...');
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) =>
                      p === '...' ? (
                        <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground">…</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setPage(p as number)}
                          className={`w-10 h-10 rounded-md text-sm font-medium transition-colors ${
                            p === currentPage
                              ? 'bg-accent text-accent-foreground'
                              : 'border border-border hover:bg-muted'
                          }`}
                        >
                          {p}
                        </button>
                      )
                    )}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-md border border-border hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Inquiry Form Section */}
      {showInquiryForm && (
        <section id="inquiry-form-section" className="py-24 bg-card border-t border-border">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <button
                onClick={() => setShowInquiryForm(false)}
                className="text-accent hover:text-[#C9A227] transition-colors flex items-center gap-2 mb-4"
              >
                <ChevronDown size={20} className="rotate-180" />
                {t('products.hideForm')}
              </button>
            </div>
            {selectedProduct && (
              <div className="mb-8 p-6 bg-background rounded-lg border border-border">
                <h3 className="text-lg font-semibold text-foreground mb-2">{t('products.inquiryFor')}</h3>
                <p className="text-accent font-semibold">{selectedProduct.name}</p>
              </div>
            )}
            <InquiryForm />
          </div>
        </section>
      )}

      {/* CTA Section if form is not shown */}
      {!showInquiryForm && (
        <section className="py-16 bg-card border-t border-border">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">{t('products.haveQuestions')}</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t('products.haveQuestionsDesc')}
            </p>
            <button
              onClick={() => setShowInquiryForm(true)}
              className="px-8 py-3 bg-accent text-accent-foreground rounded-lg font-semibold hover:bg-[#C9A227] transition-colors inline-flex items-center gap-2"
            >
              <ChevronDown size={20} />
              {t('products.submitCustomInquiry')}
            </button>
          </div>
        </section>
      )}

      <FAQ />
      <Footer />
    </div>
    </>
  );
}
