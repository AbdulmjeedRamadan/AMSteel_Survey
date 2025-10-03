/**
 * i18next Configuration
 * Handles language detection, persistence, and initialization
 */

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { translations } from './translations'

// Configure language detector to use localStorage
const languageDetector = new LanguageDetector()
languageDetector.init({
  order: ['localStorage', 'navigator'],
  lookupLocalStorage: 'amsteel-language',
  caches: ['localStorage'],
})

// Initialize i18next
i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ar: { translation: translations.ar },
      en: { translation: translations.en },
    },
    fallbackLng: 'ar',
    lng: undefined, // Let detector handle this
    interpolation: {
      escapeValue: false, // React already escapes
    },
    react: {
      useSuspense: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'amsteel-language',
      caches: ['localStorage'],
    },
  })

// Update HTML dir and lang attributes on language change
i18n.on('languageChanged', (lng) => {
  const direction = lng === 'ar' ? 'rtl' : 'ltr'
  document.documentElement.setAttribute('lang', lng)
  document.documentElement.setAttribute('dir', direction)
  document.documentElement.className = direction

  // Persist to localStorage in the format the app expects
  localStorage.setItem('amsteel-language', JSON.stringify({
    state: { language: lng, direction },
    version: 0
  }))
})

export default i18n
