import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import AdvantagesAndCertifications from '@/components/AdvantagesAndCertifications';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { CheckCircle, Award, Globe, Users, Leaf, Zap } from 'lucide-react';

export default function About() {
  const { t } = useTranslation();
  const craftImage = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663492422051/QtdHVLd8iFX9d9FCuwFdL2/craftsmanship-detail-CE869gD6VSq4U3ffECcdWG.webp';

  return (
    <>
      <Helmet>
        <title>About DONGXIAO® CASHMERE | Premium Wholesale Supplier</title>
        <meta name="description" content="Learn about DONGXIAO® CASHMERE's 30+ years of expertise in premium cashmere production from Inner Mongolia. Trusted by international B2B buyers." />
        <meta property="og:title" content="About DONGXIAO® CASHMERE | Premium Wholesale Supplier" />
        <meta property="og:description" content="Learn about DONGXIAO® CASHMERE's 30+ years of expertise in premium cashmere production from Inner Mongolia. Trusted by international B2B buyers." />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="About DONGXIAO® CASHMERE | Premium Wholesale Supplier" />
        <meta name="twitter:description" content="Learn about DONGXIAO® CASHMERE's 30+ years of expertise in premium cashmere production from Inner Mongolia. Trusted by international B2B buyers." />
      </Helmet>
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Page Header */}
      <section className="py-16 bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">{t('about.pageTitle')}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            {t('about.pageSubtitle')}
          </p>
        </div>
      </section>

      {/* Hero Story Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
                {t('about.heroTitle')}
              </h2>
              <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
                {t('about.heroDesc1')}
              </p>
              <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
                {t('about.heroDesc2')}
              </p>
              <a
                href="/brand-story"
                className="inline-flex items-center gap-2 text-accent font-semibold hover:text-[#C9A227] transition-colors mt-4"
              >
                {t('about.readFullStory')}
              </a>
            </div>
            <div className="relative h-[400px] rounded-lg overflow-hidden shadow-lg border border-border">
              <img
                src={craftImage}
                alt="Cashmere Craftsmanship"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Company Milestones */}
      <section className="py-24 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-foreground text-center mb-16">{t('about.journeyTitle')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                year: '2002',
                title: t('about.journeyFounded'),
                description: t('about.journeyFoundedDesc'),
              },
              {
                year: '2010',
                title: t('about.journeyIso'),
                description: t('about.journeyIsoDesc'),
              },
              {
                year: '2015',
                title: t('about.journeyGlobal'),
                description: t('about.journeyGlobalDesc'),
              },
              {
                year: '2026',
                title: t('about.journeySustainability'),
                description: t('about.journeySustainabilityDesc'),
              },
            ].map((milestone, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl font-bold text-accent mb-3">{milestone.year}</div>
                <h3 className="text-xl font-bold text-foreground mb-2">{milestone.title}</h3>
                <p className="text-muted-foreground">{milestone.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Production Capacity */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-foreground text-center mb-16">{t('about.scaleTitle')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="text-accent" size={40} />,
                value: '1,200+',
                label: t('about.scaleDehairing'),
                description: t('about.scaleDehairingDesc'),
              },
              {
                icon: <Award className="text-accent" size={40} />,
                value: '1,500+',
                label: t('about.scaleYarn'),
                description: t('about.scaleYarnDesc'),
              },
              {
                icon: <Globe className="text-accent" size={40} />,
                value: '5M+',
                label: t('about.scaleKnitwear'),
                description: t('about.scaleKnitwearDesc'),
              },
            ].map((stat, idx) => (
              <div key={idx} className="bg-card rounded-lg border border-border p-8 text-center hover:border-accent transition-colors">
                <div className="flex justify-center mb-4">{stat.icon}</div>
                <div className="text-4xl font-bold text-accent mb-2">{stat.value}</div>
                <h3 className="text-lg font-bold text-foreground mb-2">{stat.label}</h3>
                <p className="text-muted-foreground">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Range */}
      <section className="py-24 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-foreground text-center mb-16">{t('about.productRangeTitle')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: t('about.productSweaters'),
                specs: t('about.productSweatersSpecs'),
              },
              {
                title: t('about.productScarves'),
                specs: t('about.productScarvesSpecs'),
              },
              {
                title: t('about.productBlankets'),
                specs: t('about.productBlanketsSpecs'),
              },
              {
                title: t('about.productAccessories'),
                specs: t('about.productAccessoriesSpecs'),
              },
              {
                title: t('about.productFabrics'),
                specs: t('about.productFabricsSpecs'),
              },
              {
                title: t('about.productWorsted'),
                specs: t('about.productWorstedSpecs'),
              },
            ].map((product, idx) => (
              <div key={idx} className="bg-background rounded-lg border border-border p-6 hover:border-accent transition-colors">
                <h3 className="text-xl font-bold text-foreground mb-4">{product.title}</h3>
                <ul className="space-y-2">
                  {(Array.isArray(product.specs) ? product.specs : (() => { try { return JSON.parse(product.specs); } catch { return []; } })()).map((spec: string, specIdx: number) => (
                    <li key={specIdx} className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle size={16} className="text-accent flex-shrink-0" />
                      {spec}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Global Reach */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-foreground text-center mb-16">{t('about.globalTitle')}</h2>
          <p className="text-lg text-muted-foreground text-center max-w-3xl mx-auto mb-12">
            {t('about.globalDesc')}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[t('about.regionEurope'), t('about.regionNorthAmerica'), t('about.regionEastAsia'), t('about.regionSoutheastAsia'), t('about.regionMiddleEast'), t('about.regionAustralia'), t('about.regionSouthAmerica'), t('about.regionAfrica')].map((region, idx) => (
              <div key={idx} className="bg-card rounded-lg border border-border p-6 hover:border-accent transition-colors">
                <Globe size={32} className="text-accent mx-auto mb-3" />
                <p className="font-semibold text-foreground">{region}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advantages and Certifications */}
      <AdvantagesAndCertifications />

      {/* Core Values */}
      <section className="py-24 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-foreground text-center mb-16">{t('about.valuesTitle')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Leaf size={32} />,
                title: t('about.valueEcology'),
                description: t('about.valueEcologyDesc'),
              },
              {
                icon: <Award size={32} />,
                title: t('about.valueCraftsmanship'),
                description: t('about.valueCraftsmanshipDesc'),
              },
              {
                icon: <Users size={32} />,
                title: t('about.valueTransparency'),
                description: t('about.valueTransparencyDesc'),
              },
              {
                icon: <Zap size={32} />,
                title: t('about.valueGlobal'),
                description: t('about.valueGlobalDesc'),
              },
            ].map((value, idx) => (
              <div key={idx} className="bg-background rounded-lg border border-border p-8 text-center hover:border-accent transition-colors">
                <div className="flex justify-center mb-4 text-accent">{value.icon}</div>
                <h3 className="text-lg font-bold text-foreground mb-3">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Promise */}
      <section className="py-24 bg-foreground text-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">{t('about.promiseTitle')}</h2>
          <p className="text-2xl font-light mb-8 max-w-3xl mx-auto italic">
            {t('about.promiseQuote')}
          </p>
          <p className="text-xl max-w-3xl mx-auto opacity-90 mb-12">
            {t('about.promiseDesc')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/brand-story"
              className="px-8 py-3 bg-accent text-accent-foreground rounded-lg font-semibold hover:bg-[#C9A227] transition-colors inline-flex items-center justify-center"
            >
              {t('about.discoverStory')}
            </a>
            <a
              href="https://wa.me/8615661853999"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 bg-white/20 text-white rounded-lg font-semibold hover:bg-white/30 transition-colors inline-flex items-center justify-center"
            >
              {t('about.contactUs')}
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
    </>
  );
}