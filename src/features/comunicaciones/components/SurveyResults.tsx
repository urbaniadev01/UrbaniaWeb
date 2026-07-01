import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ErrorState } from '@/components/shared/ErrorState'
import { useSurveyResults } from '../hooks/use-surveys'

// ─── Props ──────────────────────────────────────────────────────────────

export interface SurveyResultsProps {
  surveyId: string | null
  /** Pregunta a mostrar mientras se cargan los resultados. */
  fallbackPregunta?: string
  onClose: () => void
}

// ─── Componente ─────────────────────────────────────────────────────────

/**
 * Drawer (Sheet) con los resultados de una encuesta:
 * pregunta, gráfico de barras horizontales con conteo por opción,
 * total de respuestas y badge "Cerrada" si aplica.
 *
 * El hook `useSurveyResults` hace polling cada 10s mientras esté abierta.
 */
export function SurveyResultsPanel({ surveyId, fallbackPregunta, onClose }: SurveyResultsProps) {
  const { data, isLoading, isError, error, refetch } = useSurveyResults(
    surveyId ?? undefined,
  )
  const open = !!surveyId
  const results = data?.data

  const total = results?.total_responses ?? 0
  const pregunta = results?.pregunta ?? fallbackPregunta ?? ''

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md"
        aria-describedby={undefined}
      >
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="pr-8">Resultados</SheetTitle>
          {pregunta && (
            <SheetDescription className="line-clamp-3">{pregunta}</SheetDescription>
          )}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading && <ResultsSkeleton />}

          {isError && (
            <ErrorState
              error={error}
              title="No se pudieron cargar los resultados"
              onRetry={() => refetch()}
            />
          )}

          {results && (
            <div className="space-y-6">
              {/* Header: total + estado */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-semibold tabular-nums">{total}</p>
                  <p className="text-xs text-muted-foreground">
                    {total === 1 ? 'respuesta' : 'respuestas'}
                  </p>
                </div>
                {results.cerrada ? (
                  <StatusBadge variant="muted">Cerrada</StatusBadge>
                ) : (
                  <StatusBadge variant="success">Activa</StatusBadge>
                )}
              </div>

              {/* Gráfico de barras */}
              <section className="space-y-3">
                {results.opciones.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Esta encuesta no tiene opciones.
                  </p>
                ) : (
                  results.opciones.map((opt) => {
                    const pct = total > 0 ? Math.round((opt.count / total) * 100) : 0
                    return (
                      <div key={opt.option_id}>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span className="truncate">{opt.texto}</span>
                          <span className="ml-2 shrink-0 font-mono tabular-nums text-xs text-muted-foreground">
                            {opt.count} · {pct}%
                          </span>
                        </div>
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full bg-primary transition-[width]"
                            style={{ width: `${pct}%` }}
                            role="progressbar"
                            aria-valuenow={pct}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={`${opt.texto}: ${pct}%`}
                          />
                        </div>
                      </div>
                    )
                  })
                )}
              </section>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function ResultsSkeleton() {
  return (
    <div className="space-y-4" aria-label="Cargando resultados">
      <div className="h-12 animate-pulse rounded-md bg-muted" />
      <div className="h-6 animate-pulse rounded bg-muted" />
      <div className="h-6 animate-pulse rounded bg-muted" />
      <div className="h-6 animate-pulse rounded bg-muted" />
    </div>
  )
}
