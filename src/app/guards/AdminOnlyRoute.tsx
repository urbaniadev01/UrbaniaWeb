import { Navigate, Outlet } from 'react-router'
import { useAuthStore } from '@/stores/auth.store'

/**
 * Verifica que el usuario tenga al menos un permiso administrativo (RBAC).
 *
 * Regla flexible:
 *   1. Si el rol es 'admin' → siempre pasa (compatibilidad hacia atrás).
 *   2. Si el usuario tiene cualquier permiso del módulo administrativo
 *      (prefijo `roles.` o `auth.*`) → pasa.
 *   3. Si no, redirige a /login.
 *
 * El endpoint /auth/me puede incluir `permissions: string[]` (ver auth.types.ts);
 * si no los incluye, fallback al check de rol.
 */
function hasAdminPermission(permissions: string[] | undefined, role: string | undefined): boolean {
  if (role === 'admin') return true
  if (!permissions || permissions.length === 0) return false
  return permissions.some(
    (p) => p.startsWith('roles.') || p.startsWith('auth.') || p.startsWith('authorization.'),
  )
}

export function AdminOnlyRoute() {
  const user = useAuthStore((s) => s.user)

  if (!hasAdminPermission(user?.permissions, user?.role)) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
