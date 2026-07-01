import { useEffect, useState } from 'react'
import { useNavigate, Outlet } from 'react-router'
import { useAuthStore } from '@/stores/auth.store'
import { silentRefresh, getMe } from '@/features/auth/api/auth.service'
import { FullPageLoader } from '@/components/shared/FullPageLoader'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { parseApiError } from '@/lib/utils'

/**
 * Determina si el usuario tiene al menos un permiso administrativo
 * (o el rol legacy 'admin'). Reutilizado por AdminOnlyRoute y este layout.
 */
function isStaffUser(user: { role?: string; permissions?: string[] }): boolean {
  if (user.role === 'admin') return true
  const perms = user.permissions ?? []
  return perms.some(
    (p) =>
      p.startsWith('roles.') ||
      p.startsWith('auth.') ||
      p.startsWith('authorization.'),
  )
}

export function DashboardLayout() {
  const { accessToken, setUser, clearSession } = useAuthStore()
  const navigate = useNavigate()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    async function bootstrap() {
      try {
        let user

        if (accessToken) {
          // Ya tenemos un token — intentar getMe directamente
          try {
            user = await getMe()
          } catch (error) {
            const apiError = parseApiError(error)
            // Solo si es TOKEN_EXPIRED intentamos silentRefresh
            if (apiError.code === 'TOKEN_EXPIRED') {
              await silentRefresh()
              user = await getMe()
            } else {
              throw error // Otros errores: redirigir a login
            }
          }
        } else {
          // No hay token — intentar silentRefresh
          await silentRefresh()
          user = await getMe()
        }

        // Aceptar admin legacy o cualquier usuario con permisos administrativos.
        // Un usuario 'user' sin permisos administrativos es rechazado.
        if (!isStaffUser(user)) {
          clearSession()
          navigate('/login', { replace: true })
          return
        }

        setUser(user)
        setReady(true)
      } catch {
        clearSession()
        navigate('/login', { replace: true })
      }
    }

    bootstrap()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!ready) return <FullPageLoader />
  return (
    <DashboardShell>
      <Outlet />
    </DashboardShell>
  )
}
