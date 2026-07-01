import { apiClient } from '@/services/api-client'
import type { ApiResponse } from '@/types/api.types'
import type {
  Contact,
  ContactWithOccupants,
  OccupantType,
  PropertyOccupant,
  CreateContactPayload,
  UpdateContactPayload,
  LinkOccupantPayload,
  UpdateOccupantPayload,
} from '../types/directorio.types'

const BASE = '/contacts'

export const contactsService = {
  list(filters?: Record<string, string>) {
    const params = new URLSearchParams(filters)
    return apiClient
      .get<ApiResponse<Contact[]>>(`${BASE}?${params}`)
      .then((r) => r.data.data)
  },

  getById(id: string) {
    return apiClient
      .get<ApiResponse<ContactWithOccupants>>(`${BASE}/${id}`)
      .then((r) => r.data.data)
  },

  create(payload: CreateContactPayload) {
    return apiClient
      .post<ApiResponse<{ id: string }>>(BASE, payload)
      .then((r) => r.data.data)
  },

  update(id: string, payload: UpdateContactPayload) {
    return apiClient
      .patch<ApiResponse<null>>(`${BASE}/${id}`, payload)
      .then((r) => r.data)
  },

  delete(id: string) {
    return apiClient.delete(`${BASE}/${id}`)
  },

  // Ocupantes
  listByUnit(propertyId: string) {
    return apiClient
      .get<ApiResponse<PropertyOccupant[]>>(`/properties/${propertyId}/occupants`)
      .then((r) => r.data.data)
  },

  linkToUnit(propertyId: string, payload: LinkOccupantPayload) {
    return apiClient
      .post<ApiResponse<{ id: string }>>(`/properties/${propertyId}/occupants`, payload)
      .then((r) => r.data.data)
  },

  updateOccupant(id: string, payload: UpdateOccupantPayload) {
    return apiClient
      .patch<ApiResponse<null>>(`/property-occupants/${id}`, payload)
      .then((r) => r.data)
  },

  unlinkOccupant(id: string) {
    return apiClient.delete(`/property-occupants/${id}`)
  },

  // Catálogos
  getOccupantTypes() {
    return apiClient
      .get<ApiResponse<OccupantType[]>>('/occupant-types')
      .then((r) => r.data.data)
  },
}
