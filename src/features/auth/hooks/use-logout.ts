import { useNavigate } from 'react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth.store'
import { logout } from '../api/auth.service'

export function useLogout() {
  const { clearSession } = useAuthStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      clearSession()
      queryClient.clear()
      navigate('/login', { replace: true })
    },
  })
}
