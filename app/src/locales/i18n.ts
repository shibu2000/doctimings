import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { en } from './en';
import { bn } from './bn';

const LANGUAGE_STORAGE_KEY = 'user_preferred_language';

const resources = {
  en: { translation: en },
  bn: { translation: bn },
};

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export const loadStoredLanguage = async () => {
  try {
    const saved = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved && (saved === 'en' || saved === 'bn')) {
      await i18n.changeLanguage(saved);
      return saved;
    }
  } catch {}
  return 'en';
};

export const setAppLanguage = async (lang: 'en' | 'bn') => {
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    await i18n.changeLanguage(lang);
  } catch {}
};

export default i18n;
