import { apiClient } from '@/services/api-client'
import type { ApiResponse, PaginatedResponse } from '@/types/api.types'
import type { Tower, TowerFilters, CreateTowerPayload, UpdateTowerPayload } from '../types/propiedades.types'

function toQueryParams(filters?: Record<string, unknown>): string {
  if (!filters) return ''
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null) continue
    if (typeof value === 'string' && value.trim() === '') continue
    params.set(key, String(value))
  }
  const str = params.toString()
  return str ? `?${str}` : ''
}

export const towersService = {
  /** GET /condominiums/{condominiumId}/towers?filters — Torres de un condominio */
  list(condominiumId: string, filters?: TowerFilters): Promise<PaginatedResponse<Tower>> {
    return apiClient
      .get<PaginatedResponse<Tower>>(
        `/condominiums/${condominiumId}/towers${toQueryParams(filters as Record<string, unknown>)}`,
      )
      .then((r) => r.data)
  },

  /** POST /towers — Crear torre */
  create(payload: CreateTowerPayload): Promise<ApiResponse<{ id: string }>> {
    return apiClient.post<ApiResponse<{ id: string }>>('/towers', payload).then((r) => r.data)
  },

  /** PATCH /towers/{id} — Actualizar torre */
  update(id: string, payload: UpdateTowerPayload): Promise<ApiResponse<Tower>> {
    return apiClient.patch<ApiResponse<Tower>>(`/towers/${id}`, payload).then((r) => r.data)
  },

  /** DELETE /towers/{id} — Eliminar torre */
  delete(id: string): Promise<void> {
    return apiClient.delete(`/towers/${id}`).then(() => undefined)
  },
}
