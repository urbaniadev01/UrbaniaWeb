import { Navigate, Outlet } from 'react-router'
import { useAuthStore } from '@/stores/auth.store'

export function AdminOnlyRoute() {
  const role = useAuthStore((s) => s.user?.role)

  if (role !== 'admin') return <Navigate to="/login" replace />

  return <Outlet />
}
