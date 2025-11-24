import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const initI18n = async () => {
  let savedLanguage = await AsyncStorage.getItem('language');
  
  if (!savedLanguage) {
      try {
        const locale = Localization.locale || Localization.locales?.[0] || 'si-LK';
        savedLanguage = typeof locale === 'string' && locale.startsWith('en') ? 'en' : 'si';
      } catch (error) {
        savedLanguage = 'si';
      }
  }

  if (!i18n.isInitialized) {
    await i18n
      .use(initReactI18next)
      .init({
        compatibilityJSON: 'v3',
        resources,
        lng: savedLanguage,
        fallbackLng: 'si',
        interpolation: {
          escapeValue: false,
        },
        react: {
          useSuspense: false,
        },
      });
  }
  return i18n;
};

// Initialize immediately
initI18n().catch(console.error);

export default i18n;
