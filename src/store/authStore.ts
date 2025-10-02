import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '../types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (user: User) => void
  setUser: (user: User) => void
  setToken: (token: string) => void
  logout: () => void
  setLoading: (loading: boolean) => void
  updateUser: (user: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      
      login: (user: User) => {
        set({ user, isAuthenticated: true, isLoading: false })
      },
      
      setUser: (user: User) => {
        set({ user, isAuthenticated: true })
      },
      
      setToken: (token: string) => {
        set({ token })
      },
      
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false, isLoading: false })
      },
      
      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },
      
      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } })
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
)

// Helper functions
export const hasRole = (user: User | null, role: string): boolean => {
  return user?.role === role
}

export const hasAnyRole = (user: User | null, roles: string[]): boolean => {
  return user ? roles.includes(user.role) : false
}

export const isDeveloper = (user: User | null): boolean => {
  return hasRole(user, 'developer')
}

export const isAdmin = (user: User | null): boolean => {
  return hasRole(user, 'admin')
}

export const isEmployee = (user: User | null): boolean => {
  return hasRole(user, 'employee')
}

export const canManageSurveys = (user: User | null): boolean => {
  return hasAnyRole(user, ['developer', 'admin'])
}

export const canViewAllData = (user: User | null): boolean => {
  return hasRole(user, 'developer')
}
