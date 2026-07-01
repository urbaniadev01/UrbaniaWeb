import { useState, useMemo } from 'react'
import { Link } from 'react-router'
import { Megaphone, Plus, Inbox as InboxIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { useAnnouncements } from '../hooks/use-announcements'
import { AnnouncementRow } from '../components/AnnouncementRow'
import { AnnouncementDetail } from '../components/AnnouncementDetail'
import type { AnnouncementStatus, Segment } from '../types/comunicaciones.types'

// ─── Opciones de filtros ────────────────────────────────────────────────

const ESTADO_OPTIONS: { value: '' | AnnouncementStatus; label: string }[] = [
  { value: '', label: 'Todos los estados' },
  { value: 'borrador', label: 'Borrador' },
  { value: 'programado', label: 'Programado' },
  { value: 'enviado', label: 'Enviado' },
]

const SEGMENTO_OPTIONS: { value: '' | Segment; label: string }[] = [
  { value: '', label: 'Todos los segmentos' },
  { value: 'todos', label: 'Todos' },
  { value: 'torre', label: 'Por torre' },
  { value: 'morosos', label: 'Morosos' },
  { value: 'unidad', label: 'Por unidad' },
]

// ─── Página ─────────────────────────────────────────────────────────────

export function AnnouncementsInboxPage() {
  const [estado, setEstado] = useState<'' | AnnouncementStatus>('')
  const [segmento, setSegmento] = useState<'' | Segment>('')
  const [detailId, setDetailId] = useState<string | null>(null)

  const filters = useMemo(() => {
    const f: Record<string, string> = {}
    if (estado) f.estado = estado
    if (segmento) f.segmento = segmento
    return f
  }, [estado, segmento])

  const { data, isLoading, isError, error, refetch } = useAnnouncements(
    Object.keys(filters).length > 0 ? filters : undefined,
  )

  const announcements = useMemo(() => data?.data ?? [], [data])
  const hasFilters = !!estado || !!segmento

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Megaphone className="size-6 text-muted-foreground" aria-hidden="true" />
            Bandeja de comunicados
          </h1>
          <p className="text-sm text-muted-foreground">
            Redacta, programa y mide el impacto de tus comunicados.
          </p>
        </div>
        <Button asChild>
          <Link to="/comunicaciones/nuevo">
            <Plus className="mr-1.5 size-4" />
            Nuevo comunicado
          </Link>
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-end gap-3 rounded-lg border bg-card p-3">
        <div className="space-y-1">
          <label
            htmlFor="filter-estado"
            className="text-xs font-medium text-muted-foreground"
          >
            Estado
          </label>
          <select
            id="filter-estado"
            value={estado}
            onChange={(e) => setEstado(e.target.value as '' | AnnouncementStatus)}
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            {ESTADO_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label
            htmlFor="filter-segmento"
            className="text-xs font-medium text-muted-foreground"
          >
            Segmento
          </label>
          <select
            id="filter-segmento"
            value={segmento}
            onChange={(e) => setSegmento(e.target.value as '' | Segment)}
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            {SEGMENTO_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEstado('')
              setSegmento('')
            }}
          >
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* Tabla / estados */}
      {isLoading ? (
        <TableSkeleton />
      ) : isError ? (
        <ErrorState
          error={error}
          title="Error al cargar los comunicados"
          onRetry={() => refetch()}
        />
      ) : announcements.length === 0 ? (
        <EmptyState
          icon={<InboxIcon className="size-8" aria-hidden="true" />}
          title={hasFilters ? 'No hay comunicados con esos filtros' : 'No hay comunicados aún'}
          description={
            hasFilters
              ? 'Intenta ajustar los filtros para ver resultados.'
              : 'Redacta tu primer comunicado para enviarlo a los residentes.'
          }
          action={
            hasFilters ? (
              <Button
                variant="outline"
                onClick={() => {
                  setEstado('')
                  setSegmento('')
                }}
              >
                Limpiar filtros
              </Button>
            ) : (
              <Button asChild>
                <Link to="/comunicaciones/nuevo">
                  <Plus className="mr-1.5 size-4" />
                  Redactar primer comunicado
                </Link>
              </Button>
            )
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Título
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Segmento
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Canales
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Programado
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {announcements.map((a) => (
                <AnnouncementRow
                  key={a.id}
                  announcement={a}
                  onView={(id) => setDetailId(id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AnnouncementDetail
        announcementId={detailId}
        onClose={() => setDetailId(null)}
      />
    </div>
  )
}

// ─── Skeleton ───────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="space-y-2" aria-label="Cargando comunicados">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-14 animate-pulse rounded-md bg-muted" />
      ))}
    </div>
  )
}
