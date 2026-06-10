import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Leaf, Award, Globe, Heart } from 'lucide-react';

export default function BrandStory() {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>Brand Story | DONGXIAO® CASHMERE - Weaving the Oasis</title>
        <meta name="description" content="Discover the story of DONGXIAO® CASHMERE: from desert restoration to world-class cashmere production. 23 years of excellence, sustainability, and heritage from Ordos, Inner Mongolia." />
        <meta property="og:title" content="Brand Story | DONGXIAO® CASHMERE - Weaving the Oasis" />
        <meta property="og:description" content="Discover the story of DONGXIAO® CASHMERE: from desert restoration to world-class cashmere production. 23 years of excellence, sustainability, and heritage from Ordos, Inner Mongolia." />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Brand Story | DONGXIAO® CASHMERE - Weaving the Oasis" />
        <meta name="twitter:description" content="Discover the story of DONGXIAO® CASHMERE: from desert restoration to world-class cashmere production. 23 years of excellence, sustainability, and heritage from Ordos, Inner Mongolia." />
      </Helmet>
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-b from-card to-background border-b border-border">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              {t('brandStory.heroTitle')}
            </h1>
            <h2 className="text-2xl md:text-3xl font-light text-accent mb-8">
              {t('brandStory.heroSubtitle')}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t('brandStory.heroDesc')}
            </p>
          </div>
        </div>
      </section>

      {/* Story Chapters */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="space-y-24">
            {[1, 2, 3, 4].map((chapterNum) => (
              <div key={chapterNum} className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                chapterNum % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}>
                {/* Left Side - Icon & Title */}
                <div className={chapterNum % 2 === 1 ? 'lg:order-2' : ''}>
                  <div className="flex items-start gap-6 mb-8">
                    <div className="flex-shrink-0 pt-2">
                      {chapterNum === 1 && <Leaf size={40} className="text-accent" />}
                      {chapterNum === 2 && <Award size={40} className="text-accent" />}
                      {chapterNum === 3 && <Heart size={40} className="text-accent" />}
                      {chapterNum === 4 && <Globe size={40} className="text-accent" />}
                    </div>
                    <div>
                      <div className="text-sm text-accent font-semibold uppercase tracking-widest mb-2">
                        {t('brandStory.chapterLabel', { number: chapterNum })}
                      </div>
                      <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                        {t(`brandStory.chapters.${chapterNum}.title`)}
                      </h3>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-4 mb-8">
                    {chapterNum === 1 && [0, 1, 2].map((idx) => (
                      <p key={idx} className="text-muted-foreground leading-relaxed text-lg">
                        {t(`brandStory.chapters.${chapterNum}.content.${idx}`)}
                      </p>
                    ))}
                    {chapterNum === 2 && [0, 1, 2, 3].map((idx) => (
                      <p key={idx} className="text-muted-foreground leading-relaxed text-lg">
                        {t(`brandStory.chapters.${chapterNum}.content.${idx}`)}
                      </p>
                    ))}
                    {chapterNum === 3 && [0, 1, 2, 3].map((idx) => (
                      <p key={idx} className="text-muted-foreground leading-relaxed text-lg">
                        {t(`brandStory.chapters.${chapterNum}.content.${idx}`)}
                      </p>
                    ))}
                    {chapterNum === 4 && [0, 1, 2, 3].map((idx) => (
                      <p key={idx} className="text-muted-foreground leading-relaxed text-lg">
                        {t(`brandStory.chapters.${chapterNum}.content.${idx}`)}
                      </p>
                    ))}
                  </div>

                  {/* Highlights */}
                  {chapterNum === 1 && (
                    <div className="flex flex-wrap gap-3">
                      {['Kubuqi Desert greening', 'Scientific grazing & ecological restoration', 'Albus white cashmere goats'].map((highlight, idx) => (
                        <span
                          key={idx}
                          className="px-4 py-2 bg-card border border-border rounded-full text-sm text-foreground font-medium hover:border-accent transition-colors"
                        >
                          {t(`brandStory.chapters.${chapterNum}.highlights.${idx}`)}
                        </span>
                      ))}
                    </div>
                  )}
                  {chapterNum === 2 && (
                    <div className="flex flex-wrap gap-3">
                      {['23 years industry experience', '1,200 tons annual capacity', 'Full-specification knitting', 'International first-tier brand partnerships'].map((highlight, idx) => (
                        <span
                          key={idx}
                          className="px-4 py-2 bg-card border border-border rounded-full text-sm text-foreground font-medium hover:border-accent transition-colors"
                        >
                          {t(`brandStory.chapters.${chapterNum}.highlights.${idx}`)}
                        </span>
                      ))}
                    </div>
                  )}
                  {chapterNum === 3 && (
                    <div className="flex flex-wrap gap-3">
                      {['ISO 9001', 'ISO 14001', 'OEKO-TEX®', 'BSCI', 'OHSAS 18001', 'EnMS', 'GCS by AbTF'].map((highlight, idx) => (
                        <span
                          key={idx}
                          className="px-4 py-2 bg-card border border-border rounded-full text-sm text-foreground font-medium hover:border-accent transition-colors"
                        >
                          {t(`brandStory.chapters.${chapterNum}.highlights.${idx}`)}
                        </span>
                      ))}
                    </div>
                  )}
                  {chapterNum === 4 && (
                    <div className="flex flex-wrap gap-3">
                      {['Smart Pastures', 'Ecological ID Card', 'Zero-Carbon Vision', 'Circular Fibers'].map((highlight, idx) => (
                        <span
                          key={idx}
                          className="px-4 py-2 bg-card border border-border rounded-full text-sm text-foreground font-medium hover:border-accent transition-colors"
                        >
                          {t(`brandStory.chapters.${chapterNum}.highlights.${idx}`)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Side - Visual */}
                <div className={`${chapterNum % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <div className="bg-card rounded-lg border border-border p-12 text-center">
                    <div className="text-6xl mb-6 opacity-20">
                      {chapterNum === 1 && '🏜️'}
                      {chapterNum === 2 && '🏭'}
                      {chapterNum === 3 && '🌍'}
                      {chapterNum === 4 && '🚀'}
                    </div>
                    <p className="text-muted-foreground italic text-lg">
                      {t(`brandStory.chapters.${chapterNum}.visualText`)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Promise Section */}
      <section className="py-24 bg-card border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-8">
              {t('brandStory.brandMottoTitle')}
            </h2>
            <p className="text-2xl md:text-3xl font-light text-accent mb-8 italic">
              {t('brandStory.brandMottoQuote')}
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t('brandStory.brandMottoDesc')}
            </p>
          </div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-foreground text-center mb-16">
            {t('brandStory.valuesTitle')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-card rounded-lg border border-border p-8 hover:border-accent transition-colors">
              <h3 className="text-xl font-bold text-foreground mb-2">{t('brandStory.values.ecology.title')}</h3>
              <p className="text-muted-foreground">{t('brandStory.values.ecology.desc')}</p>
            </div>
            <div className="bg-card rounded-lg border border-border p-8 hover:border-accent transition-colors">
              <h3 className="text-xl font-bold text-foreground mb-2">{t('brandStory.values.craftsmanship.title')}</h3>
              <p className="text-muted-foreground">{t('brandStory.values.craftsmanship.desc')}</p>
            </div>
            <div className="bg-card rounded-lg border border-border p-8 hover:border-accent transition-colors">
              <h3 className="text-xl font-bold text-foreground mb-2">{t('brandStory.values.transparency.title')}</h3>
              <p className="text-muted-foreground">{t('brandStory.values.transparency.desc')}</p>
            </div>
            <div className="bg-card rounded-lg border border-border p-8 hover:border-accent transition-colors">
              <h3 className="text-xl font-bold text-foreground mb-2">{t('brandStory.values.global.title')}</h3>
              <p className="text-muted-foreground">{t('brandStory.values.global.desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-foreground text-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">{t('brandStory.ctaTitle')}</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            {t('brandStory.ctaDesc')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/8615661853999"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 bg-accent text-accent-foreground rounded-lg font-semibold hover:bg-[#C9A227] transition-colors inline-flex items-center justify-center"
            >
              {t('brandStory.contactUs')}
            </a>
            <a
              href="/products"
              className="px-8 py-3 bg-white/20 text-white rounded-lg font-semibold hover:bg-white/30 transition-colors inline-flex items-center justify-center"
            >
              {t('brandStory.exploreProducts')}
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
    </>
  );
}