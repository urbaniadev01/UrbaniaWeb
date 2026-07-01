import { useEffect, useRef, useState } from 'react'
import { Search, X, ChevronDown, ChevronUp, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDebouncedValue } from '../hooks/use-debounced-value'
import { useCoefficientValidation } from '../hooks/use-properties'
import { useCurrentCondominiumIdSync } from '../hooks/use-current-condominium'
import { formatCoefficient, coefficientToPercent } from '../lib/format'
import type { PropertyFilters as FiltersState } from '../types/propiedades.types'
import type { PropertyType, PropertyStatus, Tower } from '../types/propiedades.types'

export interface PropertyFiltersProps {
  filters: FiltersState
  onFilterChange: (filters: FiltersState) => void
  towers: Tower[]
  types: PropertyType[]
  statuses: PropertyStatus[]
  /** Piso máximo de la torre actualmente filtrada, para limitar el selector */
  maxFloor: number
  isLoading?: boolean
}

/**
 * Barra de filtros para la lista de unidades.
 * - Torre / Tipo / Estado: Selects
 * - Piso: Select 0..maxFloor (0 = Sótano)
 * - Búsqueda por texto: debounce 300ms
 * - "Validar coeficientes": expande un resumen inline
 */
export function PropertyFilters({
  filters,
  onFilterChange,
  towers,
  types,
  statuses,
  maxFloor,
  isLoading,
}: PropertyFiltersProps) {
  const [search, setSearch] = useState(filters.search ?? '')
  const debouncedSearch = useDebouncedValue(search, 300)
  const isFirstSearchRender = useRef(true)

  // Sincronizar el debounce con el filtro real (excepto en el primer render)
  useEffect(() => {
    if (isFirstSearchRender.current) {
      isFirstSearchRender.current = false
      return
    }
    if (debouncedSearch !== (filters.search ?? '')) {
      onFilterChange({ ...filters, search: debouncedSearch || undefined, page: 1 })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  const clearFilters = () => {
    setSearch('')
    onFilterChange({})
  }

  const hasActiveFilters = Boolean(
    filters.tower_id ||
      filters.property_type_id ||
      filters.property_status_id ||
      filters.floor !== undefined ||
      filters.search,
  )

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        {/* Búsqueda por texto */}
        <div className="relative min-w-[200px] flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por número de unidad..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            disabled={isLoading}
            aria-label="Buscar por número de unidad"
          />
        </div>

        {/* Torre */}
        <Select
          value={filters.tower_id ?? ''}
          onChange={(v) =>
            onFilterChange({
              ...filters,
              tower_id: v || undefined,
              floor: undefined, // Reset piso al cambiar de torre
              page: 1,
            })
          }
          disabled={isLoading}
          aria-label="Filtrar por torre"
        >
          <option value="">Todas las torres</option>
          {towers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.code?.trim() || t.name}
              {t.code?.trim() ? ` (${t.name})` : ''}
            </option>
          ))}
        </Select>

        {/* Tipo */}
        <Select
          value={filters.property_type_id ?? ''}
          onChange={(v) =>
            onFilterChange({
              ...filters,
              property_type_id: v || undefined,
              page: 1,
            })
          }
          disabled={isLoading}
          aria-label="Filtrar por tipo"
        >
          <option value="">Todos los tipos</option>
          {types.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </Select>

        {/* Estado */}
        <Select
          value={filters.property_status_id ?? ''}
          onChange={(v) =>
            onFilterChange({
              ...filters,
              property_status_id: v || undefined,
              page: 1,
            })
          }
          disabled={isLoading}
          aria-label="Filtrar por estado"
        >
          <option value="">Todos los estados</option>
          {statuses.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>

        {/* Piso */}
        <Select
          value={filters.floor === undefined ? '' : String(filters.floor)}
          onChange={(v) =>
            onFilterChange({
              ...filters,
              floor: v === '' ? undefined : Number(v),
              page: 1,
            })
          }
          disabled={isLoading}
          aria-label="Filtrar por piso"
        >
          <option value="">Todos los pisos</option>
          {Array.from({ length: maxFloor + 1 }, (_, i) => (
            <option key={i} value={i}>
              {i === 0 ? 'Sótano' : `Piso ${i}`}
            </option>
          ))}
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="mr-1 size-4" />
            Limpiar
          </Button>
        )}

        <CoefficientSummaryButton />
      </div>
    </div>
  )
}

// ─── Subcomponentes ───────────────────────────────────────────────────────

interface SelectProps {
  value: string
  onChange: (v: string) => void
  disabled?: boolean
  children: React.ReactNode
  'aria-label'?: string
}

function Select({ value, onChange, disabled, children, ...rest }: SelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
      {...rest}
    >
      {children}
    </select>
  )
}

function CoefficientSummaryButton() {
  const [open, setOpen] = useState(false)
  const condominiumId = useCurrentCondominiumIdSync()
  const { data, isLoading, isError } = useCoefficientValidation(condominiumId)

  // Solo carga la data cuando se abre
  const shouldFetch = open && !!condominiumId

  return (
    <div className="ml-auto">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen((o) => !o)}
        disabled={!condominiumId}
        aria-expanded={open}
      >
        Validar coeficientes
        {open ? <ChevronUp className="ml-1.5 size-4" /> : <ChevronDown className="ml-1.5 size-4" />}
      </Button>

      {open && (
        <div className="mt-3 rounded-lg border bg-card p-4 shadow-sm">
          {isLoading && shouldFetch && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Calculando validación de coeficientes...
            </div>
          )}

          {isError && (
            <p className="text-sm text-destructive">
              No se pudo validar los coeficientes.
            </p>
          )}

          {data?.data && (
            <div className="space-y-2">
              <div
                className={
                  data.data.is_balanced
                    ? 'flex items-center gap-2 text-success'
                    : 'flex items-center gap-2 text-destructive'
                }
              >
                {data.data.is_balanced ? (
                  <CheckCircle2 className="size-5" />
                ) : (
                  <AlertCircle className="size-5" />
                )}
                <span className="font-medium">
                  {data.data.is_balanced
                    ? 'Coeficientes balanceados'
                    : 'Coeficientes desbalanceados'}
                </span>
              </div>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <dt className="text-muted-foreground">Suma actual:</dt>
                <dd className="font-mono tabular-nums">
                  {formatCoefficient(data.data.total_coefficient_sum)} (
                  {coefficientToPercent(data.data.total_coefficient_sum)})
                </dd>
                <dt className="text-muted-foreground">Total esperado:</dt>
                <dd className="font-mono tabular-nums">
                  {formatCoefficient(data.data.total_coefficient_expected)} (
                  {coefficientToPercent(data.data.total_coefficient_expected)})
                </dd>
                <dt className="text-muted-foreground">Diferencia:</dt>
                <dd
                  className={`font-mono tabular-nums ${
                    data.data.is_balanced ? 'text-success' : 'text-destructive'
                  }`}
                >
                  {formatCoefficient(data.data.difference)}
                </dd>
                <dt className="text-muted-foreground">Total unidades:</dt>
                <dd className="tabular-nums">{data.data.total_units}</dd>
                <dt className="text-muted-foreground">Con coeficiente 0:</dt>
                <dd className="tabular-nums">{data.data.units_with_coefficient_zero}</dd>
              </dl>

              {data.data.warnings.length > 0 && (
                <ul className="mt-2 space-y-1 rounded-md border border-warning/30 bg-warning-muted/40 p-2 text-xs">
                  {data.data.warnings.map((w, i) => (
                    <li key={i}>
                      <span className="font-mono text-warning">[{w.type}]</span> {w.message}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
