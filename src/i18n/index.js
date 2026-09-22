import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en.json';
import km from './km.json';

const savedLang = localStorage.getItem('theapka_lang') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      km: { translation: km },
    },
    lng: savedLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already safe from XSS
    },
  });

// Update document language attribute when language changes
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
  localStorage.setItem('theapka_lang', lng);
});

export default i18n;
