import { Navigate } from 'react-router'
import { Building2 } from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import { LoginForm } from '../components/LoginForm'

export function LoginPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <Building2 className="mx-auto size-12 text-primary" />
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">Urbania Admin</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Ingresa tus credenciales para acceder al panel
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
