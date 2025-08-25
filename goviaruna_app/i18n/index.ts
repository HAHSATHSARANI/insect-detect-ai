import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from './locales/en.json';
import si from './locales/si.json';

const resources = {
  en: {
    translation: en,
  },
  si: {
    translation: si,
  },
};

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    resources,
    lng: Localization.locale.split('-')[0] === 'si' ? 'si' : 'en',
    fallbackLng: 'si', // Default to Sinhala as main language
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
