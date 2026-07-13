import { ArrowRight, Award, Globe, Zap, CheckCircle, Truck, Leaf, Clock } from 'lucide-react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import AdvantagesAndCertifications from '@/components/AdvantagesAndCertifications';
import CustomerTestimonials from '@/components/CustomerTestimonials';
import ESGCommitment from '@/components/ESGCommitment';
import CTASection from '@/components/CTASection';
import SocialShareButtons from '@/components/SocialShareButtons';
import { Link } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';
import { ArrowRight, Award, Globe, Zap, CheckCircle, Truck, Leaf, Clock } from 'lucide-react';

export default function Home() {
  const { t } = useTranslation();
  const { user, loading, error, isAuthenticated, logout } = useAuth();

  const heroImage = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663492422051/QtdHVLd8iFX9d9FCuwFdL2/hero-cashmere-luxury-KXKCDiC7K3yCdh4wu6csH3.webp';
  const heritageImage = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663492422051/QtdHVLd8iFX9d9FCuwFdL2/inner-mongolia-heritage-KUEg5qNVQzEHPpjjAJy3MW.webp';
  const hatsImage = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663492422051/QtdHVLd8iFX9d9FCuwFdL2/product-showcase-hats-Zv5hP7heotnDEtPog3Wuiy.webp';
  const sweatersImage = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663492422051/QtdHVLd8iFX9d9FCuwFdL2/product-showcase-sweaters-c4tWphzGVb8xESGFeWp43S.webp';

  useEffect(() => {
    const schemaScript = document.createElement('script');
    schemaScript.type = 'application/ld+json';
    schemaScript.innerHTML = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "DONGXIAO® CASHMERE",
      "image": heroImage,
      "description": t('home.facilityDescription'),
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Inner Mongolia",
        "addressLocality": "Ordos",
        "addressRegion": "Inner Mongolia",
        "addressCountry": "CN"
      },
      "telephone": "+86-156-6185-3999",
      "email": "dongxiaocashmere@erdosdx.com",
      "url": "https://dongxiao-cashmere.com",
      "foundingDate": "2002",
      "sameAs": [
        "https://www.linkedin.com/company/dongxiao-cashmere",
        "https://www.instagram.com/dongxiao_cashmere",
        "https://www.facebook.com/dongxiaocashmere"
      ],
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 41.8781,
        "longitude": 112.5597
      }
    });
    document.head.appendChild(schemaScript);
  }, [t]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative h-[500px] md:h-[600px] overflow-hidden">
        <img
          src={heroImage}
          alt={t('home.heroTitle')}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative h-full flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <p className="text-accent text-sm uppercase tracking-widest mb-4 font-semibold">
                {t('home.tagline')}
              </p>
              <h1 className="text-5xl md:text-6xl lg:text-7xl text-white mb-6 leading-tight font-bold">
                {t('home.heroTitle')}
              </h1>
              <p className="text-xl text-gray-100 mb-8 max-w-2xl leading-relaxed">
                {t('home.heroDescription')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/products" className="px-8 py-4 bg-accent text-accent-foreground rounded-lg font-semibold hover:bg-[#C9A227] transition-colors inline-flex items-center justify-center gap-2 text-lg">
                  {t('home.exploreProducts')}
                  <ArrowRight size={20} />
                </Link>
                <a href="https://wa.me/8615661853999" target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-white/20 text-white rounded-lg font-semibold hover:bg-white/30 transition-colors inline-flex items-center justify-center text-lg">
                  {t('home.requestSample')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Advantages Section */}
      <section className="py-16 md:py-24 bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-background rounded-lg p-8 border border-border hover:border-accent transition-colors">
              <div className="flex items-start gap-4">
                <Leaf className="text-accent flex-shrink-0 mt-1" size={28} />
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{t('home.advantages.oekoTexCertified')}</h3>
                  <p className="text-sm text-muted-foreground">{t('home.advantages.oekoTexDesc')}</p>
                </div>
              </div>
            </div>
            <div className="bg-background rounded-lg p-8 border border-border hover:border-accent transition-colors">
              <div className="flex items-start gap-4">
                <CheckCircle className="text-accent flex-shrink-0 mt-1" size={28} />
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{t('home.advantages.lowMoq')}</h3>
                  <p className="text-sm text-muted-foreground">{t('home.advantages.lowMoqDesc')}</p>
                </div>
              </div>
            </div>
            <div className="bg-background rounded-lg p-8 border border-border hover:border-accent transition-colors">
              <div className="flex items-start gap-4">
                <Award className="text-accent flex-shrink-0 mt-1" size={28} />
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{t('home.advantages.freeSamples')}</h3>
                  <p className="text-sm text-muted-foreground">{t('home.advantages.freeSamplesDesc')}</p>
                </div>
              </div>
            </div>
            <div className="bg-background rounded-lg p-8 border border-border hover:border-accent transition-colors">
              <div className="flex items-start gap-4">
                <Clock className="text-accent flex-shrink-0 mt-1" size={28} />
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{t('home.advantages.fastSampling')}</h3>
                  <p className="text-sm text-muted-foreground">{t('home.advantages.fastSamplingDesc')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Overview Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="text-accent text-sm uppercase tracking-widest font-semibold mb-4">{t('home.aboutFactory')}</div>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-8 leading-tight">
                {t('home.factoryName')}
              </h2>
              <div className="space-y-6 text-muted-foreground leading-relaxed">
                <p>
                  <span className="font-semibold text-foreground">{t('home.established')}</span>, {t('home.yearsExcellence')}.
                </p>
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="font-semibold text-foreground mb-4">{t('home.annualCapacity')}</h3>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-3">
                      <span className="text-accent font-bold mt-1">•</span>
                      <span>{t('home.depilatedCashmere')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-accent font-bold mt-1">•</span>
                      <span>{t('home.cashmereYarn')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-accent font-bold mt-1">•</span>
                      <span>{t('home.scarvesShawls')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-accent font-bold mt-1">•</span>
                      <span>{t('home.knitwear')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-accent font-bold mt-1">•</span>
                      <span>{t('home.woolFabrics')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-accent font-bold mt-1">•</span>
                      <span>{t('home.worstedFabrics')}</span>
                    </li>
                  </ul>
                </div>
                <p>{t('home.facilityDescription')}</p>
              </div>
            </div>
            <div>
              <img
                src={heritageImage}
                alt={t('home.factoryName')}
                className="rounded-lg shadow-xl w-full h-auto mb-8"
              />
              <div className="bg-card border border-border rounded-lg p-8">
                <h3 className="font-semibold text-foreground mb-6 text-lg">{t('home.certificationsTitle')}</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="text-accent flex-shrink-0 mt-1" size={20} />
                    <span className="text-sm text-foreground font-medium">{t('home.iso9001')}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="text-accent flex-shrink-0 mt-1" size={20} />
                    <span className="text-sm text-foreground font-medium">{t('home.iso14001')}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="text-accent flex-shrink-0 mt-1" size={20} />
                    <span className="text-sm text-foreground font-medium">{t('home.ohsas18001')}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="text-accent flex-shrink-0 mt-1" size={20} />
                    <span className="text-sm text-foreground font-medium">{t('home.oekoTex')}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="text-accent flex-shrink-0 mt-1" size={20} />
                    <span className="text-sm text-foreground font-medium">{t('home.bsci')}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="text-accent flex-shrink-0 mt-1" size={20} />
                    <span className="text-sm text-foreground font-medium">{t('home.abtf')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Range Section */}
      <section className="py-24 bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="text-accent text-sm uppercase tracking-widest font-semibold mb-4">{t('home.ourExpertise')}</div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">{t('home.comprehensiveProductRange')}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t('home.completeSolutions')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-background rounded-lg p-8 border border-border">
              <h3 className="text-2xl font-bold text-foreground mb-6">{t('home.productCategories')}</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-foreground">
                  <span className="text-accent font-bold">✓</span> {t('nav.sweaters')}
                </li>
                <li className="flex items-center gap-3 text-foreground">
                  <span className="text-accent font-bold">✓</span> {t('nav.scarves')}
                </li>
                <li className="flex items-center gap-3 text-foreground">
                  <span className="text-accent font-bold">✓</span> {t('products.categories.blankets')}
                </li>
                <li className="flex items-center gap-3 text-foreground">
                  <span className="text-accent font-bold">✓</span> {t('products.categories.socks')}
                </li>
                <li className="flex items-center gap-3 text-foreground">
                  <span className="text-accent font-bold">✓</span> {t('nav.accessories')}
                </li>
              </ul>
            </div>
            <div className="bg-background rounded-lg p-8 border border-border">
              <h3 className="text-2xl font-bold text-foreground mb-6">{t('home.specificationsMaterials')}</h3>
              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-foreground mb-2">{t('home.gaugeOptions')}</p>
                  <p className="text-muted-foreground">{t('home.gaugeOptionsValue')}</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-2">{t('home.materialBlends')}</p>
                  <p className="text-muted-foreground">{t('home.materialBlendsValue')}</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-2">{t('home.customization')}</p>
                  <p className="text-muted-foreground">{t('home.customizationValue')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Global Customers Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="text-accent text-sm uppercase tracking-widest font-semibold mb-4">{t('home.globalReach')}</div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">{t('home.trustedWorldwide')}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t('home.globalReachDesc')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card rounded-lg p-8 border border-border text-center">
              <Globe className="text-accent mx-auto mb-4" size={40} />
              <h3 className="text-2xl font-bold text-foreground mb-2">{t('home.countriesCount')}</h3>
              <p className="text-muted-foreground">{t('home.countriesDesc')}</p>
            </div>
            <div className="bg-card rounded-lg p-8 border border-border text-center">
              <Award className="text-accent mx-auto mb-4" size={40} />
              <h3 className="text-2xl font-bold text-foreground mb-2">{t('home.premiumBrands')}</h3>
              <p className="text-muted-foreground">{t('home.brandsList')}</p>
            </div>
            <div className="bg-card rounded-lg p-8 border border-border text-center">
              <Truck className="text-accent mx-auto mb-4" size={40} />
              <h3 className="text-2xl font-bold text-foreground mb-2">{t('home.reliableShipping')}</h3>
              <p className="text-muted-foreground">{t('home.shippingDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      <AdvantagesAndCertifications />
      <CustomerTestimonials />
      <ESGCommitment />

      {/* CTA Section */}
      <section className="py-24 bg-foreground text-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">{t('home.readyPartner')}</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">{t('home.contactTeam')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <a href="https://wa.me/8615661853999" target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-accent text-accent-foreground rounded-lg font-semibold hover:bg-[#C9A227] transition-colors inline-flex items-center justify-center gap-2 text-lg">
              {t('home.whatsAppUs')}
              <ArrowRight size={20} />
            </a>
            <Link to="/contact" className="px-8 py-4 bg-white/20 text-white rounded-lg font-semibold hover:bg-white/30 transition-colors inline-flex items-center justify-center gap-2 text-lg">
              {t('home.getInTouch')}
            </Link>
          </div>
          <div className="border-t border-white/20 pt-8">
            <SocialShareButtons
              title="DONGXIAO® CASHMERE - Premium Cashmere B2B Supplier Since 2002"
              description="Discover premium cashmere products from Ordos. ISO certified, 23+ years of excellence. Global B2B supplier for international retailers and distributors."
              className="justify-center"
            />
          </div>
        </div>
      </section>
            {/* --- GEO 信任背书模块开始 --- */}
      <section className="w-full bg-[#1a1a1a] border-y border-gray-800 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            
            {/* 数据块 1: 经验 */}
            <div className="flex flex-col items-center justify-center p-4">
              <Award className="text-[#C5A065] mb-3" size={32} />
              <span className="text-3xl md:text-4xl font-bold text-[#C5A065] mb-2">23+</span>
              <span className="text-sm md:text-base text-gray-400 uppercase tracking-wider">Years of Excellence</span>
            </div>

            {/* 数据块 2: 产能 */}
            <div className="flex flex-col items-center justify-center p-4">
              <Zap className="text-[#C5A065] mb-3" size={32} />
              <span className="text-3xl md:text-4xl font-bold text-[#C5A065] mb-2">1,200 Tons</span>
              <span className="text-sm md:text-base text-gray-400 uppercase tracking-wider">Annual Capacity</span>
            </div>

            {/* 数据块 3: 全球市场 */}
            <div className="flex flex-col items-center justify-center p-4">
              <Globe className="text-[#C5A065] mb-3" size={32} />
              <span className="text-3xl md:text-4xl font-bold text-[#C5A065] mb-2">50+ Countries</span>
              <span className="text-sm md:text-base text-gray-400 uppercase tracking-wider">Global Markets</span>
            </div>

            {/* 数据块 4: 质量认证 */}
            <div className="flex flex-col items-center justify-center p-4">
              <CheckCircle className="text-[#C5A065] mb-3" size={32} />
              <span className="text-3xl md:text-4xl font-bold text-[#C5A065] mb-2">ISO Certified</span>
              <span className="text-sm md:text-base text-gray-400 uppercase tracking-wider">Quality Standard</span>
            </div>

          </div>
        </div>
      </section>
      {/* --- GEO 信任背书模块结束 --- */}

      <Footer />
    </div>
  );
}
