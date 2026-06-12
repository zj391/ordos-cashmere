// UNIQUE_MARKER_12345
import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import InquiryForm from '@/components/InquiryForm';
import FAQ from '@/components/FAQ';
import { useProducts } from '@/hooks/useProducts';
import { ChevronDown, Search, ChevronLeft, ChevronRight, X, Package, Shield, Clock, Star } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

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
  const [selectedModalProduct, setSelectedModalProduct] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImageIdx, setModalImageIdx] = useState(0);
  const [modalInquiry, setModalInquiry] = useState(false);
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

  function handleProductClick(product: any) {
    setSelectedModalProduct(product);
    setModalOpen(true);
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
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://erdosdx.com/products" />
        <meta property="og:title" content="Premium Cashmere Products | DONGXIAO® Wholesale Knitwear Supplier" />
        <meta property="og:description" content="Browse our complete collection of premium wholesale cashmere products including sweaters, scarves, hats, and accessories. B2B pricing and bulk orders available." />
        <meta property="og:url" content="https://erdosdx.com/products" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "Premium Cashmere Products",
          "description": "Browse our complete collection of premium wholesale cashmere products including sweaters, scarves, hats, and accessories.",
          "url": "https://erdosdx.com/products"
        })}</script>
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
                      onClick={() => handleProductClick(product)}
                      className="bg-card rounded-lg border border-border overflow-hidden hover:border-accent transition-colors group cursor-pointer flex flex-col"
                    >
                      {/* Product Image */}
                      {imgUrl ? (
                        <div className="h-48 bg-gradient-to-br from-accent/10 to-secondary/10 overflow-hidden flex-shrink-0">
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
                        <div className="h-48 bg-gradient-to-br from-accent/10 to-secondary/10 flex items-center justify-center flex-shrink-0 group-hover:from-accent/20 group-hover:to-secondary/20 transition-colors">
                          <div className="text-center">
                            <div className="text-4xl mb-2">🧶</div>
                            <p className="text-xs text-muted-foreground">{t('products.premiumCashmere')}</p>
                          </div>
                        </div>
                      )}

                      {/* Product Info */}
                      <div className="p-5 flex flex-col flex-1">
                        <h3 className="font-bold text-base mb-2 line-clamp-2 text-foreground min-h-[2.5rem]">{product.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2 flex-shrink-0">{product.description}</p>

                        {/* Product Details */}
                        <div className="space-y-1.5 mb-3 text-sm flex-shrink-0">
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
                          <div className="mb-3 flex-shrink-0">
                            <p className="text-xs text-muted-foreground mb-1.5">{t('products.colors')}:</p>
                            <div className="flex flex-wrap gap-1">
                              {product.colors.slice(0, 5).map((color: string, idx: number) => (
                                <span key={idx} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">
                                  {color}
                                </span>
                              ))}
                              {product.colors.length > 5 && (
                                <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">
                                  +{product.colors.length - 5}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* CTA */}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRequestQuote(product); }}
                          className="mt-auto w-full px-4 py-2 bg-accent text-accent-foreground rounded-md font-semibold hover:bg-[#C9A227] transition-colors text-sm"
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

      {/* Product Detail Modal */}
      {selectedModalProduct && (
        <Dialog open={modalOpen} onOpenChange={(v) => { setModalOpen(v); if (!v) setModalInquiry(false); }}>
          <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto p-0 gap-0">
            <button
              onClick={() => { setModalOpen(false); setModalInquiry(false); }}
              className="absolute top-3 right-3 z-20 p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition-colors"
            >
              <X size={18} />
            </button>

            {modalInquiry ? (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-foreground">{t('products.inquiryFor')}</h2>
                </div>
                <div className="mb-6 p-4 bg-card rounded-lg border border-border">
                  <p className="text-accent font-semibold text-lg">{selectedModalProduct.name}</p>
                </div>
                <InquiryForm />
                <button
                  onClick={() => setModalInquiry(false)}
                  className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← {t('products.backToProduct')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-5">
                {/* Left: Image - 2 cols */}
                <div className="col-span-2 relative bg-gradient-to-br from-accent/8 to-secondary/8">
                  <div className="relative aspect-square">
                    {(() => {
                      const imgs = (selectedModalProduct.images || []).map((img: string) => '/products/mic/' + (img.split('/').pop() || img));
                      const hasImgs = imgs.length > 0;
                      const hasMultiple = imgs.length > 1;
                      return (
                        <>
                          {hasImgs ? (
                            <img src={imgs[modalImageIdx]} alt={selectedModalProduct.name} className="w-full h-full object-cover" onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="text-center"><div className="text-8xl mb-4">🧶</div><p className="text-muted-foreground">{t('products.premiumCashmere')}</p></div>
                            </div>
                          )}
                          {hasMultiple && (
                            <>
                              <button onClick={() => setModalImageIdx(i => (i - 1 + imgs.length) % imgs.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/85 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors" aria-label="Previous"><ChevronLeft size={18} /></button>
                              <button onClick={() => setModalImageIdx(i => (i + 1) % imgs.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/85 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors" aria-label="Next"><ChevronRight size={18} /></button>
                              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full">{modalImageIdx + 1} / {imgs.length}</div>
                            </>
                          )}
                        </>
                      );
                    })()}
                  </div>
                  {(() => { const imgs = (selectedModalProduct.images || []).map((img: string) => '/products/mic/' + (img.split('/').pop() || img)); return imgs.length > 1 ? (
                    <div className="flex gap-2 p-4 overflow-x-auto">
                      {imgs.map((img: string, idx: number) => (
                        <button key={idx} onClick={() => setModalImageIdx(idx)} className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-colors ${idx === modalImageIdx ? 'border-accent' : 'border-transparent hover:border-border'}`}>
                          <img src={img} alt="" className="w-full h-full object-cover" onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} />
                        </button>
                      ))}
                    </div>
                  ) : null; })()}
                </div>

                {/* Right: Info - 3 cols */}
                <div className="col-span-3 p-6 md:p-7 flex flex-col">
                  {/* Category badge + Title */}
                  <div className="mb-3">
                    <span className="inline-block text-xs font-medium text-accent bg-accent/10 px-3 py-1 rounded-full mb-2">Premium Cashmere</span>
                    <h2 className="text-2xl font-bold text-foreground leading-tight">{selectedModalProduct.name}</h2>
                  </div>

                  {/* Price row */}
                  <div className="flex items-baseline gap-3 mb-4">
                    <span className="text-3xl font-bold text-accent">${selectedModalProduct.price}{selectedModalProduct.currency && selectedModalProduct.currency !== 'USD' ? ` ${selectedModalProduct.currency}` : ''}</span>
                    <span className="text-sm text-muted-foreground">/ {t('products.perPieces')}</span>
                    <span className="ml-auto text-sm bg-green-100 text-green-700 px-2 py-0.5 rounded">MOQ {selectedModalProduct.moq} pcs</span>
                  </div>

                  {/* Description */}
                  <p className="text-muted-foreground text-sm leading-relaxed mb-5">{selectedModalProduct.description}</p>

                  {/* Specs grid */}
                  <div className="grid grid-cols-2 gap-2.5 mb-5">
                    {selectedModalProduct.material && (
                      <div className="bg-muted/50 rounded-lg border border-border p-3">
                        <div className="flex items-center gap-2 mb-1"><Package size={13} className="text-accent" /><span className="text-xs text-muted-foreground uppercase tracking-wide">{t('products.material')}</span></div>
                        <p className="font-semibold text-foreground text-sm">{selectedModalProduct.material}</p>
                      </div>
                    )}
                    {selectedModalProduct.micron && (
                      <div className="bg-muted/50 rounded-lg border border-border p-3">
                        <div className="flex items-center gap-2 mb-1"><Star size={13} className="text-accent" /><span className="text-xs text-muted-foreground uppercase tracking-wide">{t('products.micron')}</span></div>
                        <p className="font-semibold text-foreground text-sm">{selectedModalProduct.micron}</p>
                      </div>
                    )}
                    <div className="bg-muted/50 rounded-lg border border-border p-3">
                      <div className="flex items-center gap-2 mb-1"><Shield size={13} className="text-accent" /><span className="text-xs text-muted-foreground uppercase tracking-wide">{t('products.moq')}</span></div>
                      <p className="font-semibold text-foreground text-sm">{selectedModalProduct.moq} pcs</p>
                    </div>
                    {selectedModalProduct.lead && (
                      <div className="bg-muted/50 rounded-lg border border-border p-3">
                        <div className="flex items-center gap-2 mb-1"><Clock size={13} className="text-accent" /><span className="text-xs text-muted-foreground uppercase tracking-wide">{t('products.leadTime')}</span></div>
                        <p className="font-semibold text-foreground text-sm">{selectedModalProduct.lead}</p>
                      </div>
                    )}
                  </div>

                  {/* Colors */}
                  {selectedModalProduct.colors && selectedModalProduct.colors.length > 0 && (
                    <div className="mb-5">
                      <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">{t('products.availableColors')}:</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedModalProduct.colors.map((color: string, idx: number) => (
                          <span key={idx} className="text-xs bg-muted border border-border text-foreground px-3 py-1 rounded-full">{color}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Divider */}
                  <div className="border-t border-border mb-5"></div>

                  {/* Trust badges */}
                  <div className="flex gap-6 mb-5">
                    <div className="text-center flex-1 bg-muted/30 rounded-lg py-2 px-2">
                      <div className="text-accent font-bold text-sm">23+</div>
                      <div className="text-xs text-muted-foreground">{t('products.yearsExp')}</div>
                    </div>
                    <div className="text-center flex-1 bg-muted/30 rounded-lg py-2 px-2">
                      <div className="text-accent font-bold text-sm">500+</div>
                      <div className="text-xs text-muted-foreground">{t('products.globalBrands')}</div>
                    </div>
                    <div className="text-center flex-1 bg-muted/30 rounded-lg py-2 px-2">
                      <div className="text-accent font-bold text-sm">OEKO-TEX®</div>
                      <div className="text-xs text-muted-foreground">{t('products.certified')}</div>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="mt-auto flex flex-col gap-2.5">
                    <button onClick={() => setModalInquiry(true)} className="w-full px-6 py-3.5 bg-accent text-accent-foreground rounded-lg font-semibold hover:bg-[#C9A227] transition-colors text-sm">{t('products.requestQuote')}</button>
                    <a href="/contact" className="w-full px-6 py-3.5 border-2 border-accent text-accent rounded-lg font-semibold hover:bg-accent/10 transition-colors text-sm text-center">{t('products.contactUs')}</a>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
    </>
  );
}
