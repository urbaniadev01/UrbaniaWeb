import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth.store'
import { accountService } from '../api/account.service'
import type { UpdateProfilePayload } from '../types/account.types'
import type { Profile } from '../types/account.types'

/** Query key para el perfil. Inmutable para que `invalidateQueries(['profile'])` cubra todo. */
export const PROFILE_KEY = ['profile'] as const

/** Hook que retorna el perfil del usuario autenticado. */
export function useProfile() {
  return useQuery<Profile>({
    queryKey: PROFILE_KEY,
    queryFn: () => accountService.me(),
    staleTime: 60 * 1000,
  })
}

/** Hook para actualizar el perfil. Invalida `['profile']` y sincroniza la store de auth. */
export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const setUser = useAuthStore((s) => s.setUser)

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => accountService.updateProfile(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: PROFILE_KEY })
      // Sincronizar la store de auth con los nuevos datos del usuario.
      // Solo actualizamos los campos que pueden cambiar desde el perfil.
      const currentUser = useAuthStore.getState().user
      if (currentUser) {
        setUser({
          ...currentUser,
          name: data.name,
          phone: data.phone,
          avatar_url: data.avatar_url,
        })
      }
    },
  })
}
