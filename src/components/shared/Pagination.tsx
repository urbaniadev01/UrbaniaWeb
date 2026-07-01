import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface PaginationProps {
  page: number
  perPage: number
  total: number
  lastPage: number
  onPageChange: (page: number) => void
}

/**
 * Paginador simple server-side. Se muestra solo si `total > per_page`.
 */
export function Pagination({ page, perPage, total, lastPage, onPageChange }: PaginationProps) {
  if (total <= perPage) return null

  const start = (page - 1) * perPage + 1
  const end = Math.min(page * perPage, total)
  const canPrev = page > 1
  const canNext = page < lastPage

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
      <p className="text-sm text-muted-foreground">
        Mostrando <span className="font-medium">{start}</span>–
        <span className="font-medium">{end}</span> de{' '}
        <span className="font-medium">{total}</span>
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!canPrev}
          onClick={() => onPageChange(page - 1)}
          aria-label="Página anterior"
        >
          <ChevronLeft className="size-4" />
          Anterior
        </Button>
        <span className="text-sm tabular-nums">
          Página {page} de {lastPage}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={!canNext}
          onClick={() => onPageChange(page + 1)}
          aria-label="Página siguiente"
        >
          Siguiente
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}
