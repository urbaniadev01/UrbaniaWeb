import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  Building2,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  ArrowRightLeft,
  FileDown,
} from 'lucide-react'
import { useSearchParams } from 'react-router'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Pagination } from '@/components/shared/Pagination'
import { PropertyFilters } from '../components/PropertyFilters'
import { PropertyForm } from '../components/PropertyForm'
import { PropertyDetail } from '../components/PropertyDetail'
import { useAuthStore } from '@/stores/auth.store'
import { useCurrentCondominiumId } from '../hooks/use-current-condominium'
import {
  useAllPropertyStatuses,
  useAllPropertyTypes,
} from '../hooks/use-catalogs'
import { useTowers } from '../hooks/use-towers'
import {
  useCreateProperty,
  useDeleteProperty,
  usePropertyList,
  useUpdateProperty,
} from '../hooks/use-properties'
import { parseApiError } from '@/lib/utils'
import {
  formatArea,
  formatCoefficient,
  formatFloor,
  statusCodeToVariant,
} from '../lib/format'
import type {
  CreatePropertyPayload,
  Property,
  PropertyFilters as FiltersState,
  UpdatePropertyPayload,
} from '../types/propiedades.types'

const PER_PAGE = 20

export function PropertiesListPage() {
  const role = useAuthStore((s) => s.user?.role)
  const isAdmin = role === 'admin'

  const [searchParams, setSearchParams] = useSearchParams()
  const condominiumId = useCurrentCondominiumId()

  // ─── Estado local de UI ──────────────────────────────────────────────
  const [filters, setFilters] = useState<FiltersState>({
    page: Number(searchParams.get('page')) || 1,
    per_page: PER_PAGE,
  })

  // Si los query params cambian desde fuera, sincronizar
  // (básicamente solo manejamos page desde la URL; el resto vive en el estado)

  // ─── Datos ──────────────────────────────────────────────────────────
  const { data, isLoading, isError, error, refetch } = usePropertyList(filters)
  const { data: typesResp } = useAllPropertyTypes(true)
  const { data: statusesResp } = useAllPropertyStatuses(true)
  const { data: towers } = useTowers(condominiumId)

  const types = useMemo(() => typesResp?.data ?? [], [typesResp])
  const statuses = useMemo(() => statusesResp?.data ?? [], [statusesResp])
  const towerList = useMemo(() => towers ?? [], [towers])

  // Torre actualmente filtrada (para limitar el selector de piso)
  const selectedTower = useMemo(() => {
    if (!filters.tower_id) return undefined
    return towerList.find((t) => t.id === filters.tower_id)
  }, [filters.tower_id, towerList])
  const maxFloor = selectedTower?.floor_count ?? 20

  // ─── Modales ────────────────────────────────────────────────────────
  const [detailPropertyId, setDetailPropertyId] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // ─── Mutaciones ─────────────────────────────────────────────────────
  const createMutation = useCreateProperty()
  const updateMutation = useUpdateProperty(editingProperty?.id ?? '')
  const deleteMutation = useDeleteProperty()

  // ─── Handlers ───────────────────────────────────────────────────────
  const handleFilterChange = useCallback((newFilters: FiltersState) => {
    setFilters({ ...newFilters, page: newFilters.page ?? 1, per_page: PER_PAGE })
  }, [])

  const handlePageChange = useCallback(
    (page: number) => {
      setFilters((f) => ({ ...f, page }))
      // Sync URL
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        next.set('page', String(page))
        return next
      })
    },
    [setSearchParams],
  )

  const handleCreate = (payload: CreatePropertyPayload | UpdatePropertyPayload) => {
    if (!condominiumId) {
      toast.error('No se pudo determinar el condominio actual')
      return
    }
    createMutation.mutate(payload as CreatePropertyPayload, {
      onSuccess: () => {
        toast.success('Unidad creada correctamente')
        setShowCreateForm(false)
      },
      onError: (err) => {
        const apiError = parseApiError(err)
        toast.error(apiError.message, { description: `Código: ${apiError.code}` })
      },
    })
  }

  const handleUpdate = (payload: CreatePropertyPayload | UpdatePropertyPayload) => {
    if (!editingProperty) return
    updateMutation.mutate(payload as UpdatePropertyPayload, {
      onSuccess: () => {
        toast.success('Unidad actualizada')
        setEditingProperty(null)
        // Refrescar el detalle si está abierto
        if (detailPropertyId === editingProperty.id) {
          // El hook se revalida automáticamente
        }
      },
      onError: (err) => {
        const apiError = parseApiError(err)
        toast.error(apiError.message, { description: `Código: ${apiError.code}` })
      },
    })
  }

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success('Unidad eliminada')
        setDeletingId(null)
        // Cerrar el drawer si está abierto
        if (detailPropertyId === id) setDetailPropertyId(null)
      },
      onError: (err) => {
        const apiError = parseApiError(err)
        toast.error(apiError.message, { description: `Código: ${apiError.code}` })
      },
    })
  }

  const properties = data?.data ?? []
  const meta = data?.meta
  const hasFilters = Boolean(
    filters.tower_id ||
      filters.property_type_id ||
      filters.property_status_id ||
      filters.floor !== undefined ||
      filters.search,
  )

  const deletingProperty = properties.find((p) => p.id === deletingId)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Building2 className="size-6 text-muted-foreground" aria-hidden="true" />
            Unidades
          </h1>
          <p className="text-sm text-muted-foreground">
            Gestión de unidades del conjunto
          </p>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              <FileDown className="mr-1.5 size-4" />
              Exportar
            </Button>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="mr-1.5 size-4" />
              Nueva unidad
            </Button>
          </div>
        )}
      </div>

      {/* Filtros */}
      <PropertyFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        towers={towerList}
        types={types}
        statuses={statuses}
        maxFloor={maxFloor}
        isLoading={isLoading}
      />

      {/* Tabla / estados */}
      {isLoading ? (
        <TableSkeleton />
      ) : isError ? (
        <ErrorState
          error={error}
          title="Error al cargar las unidades"
          onRetry={() => refetch()}
        />
      ) : properties.length === 0 ? (
        <EmptyState
          icon={<Building2 className="size-8" aria-hidden="true" />}
          title={
            hasFilters
              ? 'No hay unidades que coincidan con los filtros'
              : 'No hay unidades registradas'
          }
          description={
            hasFilters
              ? 'Intenta ajustar los filtros para ver resultados.'
              : 'Crea la primera unidad para empezar a gestionar el conjunto.'
          }
          action={
            isAdmin && hasFilters ? (
              <Button variant="outline" onClick={() => handleFilterChange({})}>
                Limpiar filtros
              </Button>
            ) : isAdmin ? (
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="mr-1.5 size-4" />
                Crear primera unidad
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          <div className="overflow-x-auto rounded-lg border">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Unidad
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Torre
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Piso
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Área
                  </th>
                  <th
                    className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground"
                    title="Porcentaje de copropiedad"
                  >
                    Coeficiente
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Residentes
                  </th>
                  {isAdmin && (
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Acciones
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {properties.map((property) => (
                  <tr
                    key={property.id}
                    className="cursor-pointer transition-colors hover:bg-muted/40"
                    onClick={() => setDetailPropertyId(property.id)}
                  >
                    <td className="px-4 py-3 font-mono font-medium">
                      {property.full_designation}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {property.tower.name}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatFloor(property.floor)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs">
                        {property.type.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums">
                      {formatArea(property.area_m2)}
                    </td>
                    <td
                      className="px-4 py-3 text-right font-mono tabular-nums"
                      title="Porcentaje de copropiedad"
                    >
                      {formatCoefficient(property.coefficient)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge variant={statusCodeToVariant(property.status.code)}>
                        {property.status.name}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-3 text-center text-muted-foreground">
                      {property.residents_count > 0 ? property.residents_count : '—'}
                    </td>
                    {isAdmin && (
                      <td
                        className="px-4 py-3 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <RowActions
                          property={property}
                          onView={() => setDetailPropertyId(property.id)}
                          onEdit={() => setEditingProperty(property)}
                          onDelete={() => setDeletingId(property.id)}
                        />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {meta && (
            <Pagination
              page={meta.current_page}
              perPage={meta.per_page}
              total={meta.total}
              lastPage={meta.last_page}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      )}

      {/* ─── Drawer de detalle ─────────────────────────────────────── */}
      <PropertyDetail
        propertyId={detailPropertyId}
        onClose={() => setDetailPropertyId(null)}
        onEdit={(property) => {
          setEditingProperty(property)
          setDetailPropertyId(null)
        }}
      />

      {/* ─── Modal crear ──────────────────────────────────────────── */}
      <PropertyForm
        open={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        towers={towerList}
        types={types}
        condominiumId={condominiumId ?? ''}
        isSubmitting={createMutation.isPending}
        onSubmit={handleCreate}
      />

      {/* ─── Modal editar ─────────────────────────────────────────── */}
      {editingProperty && (
        <PropertyForm
          open={!!editingProperty}
          onClose={() => setEditingProperty(null)}
          initialValues={editingProperty}
          towers={towerList}
          types={types}
          isSubmitting={updateMutation.isPending}
          onSubmit={handleUpdate}
        />
      )}

      {/* ─── Confirm delete ───────────────────────────────────────── */}
      <ConfirmDialog
        open={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={() => deletingId && handleDelete(deletingId)}
        title={`¿Eliminar unidad ${deletingProperty?.full_designation ?? ''}?`}
        description="Esta acción no se puede deshacer."
        warnings={[
          'Se eliminará la unidad del registro.',
          'Si la unidad tiene residentes u ocupantes vinculados, la eliminación será rechazada por el servidor.',
        ]}
        confirmLabel="Eliminar unidad"
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}

// ─── Subcomponentes ───────────────────────────────────────────────────────

function RowActions({
  property,
  onView,
  onEdit,
  onDelete,
}: {
  property: Property
  onView: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative inline-block">
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={(e) => {
          e.stopPropagation()
          setOpen((o) => !o)
        }}
        aria-label={`Acciones para ${property.full_designation}`}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <MoreHorizontal className="size-4" />
      </Button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={(e) => {
              e.stopPropagation()
              setOpen(false)
            }}
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
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setOpen(false)
            }}
          >
            <button
              type="button"
              onClick={() => {
                onView()
                setOpen(false)
              }}
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-muted"
              role="menuitem"
            >
              <Eye className="size-4" /> Ver detalle
            </button>
            <button
              type="button"
              onClick={() => {
                onEdit()
                setOpen(false)
              }}
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-muted"
              role="menuitem"
            >
              <Edit className="size-4" /> Editar
            </button>
            <button
              type="button"
              onClick={() => {
                // El modal de cambio de estado se abre desde el detalle
                onView()
                setOpen(false)
              }}
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-muted"
              role="menuitem"
            >
              <ArrowRightLeft className="size-4" /> Cambiar estado
            </button>
            <div className="my-1 h-px bg-border" />
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

function TableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-12 animate-pulse rounded-md bg-muted" />
      ))}
    </div>
  )
}
