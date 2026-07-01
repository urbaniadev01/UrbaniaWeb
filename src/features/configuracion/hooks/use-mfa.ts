import { useMutation, useQueryClient } from '@tanstack/react-query'
import { accountService } from '../api/account.service'
import type {
  MfaDisablePayload,
  MfaEnablePayload,
  MfaSetupResponse,
} from '../types/account.types'
import { PROFILE_KEY } from './use-profile'

/**
 * Hook para iniciar el setup de MFA. Retorna el secret + QR + códigos de respaldo.
 * NO invalida el perfil porque MFA aún no está activo hasta que se verifique.
 */
export function useMfaSetup() {
  return useMutation<MfaSetupResponse, Error, void>({
    mutationFn: () => accountService.mfaSetup(),
  })
}

/** Hook para confirmar y activar MFA con un código TOTP. */
export function useMfaEnable() {
  const queryClient = useQueryClient()
  return useMutation<void, Error, MfaEnablePayload>({
    mutationFn: (payload) => accountService.mfaEnable(payload),
    onSuccess: () => {
      // MFA ahora está activo, refrescar perfil para que el badge se actualice
      queryClient.invalidateQueries({ queryKey: PROFILE_KEY })
    },
  })
}

/** Hook para desactivar MFA. Requiere contraseña + código TOTP. */
export function useMfaDisable() {
  const queryClient = useQueryClient()
  return useMutation<void, Error, MfaDisablePayload>({
    mutationFn: (payload) => accountService.mfaDisable(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_KEY })
    },
  })
}

/** Hook para regenerar códigos de respaldo. */
export function useRegenerateBackupCodes() {
  return useMutation<MfaSetupResponse, Error, void>({
    mutationFn: () => accountService.regenerateBackupCodes(),
  })
}
