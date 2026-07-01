// =====================================================================
// Tipos del feature: Roles y Permisos
// =====================================================================
// Source of truth: 02-web/features/roles-permisos/ROLES_PERMISOS_SPEC.md
// Endpoints:      /api/v1/authorization/* (ver 01-api/endpoints/ROLES_PERMISOS)
// =====================================================================

// ---------- Permisos ----------

/** Acciones disponibles en el sistema RBAC de Urbania. */
export type PermissionAction =
  | 'ver'
  | 'crear'
  | 'editar'
  | 'eliminar'
  | 'aprobar'
  | 'exportar'
  | 'configurar'

/** Niveles de alcance donde un rol puede aplicar. */
export type ScopeLevel = 'organization' | 'condominium' | 'tower' | 'unit'

/** Permiso individual del catálogo. */
export interface Permission {
  id: string
  resource: string
  action: PermissionAction
  name: string
  description?: string | null
  is_system: boolean
}

/** Grupo de permisos por recurso (catálogo). */
export interface PermissionGroup {
  resource: string
  actions: Permission[]
}

// ---------- Roles ----------

/** Rol listado en GET /authorization/roles. */
export interface Role {
  id: string
  nombre: string
  codigo?: string
  descripcion?: string | null
  es_sistema: boolean
  nivel_alcance: ScopeLevel
  usuarios_count: number
  created_at: string
  updated_at: string
}

/** Detalle de rol retornado por GET /authorization/roles/:id.
 *  Incluye el set de permisos efectivos (strings "recurso.accion"). */
export interface RoleDetail extends Role {
  permisos: string[]
}

// ---------- Asignaciones ----------

/** Asignación de un rol a un usuario dentro de un alcance. */
export interface RoleAssignment {
  id: string
  user_id: string
  user_name?: string
  user_email?: string
  role_id: string
  role_name: string
  scope_type: ScopeLevel
  scope_id: string
  scope_name?: string
  vigencia_inicio: string | null
  vigencia_fin: string | null
  estado: 'programada' | 'activa' | 'expirada' | 'revocada'
  created_at: string
}

// ---------- Usuarios del panel ----------

/** Usuario del panel administrativo (no residente). */
export interface PanelUser {
  id: string
  name: string
  email: string
  phone?: string | null
  status: 'active' | 'suspended' | 'inactive'
  avatar_url?: string | null
  mfa_enabled: boolean
  roles: Array<{
    role_id: string
    role_name: string
    scope_type: ScopeLevel
    scope_id: string
    scope_name?: string
  }>
  created_at: string
}

// ---------- Reglas de aprobación ----------

/** Regla de aprobación con umbral (ver 01-api/endpoints/ROLES_PERMISOS §8). */
export interface ApprovalRule {
  id: string
  resource: string
  action: PermissionAction
  /** Umbral monetario (COP). `null` si no aplica. */
  threshold: number | null
  approver_role: { id: string; name: string }
  requires_second_approval: boolean
  created_at: string
}

// ---------- Bitácora de auditoría ----------

/** Entrada de la bitácora de permisos. */
export interface AuditLogEntry {
  id: string
  user?: { id: string; name: string } | null
  action: string
  resource?: string | null
  result: 'granted' | 'denied'
  context?: Record<string, unknown> | null
  created_at: string
}

// ---------- Payloads ----------

export interface CreateRolePayload {
  nombre: string
  descripcion?: string
  nivel_alcance: ScopeLevel
  base_role_id?: string
}

export interface UpdateRolePayload {
  nombre?: string
  descripcion?: string
  nivel_alcance?: ScopeLevel
}

export interface SetPermissionsPayload {
  permissions: string[]
}

export interface CreateAssignmentPayload {
  user_id: string
  role_id: string
  scope_type: ScopeLevel
  scope_id: string
  vigencia_inicio?: string | null
  vigencia_fin?: string | null
}

export interface CreateApprovalRulePayload {
  resource: string
  action: PermissionAction
  threshold?: number | null
  approver_role_id: string
  requires_second_approval?: boolean
}

// ---------- Filtros / Query params ----------

export interface AuditLogFilters {
  from?: string
  to?: string
  actor?: string
  page?: number
  per_page?: number
  /** Index signature para que sea asignable a Record<string, unknown>. */
  [key: string]: string | number | undefined
}

export interface PanelUsersFilters {
  page?: number
  per_page?: number
  search?: string
  status?: PanelUser['status']
  /** Index signature para que sea asignable a Record<string, unknown>. */
  [key: string]: string | number | undefined
}
