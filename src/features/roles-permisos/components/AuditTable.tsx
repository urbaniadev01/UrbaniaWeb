import { useMemo, useState } from 'react'
import { Activity, CheckCircle2, XCircle, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { Pagination } from '@/components/shared/Pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuditLog } from '../hooks/use-audit'
import type { AuditLogFilters, AuditLogEntry } from '../types/roles.types'

/**
 * Tabla paginada de la bitácora de auditoría de permisos.
 * Filtros: desde, hasta, actor.
 * Usa el componente Pagination compartido.
 */
export function AuditTable() {
  const [filters, setFilters] = useState<AuditLogFilters>({ page: 1, per_page: 20 })

  const { data, isLoading, isError, error, refetch } = useAuditLog(filters)

  const entries = data?.data ?? []
  const meta = data?.meta

  const handleFilterChange = (
    key: 'from' | 'to' | 'actor',
    value: string,
  ) => {
    setFilters((prev) => {
      const next: AuditLogFilters = { ...prev, page: 1 }
      if (value.trim() === '') {
        delete next[key]
      } else {
        next[key] = value
      }
      return next
    })
  }

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }))
  }

  const hasActiveFilters = Boolean(filters.from || filters.to || filters.actor)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 rounded-lg border bg-muted/20 p-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="audit-from" className="text-xs">
            Desde
          </Label>
          <Input
            id="audit-from"
            type="date"
            value={filters.from ?? ''}
            onChange={(e) => handleFilterChange('from', e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="audit-to" className="text-xs">
            Hasta
          </Label>
          <Input
            id="audit-to"
            type="date"
            value={filters.to ?? ''}
            onChange={(e) => handleFilterChange('to', e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="audit-actor" className="text-xs">
            Actor (ID)
          </Label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="audit-actor"
              value={filters.actor ?? ''}
              onChange={(e) => handleFilterChange('actor', e.target.value)}
              placeholder="UUID del actor"
              className="pl-8 font-mono text-xs"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : isError ? (
        <ErrorState
          error={error}
          title="Error al cargar la auditoría"
          onRetry={() => refetch()}
        />
      ) : entries.length === 0 ? (
        <EmptyState
          icon={<Activity className="size-8" aria-hidden="true" />}
          title={hasActiveFilters ? 'Sin eventos para los filtros aplicados' : 'Sin eventos aún'}
          description={
            hasActiveFilters
              ? 'Ajusta los filtros para ver resultados.'
              : 'Cuando haya acciones sobre permisos, aparecerán aquí.'
          }
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Actor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Acción
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Recurso
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Resultado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {entries.map((entry) => (
                  <AuditRow key={entry.id} entry={entry} />
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
        </>
      )}
    </div>
  )
}

function AuditRow({ entry }: { entry: AuditLogEntry }) {
  useMemo(() => {
    if (!entry.context) return null
    try {
      return JSON.stringify(entry.context, null, 2)
    } catch {
      return null
    }
  }, [entry.context])

  return (
    <tr className="transition-colors hover:bg-muted/30">
      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted-foreground">
        {formatDateTime(entry.created_at)}
      </td>
      <td className="px-4 py-3">
        {entry.user ? (
          <div>
            <div className="font-medium">{entry.user.name}</div>
            <div className="font-mono text-xs text-muted-foreground">{entry.user.id}</div>
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>
      <td className="px-4 py-3 font-mono text-xs">{entry.action}</td>
      <td className="px-4 py-3">
        {entry.resource ? (
          <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs">
            {entry.resource}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-center">
        {entry.result === 'granted' ? (
          <StatusBadge variant="success" className="gap-1">
            <CheckCircle2 className="size-3" aria-hidden="true" />
            Concedido
          </StatusBadge>
        ) : (
          <StatusBadge variant="destructive" className="gap-1">
            <XCircle className="size-3" aria-hidden="true" />
            Denegado
          </StatusBadge>
        )}
      </td>
    </tr>
  )
}

function TableSkeleton() {
  return (
    <div className="space-y-2" aria-label="Cargando auditoría">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  )
}

function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso)
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d)
  } catch {
    return iso
  }
}
