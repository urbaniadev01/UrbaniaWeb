import { useQuery } from '@tanstack/react-query'
import { rolesService } from '../api/roles.service'
import { ROLES_KEYS } from './use-roles'
import type { ApiResponse } from '@/types/api.types'
import type { PanelUser, PanelUsersFilters } from '../types/roles.types'

/**
 * Lista de usuarios del panel administrativo con sus roles asignados.
 * staleTime: 30s — datos que cambian al asignar/revocar.
 */
export function usePanelUsers(filters?: PanelUsersFilters) {
  return useQuery<ApiResponse<PanelUser[]>>({
    queryKey: [...ROLES_KEYS.users(), filters ?? {}],
    queryFn: () => rolesService.listPanelUsers(filters),
    staleTime: 30 * 1000,
  })
}
