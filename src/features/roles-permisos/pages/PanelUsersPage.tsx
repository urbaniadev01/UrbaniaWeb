import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Users, UserPlus, MoreHorizontal, Eye, ShieldCheck, ShieldX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { Skeleton } from '@/components/ui/skeleton'
import { usePanelUsers } from '../hooks/use-panel-users'
import { useRoleList } from '../hooks/use-roles'
import { useCreateAssignment, useRevokeAssignment } from '../hooks/use-assignments'
import { UserRoleAssigner } from '../components/UserRoleAssigner'
import { parseApiError } from '@/lib/utils'
import type { PanelUser } from '../types/roles.types'
import type { AssignmentFormValues } from '../validators/roles-permisos.validators'

const STATUS_LABEL: Record<PanelUser['status'], { label: string; variant: 'success' | 'warning' | 'muted' }> = {
  active: { label: 'Activo', variant: 'success' },
  suspended: { label: 'Suspendido', variant: 'warning' },
  inactive: { label: 'Inactivo', variant: 'muted' },
}

export function PanelUsersPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<PanelUser['status'] | 'all'>('all')
  const [showAssigner, setShowAssigner] = useState(false)
  const [detailUser, setDetailUser] = useState<PanelUser | null>(null)

  const { data, isLoading, isError, error, refetch } = usePanelUsers()
  const { data: rolesResp } = useRoleList()
  const createAssignment = useCreateAssignment()
  const revokeAssignment = useRevokeAssignment()

  const users = useMemo<PanelUser[]>(() => data?.data ?? [], [data])
  const roles = useMemo(() => rolesResp?.data ?? [], [rolesResp])

  const filteredUsers = useMemo<PanelUser[]>(() => {
    const term = search.trim().toLowerCase()
    return users.filter((u) => {
      if (statusFilter !== 'all' && u.status !== statusFilter) return false
      if (!term) return true
      return (
        u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)
      )
    })
  }, [users, search, statusFilter])

  const handleAssign = (values: AssignmentFormValues) => {
    createAssignment.mutate(
      {
        user_id: values.user_id,
        role_id: values.role_id,
        scope_type: values.scope_type,
        scope_id: values.scope_id,
        vigencia_inicio: values.vigencia_inicio || null,
        vigencia_fin: values.vigencia_fin || null,
      },
      {
        onSuccess: () => {
          toast.success('Asignación creada')
          setShowAssigner(false)
        },
        onError: (err) => {
          const apiError = parseApiError(err)
          toast.error(apiError.message, { description: `Código: ${apiError.code}` })
        },
      },
    )
  }

  const handleRevoke = (assignmentId: string) => {
    revokeAssignment.mutate(assignmentId, {
      onSuccess: () => {
        toast.success('Asignación revocada')
      },
      onError: (err) => {
        const apiError = parseApiError(err)
        toast.error(apiError.message, { description: `Código: ${apiError.code}` })
      },
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Users className="size-6 text-muted-foreground" aria-hidden="true" />
            Usuarios del panel
          </h1>
          <p className="text-sm text-muted-foreground">
            Gestiona los usuarios administradores y sus roles asignados.
          </p>
        </div>
        <Button onClick={() => setShowAssigner(true)}>
          <UserPlus className="mr-1.5 size-4" />
          Asignar rol
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Buscar por nombre o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as PanelUser['status'] | 'all')}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="suspended">Suspendidos</option>
          <option value="inactive">Inactivos</option>
        </select>
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : isError ? (
        <ErrorState
          error={error}
          title="Error al cargar los usuarios"
          onRetry={() => refetch()}
        />
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          icon={<Users className="size-8" aria-hidden="true" />}
          title={search || statusFilter !== 'all' ? 'Sin resultados' : 'No hay usuarios del panel'}
          description={
            search || statusFilter !== 'all'
              ? 'Ajusta los filtros para ver otros usuarios.'
              : 'Asigna un rol a un usuario existente para empezar.'
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Usuario
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Roles
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  MFA
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Estado
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((u) => {
                const statusInfo = STATUS_LABEL[u.status]
                return (
                  <tr
                    key={u.id}
                    className="cursor-pointer transition-colors hover:bg-muted/30"
                    onClick={() => setDetailUser(u)}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium">{u.name}</div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      {u.roles.length === 0 ? (
                        <span className="text-xs text-muted-foreground">Sin roles</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {u.roles.slice(0, 2).map((r, i) => (
                            <span
                              key={`${r.role_id}-${i}`}
                              className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs"
                            >
                              {r.role_name}
                            </span>
                          ))}
                          {u.roles.length > 2 && (
                            <span className="text-xs text-muted-foreground">
                              +{u.roles.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {u.mfa_enabled ? (
                        <StatusBadge variant="success">Activado</StatusBadge>
                      ) : (
                        <StatusBadge variant="muted">No</StatusBadge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge variant={statusInfo.variant}>{statusInfo.label}</StatusBadge>
                    </td>
                    <td
                      className="px-4 py-3 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => setDetailUser(u)}
                        aria-label={`Ver detalle de ${u.name}`}
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <UserRoleAssigner
        open={showAssigner}
        onClose={() => setShowAssigner(false)}
        users={users}
        roles={roles}
        isSubmitting={createAssignment.isPending}
        onSubmit={handleAssign}
      />

      {detailUser && (
        <UserDetailDrawer
          user={detailUser}
          onClose={() => setDetailUser(null)}
          onRevoke={handleRevoke}
          isRevoking={revokeAssignment.isPending}
        />
      )}
    </div>
  )
}

// ─── Drawer de detalle ────────────────────────────────────────────────────

function UserDetailDrawer({
  user,
  onClose,
  onRevoke,
  isRevoking,
}: {
  user: PanelUser
  onClose: () => void
  onRevoke: (assignmentId: string) => void
  isRevoking: boolean
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/50"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose()
      }}
      role="presentation"
    >
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <div
        className="flex h-full w-full max-w-md flex-col border-l bg-card shadow-xl"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Detalle de ${user.name}`}
      >
        <div className="flex items-start gap-3 border-b p-6">
          <div className="flex-1">
            <h2 className="text-lg font-semibold leading-tight">{user.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Cerrar">
            <span aria-hidden="true">×</span>
          </Button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Información</h3>
            <dl className="space-y-1 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Estado</dt>
                <dd>
                  <StatusBadge variant={STATUS_LABEL[user.status].variant}>
                    {STATUS_LABEL[user.status].label}
                  </StatusBadge>
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">MFA</dt>
                <dd>
                  {user.mfa_enabled ? (
                    <span className="inline-flex items-center gap-1 text-success">
                      <ShieldCheck className="size-3.5" aria-hidden="true" /> Activado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <ShieldX className="size-3.5" aria-hidden="true" /> Desactivado
                    </span>
                  )}
                </dd>
              </div>
              {user.phone && (
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Teléfono</dt>
                  <dd className="font-mono text-xs">{user.phone}</dd>
                </div>
              )}
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground">Creado</dt>
                <dd className="text-xs">{new Date(user.created_at).toLocaleDateString('es-CO')}</dd>
              </div>
            </dl>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">
              Roles asignados ({user.roles.length})
            </h3>
            {user.roles.length === 0 ? (
              <p className="text-xs text-muted-foreground">Este usuario no tiene roles asignados.</p>
            ) : (
              <ul className="space-y-2">
                {user.roles.map((r, i) => (
                  <li
                    key={`${r.role_id}-${i}`}
                    className="flex items-center justify-between rounded-md border bg-muted/30 p-3"
                  >
                    <div>
                      <div className="text-sm font-medium">{r.role_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {r.scope_type} {r.scope_name ? `· ${r.scope_name}` : ''}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => onRevoke(r.role_id)}
                      disabled={isRevoking}
                      aria-label={`Revocar ${r.role_name}`}
                    >
                      <Eye className="size-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="border-t p-4">
          <Button variant="outline" className="w-full" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="space-y-2" aria-label="Cargando usuarios">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  )
}
