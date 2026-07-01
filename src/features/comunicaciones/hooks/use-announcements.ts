import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { comunicacionesService } from '../api/comunicaciones.service'
import type { CreateAnnouncementPayload } from '../types/comunicaciones.types'

/**
 * Query keys centralizados para comunicados.
 * Mantener el prefijo `['comunicaciones', 'announcements']` para que
 * `invalidateQueries({ queryKey: ['comunicaciones'] })` cubra todo el feature.
 */
export const ANNOUNCEMENTS_KEYS = {
  all: ['comunicaciones', 'announcements'] as const,
  list: (filters?: Record<string, string>) =>
    [...ANNOUNCEMENTS_KEYS.all, 'list', filters ?? {}] as const,
  detail: (id: string) => [...ANNOUNCEMENTS_KEYS.all, 'detail', id] as const,
}

// ─── Lista paginada ─────────────────────────────────────────────────────

/** GET /comunicaciones/announcements — Lista filtrada de comunicados */
export function useAnnouncements(filters?: Record<string, string>) {
  return useQuery({
    queryKey: ANNOUNCEMENTS_KEYS.list(filters),
    queryFn: () => comunicacionesService.listAnnouncements(filters),
    staleTime: 30_000,
  })
}

// ─── Detalle ─────────────────────────────────────────────────────────────

/**
 * GET /comunicaciones/announcements/:id
 * Hace polling cada 15s mientras el comunicado no esté enviado (métricas en
 * tiempo casi real). Una vez `estado === 'enviado'`, deja de consultar.
 */
export function useAnnouncement(id: string | null | undefined) {
  return useQuery({
    queryKey: id ? ANNOUNCEMENTS_KEYS.detail(id) : [...ANNOUNCEMENTS_KEYS.detail('disabled')],
    queryFn: () => comunicacionesService.getAnnouncement(id as string),
    staleTime: 15_000,
    enabled: !!id,
    refetchInterval: (query) =>
      query.state.data?.data?.estado !== 'enviado' ? 15_000 : false,
  })
}

// ─── Crear comunicado ────────────────────────────────────────────────────

/** POST /comunicaciones/announcements */
export function useCreateAnnouncement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateAnnouncementPayload) =>
      comunicacionesService.createAnnouncement(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ANNOUNCEMENTS_KEYS.all })
      toast.success('Comunicado creado exitosamente')
    },
    onError: (error: unknown) => {
      // Axios expone el código del backend en `response.data.error.code`
      const err = error as {
        response?: { data?: { error?: { message?: string } } }
      }
      const message = err?.response?.data?.error?.message ?? 'Error al crear el comunicado'
      toast.error(message)
    },
  })
}
