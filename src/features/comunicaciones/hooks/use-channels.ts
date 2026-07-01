import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { comunicacionesService } from '../api/comunicaciones.service'
import type { UpdateChannelPayload } from '../types/comunicaciones.types'

/**
 * Query keys centralizados para configuración de canales.
 */
export const CHANNELS_KEYS = {
  all: ['comunicaciones', 'channels'] as const,
  list: () => [...CHANNELS_KEYS.all, 'list'] as const,
}

// ─── Lista de canales ───────────────────────────────────────────────────

/** GET /comunicaciones/channels — Configuración de WhatsApp/Email/Push */
export function useChannels() {
  return useQuery({
    queryKey: CHANNELS_KEYS.list(),
    queryFn: () => comunicacionesService.listChannels(),
    staleTime: 60_000,
  })
}

// ─── Actualizar canal ───────────────────────────────────────────────────

/** PUT /comunicaciones/channels */
export function useUpdateChannel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateChannelPayload) =>
      comunicacionesService.updateChannel(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHANNELS_KEYS.all })
    },
  })
}
