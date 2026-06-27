import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/auth.store'
import { silentRefresh } from '@/features/auth/api/auth.service'
import type { ApiErrorResponse } from '@/types/api.types'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// Request interceptor: adjunta Bearer token
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor: silent refresh + cola + 429 backoff
let isRefreshing = false
let pendingRequests: Array<(token: string) => void> = []

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
      _retryCount?: number
    }
    const errorCode = error.response?.data?.error?.code

    // NO reintentar en /auth/refresh
    if (original.url?.includes('/auth/refresh')) {
      return Promise.reject(error)
    }

    // 429 Rate Limit: backoff exponencial con jitter, máx 3
    if (error.response?.status === 429) {
      original._retryCount = (original._retryCount ?? 0) + 1
      const MAX_RETRIES = 3
      if (original._retryCount > MAX_RETRIES) {
        return Promise.reject(error)
      }
      const retryAfterHeader = error.response.headers?.['retry-after']
      const retryAfterMs = retryAfterHeader
        ? Number(retryAfterHeader) * 1000
        : 2 ** original._retryCount * 1000
      const jitter = Math.random() * 300
      await new Promise((resolve) => setTimeout(resolve, retryAfterMs + jitter))
      return apiClient(original)
    }

    // 401 TOKEN_EXPIRED: silent refresh con cola
    if (error.response?.status === 401 && errorCode === 'TOKEN_EXPIRED' && !original._retry) {
      original._retry = true

      if (isRefreshing) {
        return new Promise((resolve) => {
          pendingRequests.push((newToken: string) => {
            original.headers.Authorization = `Bearer ${newToken}`
            resolve(apiClient(original))
          })
        })
      }

      isRefreshing = true
      try {
        const newToken = await silentRefresh()
        pendingRequests.forEach((cb) => cb(newToken))
        pendingRequests = []
        original.headers.Authorization = `Bearer ${newToken}`
        return apiClient(original)
      } catch {
        useAuthStore.getState().clearSession()
        pendingRequests = []
        window.location.replace('/login')
        return Promise.reject(error)
      } finally {
        isRefreshing = false
      }
    }

    // 401 TOKEN_INVALID / UNAUTHORIZED: limpiar sesión
    if (
      error.response?.status === 401 &&
      (errorCode === 'TOKEN_INVALID' || errorCode === 'UNAUTHORIZED')
    ) {
      useAuthStore.getState().clearSession()
      window.location.replace('/login')
    }

    return Promise.reject(error)
  },
)
