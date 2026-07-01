import { useState } from 'react'
import { ShieldCheck, KeyRound, Smartphone, Loader2 } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/shared/ErrorState'
import { useAuthStore } from '@/stores/auth.store'
import { useProfile } from '../hooks/use-profile'
import { useMfaDisable } from '../hooks/use-mfa'
import { ChangePasswordSheet } from '../components/ChangePasswordSheet'
import { MfaSetupSheet } from '../components/MfaSetupSheet'
import { MfaDisableSheet } from '../components/MfaDisableSheet'
import { ActiveSessionsList } from '../components/ActiveSessionsList'

export function SecurityPage() {
  // El store tiene la información cacheada del login. Si está disponible,
  // podemos mostrar datos sin esperar la respuesta del servidor.
  const storeUser = useAuthStore((s) => s.user)
  const { data: profile, isLoading, isError, error, refetch } = useProfile()

  const mfaEnabled = profile?.mfa_enabled ?? storeUser?.mfa_enabled ?? false

  const [showChangePassword, setShowChangePassword] = useState(false)
  const [showMfaSetup, setShowMfaSetup] = useState(false)
  const [showMfaDisable, setShowMfaDisable] = useState(false)

  // Mantenemos la mutación referenciada para usar isPending en el botón
  const disableMfa = useMfaDisable()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <ShieldCheck className="size-6 text-muted-foreground" aria-hidden="true" />
          Seguridad
        </h1>
        <p className="text-sm text-muted-foreground">
          Gestiona tu contraseña, autenticación de dos factores y sesiones activas.
        </p>
      </div>

      {isLoading && !profile ? (
        <SecuritySkeleton />
      ) : isError && !profile ? (
        <ErrorState
          error={error}
          title="Error al cargar la información de seguridad"
          onRetry={() => void refetch()}
        />
      ) : (
        <div className="space-y-4">
          {/* ─── Contraseña ──────────────────────────────────────── */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <KeyRound className="size-4 text-muted-foreground" aria-hidden="true" />
                    <CardTitle className="text-base">Contraseña</CardTitle>
                  </div>
                  <CardDescription>
                    Cambia tu contraseña periódicamente para mantener tu cuenta segura.
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowChangePassword(true)}
                >
                  Cambiar contraseña
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Al cambiar la contraseña, todas las demás sesiones se cerrarán
                automáticamente por seguridad.
              </p>
            </CardContent>
          </Card>

          {/* ─── MFA ────────────────────────────────────────────── */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Smartphone className="size-4 text-muted-foreground" aria-hidden="true" />
                    <CardTitle className="text-base">Autenticación de dos factores</CardTitle>
                    {mfaEnabled ? (
                      <StatusBadge variant="success">Activado</StatusBadge>
                    ) : (
                      <StatusBadge variant="muted">Desactivado</StatusBadge>
                    )}
                  </div>
                  <CardDescription>
                    Añade una capa extra de seguridad requiriendo un código de tu app
                    autenticadora al iniciar sesión.
                  </CardDescription>
                </div>
                {mfaEnabled ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMfaDisable(true)}
                    disabled={disableMfa.isPending}
                  >
                    {disableMfa.isPending ? (
                      <Loader2 className="mr-1.5 size-4 animate-spin" />
                    ) : null}
                    Desactivar
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => setShowMfaSetup(true)}>
                    Activar
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Apps compatibles: Google Authenticator, Authy, 1Password, Microsoft Authenticator.
              </p>
            </CardContent>
          </Card>

          {/* ─── Sesiones ───────────────────────────────────────── */}
          <Card>
            <CardHeader>
              <div className="space-y-1">
                <CardTitle className="text-base">Sesiones activas</CardTitle>
                <CardDescription>
                  Dispositivos que tienen iniciada tu sesión ahora mismo.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <ActiveSessionsList />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sheets de cambio de contraseña y MFA */}
      <ChangePasswordSheet
        open={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />
      <MfaSetupSheet open={showMfaSetup} onClose={() => setShowMfaSetup(false)} />
      <MfaDisableSheet open={showMfaDisable} onClose={() => setShowMfaDisable(false)} />
    </div>
  )
}

function SecuritySkeleton() {
  return (
    <div className="space-y-4" aria-label="Cargando configuración de seguridad">
      {[0, 1, 2].map((i) => (
        <div key={i} className="space-y-3 rounded-lg border bg-card p-6">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-3 w-72" />
          <Skeleton className="h-3 w-96" />
        </div>
      ))}
    </div>
  )
}
