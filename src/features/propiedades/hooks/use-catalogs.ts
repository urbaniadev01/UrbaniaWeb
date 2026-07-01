import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { catalogsService } from '../api/catalogs.service'
import type {
  CatalogFilters,
  CreatePropertyTypePayload,
  UpdatePropertyTypePayload,
  CreatePropertyStatusPayload,
  UpdatePropertyStatusPayload,
  CreatePropertyDocumentTypePayload,
  UpdatePropertyDocumentTypePayload,
} from '../types/propiedades.types'
import type { ApiResponse } from '@/types/api.types'
import type {
  PropertyType,
  PropertyStatus,
  PropertyDocumentType,
} from '../types/propiedades.types'

// ─── Query keys ───────────────────────────────────────────────────────────

export const CATALOG_KEYS = {
  types: ['property-types'] as const,
  typeList: (filters?: CatalogFilters) => [...CATALOG_KEYS.types, filters ?? {}] as const,
  typeAll: () => [...CATALOG_KEYS.types, 'all'] as const,

  statuses: ['property-statuses'] as const,
  statusList: (filters?: CatalogFilters) => [...CATALOG_KEYS.statuses, filters ?? {}] as const,
  statusAll: () => [...CATALOG_KEYS.statuses, 'all'] as const,

  docTypes: ['property-document-types'] as const,
  docTypeList: (filters?: CatalogFilters) => [...CATALOG_KEYS.docTypes, filters ?? {}] as const,
  docTypeAll: () => [...CATALOG_KEYS.docTypes, 'all'] as const,
} as const

// ─── Tipos de unidad ──────────────────────────────────────────────────────

/** Lista paginada de tipos de unidad (admin) — staleTime 300s */
export function usePropertyTypes(filters?: CatalogFilters) {
  return useQuery({
    queryKey: CATALOG_KEYS.typeList(filters),
    queryFn: () => catalogsService.getTypes(filters),
    staleTime: 300 * 1000,
  })
}

/** Lista plana (sin paginar) para alimentar <select> — staleTime 300s */
export function useAllPropertyTypes(activeOnly = true) {
  return useQuery<ApiResponse<PropertyType[]>>({
    queryKey: [...CATALOG_KEYS.typeAll(), activeOnly ? 'active' : 'all'],
    queryFn: () => catalogsService.getAllTypes(activeOnly),
    staleTime: 300 * 1000,
  })
}

export function useCreatePropertyType() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreatePropertyTypePayload) => catalogsService.createType(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATALOG_KEYS.types })
    },
  })
}

export function useUpdatePropertyType() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePropertyTypePayload }) =>
      catalogsService.updateType(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATALOG_KEYS.types })
    },
  })
}

export function useDeletePropertyType() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => catalogsService.deleteType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATALOG_KEYS.types })
    },
  })
}

// ─── Estados de unidad ────────────────────────────────────────────────────

/** Lista paginada de estados de unidad — staleTime 300s */
export function usePropertyStatuses(filters?: CatalogFilters) {
  return useQuery({
    queryKey: CATALOG_KEYS.statusList(filters),
    queryFn: () => catalogsService.getStatuses(filters),
    staleTime: 300 * 1000,
  })
}

/** Lista plana (sin paginar) para alimentar <select> */
export function useAllPropertyStatuses(activeOnly = true) {
  return useQuery<ApiResponse<PropertyStatus[]>>({
    queryKey: [...CATALOG_KEYS.statusAll(), activeOnly ? 'active' : 'all'],
    queryFn: () => catalogsService.getAllStatuses(activeOnly),
    staleTime: 300 * 1000,
  })
}

export function useCreatePropertyStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreatePropertyStatusPayload) => catalogsService.createStatus(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATALOG_KEYS.statuses })
    },
  })
}

export function useUpdatePropertyStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePropertyStatusPayload }) =>
      catalogsService.updateStatus(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATALOG_KEYS.statuses })
    },
  })
}

export function useDeletePropertyStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => catalogsService.deleteStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATALOG_KEYS.statuses })
    },
  })
}

// ─── Tipos de documento ───────────────────────────────────────────────────

/** Lista paginada de tipos de documento */
export function usePropertyDocumentTypes(filters?: CatalogFilters) {
  return useQuery({
    queryKey: CATALOG_KEYS.docTypeList(filters),
    queryFn: () => catalogsService.getDocumentTypes(filters),
    staleTime: 300 * 1000,
  })
}

/** Lista plana para alimentar <select> */
export function useAllPropertyDocumentTypes(activeOnly = true) {
  return useQuery<ApiResponse<PropertyDocumentType[]>>({
    queryKey: [...CATALOG_KEYS.docTypeAll(), activeOnly ? 'active' : 'all'],
    queryFn: () => catalogsService.getAllDocumentTypes(activeOnly),
    staleTime: 300 * 1000,
  })
}

export function useCreatePropertyDocumentType() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreatePropertyDocumentTypePayload) =>
      catalogsService.createDocumentType(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATALOG_KEYS.docTypes })
    },
  })
}

export function useUpdatePropertyDocumentType() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePropertyDocumentTypePayload }) =>
      catalogsService.updateDocumentType(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATALOG_KEYS.docTypes })
    },
  })
}

export function useDeletePropertyDocumentType() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => catalogsService.deleteDocumentType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATALOG_KEYS.docTypes })
    },
  })
}
