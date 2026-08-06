import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import InquiryForm from '@/components/InquiryForm';
import FAQ from '@/components/FAQ';
import { useProducts, type Product, type ProductsData } from '@/hooks/useProducts';
import { ChevronLeft, ChevronRight, Star, Shield, Clock, Package, MapPin } from 'lucide-react';

function getImageUrls(product: Product): string[] {
  const images: string[] = product.images || [];
  if (images.length === 0) return [];
  return images.map(img => {
    const fname = img.split('/').pop() || img;
    return `/products/mic/${fname}`;
  });
}

export default function ProductDetail({ params }: { params?: { id?: string } }) {
  const { t } = useTranslation();
  const productId = params?.id || '';
  const [data, setData] = useState<ProductsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [showInquiryForm, setShowInquiryForm] = useState(false);

  // DEBUG
  console.log('ProductDetail productId:', productId, 'loading:', loading, 'data:', !!data);

  useEffect(() => {
    fetch('/products.json')
      .then(r => r.json())
      .then((json: ProductsData) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const product: Product | undefined = data?.categories
    .flatMap(c => c.products)
    .find(p => p.id === productId);

  const images = product ? getImageUrls(product) : [];
  const hasMultipleImages = images.length > 1;

  function prevImage() {
    setSelectedImageIdx(i => (i - 1 + images.length) % images.length);
  }

  function nextImage() {
    setSelectedImageIdx(i => (i + 1) % images.length);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg text-muted-foreground">{t('products.loading')}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-2xl font-bold text-foreground">Product not found</p>
        <a href="/products/" className="text-accent hover:underline">{t('products.backToProducts')}</a>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{product.name} | DONGXIAO® Cashmere Wholesale</title>
        <meta name="description" content={product.description} />
        <meta name="keywords" content={`${product.name}, cashmere wholesale, luxury knitwear, B2B supplier, Inner Mongolia cashmere`} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`https://erdosdx.com/products/${product.id}`} />
        <meta property="og:title" content={`${product.name} | DONGXIAO® Cashmere`} />
        <meta property="og:description" content={product.description} />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={`https://erdosdx.com/products/${product.id}`} />
        {images[0] && <meta property="og:image" content={images[0]} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${product.name} | DONGXIAO® Cashmere`} />
        <meta name="twitter:description" content={product.description} />
        {images[0] && <meta name="twitter:image" content={images[0]} />}
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          "name": product.name,
          "description": product.description,
          "image": images,
          "brand": { "@type": "Brand", "name": "DONGXIAO® CASHMERE" },
          "manufacturer": { "@type": "Organization", "name": "DONGXIAO® CASHMERE", "url": "https://erdosdx.com" },
          "category": product.category,
          "sku": product.id,
          "url": `https://erdosdx.com/products/${product.id}`
        })}</script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navigation />

        {/* Breadcrumb */}
        <div className="container mx-auto px-4 pt-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <a href="/" className="hover:text-foreground transition-colors">{t('nav.home')}</a>
            <span>/</span>
            <a href="/products/" className="hover:text-foreground transition-colors">{t('products.title')}</a>
            <span>/</span>
            <span className="text-foreground truncate">{product.name}</span>
          </div>
        </div>

        {/* Main Product Section */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-16">

              {/* Left: Image Gallery */}
              <div className="space-y-4">
                {/* Main Image */}
                <div className="relative bg-gradient-to-br from-accent/5 to-secondary/5 rounded-xl overflow-hidden aspect-square">
                  {images.length > 0 ? (
                    <img
                      src={images[selectedImageIdx]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={e => {
                        (e.target as HTMLImageElement).src = '';
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-8xl mb-4">🧶</div>
                        <p className="text-muted-foreground">{t('products.premiumCashmere')}</p>
                      </div>
                    </div>
                  )}

                  {/* Navigation Arrows */}
                  {hasMultipleImages && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                        aria-label="Previous image"
                      >
                        <ChevronLeft size={20} className="text-foreground" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                        aria-label="Next image"
                      >
                        <ChevronRight size={20} className="text-foreground" />
                      </button>
                    </>
                  )}

                  {/* Image Counter */}
                  {hasMultipleImages && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
                      {selectedImageIdx + 1} / {images.length}
                    </div>
                  )}
                </div>

                {/* Thumbnail Strip */}
                {images.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImageIdx(idx)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                          idx === selectedImageIdx
                            ? 'border-accent'
                            : 'border-transparent hover:border-border'
                        }`}
                      >
                        <img
                          src={img}
                          alt={`${product.name} view ${idx + 1}`}
                          className="w-full h-full object-cover"
                          onError={e => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Product Info */}
              <div className="space-y-6">
                {/* Title & Price */}
                <div>
                  <h1 className="text-3xl xl:text-4xl font-bold text-foreground mb-4 leading-tight">
                    {product.name}
                  </h1>
                  <div className="flex flex-wrap items-baseline gap-3 mb-4">
                    <span className="text-3xl font-bold text-accent">
                      ${product.price}
                      {product.currency && product.currency !== 'USD' ? ` ${product.currency}` : ''}
                    </span>
                    <span className="text-sm text-muted-foreground">/ {t('products.perPieces')}</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{product.description}</p>
                </div>

                {/* Key Specs Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {product.material && (
                    <div className="bg-card rounded-lg border border-border p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Package size={16} className="text-accent" />
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">{t('products.material')}</span>
                      </div>
                      <p className="font-semibold text-foreground">{product.material}</p>
                    </div>
                  )}
                  {product.micron && (
                    <div className="bg-card rounded-lg border border-border p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Star size={16} className="text-accent" />
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">{t('products.micron')}</span>
                      </div>
                      <p className="font-semibold text-foreground">{product.micron}</p>
                    </div>
                  )}
                  <div className="bg-card rounded-lg border border-border p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield size={16} className="text-accent" />
                      <span className="text-xs text-muted-foreground uppercase tracking-wide">{t('products.moq')}</span>
                    </div>
                    <p className="font-semibold text-foreground">{product.moq} {t('products.pcs')}</p>
                  </div>
                  {product.lead && (
                    <div className="bg-card rounded-lg border border-border p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock size={16} className="text-accent" />
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">{t('products.leadTime')}</span>
                      </div>
                      <p className="font-semibold text-foreground">{product.lead}</p>
                    </div>
                  )}
                  {product.sample_time && (
                    <div className="bg-card rounded-lg border border-border p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock size={16} className="text-accent" />
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">{t('products.sampleTime')}</span>
                      </div>
                      <p className="font-semibold text-foreground">{product.sample_time}</p>
                    </div>
                  )}
                </div>

                {/* Colors */}
                {product.colors && product.colors.length > 0 && (
                  <div className="bg-card rounded-lg border border-border p-6">
                    <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
                      {t('products.availableColors')}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {product.colors.map((color, idx) => (
                        <span key={idx} className="bg-muted text-muted-foreground px-4 py-2 rounded-md text-sm">
                          {color}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {product.tags && product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, idx) => (
                      <span key={idx} className="text-xs bg-accent/10 text-accent px-3 py-1 rounded-full">
                        {tag.replace(/"/g, '')}
                      </span>
                    ))}
                  </div>
                )}

                {/* CTA */}
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <button
                    onClick={() => setShowInquiryForm(true)}
                    className="flex-1 px-6 py-4 bg-accent text-accent-foreground rounded-lg font-bold text-lg hover:bg-[#C9A227] transition-colors"
                  >
                    {t('products.requestQuote')}
                  </button>
                  <a
                    href="/contact/"
                    className="flex-1 px-6 py-4 border-2 border-accent text-accent rounded-lg font-bold text-lg hover:bg-accent/10 transition-colors text-center"
                  >
                    {t('products.contactUs')}
                  </a>
                </div>

                {/* Trust Signals */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                  <div className="text-center">
                    <div className="text-accent font-bold text-xl mb-1">23+</div>
                    <div className="text-xs text-muted-foreground">{t('products.yearsExperience')}</div>
                  </div>
                  <div className="text-center border-x border-border">
                    <div className="text-accent font-bold text-xl mb-1">500+</div>
                    <div className="text-xs text-muted-foreground">{t('products.globalBrands')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-accent font-bold text-xl mb-1">OEKO-TEX®</div>
                    <div className="text-xs text-muted-foreground">{t('products.certified')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Product Details Tabs */}
        <section className="py-12 bg-card border-t border-border">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Details Column */}
              <div className="lg:col-span-2 space-y-6">
                <h2 className="text-2xl font-bold text-foreground">{t('products.productDetails')}</h2>
                <div className="bg-background rounded-lg border border-border divide-y divide-border">
                  {product.material && (
                    <div className="flex justify-between items-center p-4">
                      <span className="text-muted-foreground">{t('products.material')}</span>
                      <span className="font-semibold text-foreground">{product.material}</span>
                    </div>
                  )}
                  {product.micron && (
                    <div className="flex justify-between items-center p-4">
                      <span className="text-muted-foreground">{t('products.micron')}</span>
                      <span className="font-semibold text-foreground">{product.micron}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center p-4">
                    <span className="text-muted-foreground">{t('products.moq')}</span>
                    <span className="font-semibold text-foreground">{product.moq} {t('products.pcs')}</span>
                  </div>
                  {product.lead && (
                    <div className="flex justify-between items-center p-4">
                      <span className="text-muted-foreground">{t('products.leadTime')}</span>
                      <span className="font-semibold text-foreground">{product.lead}</span>
                    </div>
                  )}
                  {product.sample_time && (
                    <div className="flex justify-between items-center p-4">
                      <span className="text-muted-foreground">{t('products.sampleTime')}</span>
                      <span className="font-semibold text-foreground">{product.sample_time}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center p-4">
                    <span className="text-muted-foreground">{t('products.priceCurrency')}</span>
                    <span className="font-semibold text-foreground">USD</span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">{t('products.description')}</h2>
                  <p className="text-muted-foreground leading-relaxed">{product.description}</p>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Factory Info */}
                <div className="bg-background rounded-lg border border-border p-6">
                  <h3 className="font-bold text-foreground mb-4">{t('products.factoryInfo')}</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                      <MapPin size={16} className="text-accent mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-foreground">Inner Mongolia, China</p>
                        <p className="text-muted-foreground">{t('products.factoryLocation')}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock size={16} className="text-accent mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-foreground">2002 {t('products.established')}</p>
                        <p className="text-muted-foreground">ISO 9001:2015 Certified</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Inquiry */}
                <div className="bg-background rounded-lg border border-border p-6">
                  <h3 className="font-bold text-foreground mb-2">{t('products.quickInquiry')}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{t('products.quickInquiryDesc')}</p>
                  <button
                    onClick={() => setShowInquiryForm(true)}
                    className="w-full px-4 py-3 bg-accent text-accent-foreground rounded-md font-semibold hover:bg-[#C9A227] transition-colors"
                  >
                    {t('products.requestQuote')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Inquiry Form */}
        {showInquiryForm && (
          <section className="py-16 bg-background border-t border-border">
            <div className="container mx-auto px-4 max-w-2xl">
              <button
                onClick={() => setShowInquiryForm(false)}
                className="text-accent hover:text-[#C9A227] transition-colors mb-6 flex items-center gap-2"
              >
                ← {t('products.backToProduct')}
              </button>
              <div className="bg-card rounded-lg border border-border p-8 mb-6">
                <h3 className="text-xl font-bold text-foreground mb-2">{t('products.inquiryFor')}</h3>
                <p className="text-accent font-semibold text-lg">{product.name}</p>
              </div>
              <InquiryForm />
            </div>
          </section>
        )}

        <FAQ />
        <Footer />
      </div>
    </>
  );
}