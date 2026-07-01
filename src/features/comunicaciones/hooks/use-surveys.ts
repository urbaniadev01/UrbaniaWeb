import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { comunicacionesService } from '../api/comunicaciones.service'
import type { CreateSurveyPayload } from '../types/comunicaciones.types'

/**
 * Query keys centralizados para encuestas.
 */
export const SURVEYS_KEYS = {
  all: ['comunicaciones', 'surveys'] as const,
  list: () => [...SURVEYS_KEYS.all, 'list'] as const,
  results: (id: string) => [...SURVEYS_KEYS.all, 'results', id] as const,
}

// ─── Lista de encuestas ─────────────────────────────────────────────────

/** GET /comunicaciones/surveys */
export function useSurveys() {
  return useQuery({
    queryKey: SURVEYS_KEYS.list(),
    queryFn: () => comunicacionesService.listSurveys(),
    staleTime: 30_000,
  })
}

// ─── Resultados ─────────────────────────────────────────────────────────

/**
 * GET /comunicaciones/surveys/:id/results
 * Polling cada 10s mientras la encuesta esté activa (conteos en vivo).
 * Cuando `cerrada === true`, deja de consultar.
 */
export function useSurveyResults(surveyId: string | null | undefined) {
  return useQuery({
    queryKey: surveyId
      ? SURVEYS_KEYS.results(surveyId)
      : [...SURVEYS_KEYS.results('disabled')],
    queryFn: () => comunicacionesService.getSurveyResults(surveyId as string),
    staleTime: 5_000,
    enabled: !!surveyId,
    refetchInterval: (query) => (query.state.data?.data?.cerrada ? false : 10_000),
  })
}

// ─── Crear encuesta ─────────────────────────────────────────────────────

/** POST /comunicaciones/surveys */
export function useCreateSurvey() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateSurveyPayload) =>
      comunicacionesService.createSurvey(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SURVEYS_KEYS.all })
      toast.success('Encuesta creada correctamente')
    },
    onError: (error: unknown) => {
      const err = error as {
        response?: { data?: { error?: { message?: string } } }
      }
      const message =
        err?.response?.data?.error?.message ?? 'Error al crear la encuesta'
      toast.error(message)
    },
  })
}
