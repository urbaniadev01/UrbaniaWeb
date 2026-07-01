import { useState } from 'react'
import { Loader2, Monitor, Smartphone, Globe, Trash2, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import {
  useRevokeAllSessions,
  useRevokeSession,
  useSessions,
} from '../hooks/use-sessions'
import { toast } from 'sonner'
import { parseApiError } from '@/lib/utils'
import type { ActiveSession } from '../types/account.types'

// ─── Helpers ──────────────────────────────────────────────────────────────

/** Devuelve un ícono Lucide apropiado según el nombre del dispositivo */
function deviceIcon(deviceName: string | null) {
  if (!deviceName) return Globe
  const lower = deviceName.toLowerCase()
  if (lower.includes('iphone') || lower.includes('android') || lower.includes('mobile')) {
    return Smartphone
  }
  return Monitor
}

/** Tiempo relativo en es-CO: "hace 2h", "ayer", "hace 3d" */
function formatRelative(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  const diffMs = Date.now() - date.getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  if (diffMin < 1) return 'justo ahora'
  if (diffMin < 60) return `hace ${diffMin} min`
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `hace ${diffHour} h`
  const diffDay = Math.floor(diffHour / 24)
  if (diffDay === 1) return 'ayer'
  if (diffDay < 30) return `hace ${diffDay} d`
  return date.toLocaleDateString('es-CO')
}

// ─── Componente ───────────────────────────────────────────────────────────

export function ActiveSessionsList() {
  const { data, isLoading, isError, error, refetch } = useSessions()
  const revokeMutation = useRevokeSession()
  const revokeAllMutation = useRevokeAllSessions()

  const [revokeOneId, setRevokeOneId] = useState<string | null>(null)
  const [showRevokeAll, setShowRevokeAll] = useState(false)

  const sessions = data ?? []
  const otherSessions = sessions.filter((s) => !s.is_current)
  const currentSession = sessions.find((s) => s.is_current)

  // ─── Loading ──────────────────────────────────────────────────────────
  if (isLoading) {
    return <SessionsSkeleton />
  }

  // ─── Error ────────────────────────────────────────────────────────────
  if (isError) {
    return (
      <ErrorState
        error={error}
        title="Error al cargar las sesiones"
        onRetry={() => void refetch()}
      />
    )
  }

  // ─── Empty (no hay sesiones — improbable pero posible) ────────────────
  if (sessions.length === 0) {
    return <EmptyState title="Sin sesiones activas" description="No se encontraron sesiones." />
  }

  const handleRevokeOne = (id: string) => {
    revokeMutation.mutate(id, {
      onSuccess: () => {
        toast.success('Sesión revocada')
        setRevokeOneId(null)
      },
      onError: (err) => {
        const apiError = parseApiError(err)
        toast.error(apiError.message, { description: `Código: ${apiError.code}` })
        setRevokeOneId(null)
      },
    })
  }

  const handleRevokeAll = () => {
    revokeAllMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success('Todas las demás sesiones han sido cerradas')
        setShowRevokeAll(false)
      },
      onError: (err) => {
        const apiError = parseApiError(err)
        toast.error(apiError.message, { description: `Código: ${apiError.code}` })
        setShowRevokeAll(false)
      },
    })
  }

  return (
    <div className="space-y-3">
      {/* Encabezado con acción de revocar todas */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {sessions.length} {sessions.length === 1 ? 'sesión activa' : 'sesiones activas'}
        </p>
        {otherSessions.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowRevokeAll(true)}
            disabled={revokeAllMutation.isPending}
          >
            <LogOut className="mr-1.5 size-4" />
            Cerrar todas las demás sesiones
          </Button>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Dispositivo
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                IP
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Último uso
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Estado
              </th>
              <th className="px-4 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sessions.map((session) => {
              const Icon = deviceIcon(session.device_name)
              const isRevoking =
                revokeMutation.isPending && revokeMutation.variables === session.id
              return (
                <SessionRow
                  key={session.id}
                  session={session}
                  Icon={Icon}
                  isRevoking={isRevoking}
                  onRevoke={() => setRevokeOneId(session.id)}
                />
              )
            })}
          </tbody>
        </table>
      </div>

      {sessions.length === 1 && currentSession && (
        <p className="text-xs text-muted-foreground">
          Solo tienes esta sesión activa.
        </p>
      )}

      {/* ─── Confirmaciones ────────────────────────────────────────── */}
      <ConfirmDialog
        open={!!revokeOneId}
        onClose={() => setRevokeOneId(null)}
        onConfirm={() => revokeOneId && handleRevokeOne(revokeOneId)}
        title="¿Revocar esta sesión?"
        description="La sesión será cerrada inmediatamente. El dispositivo tendrá que volver a iniciar sesión."
        confirmLabel="Revocar sesión"
        isLoading={revokeMutation.isPending}
      />

      <ConfirmDialog
        open={showRevokeAll}
        onClose={() => setShowRevokeAll(false)}
        onConfirm={handleRevokeAll}
        title="¿Cerrar todas las demás sesiones?"
        description="Se cerrarán todas las sesiones excepto la actual. Los demás dispositivos tendrán que volver a iniciar sesión."
        confirmLabel="Cerrar todas"
        isLoading={revokeAllMutation.isPending}
      />
    </div>
  )
}

// ─── Subcomponentes ──────────────────────────────────────────────────────

function SessionRow({
  session,
  Icon,
  isRevoking,
  onRevoke,
}: {
  session: ActiveSession
  Icon: typeof Monitor
  isRevoking: boolean
  onRevoke: () => void
}) {
  return (
    <tr className="hover:bg-muted/30">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
          <span className="font-medium">
            {session.device_name ?? 'Dispositivo desconocido'}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
        {session.ip_address || '—'}
      </td>
      <td className="px-4 py-3 text-muted-foreground">
        {formatRelative(session.last_used_at)}
      </td>
      <td className="px-4 py-3">
        {session.is_current ? (
          <StatusBadge variant="success">Esta sesión</StatusBadge>
        ) : (
          <StatusBadge variant="muted">Inactiva</StatusBadge>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        {!session.is_current && (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={onRevoke}
            disabled={isRevoking}
            className="text-destructive hover:bg-destructive/10"
          >
            {isRevoking ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <Trash2 className="size-3" />
            )}
            <span className="ml-1">Revocar</span>
          </Button>
        )}
      </td>
    </tr>
  )
}

function SessionsSkeleton() {
  return (
    <div className="space-y-2" aria-label="Cargando sesiones">
      <Skeleton className="ml-auto h-8 w-56" />
      <div className="space-y-1">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  )
}
