import { apiClient } from '@/services/api-client'
import type { ApiResponse, PaginatedResponse } from '@/types/api.types'
import type {
  ApprovalRule,
  AuditLogEntry,
  AuditLogFilters,
  CreateApprovalRulePayload,
  CreateAssignmentPayload,
  CreateRolePayload,
  PanelUser,
  PanelUsersFilters,
  Permission,
  Role,
  RoleDetail,
  SetPermissionsPayload,
  UpdateRolePayload,
} from '../types/roles.types'

const BASE = '/authorization'

/**
 * Construye un query string a partir de un objeto de filtros.
 * Omite claves con `undefined`, `null` o string vacío.
 */
function toQueryParams(filters?: Record<string, unknown>): string {
  if (!filters) return ''
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null) continue
    if (typeof value === 'string' && value.trim() === '') continue
    params.set(key, String(value))
  }
  const str = params.toString()
  return str ? `?${str}` : ''
}

/**
 * Servicio de Roles y Permisos (Authorization).
 * Endpoints base: /api/v1/authorization/*
 * Coincide con la convención de `properties.service.ts`:
 * cada método retorna `ApiResponse<T>['data']` o `void`.
 */
export const rolesService = {
  // ─── Roles ─────────────────────────────────────────────────────────────

  /** GET /authorization/roles — Lista de roles del conjunto. */
  listRoles(): Promise<ApiResponse<Role[]>> {
    return apiClient.get<ApiResponse<Role[]>>(`${BASE}/roles`).then((r) => r.data)
  },

  /** GET /authorization/roles/:id — Detalle de un rol con sus permisos. */
  getRole(id: string): Promise<ApiResponse<RoleDetail>> {
    return apiClient.get<ApiResponse<RoleDetail>>(`${BASE}/roles/${id}`).then((r) => r.data)
  },

  /** POST /authorization/roles — Crear un rol nuevo. */
  createRole(payload: CreateRolePayload): Promise<ApiResponse<Role>> {
    return apiClient.post<ApiResponse<Role>>(`${BASE}/roles`, payload).then((r) => r.data)
  },

  /** PATCH /authorization/roles/:id — Actualizar datos básicos de un rol. */
  updateRole(id: string, payload: UpdateRolePayload): Promise<ApiResponse<Role>> {
    return apiClient
      .patch<ApiResponse<Role>>(`${BASE}/roles/${id}`, payload)
      .then((r) => r.data)
  },

  /** PUT /authorization/roles/:id/permissions — Reemplaza la matriz de permisos. */
  setRolePermissions(
    id: string,
    payload: SetPermissionsPayload,
  ): Promise<ApiResponse<RoleDetail>> {
    return apiClient
      .put<ApiResponse<RoleDetail>>(`${BASE}/roles/${id}/permissions`, payload)
      .then((r) => r.data)
  },

  // ─── Catálogo de permisos ──────────────────────────────────────────────

  /** GET /authorization/permissions — Catálogo completo de permisos. */
  listPermissions(): Promise<ApiResponse<Permission[]>> {
    return apiClient
      .get<ApiResponse<Permission[]>>(`${BASE}/permissions`)
      .then((r) => r.data)
  },

  // ─── Asignaciones ─────────────────────────────────────────────────────

  /** POST /authorization/assignments — Crear una asignación rol-usuario. */
  createAssignment(payload: CreateAssignmentPayload): Promise<ApiResponse<{ id: string }>> {
    return apiClient
      .post<ApiResponse<{ id: string }>>(`${BASE}/assignments`, payload)
      .then((r) => r.data)
  },

  /** DELETE /authorization/assignments/:id — Revocar una asignación. */
  revokeAssignment(id: string): Promise<void> {
    return apiClient.delete(`${BASE}/assignments/${id}`).then(() => undefined)
  },

  // ─── Reglas de aprobación ──────────────────────────────────────────────

  /**
   * GET /authorization/approval-rules — Lista de reglas de aprobación.
   * NOTA: según el contrato actual solo está definido POST. Esta función
   * queda preparada para cuando el backend exponga el endpoint de listado.
   */
  listApprovalRules(): Promise<ApiResponse<ApprovalRule[]>> {
    return apiClient
      .get<ApiResponse<ApprovalRule[]>>(`${BASE}/approval-rules`)
      .then((r) => r.data)
  },

  /** POST /authorization/approval-rules — Crear una regla de aprobación. */
  createApprovalRule(payload: CreateApprovalRulePayload): Promise<ApiResponse<ApprovalRule>> {
    return apiClient
      .post<ApiResponse<ApprovalRule>>(`${BASE}/approval-rules`, payload)
      .then((r) => r.data)
  },

  // ─── Bitácora de auditoría ─────────────────────────────────────────────

  /** GET /authorization/audit — Eventos de auditoría paginados. */
  listAuditLog(filters?: AuditLogFilters): Promise<PaginatedResponse<AuditLogEntry>> {
    return apiClient
      .get<PaginatedResponse<AuditLogEntry>>(`${BASE}/audit${toQueryParams(filters)}`)
      .then((r) => r.data)
  },

  // ─── Usuarios del panel ────────────────────────────────────────────────

  /**
   * GET /authorization/users — Lista de usuarios del panel con sus roles.
   * Si el endpoint no está expuesto por el backend, retorna un array vacío
   * (los hooks deben manejar este caso con EmptyState).
   */
  listPanelUsers(filters?: PanelUsersFilters): Promise<ApiResponse<PanelUser[]>> {
    return apiClient
      .get<ApiResponse<PanelUser[]>>(`${BASE}/users${toQueryParams(filters)}`)
      .then((r) => r.data)
  },
}
