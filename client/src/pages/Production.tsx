import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import CaseStudies from '@/components/CaseStudies';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { CheckCircle, Zap, Award } from 'lucide-react';

interface ProductionStep {
  id: string;
  step: number;
  titleKey: string;
  descriptionKey: string;
  detailsKey: string;
  icon: string;
  durationKey: string;
}

const productionSteps: ProductionStep[] = [
  {
    id: 'step-1',
    step: 1,
    titleKey: 'production.steps.step1.title',
    descriptionKey: 'production.steps.step1.description',
    detailsKey: 'production.steps.step1.details',
    icon: '🐐',
    durationKey: 'production.steps.step1.duration',
  },
  {
    id: 'step-2',
    step: 2,
    titleKey: 'production.steps.step2.title',
    descriptionKey: 'production.steps.step2.description',
    detailsKey: 'production.steps.step2.details',
    icon: '🧹',
    durationKey: 'production.steps.step2.duration',
  },
  {
    id: 'step-3',
    step: 3,
    titleKey: 'production.steps.step3.title',
    descriptionKey: 'production.steps.step3.description',
    detailsKey: 'production.steps.step3.details',
    icon: '🔄',
    durationKey: 'production.steps.step3.duration',
  },
  {
    id: 'step-4',
    step: 4,
    titleKey: 'production.steps.step4.title',
    descriptionKey: 'production.steps.step4.description',
    detailsKey: 'production.steps.step4.details',
    icon: '🧵',
    durationKey: 'production.steps.step4.duration',
  },
  {
    id: 'step-5',
    step: 5,
    titleKey: 'production.steps.step5.title',
    descriptionKey: 'production.steps.step5.description',
    detailsKey: 'production.steps.step5.details',
    icon: '🧶',
    durationKey: 'production.steps.step5.duration',
  },
  {
    id: 'step-6',
    step: 6,
    titleKey: 'production.steps.step6.title',
    descriptionKey: 'production.steps.step6.description',
    detailsKey: 'production.steps.step6.details',
    icon: '💧',
    durationKey: 'production.steps.step6.duration',
  },
  {
    id: 'step-7',
    step: 7,
    titleKey: 'production.steps.step7.title',
    descriptionKey: 'production.steps.step7.description',
    detailsKey: 'production.steps.step7.details',
    icon: '✓',
    durationKey: 'production.steps.step7.duration',
  },
  {
    id: 'step-8',
    step: 8,
    titleKey: 'production.steps.step8.title',
    descriptionKey: 'production.steps.step8.description',
    detailsKey: 'production.steps.step8.details',
    icon: '📦',
    durationKey: 'production.steps.step8.duration',
  },
];

const qualityMetricsKeys = [
  { metricKey: 'production.metrics.fiberGrade.metric', value: 'Premium A+', descriptionKey: 'production.metrics.fiberGrade.description' },
  { metricKey: 'production.metrics.productionCapacity.metric', value: '1,200+ tons/year', descriptionKey: 'production.metrics.productionCapacity.description' },
  { metricKey: 'production.metrics.qualityPassRate.metric', value: '99.2%', descriptionKey: 'production.metrics.qualityPassRate.description' },
  { metricKey: 'production.metrics.leadTime.metric', value: '30-45 days', descriptionKey: 'production.metrics.leadTime.description' },
];

export default function Production() {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>Production Process | DONGXIAO® CASHMERE - From Raw Fiber to Luxury Knitwear</title>
        <meta name="description" content="Explore DONGXIAO® CASHMERE's complete production process: dehairing, spinning, knitting, quality control. 23+ years of precision craftsmanship in cashmere manufacturing." />
        <meta property="og:title" content="Production Process | DONGXIAO® CASHMERE - From Raw Fiber to Luxury Knitwear" />
        <meta property="og:description" content="Explore DONGXIAO® CASHMERE's complete production process: dehairing, spinning, knitting, quality control. 23+ years of precision craftsmanship in cashmere manufacturing." />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Production Process | DONGXIAO® CASHMERE - From Raw Fiber to Luxury Knitwear" />
        <meta name="twitter:description" content="Explore DONGXIAO® CASHMERE's complete production process: dehairing, spinning, knitting, quality control. 23+ years of precision craftsmanship in cashmere manufacturing." />
      </Helmet>
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Page Header */}
      <section className="py-16 bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">{t('production.pageTitle')}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            {t('production.pageSubtitle')}
          </p>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">{t('production.introTitle')}</h2>
            <p className="text-lg text-muted-foreground mb-8">
              {t('production.introDescription')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="flex items-center gap-2 text-foreground">
                <Award size={24} className="text-accent" />
                <span className="font-semibold">{t('production.isoCertified')}</span>
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <Zap size={24} className="text-accent" />
                <span className="font-semibold">{t('production.stateOfTheArt')}</span>
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <CheckCircle size={24} className="text-accent" />
                <span className="font-semibold">{t('production.qualityAssured')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Production Steps */}
      <section className="py-24 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">{t('production.stepsTitle')}</h2>

          <div className="space-y-12">
            {productionSteps.map((step, index) => (
              <div key={step.id} className="relative">
                {/* Connection Line */}
                {index < productionSteps.length - 1 && (
                  <div className="absolute left-8 top-24 w-1 h-12 bg-accent/30 hidden md:block"></div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                  {/* Step Number Circle */}
                  <div className="md:col-span-2 flex justify-center">
                    <div className="relative">
                      <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center text-white font-bold text-2xl">
                        {step.step}
                      </div>
                      <div className="text-4xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        {step.icon}
                      </div>
                    </div>
                  </div>

                  {/* Step Content */}
                  <div className="md:col-span-10 bg-background rounded-lg border border-border p-8">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-foreground mb-2">{t(step.titleKey)}</h3>
                        <p className="text-lg text-accent font-semibold mb-4">{t(step.descriptionKey)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground font-semibold">{t('production.duration')}</p>
                        <p className="text-lg font-bold text-foreground">{t(step.durationKey)}</p>
                      </div>
                    </div>

                    <ul className="space-y-2">
                      {t(step.detailsKey, { returnObjects: true }).map((detail: string, idx: number) => (
                        <li key={idx} className="flex gap-3 text-muted-foreground">
                          <CheckCircle size={20} className="text-accent flex-shrink-0 mt-0.5" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quality Metrics */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">{t('production.qualityMetricsTitle')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {qualityMetricsKeys.map((item, idx) => (
              <div key={idx} className="bg-card rounded-lg border border-border p-8 text-center hover:border-accent transition-colors">
                <p className="text-sm text-accent font-semibold uppercase tracking-wide mb-3">{t(item.metricKey)}</p>
                <p className="text-4xl font-bold text-foreground mb-3">{item.value}</p>
                <p className="text-muted-foreground">{t(item.descriptionKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications & Standards */}
      <section className="py-24 bg-card border-t border-border">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">{t('production.certificationsTitle')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-background rounded-lg border border-border p-8">
              <h3 className="text-xl font-bold text-foreground mb-4">{t('production.qualityStandards')}</h3>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <CheckCircle size={20} className="text-accent flex-shrink-0" />
                  <span className="text-muted-foreground">{t('production.iso9001')}</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle size={20} className="text-accent flex-shrink-0" />
                  <span className="text-muted-foreground">{t('production.oekoTex')}</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle size={20} className="text-accent flex-shrink-0" />
                  <span className="text-muted-foreground">{t('production.iso14001')}</span>
                </li>
              </ul>
            </div>

            <div className="bg-background rounded-lg border border-border p-8">
              <h3 className="text-xl font-bold text-foreground mb-4">{t('production.productionCapabilities')}</h3>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <CheckCircle size={20} className="text-accent flex-shrink-0" />
                  <span className="text-muted-foreground">{t('production.customColorOptions')}</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle size={20} className="text-accent flex-shrink-0" />
                  <span className="text-muted-foreground">{t('production.gaugeOptions')}</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle size={20} className="text-accent flex-shrink-0" />
                  <span className="text-muted-foreground">{t('production.flexibleMoq')}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Case Studies Section */}
      <CaseStudies />

      {/* CTA Section */}
      <section className="py-24 bg-foreground text-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">{t('production.ctaTitle')}</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            {t('production.ctaDescription')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/8615661853999"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 bg-accent text-accent-foreground rounded-lg font-semibold hover:bg-[#C9A227] transition-colors inline-flex items-center justify-center"
            >
              {t('production.whatsAppUs')}
            </a>
            <a
              href="mailto:dongxiaocashmere@erdosdx.com"
              className="px-8 py-3 bg-white/20 text-white rounded-lg font-semibold hover:bg-white/30 transition-colors inline-flex items-center justify-center"
            >
              {t('production.emailUs')}
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
    </>
  );
}