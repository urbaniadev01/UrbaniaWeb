import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { rolesService } from '../api/roles.service'
import type {
  CreateRolePayload,
  SetPermissionsPayload,
  UpdateRolePayload,
} from '../types/roles.types'
import type { ApiResponse } from '@/types/api.types'
import type { Role, RoleDetail } from '../types/roles.types'

/**
 * Query keys centralizados para el feature roles-permisos.
 * Mantener el prefijo `['roles-permisos']` para que
 * `invalidateQueries({ queryKey: ['roles-permisos'] })` cubra todas las variantes.
 */
export const ROLES_KEYS = {
  all: ['roles-permisos'] as const,
  roles: () => [...ROLES_KEYS.all, 'roles'] as const,
  role: (id: string) => [...ROLES_KEYS.roles(), id] as const,
  permissions: () => [...ROLES_KEYS.all, 'permissions'] as const,
  users: () => [...ROLES_KEYS.all, 'users'] as const,
  assignments: () => [...ROLES_KEYS.all, 'assignments'] as const,
  approvalRules: () => [...ROLES_KEYS.all, 'approval-rules'] as const,
  audit: (filters?: Record<string, unknown>) => [...ROLES_KEYS.all, 'audit', filters ?? {}] as const,
} as const

// ─── Lista de roles ───────────────────────────────────────────────────────

export function useRoleList() {
  return useQuery<ApiResponse<Role[]>>({
    queryKey: ROLES_KEYS.roles(),
    queryFn: () => rolesService.listRoles(),
    staleTime: 60 * 1000,
  })
}

// ─── Detalle de rol ───────────────────────────────────────────────────────

export function useRole(id: string | null | undefined) {
  return useQuery<ApiResponse<RoleDetail>>({
    queryKey: id ? ROLES_KEYS.role(id) : [...ROLES_KEYS.role('disabled')],
    queryFn: () => rolesService.getRole(id as string),
    staleTime: 60 * 1000,
    enabled: !!id,
  })
}

// ─── Crear rol ────────────────────────────────────────────────────────────

export function useCreateRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateRolePayload) => rolesService.createRole(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROLES_KEYS.roles() })
    },
  })
}

// ─── Actualizar rol ───────────────────────────────────────────────────────

export function useUpdateRole(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateRolePayload) => rolesService.updateRole(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROLES_KEYS.roles() })
      queryClient.invalidateQueries({ queryKey: ROLES_KEYS.role(id) })
    },
  })
}

// ─── Definir matriz de permisos ───────────────────────────────────────────

export function useSetRolePermissions(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: SetPermissionsPayload) => rolesService.setRolePermissions(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROLES_KEYS.role(id) })
      queryClient.invalidateQueries({ queryKey: ROLES_KEYS.roles() })
    },
  })
}
