import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { rolesService } from '../api/roles.service'
import { ROLES_KEYS } from './use-roles'
import type { ApiResponse } from '@/types/api.types'
import type { ApprovalRule, CreateApprovalRulePayload } from '../types/roles.types'

export function useApprovalRules() {
  return useQuery<ApiResponse<ApprovalRule[]>>({
    queryKey: ROLES_KEYS.approvalRules(),
    queryFn: () => rolesService.listApprovalRules(),
    staleTime: 60 * 1000,
  })
}

export function useCreateApprovalRule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateApprovalRulePayload) => rolesService.createApprovalRule(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROLES_KEYS.approvalRules() })
    },
  })
}
