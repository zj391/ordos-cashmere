import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enTranslations from '../locales/en.json';
import zhTranslations from '../locales/zh.json';
import jaTranslations from '../locales/ja.json';
import koTranslations from '../locales/ko.json';
import frTranslations from '../locales/fr.json';
import deTranslations from '../locales/de.json';
import esTranslations from '../locales/es.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      zh: { translation: zhTranslations },
      ja: { translation: jaTranslations },
      ko: { translation: koTranslations },
      fr: { translation: frTranslations },
      de: { translation: deTranslations },
      es: { translation: esTranslations },
    },
       fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
      prefix: '<${{',
      suffix: '}}>$',
    },
  });

export default i18n;
