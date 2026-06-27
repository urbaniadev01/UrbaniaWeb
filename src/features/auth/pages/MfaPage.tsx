import { Navigate, useNavigate } from 'react-router'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth.store'
import { MfaVerifyForm } from '../components/MfaVerifyForm'

export function MfaPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const navigate = useNavigate()

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <ShieldCheck className="mx-auto size-12 text-primary" />
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">Verificación MFA</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Ingresa el código de tu aplicación autenticadora
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <MfaVerifyForm />
        </div>
        <div className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/login', { replace: true })}
          >
            <ArrowLeft className="mr-2 size-4" />
            Volver al inicio de sesión
          </Button>
        </div>
      </div>
    </div>
  )
}
