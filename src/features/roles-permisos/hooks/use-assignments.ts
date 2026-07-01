import { useMutation, useQueryClient } from '@tanstack/react-query'
import { rolesService } from '../api/roles.service'
import { ROLES_KEYS } from './use-roles'
import type { CreateAssignmentPayload } from '../types/roles.types'

export function useCreateAssignment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateAssignmentPayload) => rolesService.createAssignment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROLES_KEYS.users() })
      queryClient.invalidateQueries({ queryKey: ROLES_KEYS.assignments() })
    },
  })
}

export function useRevokeAssignment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => rolesService.revokeAssignment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROLES_KEYS.users() })
      queryClient.invalidateQueries({ queryKey: ROLES_KEYS.assignments() })
    },
  })
}
