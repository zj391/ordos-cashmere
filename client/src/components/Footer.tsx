import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-card border-t border-border mt-24">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div>
            <div className="text-xl font-bold text-accent mb-4">
              DONGXIAO<span className="text-sm">®</span> CASHMERE
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {t('footer.companyDesc')}
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <MapPin size={16} />
              <span>{t('footer.location')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Phone size={16} />
              <a href="https://wa.me/8615661853999" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">{t('footer.whatsapp')}: +86 156 6185 3999</a>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail size={16} />
              <a href="mailto:dongxiaocashmere@erdosdx.com" className="hover:text-accent transition-colors">dongxiaocashmere@erdosdx.com</a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2">
              <li><a href="/" className="text-sm text-muted-foreground hover:text-accent transition-colors">{t('nav.home')}</a></li>
              <li><a href="/products/" className="text-sm text-muted-foreground hover:text-accent transition-colors">{t('nav.products')}</a></li>
              <li><a href="/about/" className="text-sm text-muted-foreground hover:text-accent transition-colors">{t('nav.about')}</a></li>
              <li><a href="/contact/" className="text-sm text-muted-foreground hover:text-accent transition-colors">{t('nav.contact')}</a></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">{t('footer.categories')}</h4>
            <ul className="space-y-2">
              <li><a href="/products?category=sweaters" className="text-sm text-muted-foreground hover:text-accent transition-colors">{t('nav.sweaters')}</a></li>
              <li><a href="/products?category=scarves" className="text-sm text-muted-foreground hover:text-accent transition-colors">{t('nav.scarves')}</a></li>
              <li><a href="/products?category=hats" className="text-sm text-muted-foreground hover:text-accent transition-colors">{t('products.categories.hats')}</a></li>
              <li><a href="/products?category=accessories" className="text-sm text-muted-foreground hover:text-accent transition-colors">{t('nav.accessories')}</a></li>
            </ul>
          </div>

          {/* B2B Services */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">{t('footer.b2bServices')}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ {t('footer.wholesalePricing')}</li>
              <li>✓ {t('footer.customOrders')}</li>
              <li>✓ {t('footer.moq')}</li>
              <li>✓ {t('footer.fastShipping')}</li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © 2002 DONGXIAO® CASHMERE. {t('footer.allRights')}
          </p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="/privacy-policy/" className="text-sm text-muted-foreground hover:text-accent transition-colors">{t('footer.privacy')}</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-accent transition-colors">{t('footer.terms')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}