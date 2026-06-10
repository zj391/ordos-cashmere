import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';

const FAQ_QUESTIONS = [
  { category: 'moq', key: 'moq1' },
  { category: 'moq', key: 'moq2' },
  { category: 'sampling', key: 'sampling1' },
  { category: 'sampling', key: 'sampling2' },
  { category: 'quality', key: 'quality1' },
  { category: 'quality', key: 'quality2' },
  { category: 'production', key: 'production1' },
  { category: 'production', key: 'production2' },
  { category: 'logistics', key: 'logistics1' },
  { category: 'logistics', key: 'logistics2' },
  { category: 'sustainability', key: 'sustainability1' },
  { category: 'communication', key: 'communication1' },
] as const;

export default function FAQ() {
  const { t } = useTranslation();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const categories = Array.from(new Set(FAQ_QUESTIONS.map((item) => item.category)));

  return (
    <>
      <Helmet>
        <title>FAQ | DONGXIAO® CASHMERE - Frequently Asked Questions</title>
        <meta name="description" content="Find answers to common B2B wholesale questions about MOQ, sampling, shipping, payment terms, and quality assurance for cashmere products." />
        <meta property="og:title" content="FAQ | DONGXIAO® CASHMERE - Frequently Asked Questions" />
        <meta property="og:description" content="Find answers to common B2B wholesale questions about MOQ, sampling, shipping, payment terms, and quality assurance for cashmere products." />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="FAQ | DONGXIAO® CASHMERE - Frequently Asked Questions" />
        <meta name="twitter:description" content="Find answers to common B2B wholesale questions about MOQ, sampling, shipping, payment terms, and quality assurance for cashmere products." />
      </Helmet>
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Page Header */}
      <section className="py-16 bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">{t('faq.title')}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            {t('faq.description')}
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          {categories.map((category) => (
            <div key={category} className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-6 pb-3 border-b border-border">{t(`faq.categories.${category}`)}</h2>
              <div className="space-y-4">
                {FAQ_QUESTIONS
                  .filter((item) => item.category === category)
                  .map((item, idx) => {
                    const globalIndex = FAQ_QUESTIONS.findIndex((i) => i.key === item.key);
                    return (
                      <div
                        key={idx}
                        className="bg-card rounded-lg border border-border overflow-hidden hover:border-accent transition-colors"
                      >
                        <button
                          onClick={() =>
                            setExpandedIndex(expandedIndex === globalIndex ? null : globalIndex)
                          }
                          className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted transition-colors"
                        >
                          <h3 className="text-lg font-semibold text-foreground text-left">{t(`faq.questions.${item.key}.question`)}</h3>
                          <ChevronDown
                            size={20}
                            className={`text-accent flex-shrink-0 transition-transform ${
                              expandedIndex === globalIndex ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        {expandedIndex === globalIndex && (
                          <div className="px-6 py-4 bg-muted border-t border-border">
                            <p className="text-muted-foreground leading-relaxed">{t(`faq.questions.${item.key}.answer`)}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-card border-y border-border">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">{t('faq.cta.title')}</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t('faq.cta.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/8615661853999"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 bg-accent text-accent-foreground rounded-lg font-semibold hover:bg-[#C9A227] transition-colors inline-flex items-center justify-center"
            >
              {t('faq.cta.whatsapp')}
            </a>
            <a
              href="mailto:dongxiaocashmere@erdosdx.com"
              className="px-8 py-3 bg-muted text-foreground rounded-lg font-semibold hover:bg-border transition-colors inline-flex items-center justify-center"
            >
              {t('faq.cta.email')}
            </a>
          </div>
        </div>
      </section>

      {/* FAQ Schema Markup */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: FAQ_QUESTIONS.map((item) => ({
            '@type': 'Question',
            name: t(`faq.questions.${item.key}.question`),
            acceptedAnswer: {
              '@type': 'Answer',
              text: t(`faq.questions.${item.key}.answer`),
            },
          })),
        })}
      </script>

      <Footer />
    </div>
    </>
  );
}
