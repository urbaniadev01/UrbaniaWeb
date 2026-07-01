import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { propertiesService } from '../api/properties.service'
import type {
  ChangeStatusPayload,
  CreatePropertyPayload,
  PropertyFilters,
  UpdatePropertyPayload,
} from '../types/propiedades.types'
import type { ApiResponse, PaginatedResponse } from '@/types/api.types'
import type {
  Property,
  PropertyDocument,
  StatusLogEntry,
  CoefficientValidation,
} from '../types/propiedades.types'

/**
 * Query keys centralizados para todo el feature de propiedades.
 * Mantener el mismo prefijo `['properties']` para que
 * `invalidateQueries({ queryKey: ['properties'] })` cubra todas las variantes.
 */
export const PROPERTY_KEYS = {
  all: ['properties'] as const,
  lists: () => [...PROPERTY_KEYS.all, 'list'] as const,
  list: (filters?: PropertyFilters) => [...PROPERTY_KEYS.lists(), filters ?? {}] as const,
  details: () => [...PROPERTY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...PROPERTY_KEYS.details(), id] as const,
  statusLog: (id: string) => [...PROPERTY_KEYS.detail(id), 'status-log'] as const,
  documents: (id: string) => [...PROPERTY_KEYS.detail(id), 'documents'] as const,
  coefficient: (condominiumId: string) =>
    ['coefficient-validation', condominiumId] as const,
} as const

// ─── Lista paginada ───────────────────────────────────────────────────────

export function usePropertyList(filters?: PropertyFilters) {
  return useQuery<PaginatedResponse<Property>>({
    queryKey: PROPERTY_KEYS.list(filters),
    queryFn: () => propertiesService.list(filters),
    staleTime: 30 * 1000,
  })
}

// ─── Detalle ──────────────────────────────────────────────────────────────

export function useProperty(id: string | null | undefined) {
  return useQuery<ApiResponse<Property>>({
    queryKey: id ? PROPERTY_KEYS.detail(id) : ['properties', 'detail', 'disabled'],
    queryFn: () => propertiesService.getById(id as string),
    staleTime: 60 * 1000,
    enabled: !!id,
  })
}

// ─── Crear ────────────────────────────────────────────────────────────────

export function useCreateProperty() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreatePropertyPayload) => propertiesService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROPERTY_KEYS.lists() })
      // Si cambia la cantidad de unidades, la validación de coeficientes se invalida
      queryClient.invalidateQueries({ queryKey: ['coefficient-validation'] })
    },
  })
}

// ─── Actualizar ───────────────────────────────────────────────────────────

export function useUpdateProperty(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdatePropertyPayload) => propertiesService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROPERTY_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: PROPERTY_KEYS.detail(id) })
      queryClient.invalidateQueries({ queryKey: ['coefficient-validation'] })
    },
  })
}

// ─── Eliminar ─────────────────────────────────────────────────────────────

export function useDeleteProperty() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => propertiesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROPERTY_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: ['coefficient-validation'] })
    },
  })
}

// ─── Cambiar estado ───────────────────────────────────────────────────────

export function useChangePropertyStatus(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ChangeStatusPayload) => propertiesService.changeStatus(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROPERTY_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: PROPERTY_KEYS.detail(id) })
      queryClient.invalidateQueries({ queryKey: PROPERTY_KEYS.statusLog(id) })
    },
  })
}

// ─── Historial de estados ─────────────────────────────────────────────────

export function useStatusLog(id: string | null | undefined, page = 1) {
  return useQuery<PaginatedResponse<StatusLogEntry>>({
    queryKey: id ? [...PROPERTY_KEYS.statusLog(id), page] : ['properties', 'status-log', 'disabled'],
    queryFn: () => propertiesService.getStatusLog(id as string, page),
    staleTime: 120 * 1000,
    enabled: !!id,
  })
}

// ─── Validación de coeficientes ───────────────────────────────────────────

export function useCoefficientValidation(condominiumId: string | null | undefined) {
  return useQuery<ApiResponse<CoefficientValidation>>({
    queryKey: condominiumId
      ? PROPERTY_KEYS.coefficient(condominiumId)
      : ['coefficient-validation', 'disabled'],
    queryFn: () => propertiesService.getCoefficientValidation(condominiumId as string),
    staleTime: 300 * 1000,
    enabled: !!condominiumId,
  })
}

// ─── Documentos ───────────────────────────────────────────────────────────

export function usePropertyDocuments(propertyId: string | null | undefined) {
  return useQuery<ApiResponse<PropertyDocument[]>>({
    queryKey: propertyId
      ? PROPERTY_KEYS.documents(propertyId)
      : ['properties', 'documents', 'disabled'],
    queryFn: () => propertiesService.getDocuments(propertyId as string),
    staleTime: 60 * 1000,
    enabled: !!propertyId,
  })
}

export function useUploadDocument(propertyId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (formData: FormData) => propertiesService.uploadDocument(propertyId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROPERTY_KEYS.documents(propertyId) })
      queryClient.invalidateQueries({ queryKey: PROPERTY_KEYS.detail(propertyId) })
    },
  })
}

export function useDeleteDocument(propertyId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (docId: string) => propertiesService.deleteDocument(propertyId, docId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROPERTY_KEYS.documents(propertyId) })
      queryClient.invalidateQueries({ queryKey: PROPERTY_KEYS.detail(propertyId) })
    },
  })
}
