import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';

export default function PrivacyPolicy() {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t('privacy.title')} - DONGXIAO® CASHMERE</title>
        <meta name="description" content="Privacy Policy - DONGXIAO Cashmere, Premium wholesale cashmere products from Inner Mongolia." />
      </Helmet>
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-8">{t('privacy.title')}</h1>
        <div className="prose prose-gray max-w-none space-y-6">
          <p className="text-sm text-muted-foreground">{t('privacy.lastUpdated')} 2026-01-01</p>

          <section>
            <h2 className="text-xl font-semibold mb-3">{t('privacy.section1Title')}</h2>
            <p>{t('privacy.section1P1')}</p>
            <p>{t('privacy.section1P2')}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{t('privacy.section2Title')}</h2>
            <p>{t('privacy.section2P1')}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{t('privacy.section3Title')}</h2>
            <p>{t('privacy.section3P1')}</p>
            <p>{t('privacy.section3P2')}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{t('privacy.section4Title')}</h2>
            <p>{t('privacy.section4P1')}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{t('privacy.section5Title')}</h2>
            <p>{t('privacy.section5P1')}</p>
            <p>{t('privacy.section5P2')}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{t('privacy.section6Title')}</h2>
            <p>{t('privacy.section6P1')}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{t('privacy.section7Title')}</h2>
            <p>{t('privacy.section7P1')}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{t('privacy.section8Title')}</h2>
            <p>{t('privacy.section8P1')}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{t('privacy.section9Title')}</h2>
            <p>{t('privacy.section9P1')}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{t('privacy.section10Title')}</h2>
            <p>{t('privacy.section10P1')}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{t('privacy.section11Title')}</h2>
            <p>{t('privacy.section11P1')}</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>{t('privacy.contactEmail')} info@ordosdx.com</li>
              <li>{t('privacy.contactPhone')} +86 156 6185 3999</li>
              <li>{t('privacy.contactAddress')} Inner Mongolia, China</li>
            </ul>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
}