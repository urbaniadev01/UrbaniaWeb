import axios from 'axios'
import { useAuthStore } from '@/stores/auth.store'
import { apiClient } from '@/services/api-client'
import type { ApiResponse } from '@/types/api.types'
import type {
  LoginInput,
  LoginResponseData,
  RefreshResponseData,
  AuthUser,
} from '../types/auth.types'

export async function login({ email, password }: LoginInput): Promise<LoginResponseData> {
  const { data } = await apiClient.post<ApiResponse<LoginResponseData>>('/auth/login', {
    email,
    password,
  })
  return data.data
}

export async function silentRefresh(): Promise<string> {
  const { refreshToken } = useAuthStore.getState()

  if (!refreshToken) {
    throw new Error('No refresh token available')
  }

  const { data } = await axios.post<ApiResponse<RefreshResponseData>>(
    `${import.meta.env.VITE_API_URL}/auth/refresh`,
    { refresh_token: refreshToken },
  )

  const newAccessToken = data.data.access_token
  const newRefreshToken = data.data.refresh_token
  useAuthStore.getState().setTokens(newAccessToken, newRefreshToken)
  return newAccessToken
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout')
}

export async function getMe(): Promise<AuthUser> {
  const { data } = await apiClient.get<ApiResponse<AuthUser>>('/auth/me')
  return data.data
}
