/**
 * Language Store
 * Manages application language (Arabic/English) and direction (RTL/LTR)
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Language = 'ar' | 'en'
export type Direction = 'ltr' | 'rtl'

interface LanguageState {
  language: Language
  direction: Direction
  setLanguage: (language: Language) => void
  toggleLanguage: () => void
}

const getDirectionFromLanguage = (language: Language): Direction => {
  return language === 'ar' ? 'rtl' : 'ltr'
}

const updateDOM = (language: Language, direction: Direction) => {
  const root = document.documentElement
  root.setAttribute('lang', language)
  root.setAttribute('dir', direction)

  // Update document direction class
  if (direction === 'rtl') {
    root.classList.add('rtl')
    root.classList.remove('ltr')
  } else {
    root.classList.add('ltr')
    root.classList.remove('rtl')
  }
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'ar',
      direction: 'rtl',

      setLanguage: (language: Language) => {
        const direction = getDirectionFromLanguage(language)
        updateDOM(language, direction)
        set({ language, direction })
      },

      toggleLanguage: () => {
        set((state) => {
          const newLanguage = state.language === 'ar' ? 'en' : 'ar'
          const newDirection = getDirectionFromLanguage(newLanguage)
          updateDOM(newLanguage, newDirection)
          return { language: newLanguage, direction: newDirection }
        })
      },
    }),
    {
      name: 'amsteel-language',
      onRehydrateStorage: () => (state) => {
        if (state) {
          updateDOM(state.language, state.direction)
        }
      },
    }
  )
)
