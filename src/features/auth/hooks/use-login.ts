import { useNavigate, useLocation } from 'react-router'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth.store'
import { login } from '../api/auth.service'
import { parseApiError } from '@/lib/utils'
import type { LoginInput } from '../types/auth.types'
import type { ApiError } from '@/types/api.types'

export function useLogin() {
  const { setTokens, setUser, clearSession } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const returnTo = (location.state as { from?: string } | null)?.from ?? '/dashboard'

  return useMutation({
    mutationFn: async (input: LoginInput) => {
      try {
        return await login(input)
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
    onError: (error: ApiError) => {
      if (error.code === 'MFA_REQUIRED') {
        navigate('/login/mfa', { state: { from: returnTo } })
        return
      }

      if (error.code === 'FORCE_PASSWORD_CHANGE') {
        const limitedToken = error.data?.limited_token as string | undefined
        navigate('/change-password', {
          state: { limitedToken, from: returnTo },
          replace: true,
        })
        return
      }

      // Otros errores se muestran en el formulario — no navegar
    },
  })
}
