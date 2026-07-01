// =====================================================================
// Tipos del feature: Configuración (Perfil y Seguridad)
// =====================================================================
// Endpoints:    /auth/me, /auth/profile, /auth/change-password,
//               /auth/sessions, /auth/mfa/*
// =====================================================================

/**
 * Perfil completo del usuario autenticado.
 * Coincide con la respuesta de GET /auth/me y PATCH /auth/profile.
 *
 * NOTA: NO extender AuthUser desde auth.types.ts para evitar acoplamiento
 * entre features. Se duplican los campos comunes intencionalmente.
 */
export interface Profile {
  id: string
  email: string
  name: string
  phone: string | null
  avatar_url: string | null
  mfa_enabled: boolean
  organization_id: string
  role: string
  status: string
}

export interface UpdateProfilePayload {
  name?: string
  /** `null` para limpiar el teléfono. `string` para asignar uno nuevo. */
  phone?: string | null
  /** `null` para eliminar el avatar. `string` (URL) para asignar uno nuevo. */
  avatar_url?: string | null
}

export interface ChangePasswordPayload {
  current_password: string
  new_password: string
  new_password_confirmation: string
}

export interface ActiveSession {
  id: string
  device_name: string | null
  ip_address: string
  last_used_at: string
  is_current: boolean
}

export interface MfaSetupResponse {
  secret: string
  qr_code_url: string
  backup_codes: string[]
}

export interface MfaEnablePayload {
  code: string
}

export interface MfaDisablePayload {
  password: string
  code: string
}
