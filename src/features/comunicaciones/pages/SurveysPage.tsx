import { useState } from 'react'
import { toast } from 'sonner'
import { BarChart3, Plus, Inbox as InboxIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { SurveyBuilder } from '../components/SurveyBuilder'
import { SurveyResultsPanel } from '../components/SurveyResults'
import { useCreateSurvey, useSurveys } from '../hooks/use-surveys'
import { parseApiError } from '@/lib/utils'
import type { SurveyFormValues } from '../validators/comunicaciones.validators'

// ─── Página ─────────────────────────────────────────────────────────────

export function SurveysPage() {
  const { data, isLoading, isError, error, refetch } = useSurveys()
  const createMutation = useCreateSurvey()

  const [showBuilder, setShowBuilder] = useState(false)
  const [resultsSurveyId, setResultsSurveyId] = useState<string | null>(null)
  const [resultsPregunta, setResultsPregunta] = useState<string>('')

  const surveys = data?.data ?? []

  const handleCreate = (values: SurveyFormValues) => {
    createMutation.mutate(
      {
        pregunta: values.pregunta.trim(),
        opciones: values.opciones.map((o) => o.trim()).filter((o) => o.length > 0),
        cierra_el: values.cierra_el?.trim() || undefined,
      },
      {
        onSuccess: () => {
          setShowBuilder(false)
        },
        onError: (err) => {
          const apiError = parseApiError(err)
          toast.error(apiError.message, { description: `Código: ${apiError.code}` })
        },
      },
    )
  }

  const openResults = (surveyId: string, pregunta: string) => {
    setResultsSurveyId(surveyId)
    setResultsPregunta(pregunta)
  }

  const totalResponses = (survey: (typeof surveys)[number]) =>
    survey.opciones.reduce((acc, o) => acc + (o.responses_count ?? 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <BarChart3 className="size-6 text-muted-foreground" aria-hidden="true" />
            Encuestas
          </h1>
          <p className="text-sm text-muted-foreground">
            Crea encuestas y mide la opinión de los residentes.
          </p>
        </div>
        <Button onClick={() => setShowBuilder(true)}>
          <Plus className="mr-1.5 size-4" />
          Nueva encuesta
        </Button>
      </div>

      {/* Tabla / estados */}
      {isLoading ? (
        <TableSkeleton />
      ) : isError ? (
        <ErrorState
          error={error}
          title="Error al cargar las encuestas"
          onRetry={() => refetch()}
        />
      ) : surveys.length === 0 ? (
        <EmptyState
          icon={<InboxIcon className="size-8" aria-hidden="true" />}
          title="No hay encuestas"
          description="Crea la primera encuesta para empezar a recibir respuestas de los residentes."
          action={
            <Button onClick={() => setShowBuilder(true)}>
              <Plus className="mr-1.5 size-4" />
              Crear primera encuesta
            </Button>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Pregunta
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Respuestas
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Cierra
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {surveys.map((s) => {
                const responses = totalResponses(s)
                return (
                  <tr
                    key={s.id}
                    className="cursor-pointer transition-colors hover:bg-muted/40"
                    onClick={() => openResults(s.id, s.pregunta)}
                  >
                    <td className="max-w-md truncate px-4 py-3 font-medium">
                      {s.pregunta}
                    </td>
                    <td className="px-4 py-3 text-center font-mono tabular-nums">
                      {responses}
                    </td>
                    <td className="px-4 py-3">
                      {s.activa ? (
                        <StatusBadge variant="success">Activa</StatusBadge>
                      ) : (
                        <StatusBadge variant="muted">Cerrada</StatusBadge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {s.cierra_el
                        ? new Date(s.cierra_el).toLocaleString('es-CO', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openResults(s.id, s.pregunta)}
                      >
                        Ver resultados
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── Modal crear ──────────────────────────────────────── */}
      <SurveyBuilder
        open={showBuilder}
        onClose={() => setShowBuilder(false)}
        isSubmitting={createMutation.isPending}
        onSubmit={handleCreate}
      />

      {/* ─── Drawer resultados ───────────────────────────────── */}
      <SurveyResultsPanel
        surveyId={resultsSurveyId}
        fallbackPregunta={resultsPregunta}
        onClose={() => setResultsSurveyId(null)}
      />
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="space-y-2" aria-label="Cargando encuestas">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-12 animate-pulse rounded-md bg-muted" />
      ))}
    </div>
  )
}
