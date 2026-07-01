export interface AuthUser {
  id: string
  name: string
  email: string
  phone: string | null
  unit: string | null
  /** ID del condominio al que pertenece el admin. Ausente en usuarios no-admin. */
  condominium_id?: string | null
  role: 'admin' | 'user'
  status: 'active' | 'suspended' | 'inactive'
  avatar_url: string | null
  mfa_enabled: boolean
  /**
   * Permisos efectivos del usuario (claves "recurso.accion").
   * Opcional: el endpoint /auth/me lo incluye si la API lo expone.
   * Se usa en AdminOnlyRoute y DashboardLayout como reemplazo del check
   * exclusivo por rol.
   */
  permissions?: string[]
}

export interface LoginResponseData {
  access_token: string
  refresh_token: string
  token_type: 'bearer'
  expires_in: number
  user: AuthUser
}

export interface RefreshResponseData {
  access_token: string
  refresh_token: string
  token_type: 'bearer'
  expires_in: number
}

export interface Session {
  id: string
  device_name: string | null
  ip_address: string | null
  location: string | null
  last_activity: string
  is_current: boolean
  created_at: string
}

export interface LoginInput {
  email: string
  password: string
}
