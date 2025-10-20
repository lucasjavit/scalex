import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

// Import translation files
import enAdmin from './locales/en/admin.json';
import enAuth from './locales/en/auth.json';
import enCommon from './locales/en/common.json';
import enEnglishCourse from './locales/en/englishCourse.json';
import enLanding from './locales/en/landing.json';
import enVideoCall from './locales/en/videoCall.json';

import ptAdmin from './locales/pt-BR/admin.json';
import ptAuth from './locales/pt-BR/auth.json';
import ptCommon from './locales/pt-BR/common.json';
import ptEnglishCourse from './locales/pt-BR/englishCourse.json';
import ptLanding from './locales/pt-BR/landing.json';
import ptVideoCall from './locales/pt-BR/videoCall.json';

import esAdmin from './locales/es/admin.json';
import esAuth from './locales/es/auth.json';
import esCommon from './locales/es/common.json';
import esEnglishCourse from './locales/es/englishCourse.json';
import esLanding from './locales/es/landing.json';
import esVideoCall from './locales/es/videoCall.json';

const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    admin: enAdmin,
    videoCall: enVideoCall,
    landing: enLanding,
    englishCourse: enEnglishCourse,
  },
  'pt-BR': {
    common: ptCommon,
    auth: ptAuth,
    admin: ptAdmin,
    videoCall: ptVideoCall,
    landing: ptLanding,
    englishCourse: ptEnglishCourse,
  },
  es: {
    common: esCommon,
    auth: esAuth,
    admin: esAdmin,
    videoCall: esVideoCall,
    landing: esLanding,
    englishCourse: esEnglishCourse,
  },
};

i18n
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Pass i18n to react-i18next
  .init({
    resources,
    fallbackLng: 'en', // Default language
    defaultNS: 'common', // Default namespace
    ns: ['common', 'auth', 'admin', 'videoCall', 'landing', 'englishCourse'],
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    detection: {
      // Order of language detection
      order: ['localStorage', 'navigator'],
      // Cache user language preference
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    
    // Force reload for debugging
    debug: true,
  });

export default i18n;

