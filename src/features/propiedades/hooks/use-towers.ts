import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { towersService } from '../api/towers.service'
import type { TowerFilters, CreateTowerPayload, UpdateTowerPayload } from '../types/propiedades.types'
import type { ApiResponse, PaginatedResponse } from '@/types/api.types'
import type { Tower } from '../types/propiedades.types'

export const TOWER_KEYS = {
  all: ['towers'] as const,
  list: (condominiumId: string, filters?: TowerFilters) =>
    [...TOWER_KEYS.all, condominiumId, filters ?? {}] as const,
  detail: (id: string) => [...TOWER_KEYS.all, 'detail', id] as const,
} as const

/** Lista de torres de un condominio. staleTime 120s según SPEC. */
export function useTowerList(condominiumId: string | null | undefined, filters?: TowerFilters) {
  return useQuery<PaginatedResponse<Tower>>({
    queryKey: condominiumId
      ? TOWER_KEYS.list(condominiumId, filters)
      : ['towers', 'list', 'disabled'],
    queryFn: () => towersService.list(condominiumId as string, filters),
    staleTime: 120 * 1000,
    enabled: !!condominiumId,
  })
}

/** Hook conveniente: retorna solo `data` (array de torres) */
export function useTowers(condominiumId: string | null | undefined) {
  const query = useTowerList(condominiumId)
  return {
    ...query,
    data: query.data?.data,
  }
}

export function useCreateTower(condominiumId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateTowerPayload) => towersService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...TOWER_KEYS.all, condominiumId] })
    },
  })
}

export function useUpdateTower(condominiumId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTowerPayload }) =>
      towersService.update(id, payload),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: [...TOWER_KEYS.all, condominiumId] })
      queryClient.invalidateQueries({ queryKey: TOWER_KEYS.detail(vars.id) })
    },
  })
}

export function useDeleteTower(condominiumId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => towersService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...TOWER_KEYS.all, condominiumId] })
    },
  })
}

export function useTower(id: string | null | undefined) {
  return useQuery<ApiResponse<Tower>>({
    queryKey: id ? TOWER_KEYS.detail(id) : ['towers', 'detail', 'disabled'],
    // No hay endpoint de detalle público de torre; usamos el listado para resolver
    queryFn: async () => {
      // Fallback: si el backend expone un endpoint dedicado, sustituir aquí.
      throw new Error('useTower requiere endpoint GET /towers/{id} (no implementado)')
    },
    enabled: false,
  })
}
