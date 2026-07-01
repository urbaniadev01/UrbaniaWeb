import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { comunicacionesService } from '../api/comunicaciones.service'
import type {
  CreateTemplatePayload,
  UpdateTemplatePayload,
} from '../types/comunicaciones.types'

/**
 * Query keys centralizados para plantillas de comunicados.
 */
export const TEMPLATES_KEYS = {
  all: ['comunicaciones', 'templates'] as const,
  list: () => [...TEMPLATES_KEYS.all, 'list'] as const,
}

// ─── Lista ──────────────────────────────────────────────────────────────

/** GET /comunicaciones/templates — Plantillas del conjunto. */
export function useTemplates() {
  return useQuery({
    queryKey: TEMPLATES_KEYS.list(),
    queryFn: () => comunicacionesService.listTemplates(),
    staleTime: 5 * 60_000, // 5 min — cambian poco
  })
}

// ─── CRUD ───────────────────────────────────────────────────────────────

/** POST /comunicaciones/templates */
export function useCreateTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateTemplatePayload) =>
      comunicacionesService.createTemplate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEMPLATES_KEYS.all })
    },
  })
}

/** PATCH /comunicaciones/templates/:id */
export function useUpdateTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTemplatePayload }) =>
      comunicacionesService.updateTemplate(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEMPLATES_KEYS.all })
    },
  })
}

/** DELETE /comunicaciones/templates/:id */
export function useDeleteTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => comunicacionesService.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEMPLATES_KEYS.all })
    },
  })
}
