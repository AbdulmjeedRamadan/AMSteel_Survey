import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark'
type Direction = 'ltr' | 'rtl'

interface ThemeState {
  theme: Theme
  direction: Direction
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  setDirection: (direction: Direction) => void
  toggleDirection: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      direction: 'rtl', // Default to RTL for Arabic

      setTheme: (theme: Theme) => {
        set({ theme })
        updateDOMTheme(theme)
      },

      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light'
        set({ theme: newTheme })
        updateDOMTheme(newTheme)
      },

      setDirection: (direction: Direction) => {
        set({ direction })
        updateDOMDirection(direction)
      },

      toggleDirection: () => {
        const newDirection = get().direction === 'ltr' ? 'rtl' : 'ltr'
        set({ direction: newDirection })
        updateDOMDirection(newDirection)
      },
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          updateDOMTheme(state.theme)
          updateDOMDirection(state.direction)
        }
      },
    }
  )
)

// Helper functions to update DOM
function updateDOMTheme(theme: Theme) {
  const root = document.documentElement

  if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

function updateDOMDirection(direction: Direction) {
  const root = document.documentElement

  root.setAttribute('dir', direction)
  root.classList.remove('rtl', 'ltr')
  root.classList.add(direction)
}

// Initialize theme on load
if (typeof window !== 'undefined') {
  const storedTheme = localStorage.getItem('theme-storage')
  if (storedTheme) {
    try {
      const parsed = JSON.parse(storedTheme)
      updateDOMTheme(parsed.state?.theme || 'light')
      updateDOMDirection(parsed.state?.direction || 'rtl')
    } catch (error) {
      console.error('Failed to parse stored theme:', error)
    }
  }
}
