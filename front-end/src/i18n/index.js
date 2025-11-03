import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

// Import translation files
import enAdmin from './locales/en/admin.json';
import enAuth from './locales/en/auth.json';
import enCommon from './locales/en/common.json';
import enLanding from './locales/en/landing.json';
import enVideoCall from './locales/en/videoCall.json';

import ptAdmin from './locales/pt-BR/admin.json';
import ptAuth from './locales/pt-BR/auth.json';
import ptCommon from './locales/pt-BR/common.json';
import ptLanding from './locales/pt-BR/landing.json';
import ptVideoCall from './locales/pt-BR/videoCall.json';

import esAdmin from './locales/es/admin.json';
import esAuth from './locales/es/auth.json';
import esCommon from './locales/es/common.json';
import esLanding from './locales/es/landing.json';
import esVideoCall from './locales/es/videoCall.json';

const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    admin: enAdmin,
    landing: enLanding,
    videoCall: enVideoCall,
  },
  'pt-BR': {
    common: ptCommon,
    auth: ptAuth,
    admin: ptAdmin,
    landing: ptLanding,
    videoCall: ptVideoCall,
  },
  es: {
    common: esCommon,
    auth: esAuth,
    admin: esAdmin,
    landing: esLanding,
    videoCall: esVideoCall,
  },
};

// Force English as default - clear any saved preferences
if (typeof window !== 'undefined') {
  // Only set English if no language is set, or force it
  const savedLang = localStorage.getItem('i18nextLng');
  if (!savedLang || savedLang !== 'en') {
    localStorage.setItem('i18nextLng', 'en');
  }
}

i18n
  .use(initReactI18next) // Pass i18n to react-i18next
  .init({
    resources,
    fallbackLng: 'en', // Default language
    lng: 'en', // Force English as default language
    defaultNS: 'common', // Default namespace
    ns: ['common', 'auth', 'admin', 'landing', 'videoCall'],

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    // Don't use browser language detection - force English
    // Users can manually change language via language selector

    // Debug mode disabled for production
    debug: false,
  });

export default i18n;

