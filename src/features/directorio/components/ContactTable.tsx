import { useState } from 'react'
import { Link } from 'react-router'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { Contact } from '../types/directorio.types'

const DOCUMENT_TYPES = [
  { value: '', label: 'Todos los tipos' },
  { value: 'CC', label: 'CC' },
  { value: 'NIT', label: 'NIT' },
  { value: 'CE', label: 'CE' },
  { value: 'Pasaporte', label: 'Pasaporte' },
  { value: 'Otro', label: 'Otro' },
] as const

export interface ContactTableFilters {
  full_name?: string
  document_type?: string
  document_number?: string
}

interface ContactTableProps {
  data: Contact[] | undefined
  isLoading: boolean
  isError: boolean
  error: Error | null
  filters: ContactTableFilters
  onFiltersChange: (filters: ContactTableFilters) => void
}

export function ContactTable({
  data,
  isLoading,
  isError,
  error,
  filters,
  onFiltersChange,
}: ContactTableProps) {
  const [searchText, setSearchText] = useState(filters.full_name ?? '')

  const handleSearch = () => {
    onFiltersChange({ ...filters, full_name: searchText || undefined })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const clearFilters = () => {
    setSearchText('')
    onFiltersChange({})
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-3">
          <div className="h-9 w-64 animate-pulse rounded-md bg-muted" />
          <div className="h-9 w-32 animate-pulse rounded-md bg-muted" />
          <div className="h-9 w-48 animate-pulse rounded-md bg-muted" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-md bg-muted" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
        <p className="text-sm text-destructive">
          {error?.message ?? 'Error al cargar el directorio'}
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() => onFiltersChange({ ...filters })}
        >
          Reintentar
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-9"
          />
        </div>

        <select
          value={filters.document_type ?? ''}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              document_type: e.target.value || undefined,
            })
          }
          className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          {DOCUMENT_TYPES.map((dt) => (
            <option key={dt.value} value={dt.value}>
              {dt.label}
            </option>
          ))}
        </select>

        <Input
          placeholder="Número de documento..."
          value={filters.document_number ?? ''}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              document_number: e.target.value || undefined,
            })
          }
          className="max-w-48"
        />

        {(filters.full_name || filters.document_type || filters.document_number) && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="mr-1 size-4" />
            Limpiar
          </Button>
        )}
      </div>

      {/* Empty state */}
      {!data || data.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <Search className="mx-auto size-12 text-muted-foreground" />
          <h3 className="mt-4 text-sm font-medium">No se encontraron contactos</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {filters.full_name || filters.document_type || filters.document_number
              ? 'Intenta con otros filtros de búsqueda'
              : 'Crea tu primer contacto para empezar'}
          </p>
        </div>
      ) : (
        /* Tabla */
        <div className="overflow-x-auto rounded-lg border">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Nombre
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Tipo Doc.
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Número Doc.
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Teléfono
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((contact) => (
                <tr
                  key={contact.id}
                  className="cursor-pointer transition-colors hover:bg-muted/50"
                >
                  <td className="px-4 py-3">
                    <Link
                      to={`/directorio/${contact.id}`}
                      className="block text-sm font-medium text-foreground hover:text-primary"
                    >
                      {contact.full_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {contact.document_type}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {contact.document_number}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {contact.email ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {contact.phone ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
