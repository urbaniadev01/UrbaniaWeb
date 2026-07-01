import { useState } from 'react'
import { toast } from 'sonner'
import {
  Tag,
  Plus,
  MoreHorizontal,
  Pencil,
  Power,
  Check,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { CatalogForm, type CatalogFormMode } from '../components/CatalogForm'
import { useAuthStore } from '@/stores/auth.store'
import {
  useCreatePropertyStatus,
  useCreatePropertyType,
  useDeletePropertyStatus,
  useDeletePropertyType,
  usePropertyStatuses,
  usePropertyTypes,
  useUpdatePropertyStatus,
  useUpdatePropertyType,
} from '../hooks/use-catalogs'
import { parseApiError } from '@/lib/utils'
import type { PropertyStatus, PropertyType } from '../types/propiedades.types'
import type { CatalogFormValues } from '../validators/propiedades.validators'

type Tab = 'types' | 'statuses'

export function CatalogsPage() {
  const role = useAuthStore((s) => s.user?.role)
  const isAdmin = role === 'admin'

  const [tab, setTab] = useState<Tab>('types')
  const [formMode, setFormMode] = useState<CatalogFormMode>('type')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<PropertyType | PropertyStatus | null>(null)
  const [deactivating, setDeactivating] = useState<PropertyType | PropertyStatus | null>(
    null,
  )

  // ─── Mutations: Types ─────────────────────────────────────────────
  const createType = useCreatePropertyType()
  const updateType = useUpdatePropertyType()
  const deleteType = useDeletePropertyType()

  // ─── Mutations: Statuses ──────────────────────────────────────────
  const createStatus = useCreatePropertyStatus()
  const updateStatus = useUpdatePropertyStatus()
  const deleteStatus = useDeletePropertyStatus()

  // ─── Handlers ────────────────────────────────────────────────────
  const handleSubmit = (values: CatalogFormValues) => {
    if (formMode === 'type') {
      if (editing && 'properties_count' in editing) {
        // Update
        updateType.mutate(
          {
            id: editing.id,
            payload: {
              name: values.name,
              description: values.description || null,
              sort_order: values.sort_order,
              is_active: values.is_active,
            },
          },
          {
            onSuccess: () => {
              toast.success('Tipo actualizado')
              setShowForm(false)
              setEditing(null)
            },
            onError: (err) => {
              const apiError = parseApiError(err)
              toast.error(apiError.message, { description: `Código: ${apiError.code}` })
            },
          },
        )
      } else {
        // Create
        createType.mutate(
          {
            code: values.code,
            name: values.name,
            description: values.description || undefined,
            sort_order: values.sort_order,
          },
          {
            onSuccess: () => {
              toast.success('Tipo creado')
              setShowForm(false)
            },
            onError: (err) => {
              const apiError = parseApiError(err)
              toast.error(apiError.message, { description: `Código: ${apiError.code}` })
            },
          },
        )
      }
    } else {
      // Status
      if (editing && 'allows_residents' in editing) {
        updateStatus.mutate(
          {
            id: editing.id,
            payload: {
              name: values.name,
              description: values.description || null,
              sort_order: values.sort_order,
              allows_residents: values.allows_residents,
              is_active: values.is_active,
            },
          },
          {
            onSuccess: () => {
              toast.success('Estado actualizado')
              setShowForm(false)
              setEditing(null)
            },
            onError: (err) => {
              const apiError = parseApiError(err)
              toast.error(apiError.message, { description: `Código: ${apiError.code}` })
            },
          },
        )
      } else {
        createStatus.mutate(
          {
            code: values.code,
            name: values.name,
            description: values.description || undefined,
            sort_order: values.sort_order,
            allows_residents: values.allows_residents,
          },
          {
            onSuccess: () => {
              toast.success('Estado creado')
              setShowForm(false)
            },
            onError: (err) => {
              const apiError = parseApiError(err)
              toast.error(apiError.message, { description: `Código: ${apiError.code}` })
            },
          },
        )
      }
    }
  }

  const handleDeactivate = () => {
    if (!deactivating) return
    if (formMode === 'type') {
      deleteType.mutate(deactivating.id, {
        onSuccess: () => {
          toast.success('Tipo desactivado')
          setDeactivating(null)
        },
        onError: (err) => {
          const apiError = parseApiError(err)
          // Mensaje amigable para errores de protección
          if (apiError.code === 'CATALOG_HAS_ACTIVE_DEPENDENCIES' || apiError.status === 409) {
            toast.error(
              `No se puede desactivar "${deactivating.name}" porque tiene unidades asociadas.`,
            )
          } else {
            toast.error(apiError.message, { description: `Código: ${apiError.code}` })
          }
        },
      })
    } else {
      deleteStatus.mutate(deactivating.id, {
        onSuccess: () => {
          toast.success('Estado desactivado')
          setDeactivating(null)
        },
        onError: (err) => {
          const apiError = parseApiError(err)
          if (apiError.code === 'CATALOG_HAS_ACTIVE_DEPENDENCIES' || apiError.status === 409) {
            toast.error(
              `No se puede desactivar "${deactivating.name}" porque tiene unidades asociadas.`,
            )
          } else {
            toast.error(apiError.message, { description: `Código: ${apiError.code}` })
          }
        },
      })
    }
  }

  const isFormSubmitting = createType.isPending || updateType.isPending || createStatus.isPending || updateStatus.isPending
  const isDeleting = deleteType.isPending || deleteStatus.isPending

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Tag className="size-6 text-muted-foreground" aria-hidden="true" />
            Catálogos
          </h1>
          <p className="text-sm text-muted-foreground">
            Tipos y estados de unidad
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => {
              setFormMode(tab === 'types' ? 'type' : 'status')
              setEditing(null)
              setShowForm(true)
            }}
          >
            <Plus className="mr-1.5 size-4" />
            Nuevo{tab === 'statuses' ? ' estado' : 'o tipo'}
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b" role="tablist">
        <TabButton active={tab === 'types'} onClick={() => setTab('types')}>
          Tipos de unidad
        </TabButton>
        <TabButton active={tab === 'statuses'} onClick={() => setTab('statuses')}>
          Estados de unidad
        </TabButton>
      </div>

      {/* Contenido */}
      {tab === 'types' ? (
        <TypesTable
          isAdmin={isAdmin}
          onEdit={(t) => {
            setFormMode('type')
            setEditing(t)
            setDeactivating(null)
            setShowForm(true)
          }}
          onDeactivate={(t) => {
            setFormMode('type')
            setDeactivating(t)
          }}
        />
      ) : (
        <StatusesTable
          isAdmin={isAdmin}
          onEdit={(s) => {
            setFormMode('status')
            setEditing(s)
            setDeactivating(null)
            setShowForm(true)
          }}
          onDeactivate={(s) => {
            setFormMode('status')
            setDeactivating(s)
          }}
        />
      )}

      {/* Modal crear/editar */}
      <CatalogForm
        open={showForm}
        onClose={() => {
          setShowForm(false)
          setEditing(null)
        }}
        catalogType={formMode}
        initialValues={editing ?? undefined}
        isSubmitting={isFormSubmitting}
        onSubmit={handleSubmit}
      />

      {/* Confirmar desactivación */}
      <ConfirmDialog
        open={!!deactivating}
        onClose={() => setDeactivating(null)}
        onConfirm={handleDeactivate}
        title={`¿Desactivar ${deactivating?.name ?? ''}?`}
        description="El elemento dejará de estar disponible para nuevas unidades, pero las existentes se mantienen."
        warnings={[
          'Si tiene unidades activas asociadas, la desactivación será rechazada por el servidor.',
        ]}
        confirmLabel="Desactivar"
        isLoading={isDeleting}
      />
    </div>
  )
}

// ─── Tabla de Tipos ───────────────────────────────────────────────────────

function TypesTable({
  isAdmin,
  onEdit,
  onDeactivate,
}: {
  isAdmin: boolean
  onEdit: (t: PropertyType) => void
  onDeactivate: (t: PropertyType) => void
}) {
  const { data, isLoading, isError, error, refetch } = usePropertyTypes()
  const items = data?.data ?? []

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-md bg-muted" />
        ))}
      </div>
    )
  }
  if (isError) {
    return <ErrorState error={error} title="Error al cargar tipos" onRetry={() => refetch()} />
  }
  if (items.length === 0) {
    return (
      <EmptyState
        icon={<Tag className="size-8" aria-hidden="true" />}
        title="No hay tipos de unidad"
        description="Crea tipos como 'Apartamento', 'Local', 'Oficina', etc."
      />
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Código
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Nombre
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Descripción
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Unidades
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Activo
            </th>
            {isAdmin && (
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Acciones
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((t) => (
            <tr key={t.id} className="transition-colors hover:bg-muted/40">
              <td className="px-4 py-3 font-mono text-xs">{t.code}</td>
              <td className="px-4 py-3 font-medium">{t.name}</td>
              <td className="px-4 py-3 text-muted-foreground">{t.description || '—'}</td>
              <td className="px-4 py-3 text-right tabular-nums">
                {t.properties_count ?? 0}
              </td>
              <td className="px-4 py-3">
                {t.is_active ? (
                  <Check className="size-4 text-success" aria-label="Activo" />
                ) : (
                  <X className="size-4 text-muted-foreground" aria-label="Inactivo" />
                )}
              </td>
              {isAdmin && (
                <td className="px-4 py-3 text-right">
                  <CatalogRowActions
                    name={t.name}
                    isActive={t.is_active}
                    onEdit={() => onEdit(t)}
                    onDeactivate={() => onDeactivate(t)}
                  />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Tabla de Estados ─────────────────────────────────────────────────────

function StatusesTable({
  isAdmin,
  onEdit,
  onDeactivate,
}: {
  isAdmin: boolean
  onEdit: (s: PropertyStatus) => void
  onDeactivate: (s: PropertyStatus) => void
}) {
  const { data, isLoading, isError, error, refetch } = usePropertyStatuses()
  const items = data?.data ?? []

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-md bg-muted" />
        ))}
      </div>
    )
  }
  if (isError) {
    return (
      <ErrorState
        error={error}
        title="Error al cargar estados"
        onRetry={() => refetch()}
      />
    )
  }
  if (items.length === 0) {
    return (
      <EmptyState
        icon={<Tag className="size-8" aria-hidden="true" />}
        title="No hay estados de unidad"
        description="Crea estados como 'Ocupada', 'Vacante', 'En mantenimiento', etc."
      />
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Código
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Nombre
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Permite residentes
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Unidades
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Activo
            </th>
            {isAdmin && (
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Acciones
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((s) => (
            <tr key={s.id} className="transition-colors hover:bg-muted/40">
              <td className="px-4 py-3 font-mono text-xs">{s.code}</td>
              <td className="px-4 py-3 font-medium">
                <StatusBadge variant="default">{s.name}</StatusBadge>
              </td>
              <td className="px-4 py-3 text-center">
                {s.allows_residents ? (
                  <Check
                    className="mx-auto size-4 text-success"
                    aria-label="Sí permite residentes"
                  />
                ) : (
                  <X
                    className="mx-auto size-4 text-muted-foreground"
                    aria-label="No permite residentes"
                  />
                )}
              </td>
              <td className="px-4 py-3 text-right tabular-nums">
                {s.properties_count ?? 0}
              </td>
              <td className="px-4 py-3">
                {s.is_active ? (
                  <Check className="size-4 text-success" aria-label="Activo" />
                ) : (
                  <X className="size-4 text-muted-foreground" aria-label="Inactivo" />
                )}
              </td>
              {isAdmin && (
                <td className="px-4 py-3 text-right">
                  <CatalogRowActions
                    name={s.name}
                    isActive={s.is_active}
                    onEdit={() => onEdit(s)}
                    onDeactivate={() => onDeactivate(s)}
                  />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Subcomponentes UI ────────────────────────────────────────────────────

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? 'text-foreground after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-primary'
          : 'text-muted-foreground hover:text-foreground'
      }`}
      role="tab"
      aria-selected={active}
    >
      {children}
    </button>
  )
}

function CatalogRowActions({
  name,
  isActive,
  onEdit,
  onDeactivate,
}: {
  name: string
  isActive: boolean
  onEdit: () => void
  onDeactivate: () => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative inline-block">
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Acciones para ${name}`}
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
            className="absolute right-0 z-20 mt-1 w-44 rounded-md border bg-popover p-1 text-sm shadow-lg"
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
            {isActive && (
              <button
                type="button"
                onClick={() => {
                  onDeactivate()
                  setOpen(false)
                }}
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-destructive hover:bg-destructive/10"
                role="menuitem"
              >
                <Power className="size-4" /> Desactivar
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
