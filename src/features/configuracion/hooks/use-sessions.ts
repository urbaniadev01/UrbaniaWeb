import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { accountService } from '../api/account.service'
import type { ActiveSession } from '../types/account.types'

export const SESSIONS_KEY = ['sessions'] as const

/** Hook para listar las sesiones activas del usuario. */
export function useSessions() {
  return useQuery<ActiveSession[]>({
    queryKey: SESSIONS_KEY,
    queryFn: () => accountService.sessions(),
    staleTime: 15 * 1000,
  })
}

/** Hook para revocar una sesión específica. */
export function useRevokeSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => accountService.revokeSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SESSIONS_KEY })
    },
  })
}

/** Hook para revocar todas las demás sesiones (excepto la actual). */
export function useRevokeAllSessions() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => accountService.revokeAllSessions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SESSIONS_KEY })
    },
  })
}
