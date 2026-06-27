import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from '@/stores/auth.store'

describe('auth.store', () => {
  beforeEach(() => {
    useAuthStore.setState({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
    })
  })

  it('setTokens actualiza accessToken, refreshToken y marca autenticado', () => {
    useAuthStore.getState().setTokens('access-1', 'refresh-1')
    const state = useAuthStore.getState()
    expect(state.accessToken).toBe('access-1')
    expect(state.refreshToken).toBe('refresh-1')
    expect(state.isAuthenticated).toBe(true)
  })

  it('clearSession limpia todos los valores', () => {
    useAuthStore.getState().setTokens('access-1', 'refresh-1')
    useAuthStore.getState().setUser({
      id: '1',
      name: 'Admin',
      email: 'admin@test.com',
      role: 'admin',
      status: 'active',
      mfa_enabled: false,
      phone: null,
      unit: null,
      avatar_url: null,
    })
    useAuthStore.getState().clearSession()

    const state = useAuthStore.getState()
    expect(state.accessToken).toBeNull()
    expect(state.refreshToken).toBeNull()
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })
})
