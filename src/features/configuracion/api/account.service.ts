import { apiClient } from '@/services/api-client'
import type { ApiResponse } from '@/types/api.types'
import type {
  ActiveSession,
  ChangePasswordPayload,
  MfaDisablePayload,
  MfaEnablePayload,
  MfaSetupResponse,
  Profile,
  UpdateProfilePayload,
} from '../types/account.types'

/**
 * Servicio de Cuenta/Perfil del usuario autenticado.
 * Endpoints base: /auth/* (perfil, contraseña, sesiones, MFA).
 *
 * Patrón: cada método retorna `ApiResponse<T>['data']` o `void`,
 * según la convención del resto de servicios del proyecto
 * (ver `properties.service.ts`).
 */
export const accountService = {
  /** GET /auth/me — Perfil del usuario autenticado */
  me(): Promise<Profile> {
    return apiClient.get<ApiResponse<Profile>>('/auth/me').then((r) => r.data.data)
  },

  /** PATCH /auth/profile — Actualizar datos del perfil */
  updateProfile(payload: UpdateProfilePayload): Promise<Profile> {
    return apiClient
      .patch<ApiResponse<Profile>>('/auth/profile', payload)
      .then((r) => r.data.data)
  },

  /**
   * POST /auth/change-password — Cambiar contraseña.
   * IMPORTANTE: el servidor revoca TODAS las sesiones incluida la actual
   * (ver spec §C.2). El caller debe limpiar la sesión local tras éxito.
   */
  changePassword(payload: ChangePasswordPayload): Promise<void> {
    return apiClient.post('/auth/change-password', payload).then(() => undefined)
  },

  /** GET /auth/sessions — Lista de sesiones activas del usuario */
  sessions(): Promise<ActiveSession[]> {
    return apiClient
      .get<ApiResponse<ActiveSession[]>>('/auth/sessions')
      .then((r) => r.data.data)
  },

  /** DELETE /auth/sessions/{id} — Revocar una sesión específica */
  revokeSession(id: string): Promise<void> {
    return apiClient.delete(`/auth/sessions/${id}`).then(() => undefined)
  },

  /** DELETE /auth/sessions — Revocar todas las demás sesiones */
  revokeAllSessions(): Promise<void> {
    return apiClient.delete('/auth/sessions').then(() => undefined)
  },

  /**
   * POST /auth/mfa/setup — Inicia el setup de MFA.
   * Retorna el secret en texto y la URL del QR + códigos de respaldo iniciales.
   * NOTA: aún no habilita MFA — el usuario debe verificar con un código.
   */
  mfaSetup(): Promise<MfaSetupResponse> {
    return apiClient
      .post<ApiResponse<MfaSetupResponse>>('/auth/mfa/setup')
      .then((r) => r.data.data)
  },

  /** POST /auth/mfa/enable — Confirmar setup con un código TOTP válido */
  mfaEnable(payload: MfaEnablePayload): Promise<void> {
    return apiClient.post('/auth/mfa/enable', payload).then(() => undefined)
  },

  /**
   * POST /auth/mfa/disable — Desactivar MFA.
   * Requiere contraseña + código TOTP actual (verificación doble).
   */
  mfaDisable(payload: MfaDisablePayload): Promise<void> {
    return apiClient.post('/auth/mfa/disable', payload).then(() => undefined)
  },

  /** POST /auth/mfa/backup-codes — Regenerar códigos de respaldo */
  regenerateBackupCodes(): Promise<MfaSetupResponse> {
    return apiClient
      .post<ApiResponse<MfaSetupResponse>>('/auth/mfa/backup-codes')
      .then((r) => r.data.data)
  },
}
