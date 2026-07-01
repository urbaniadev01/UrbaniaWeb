import { useState } from 'react'
import { toast } from 'sonner'
import {
  Building,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Check,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { TowerForm } from '../components/TowerForm'
import { useAuthStore } from '@/stores/auth.store'
import { useCurrentCondominiumId } from '../hooks/use-current-condominium'
import {
  useCreateTower,
  useDeleteTower,
  useTowers,
  useUpdateTower,
} from '../hooks/use-towers'
import { parseApiError } from '@/lib/utils'
import type { Tower } from '../types/propiedades.types'
import type { TowerFormValues } from '../validators/propiedades.validators'

export function TowersPage() {
  const role = useAuthStore((s) => s.user?.role)
  const isAdmin = role === 'admin'
  const condominiumId = useCurrentCondominiumId()

  const { data: towers, isLoading, isError, error, refetch } = useTowers(condominiumId)

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Tower | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const createMutation = useCreateTower(condominiumId ?? '')
  const updateMutation = useUpdateTower(condominiumId ?? '')
  const deleteMutation = useDeleteTower(condominiumId ?? '')

  const handleCreate = (values: TowerFormValues) => {
    if (!condominiumId) {
      toast.error('No se pudo determinar el condominio actual')
      return
    }
    createMutation.mutate(
      { ...values, condominium_id: condominiumId, code: values.code || undefined },
      {
        onSuccess: () => {
          toast.success('Torre creada correctamente')
          setShowForm(false)
        },
        onError: (err) => {
          const apiError = parseApiError(err)
          toast.error(apiError.message, { description: `Código: ${apiError.code}` })
        },
      },
    )
  }

  const handleUpdate = (values: TowerFormValues) => {
    if (!editing) return
    updateMutation.mutate(
      {
        id: editing.id,
        payload: {
          ...values,
          code: values.code || null,
          description: values.description || null,
        },
      },
      {
        onSuccess: () => {
          toast.success('Torre actualizada')
          setEditing(null)
        },
        onError: (err) => {
          const apiError = parseApiError(err)
          toast.error(apiError.message, { description: `Código: ${apiError.code}` })
        },
      },
    )
  }

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success('Torre eliminada')
        setDeletingId(null)
      },
      onError: (err) => {
        const apiError = parseApiError(err)
        toast.error(apiError.message, { description: `Código: ${apiError.code}` })
      },
    })
  }

  const deleting = towers?.find((t) => t.id === deletingId)
  const deletingUnits = deleting?.stats?.total_units ?? 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Building className="size-6 text-muted-foreground" aria-hidden="true" />
            Torres
          </h1>
          <p className="text-sm text-muted-foreground">
            Estructura física del conjunto
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-1.5 size-4" />
            Nueva torre
          </Button>
        )}
      </div>

      {/* Tabla / estados */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-md bg-muted" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          error={error}
          title="Error al cargar las torres"
          onRetry={() => refetch()}
        />
      ) : !towers || towers.length === 0 ? (
        <EmptyState
          icon={<Building className="size-8" aria-hidden="true" />}
          title="No hay torres registradas"
          description="Crea la primera torre para empezar a organizar las unidades."
          action={
            isAdmin ? (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="mr-1.5 size-4" />
                Crear primera torre
              </Button>
            ) : undefined
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
                  Pisos
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Ascensor
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Unidades
                </th>
                {isAdmin && (
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Acciones
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {towers.map((tower) => (
                <tr key={tower.id} className="transition-colors hover:bg-muted/40">
                  <td className="px-4 py-3">
                    <div className="font-medium">{tower.name}</div>
                    {tower.code && (
                      <div className="text-xs text-muted-foreground">({tower.code})</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground tabular-nums">
                    {tower.floor_count}
                  </td>
                  <td className="px-4 py-3">
                    {tower.has_elevator ? (
                      <Check className="size-4 text-success" aria-label="Sí" />
                    ) : (
                      <X className="size-4 text-muted-foreground" aria-label="No" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {tower.stats ? (
                      <span className="tabular-nums">
                        {tower.stats.total_units}
                        <span className="mx-1 text-muted-foreground">·</span>
                        <span className="text-success">
                          {tower.stats.occupied_units} oc
                        </span>
                        <span className="mx-1 text-muted-foreground">·</span>
                        <span className="text-info">
                          {tower.stats.vacant_units} vac
                        </span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3 text-right">
                      <RowActions
                        tower={tower}
                        onEdit={() => setEditing(tower)}
                        onDelete={() => setDeletingId(tower.id)}
                      />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal crear */}
      <TowerForm
        open={showForm}
        onClose={() => setShowForm(false)}
        isSubmitting={createMutation.isPending}
        onSubmit={handleCreate}
      />

      {/* Modal editar */}
      {editing && (
        <TowerForm
          open={!!editing}
          onClose={() => setEditing(null)}
          initialValues={editing}
          isSubmitting={updateMutation.isPending}
          onSubmit={handleUpdate}
        />
      )}

      {/* Confirm delete */}
      <ConfirmDialog
        open={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={() => deletingId && handleDelete(deletingId)}
        title={`¿Eliminar torre ${deleting?.name ?? ''}?`}
        description="Esta acción no se puede deshacer."
        warnings={[
          `La torre tiene ${deletingUnits} unidad${deletingUnits !== 1 ? 'es' : ''} asociada${deletingUnits !== 1 ? 's' : ''}.`,
          deletingUnits > 0
            ? 'La eliminación será rechazada mientras tenga unidades activas.'
            : 'Si está vacía, se eliminará permanentemente.',
        ]}
        confirmLabel="Eliminar torre"
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}

// ─── Subcomponentes ───────────────────────────────────────────────────────

function RowActions({
  tower,
  onEdit,
  onDelete,
}: {
  tower: Tower
  onEdit: () => void
  onDelete: () => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative inline-block">
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Acciones para torre ${tower.name}`}
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
            className="absolute right-0 z-20 mt-1 w-40 rounded-md border bg-popover p-1 text-sm shadow-lg"
            role="menu"
            tabIndex={-1}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setOpen(false)
            }}
          >
            <button
              type="button"
              onClick={() => {
                onEdit()
                setOpen(false)
              }}
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-muted"
              role="menuitem"
            >
              <Pencil className="size-4" /> Editar
            </button>
            <button
              type="button"
              onClick={() => {
                onDelete()
                setOpen(false)
              }}
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-destructive hover:bg-destructive/10"
              role="menuitem"
            >
              <Trash2 className="size-4" /> Eliminar
            </button>
          </div>
        </>
      )}
    </div>
  )
}
