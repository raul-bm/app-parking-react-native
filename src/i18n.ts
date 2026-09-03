import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import es from './locales/es.json';
import en from './locales/en.json';
import val from './locales/val.json';

const locales = Localization.getLocales();
const deviceLang = locales[0]?.languageCode ?? 'es';

i18n.use(initReactI18next).init({
  resources: {
    es: { translation: es },
    en: { translation: en },
    val: { translation: val },
  },
  lng: ['es', 'en', 'val'].includes(deviceLang) ? deviceLang : 'es',
  fallbackLng: 'es',
  interpolation: { escapeValue: false },
});

export default i18n;
