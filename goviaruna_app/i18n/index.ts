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

// Get the device locale safely
const getDeviceLocale = () => {
  try {
    const locale = Localization.locale || Localization.locales?.[0] || 'en-US';
    return typeof locale === 'string' ? locale.split('-')[0] : 'en';
  } catch (error) {
    console.warn('Error getting device locale:', error);
    return 'en';
  }
};

const deviceLanguage = getDeviceLocale();

const initI18n = async () => {
  if (!i18n.isInitialized) {
    await i18n
      .use(initReactI18next)
      .init({
        compatibilityJSON: 'v3',
        resources,
        lng: deviceLanguage === 'si' ? 'si' : 'si', // Default to Sinhala as main language
        fallbackLng: 'si',
        interpolation: {
          escapeValue: false,
        },
        react: {
          useSuspense: false, // Disable suspense for React Native
        },
      });
  }
  return i18n;
};

// Initialize immediately
initI18n().catch(console.error);

export default i18n;
