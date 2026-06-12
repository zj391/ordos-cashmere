import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, X, Package, Shield, Clock, Star } from 'lucide-react';
import InquiryForm from '@/components/InquiryForm';

interface ProductModalProps {
  product: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function getImageUrls(product: any): string[] {
  const images: string[] = product.images || [];
  if (images.length === 0) return [];
  return images.map((img: string) => {
    const fname = img.split('/').pop() || img;
    return `/products/mic/${fname}`;
  });
}

export default function ProductModal({ product, open, onOpenChange }: ProductModalProps) {
  const { t } = useTranslation();
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [showInquiryForm, setShowInquiryForm] = useState(false);

  if (!product) return null;

  const images = getImageUrls(product);
  const hasMultipleImages = images.length > 1;

  function prevImage() {
    setSelectedImageIdx(i => (i - 1 + images.length) % images.length);
  }

  function nextImage() {
    setSelectedImageIdx(i => (i + 1) % images.length);
  }

  function handleClose() {
    onOpenChange(false);
    setShowInquiryForm(false);
  }

  // If showing inquiry form, render simplified modal content
  if (showInquiryForm) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">{t('products.inquiryFor')}</h2>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="mb-6 p-4 bg-card rounded-lg border border-border">
              <p className="text-accent font-semibold text-lg">{product.name}</p>
            </div>
            <InquiryForm />
            <button
              onClick={() => setShowInquiryForm(false)}
              className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← {t('products.backToProduct')}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        {/* Close button at top right */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-white rounded-full shadow transition-colors"
        >
          <X size={20} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left: Image Gallery */}
          <div className="relative bg-gradient-to-br from-accent/5 to-secondary/5">
            <div className="relative aspect-square">
              {images.length > 0 ? (
                <img
                  src={images[selectedImageIdx]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={e => {
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
              <div className="flex gap-2 p-4 overflow-x-auto">
                {images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      idx === selectedImageIdx ? 'border-accent' : 'border-transparent hover:border-border'
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
          <div className="p-6 md:p-8 flex flex-col">
            {/* Title */}
            <h2 className="text-2xl font-bold text-foreground mb-3 leading-tight">{product.name}</h2>

            {/* Price & MOQ */}
            <div className="flex items-baseline gap-3 mb-3">
              <span className="text-2xl font-bold text-accent">
                ${product.price}
                {product.currency && product.currency !== 'USD' ? ` ${product.currency}` : ''}
              </span>
              <span className="text-sm text-muted-foreground">/ {t('products.perPieces')}</span>
            </div>
            <div className="text-sm text-muted-foreground mb-4">
              {t('products.moq')}: <span className="font-semibold text-foreground">{product.moq} pcs</span>
            </div>

            {/* Description */}
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">{product.description}</p>

            {/* Key Specs */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {product.material && (
                <div className="bg-card rounded-lg border border-border p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Package size={14} className="text-accent" />
                    <span className="text-xs text-muted-foreground uppercase tracking-wide">{t('products.material')}</span>
                  </div>
                  <p className="font-semibold text-foreground text-sm">{product.material}</p>
                </div>
              )}
              {product.micron && (
                <div className="bg-card rounded-lg border border-border p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Star size={14} className="text-accent" />
                    <span className="text-xs text-muted-foreground uppercase tracking-wide">{t('products.micron')}</span>
                  </div>
                  <p className="font-semibold text-foreground text-sm">{product.micron}</p>
                </div>
              )}
              <div className="bg-card rounded-lg border border-border p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Shield size={14} className="text-accent" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">{t('products.moq')}</span>
                </div>
                <p className="font-semibold text-foreground text-sm">{product.moq} pcs</p>
              </div>
              {product.lead && (
                <div className="bg-card rounded-lg border border-border p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock size={14} className="text-accent" />
                    <span className="text-xs text-muted-foreground uppercase tracking-wide">{t('products.leadTime')}</span>
                  </div>
                  <p className="font-semibold text-foreground text-sm">{product.lead}</p>
                </div>
              )}
            </div>

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">{t('products.availableColors')}:</p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color: string, idx: number) => (
                    <span key={idx} className="text-xs bg-muted text-muted-foreground px-3 py-1 rounded-full">
                      {color}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="mt-auto flex flex-col gap-3">
              <button
                onClick={() => setShowInquiryForm(true)}
                className="w-full px-6 py-3 bg-accent text-accent-foreground rounded-lg font-semibold hover:bg-[#C9A227] transition-colors"
              >
                {t('products.requestQuote')}
              </button>
              <a
                href="/contact"
                className="w-full px-6 py-3 border-2 border-accent text-accent rounded-lg font-semibold hover:bg-accent/10 transition-colors text-center"
              >
                {t('products.contactUs')}
              </a>
            </div>

            {/* Trust */}
            <div className="flex justify-center gap-6 pt-4 mt-4 border-t border-border text-center">
              <div>
                <div className="text-accent font-bold text-sm">23+</div>
                <div className="text-xs text-muted-foreground">{t('products.yearsExp')}</div>
              </div>
              <div className="border-x border-border px-4">
                <div className="text-accent font-bold text-sm">500+</div>
                <div className="text-xs text-muted-foreground">{t('products.globalBrands')}</div>
              </div>
              <div>
                <div className="text-accent font-bold text-sm">OEKO-TEX®</div>
                <div className="text-xs text-muted-foreground">{t('products.certified')}</div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}