import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth.store'
import { accountService } from '../api/account.service'
import type { ChangePasswordPayload } from '../types/account.types'

/**
 * Hook para cambiar la contraseña.
 *
 * El servidor revoca TODAS las sesiones del usuario al cambiar la contraseña
 * (incluida la sesión actual). Por lo tanto, tras el éxito debemos:
 *  1. Limpiar el store de auth
 *  2. Redirigir al login
 *
 * Se usa `window.location.replace` (no `navigate`) porque el accessToken ya
 * no es válido y la próxima petición fallaría sin posibilidad de silent refresh.
 */
export function useChangePassword() {
  const clearSession = useAuthStore((s) => s.clearSession)

  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => accountService.changePassword(payload),
    onSuccess: () => {
      clearSession()
      toast.success('Contraseña actualizada. Serás redirigido al login.', {
        description: 'Por seguridad, todas las demás sesiones fueron cerradas.',
      })
      // Pequeño delay para que el toast sea visible antes del redirect
      setTimeout(() => {
        window.location.replace('/login')
      }, 800)
    },
  })
}
