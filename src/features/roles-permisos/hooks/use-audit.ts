import { useQuery } from '@tanstack/react-query'
import { rolesService } from '../api/roles.service'
import { ROLES_KEYS } from './use-roles'
import type { PaginatedResponse } from '@/types/api.types'
import type { AuditLogEntry, AuditLogFilters } from '../types/roles.types'

/**
 * Bitácora de auditoría de permisos.
 * staleTime: 30s — los eventos se consultan frecuentemente para verificar acciones.
 */
export function useAuditLog(filters?: AuditLogFilters) {
  return useQuery<PaginatedResponse<AuditLogEntry>>({
    queryKey: ROLES_KEYS.audit(filters as Record<string, unknown>),
    queryFn: () => rolesService.listAuditLog(filters),
    staleTime: 30 * 1000,
  })
}
