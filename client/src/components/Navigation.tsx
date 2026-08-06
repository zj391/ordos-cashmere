import { useTranslation } from 'react-i18next';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'wouter';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navigation() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Brand Header - Above Navigation */}
      <div className="bg-background border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center text-center">
            <div className="text-sm text-muted-foreground uppercase tracking-widest mb-2">
              {t('nav.premiumSupplier')}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-accent mb-2">
              DONGXIAO<span className="text-2xl">®</span>
            </h1>
            <h2 className="text-2xl md:text-3xl font-light text-foreground tracking-wide">
              CASHMERE
            </h2>
            <p className="text-sm text-muted-foreground mt-4 max-w-2xl">
              {t('nav.headerDesc')}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            {/* Logo for mobile - simplified */}
            <Link href="/" className="md:hidden">
              <div className="text-lg font-bold text-accent">DONGXIAO<span className="text-sm">®</span></div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-12 flex-1">
              <Link href="/" className="text-foreground hover:text-accent transition-colors text-sm font-medium">
                {t('nav.home')}
              </Link>
              <Link href="/products/" className="text-foreground hover:text-accent transition-colors text-sm font-medium">
                {t('nav.products')}
              </Link>
              <Link href="/brand-story/" className="text-foreground hover:text-accent transition-colors text-sm font-medium">
                {t('nav.brandStory')}
              </Link>
              <Link href="/production/" className="text-foreground hover:text-accent transition-colors text-sm font-medium">
                {t('nav.production')}
              </Link>
              <Link href="/about/" className="text-foreground hover:text-accent transition-colors text-sm font-medium">
                {t('nav.about')}
              </Link>
              <Link href="/faq/" className="text-foreground hover:text-accent transition-colors text-sm font-medium">
                {t('nav.faq')}
              </Link>
              <Link href="/blog/" className="text-foreground hover:text-accent transition-colors text-sm font-medium">
                {t('nav.blog')}
              </Link>
              <Link href="/contact/" className="text-foreground hover:text-accent transition-colors text-sm font-medium">
                {t('nav.contact')}
              </Link>
            </div>

            {/* WhatsApp Button & Language Switcher - Desktop */}
            <div className="hidden md:flex items-center gap-4">
              <LanguageSwitcher />
              <a
                href="https://wa.me/8615661853999"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2 bg-accent text-accent-foreground rounded-md font-medium hover:bg-[#C9A227] transition-colors text-sm"
              >
                {t('nav.whatsApp')}
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 hover:bg-muted rounded-md transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isOpen && (
            <div className="md:hidden pb-4 border-t border-border">
              <Link href="/" className="block py-3 text-foreground hover:text-accent transition-colors text-sm">
                {t('nav.home')}
              </Link>
              <Link href="/products/" className="block py-3 text-foreground hover:text-accent transition-colors text-sm">
                {t('nav.products')}
              </Link>
              <Link href="/brand-story/" className="block py-3 text-foreground hover:text-accent transition-colors text-sm">
                {t('nav.brandStory')}
              </Link>
              <Link href="/production/" className="block py-3 text-foreground hover:text-accent transition-colors text-sm">
                {t('nav.production')}
              </Link>
              <Link href="/about/" className="block py-3 text-foreground hover:text-accent transition-colors text-sm">
                {t('nav.about')}
              </Link>
              <Link href="/faq/" className="block py-3 text-foreground hover:text-accent transition-colors text-sm">
                {t('nav.faq')}
              </Link>
              <Link href="/blog/" className="block py-3 text-foreground hover:text-accent transition-colors text-sm">
                {t('nav.blog')}
              </Link>
              <Link href="/contact/" className="block py-3 text-foreground hover:text-accent transition-colors text-sm">
                {t('nav.contact')}
              </Link>
              <a
                href="https://wa.me/8615661853999"
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-4 px-6 py-2 bg-accent text-accent-foreground rounded-md font-medium hover:bg-[#C9A227] transition-colors text-sm text-center"
              >
                {t('nav.whatsApp')}: +86 156 6185 3999
              </a>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
