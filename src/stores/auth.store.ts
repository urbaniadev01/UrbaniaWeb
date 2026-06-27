import { create } from 'zustand'
import type { AuthUser } from '@/features/auth/types/auth.types'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: AuthUser | null
  isAuthenticated: boolean
  setTokens: (accessToken: string, refreshToken: string) => void
  setUser: (user: AuthUser) => void
  clearSession: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,

  setTokens: (accessToken, refreshToken) =>
    set({ accessToken, refreshToken, isAuthenticated: true }),

  setUser: (user) => set({ user }),

  clearSession: () =>
    set({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
    }),
}))
