import { useNavigate, useLocation } from 'react-router'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth.store'
import { apiClient } from '@/services/api-client'
import { parseApiError } from '@/lib/utils'
import type { ApiResponse } from '@/types/api.types'
import type { LoginResponseData } from '../types/auth.types'

export function useMfaVerify() {
  const { setTokens, setUser, clearSession } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const returnTo = (location.state as { from?: string } | null)?.from ?? '/dashboard'

  return useMutation({
    mutationFn: async (code: string) => {
      try {
        const { data } = await apiClient.post<ApiResponse<LoginResponseData>>(
          '/auth/mfa/verify',
          { code },
        )
        return data.data
      } catch (error) {
        throw parseApiError(error)
      }
    },
    onSuccess: (data) => {
      setTokens(data.access_token, data.refresh_token)
      setUser(data.user)

      if (data.user.role !== 'admin') {
        clearSession()
        toast.error('Acceso no autorizado. Solo administradores.')
        return
      }

      toast.success(`Bienvenido, ${data.user.name}`)
      navigate(returnTo, { replace: true })
    },
  })
}
