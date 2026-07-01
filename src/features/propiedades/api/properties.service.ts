import { apiClient } from '@/services/api-client'
import type { ApiResponse, PaginatedResponse } from '@/types/api.types'
import type {
  Property,
  PropertyDocument,
  PropertyFilters,
  StatusLogEntry,
  CoefficientValidation,
  CreatePropertyPayload,
  UpdatePropertyPayload,
  ChangeStatusPayload,
} from '../types/propiedades.types'

const BASE = '/properties'

/**
 * Construye un query string a partir de un objeto de filtros.
 * Omite claves con `undefined`, `null` o string vacío para no contaminar la URL.
 */
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

export const propertiesService = {
  /** GET /properties?filters — Lista paginada de unidades */
  list(filters?: PropertyFilters): Promise<PaginatedResponse<Property>> {
    return apiClient
      .get<PaginatedResponse<Property>>(`${BASE}${toQueryParams(filters as Record<string, unknown>)}`)
      .then((r) => r.data)
  },

  /** GET /properties/{id} — Detalle completo de una unidad */
  getById(id: string): Promise<ApiResponse<Property>> {
    return apiClient.get<ApiResponse<Property>>(`${BASE}/${id}`).then((r) => r.data)
  },

  /** POST /properties — Crear unidad. Retorna ApiResponse<{id}> */
  create(payload: CreatePropertyPayload): Promise<ApiResponse<{ id: string }>> {
    return apiClient.post<ApiResponse<{ id: string }>>(BASE, payload).then((r) => r.data)
  },

  /** PATCH /properties/{id} — Actualizar unidad */
  update(id: string, payload: UpdatePropertyPayload): Promise<ApiResponse<Property>> {
    return apiClient.patch<ApiResponse<Property>>(`${BASE}/${id}`, payload).then((r) => r.data)
  },

  /** DELETE /properties/{id} — Eliminar unidad */
  delete(id: string): Promise<void> {
    return apiClient.delete(`${BASE}/${id}`).then(() => undefined)
  },

  /** PATCH /properties/{id}/status — Cambiar estado de la unidad */
  changeStatus(id: string, payload: ChangeStatusPayload): Promise<ApiResponse<Property>> {
    return apiClient
      .patch<ApiResponse<Property>>(`${BASE}/${id}/status`, payload)
      .then((r) => r.data)
  },

  /** GET /properties/{id}/status-log — Historial paginado de cambios de estado */
  getStatusLog(id: string, page = 1): Promise<PaginatedResponse<StatusLogEntry>> {
    return apiClient
      .get<PaginatedResponse<StatusLogEntry>>(`${BASE}/${id}/status-log?page=${page}`)
      .then((r) => r.data)
  },

  /** GET /condominiums/{id}/coefficient-validation — Validación de suma de coeficientes */
  getCoefficientValidation(condominiumId: string): Promise<ApiResponse<CoefficientValidation>> {
    return apiClient
      .get<ApiResponse<CoefficientValidation>>(
        `/condominiums/${condominiumId}/coefficient-validation`,
      )
      .then((r) => r.data)
  },

  /** GET /properties/{id}/documents — Lista de documentos de una unidad */
  getDocuments(propertyId: string): Promise<ApiResponse<PropertyDocument[]>> {
    return apiClient
      .get<ApiResponse<PropertyDocument[]>>(`${BASE}/${propertyId}/documents`)
      .then((r) => r.data)
  },

  /**
   * POST /properties/{id}/documents — Subir documento (multipart/form-data).
   * `formData` debe incluir: file, document_type_id, name, notes?
   */
  uploadDocument(propertyId: string, formData: FormData): Promise<ApiResponse<PropertyDocument>> {
    return apiClient
      .post<ApiResponse<PropertyDocument>>(`${BASE}/${propertyId}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
  },

  /** DELETE /properties/{id}/documents/{docId} — Eliminar documento */
  deleteDocument(propertyId: string, docId: string): Promise<void> {
    return apiClient
      .delete(`${BASE}/${propertyId}/documents/${docId}`)
      .then(() => undefined)
  },
}
