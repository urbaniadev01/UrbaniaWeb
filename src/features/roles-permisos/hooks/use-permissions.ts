import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { rolesService } from '../api/roles.service'
import { ROLES_KEYS } from './use-roles'
import type { ApiResponse } from '@/types/api.types'
import type { Permission, PermissionGroup } from '../types/roles.types'

/**
 * Catálogo de permisos del sistema.
 * El endpoint devuelve todos los permisos; los agrupamos por `resource`
 * para alimentar la PermissionMatrix.
 *
 * staleTime: 5 min — el catálogo casi nunca cambia (sembrado por operador SaaS).
 */
export function usePermissionsCatalog() {
  const query = useQuery<ApiResponse<Permission[]>>({
    queryKey: ROLES_KEYS.permissions(),
    queryFn: () => rolesService.listPermissions(),
    staleTime: 300 * 1000,
  })

  const groups = useMemo<PermissionGroup[]>(() => {
    const list = query.data?.data ?? []
    const map = new Map<string, Permission[]>()
    for (const p of list) {
      const arr = map.get(p.resource) ?? []
      arr.push(p)
      map.set(p.resource, arr)
    }
    return Array.from(map.entries())
      .map(([resource, actions]) => ({ resource, actions }))
      .sort((a, b) => a.resource.localeCompare(b.resource))
  }, [query.data])

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isSuccess: query.isSuccess,
    refetch: query.refetch,
    groups,
  }
}
