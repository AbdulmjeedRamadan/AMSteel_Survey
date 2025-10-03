/**
 * Custom useTranslation Hook
 * Wraps react-i18next with Zustand store synchronization
 */

import { useTranslation as useI18nextTranslation } from 'react-i18next'
import { useEffect } from 'react'
import { useLanguageStore } from '../store/languageStore'

export function useTranslation() {
  const { t, i18n } = useI18nextTranslation()
  const { language, setLanguage } = useLanguageStore()

  // Sync Zustand store with i18next
  useEffect(() => {
    if (i18n.language !== language) {
      i18n.changeLanguage(language)
    }
  }, [language, i18n])

  // Sync i18next changes back to Zustand
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      if (lng !== language && (lng === 'ar' || lng === 'en')) {
        setLanguage(lng)
      }
    }

    i18n.on('languageChanged', handleLanguageChange)
    return () => {
      i18n.off('languageChanged', handleLanguageChange)
    }
  }, [i18n, language, setLanguage])

  return { t, i18n }
}
