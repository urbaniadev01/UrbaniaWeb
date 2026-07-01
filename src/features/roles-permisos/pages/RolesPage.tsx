import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { Shield, Plus, MoreHorizontal, Eye, Edit, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { useCreateRole, useRoleList } from '../hooks/use-roles'
import { RoleForm } from '../components/RoleForm'
import { parseApiError } from '@/lib/utils'
import type { Role } from '../types/roles.types'
import type { RoleFormValues } from '../validators/roles-permisos.validators'

const SCOPE_LABEL: Record<Role['nivel_alcance'], string> = {
  organization: 'Organización',
  condominium: 'Conjunto',
  tower: 'Torre',
  unit: 'Unidad',
}

export function RolesPage() {
  const navigate = useNavigate()
  const { data, isLoading, isError, error, refetch } = useRoleList()
  const createMutation = useCreateRole()

  const [showForm, setShowForm] = useState(false)

  const roles = useMemo<Role[]>(() => data?.data ?? [], [data])

  const handleCreate = (values: RoleFormValues) => {
    createMutation.mutate(
      {
        nombre: values.nombre.trim(),
        descripcion: values.descripcion?.trim() || undefined,
        nivel_alcance: values.nivel_alcance,
        base_role_id: values.base_role_id || undefined,
      },
      {
        onSuccess: () => {
          toast.success('Rol creado correctamente')
          setShowForm(false)
        },
        onError: (err) => {
          const apiError = parseApiError(err)
          toast.error(apiError.message, { description: `Código: ${apiError.code}` })
        },
      },
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Shield className="size-6 text-muted-foreground" aria-hidden="true" />
            Roles
          </h1>
          <p className="text-sm text-muted-foreground">
            Define los roles del panel y su alcance.
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-1.5 size-4" />
          Nuevo rol
        </Button>
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : isError ? (
        <ErrorState
          error={error}
          title="Error al cargar los roles"
          onRetry={() => refetch()}
        />
      ) : roles.length === 0 ? (
        <EmptyState
          icon={<Shield className="size-8" aria-hidden="true" />}
          title="No hay roles definidos"
          description="Crea el primer rol para empezar a gestionar permisos en el panel."
          action={
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-1.5 size-4" />
              Crear primer rol
            </Button>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Nombre
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Alcance
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Usuarios
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Tipo
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {roles.map((role) => (
                <tr key={role.id} className="transition-colors hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="font-medium">{role.nombre}</div>
                    {role.descripcion && (
                      <div className="line-clamp-1 text-xs text-muted-foreground">
                        {role.descripcion}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {SCOPE_LABEL[role.nivel_alcance]}
                  </td>
                  <td className="px-4 py-3 text-center font-mono tabular-nums">
                    {role.usuarios_count}
                  </td>
                  <td className="px-4 py-3">
                    {role.es_sistema ? (
                      <StatusBadge variant="info">Sistema</StatusBadge>
                    ) : (
                      <StatusBadge variant="muted">Personalizado</StatusBadge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <RowActions
                      role={role}
                      onMatrix={() => navigate(`/admin/roles/${role.id}/permisos`)}
                      onDetail={() => navigate(`/admin/roles/${role.id}/permisos`)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <RoleForm
        open={showForm}
        onClose={() => setShowForm(false)}
        availableBaseRoles={roles}
        isSubmitting={createMutation.isPending}
        onSubmit={handleCreate}
      />
    </div>
  )
}

function RowActions({
  role,
  onMatrix,
  onDetail,
}: {
  role: Role
  onMatrix: () => void
  onDetail: () => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative inline-block">
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Acciones para rol ${role.nombre}`}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <MoreHorizontal className="size-4" />
      </Button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setOpen(false)
            }}
            aria-hidden="true"
            role="presentation"
          />
          <div
            className="absolute right-0 z-20 mt-1 w-48 rounded-md border bg-popover p-1 text-sm shadow-lg"
            role="menu"
            tabIndex={-1}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setOpen(false)
            }}
          >
            <button
              type="button"
              onClick={() => {
                onMatrix()
                setOpen(false)
              }}
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-muted"
              role="menuitem"
            >
              <ShieldCheck className="size-4" /> Matriz de permisos
            </button>
            <button
              type="button"
              onClick={() => {
                onDetail()
                setOpen(false)
              }}
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-muted"
              role="menuitem"
            >
              <Eye className="size-4" /> Ver detalle
            </button>
            {!role.es_sistema && (
              <button
                type="button"
                disabled
                title="Edición inline de rol no disponible — usa la matriz"
                className="flex w-full cursor-not-allowed items-center gap-2 rounded px-2 py-1.5 text-left text-muted-foreground"
                role="menuitem"
              >
                <Edit className="size-4" /> Editar nombre
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="space-y-2" aria-label="Cargando roles">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-14 animate-pulse rounded-md bg-muted" />
      ))}
    </div>
  )
}
