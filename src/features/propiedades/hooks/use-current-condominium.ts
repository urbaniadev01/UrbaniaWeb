import { useAuthStore } from '@/stores/auth.store'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/services/api-client'
import type { ApiResponse } from '@/types/api.types'
import type { Condominium } from '../types/propiedades.types'

/**
 * Hook que retorna el ID del condominio del admin autenticado.
 *
 * Estrategia:
 *   1. Lee `condominium_id` del usuario en el store (presente si la API lo expone).
 *   2. Si no está, hace una llamada a `GET /condominiums/me` (fallback) y cachea el resultado.
 *
 * Mientras se resuelve, retorna `null` (los hooks que dependen deben usar `enabled: !!id`).
 */
export function useCurrentCondominiumId(): string | null {
  const userCondominiumId = useAuthStore((s) => s.user?.condominium_id ?? null)

  // Fallback: si el store no tiene el ID, intentar endpoint /condominiums/me
  const { data } = useQuery<ApiResponse<Condominium>>({
    queryKey: ['condominiums', 'me'],
    queryFn: () =>
      apiClient
        .get<ApiResponse<Condominium>>('/condominiums/me')
        .then((r) => r.data),
    enabled: !userCondominiumId,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })

  if (userCondominiumId) return userCondominiumId
  return data?.data?.id ?? null
}

/** Versión sincrónica: solo lee del store, sin fallback remoto. */
export function useCurrentCondominiumIdSync(): string | null {
  return useAuthStore((s) => s.user?.condominium_id ?? null)
}
