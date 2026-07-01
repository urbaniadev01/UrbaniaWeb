import { apiClient } from '@/services/api-client'
import type { ApiResponse, PaginatedResponse } from '@/types/api.types'
import type {
  PropertyType,
  PropertyStatus,
  PropertyDocumentType,
  CatalogFilters,
  CreatePropertyTypePayload,
  UpdatePropertyTypePayload,
  CreatePropertyStatusPayload,
  UpdatePropertyStatusPayload,
  CreatePropertyDocumentTypePayload,
  UpdatePropertyDocumentTypePayload,
} from '../types/propiedades.types'

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

export const catalogsService = {
  // ─── Tipos de unidad ─────────────────────────────────────────────────────

  /** GET /property-types?filters — Lista paginada de tipos de unidad */
  getTypes(filters?: CatalogFilters): Promise<PaginatedResponse<PropertyType>> {
    return apiClient
      .get<PaginatedResponse<PropertyType>>(
        `/property-types${toQueryParams(filters as Record<string, unknown>)}`,
      )
      .then((r) => r.data)
  },

  /** GET /property-types/all?is_active= — Lista simple (sin paginar) para selects */
  getAllTypes(activeOnly = true): Promise<ApiResponse<PropertyType[]>> {
    return apiClient
      .get<ApiResponse<PropertyType[]>>(`/property-types/all?is_active=${activeOnly ? 1 : 0}`)
      .then((r) => r.data)
  },

  /** POST /property-types — Crear tipo */
  createType(payload: CreatePropertyTypePayload): Promise<ApiResponse<{ id: string }>> {
    return apiClient
      .post<ApiResponse<{ id: string }>>('/property-types', payload)
      .then((r) => r.data)
  },

  /** PATCH /property-types/{id} — Actualizar tipo */
  updateType(id: string, payload: UpdatePropertyTypePayload): Promise<ApiResponse<PropertyType>> {
    return apiClient
      .patch<ApiResponse<PropertyType>>(`/property-types/${id}`, payload)
      .then((r) => r.data)
  },

  /** DELETE /property-types/{id} — Eliminar (soft) tipo */
  deleteType(id: string): Promise<void> {
    return apiClient.delete(`/property-types/${id}`).then(() => undefined)
  },

  // ─── Estados de unidad ──────────────────────────────────────────────────

  /** GET /property-statuses?filters — Lista paginada de estados */
  getStatuses(filters?: CatalogFilters): Promise<PaginatedResponse<PropertyStatus>> {
    return apiClient
      .get<PaginatedResponse<PropertyStatus>>(
        `/property-statuses${toQueryParams(filters as Record<string, unknown>)}`,
      )
      .then((r) => r.data)
  },

  /** GET /property-statuses/all?is_active= — Lista simple para selects */
  getAllStatuses(activeOnly = true): Promise<ApiResponse<PropertyStatus[]>> {
    return apiClient
      .get<ApiResponse<PropertyStatus[]>>(
        `/property-statuses/all?is_active=${activeOnly ? 1 : 0}`,
      )
      .then((r) => r.data)
  },

  /** POST /property-statuses — Crear estado */
  createStatus(payload: CreatePropertyStatusPayload): Promise<ApiResponse<{ id: string }>> {
    return apiClient
      .post<ApiResponse<{ id: string }>>('/property-statuses', payload)
      .then((r) => r.data)
  },

  /** PATCH /property-statuses/{id} — Actualizar estado */
  updateStatus(
    id: string,
    payload: UpdatePropertyStatusPayload,
  ): Promise<ApiResponse<PropertyStatus>> {
    return apiClient
      .patch<ApiResponse<PropertyStatus>>(`/property-statuses/${id}`, payload)
      .then((r) => r.data)
  },

  /** DELETE /property-statuses/{id} — Eliminar (soft) estado */
  deleteStatus(id: string): Promise<void> {
    return apiClient.delete(`/property-statuses/${id}`).then(() => undefined)
  },

  // ─── Tipos de documento ─────────────────────────────────────────────────

  /** GET /property-document-types?filters — Lista de tipos de documento */
  getDocumentTypes(filters?: CatalogFilters): Promise<PaginatedResponse<PropertyDocumentType>> {
    return apiClient
      .get<PaginatedResponse<PropertyDocumentType>>(
        `/property-document-types${toQueryParams(filters as Record<string, unknown>)}`,
      )
      .then((r) => r.data)
  },

  /** GET /property-document-types/all?is_active= — Lista simple para selects */
  getAllDocumentTypes(activeOnly = true): Promise<ApiResponse<PropertyDocumentType[]>> {
    return apiClient
      .get<ApiResponse<PropertyDocumentType[]>>(
        `/property-document-types/all?is_active=${activeOnly ? 1 : 0}`,
      )
      .then((r) => r.data)
  },

  /** POST /property-document-types — Crear tipo de documento */
  createDocumentType(
    payload: CreatePropertyDocumentTypePayload,
  ): Promise<ApiResponse<{ id: string }>> {
    return apiClient
      .post<ApiResponse<{ id: string }>>('/property-document-types', payload)
      .then((r) => r.data)
  },

  /** PATCH /property-document-types/{id} — Actualizar tipo de documento */
  updateDocumentType(
    id: string,
    payload: UpdatePropertyDocumentTypePayload,
  ): Promise<ApiResponse<PropertyDocumentType>> {
    return apiClient
      .patch<ApiResponse<PropertyDocumentType>>(
        `/property-document-types/${id}`,
        payload,
      )
      .then((r) => r.data)
  },

  /** DELETE /property-document-types/{id} — Eliminar tipo de documento */
  deleteDocumentType(id: string): Promise<void> {
    return apiClient.delete(`/property-document-types/${id}`).then(() => undefined)
  },
}
