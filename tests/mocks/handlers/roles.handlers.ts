import { http, HttpResponse } from 'msw'

/**
 * Handlers MSW para los endpoints del feature Roles y Permisos.
 * Coinciden con 01-api/endpoints/ROLES_PERMISOS.md.
 */

const MOCK_ROLES = [
  {
    id: 'role-admin-001',
    nombre: 'Administrador',
    codigo: 'admin',
    descripcion: 'Acceso total al panel de gestión.',
    es_sistema: true,
    nivel_alcance: 'organization',
    usuarios_count: 2,
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'role-contador-001',
    nombre: 'Contador',
    codigo: 'contador',
    descripcion: 'Gestiona pagos, consulta reportes y exporta información financiera.',
    es_sistema: false,
    nivel_alcance: 'condominium',
    usuarios_count: 1,
    created_at: '2026-02-20T14:30:00Z',
    updated_at: '2026-03-10T09:15:00Z',
  },
  {
    id: 'role-recepcion-001',
    nombre: 'Recepción',
    codigo: 'recepcion',
    descripcion: 'Registra ingresos de visitantes y consulta directorio.',
    es_sistema: false,
    nivel_alcance: 'condominium',
    usuarios_count: 0,
    created_at: '2026-04-05T08:00:00Z',
    updated_at: '2026-04-05T08:00:00Z',
  },
]

const MOCK_PERMISSIONS = [
  { id: 'p-1', resource: 'roles', action: 'ver', name: 'roles.ver', is_system: true },
  { id: 'p-2', resource: 'roles', action: 'crear', name: 'roles.crear', is_system: true },
  { id: 'p-3', resource: 'roles', action: 'editar', name: 'roles.editar', is_system: true },
  { id: 'p-4', resource: 'roles', action: 'asignar', name: 'roles.asignar', is_system: true },
  { id: 'p-5', resource: 'roles', action: 'configurar', name: 'roles.configurar', is_system: true },
  { id: 'p-6', resource: 'propiedades', action: 'ver', name: 'propiedades.ver', is_system: false },
  { id: 'p-7', resource: 'propiedades', action: 'crear', name: 'propiedades.crear', is_system: false },
  { id: 'p-8', resource: 'propiedades', action: 'editar', name: 'propiedades.editar', is_system: false },
  { id: 'p-9', resource: 'pagos', action: 'ver', name: 'pagos.ver', is_system: false },
  { id: 'p-10', resource: 'pagos', action: 'aprobar', name: 'pagos.aprobar', is_system: false },
  { id: 'p-11', resource: 'pagos', action: 'exportar', name: 'pagos.exportar', is_system: false },
  { id: 'p-12', resource: 'directorio', action: 'ver', name: 'directorio.ver', is_system: false },
]

const MOCK_USERS = [
  {
    id: 'u-1',
    name: 'Ana Pérez',
    email: 'ana@urbania.com',
    phone: '+57 300 111 2233',
    status: 'active',
    avatar_url: null,
    mfa_enabled: true,
    roles: [
      {
        role_id: 'role-admin-001',
        role_name: 'Administrador',
        scope_type: 'organization',
        scope_id: 'org-1',
        scope_name: 'Organización demo',
      },
    ],
    created_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'u-2',
    name: 'Carlos Méndez',
    email: 'carlos@urbania.com',
    phone: null,
    status: 'active',
    avatar_url: null,
    mfa_enabled: false,
    roles: [
      {
        role_id: 'role-contador-001',
        role_name: 'Contador',
        scope_type: 'condominium',
        scope_id: 'condo-1',
        scope_name: 'Conjunto Las Acacias',
      },
    ],
    created_at: '2026-02-20T14:30:00Z',
  },
  {
    id: 'u-3',
    name: 'Lucía Rojas',
    email: 'lucia@urbania.com',
    phone: '+57 311 555 7788',
    status: 'suspended',
    avatar_url: null,
    mfa_enabled: false,
    roles: [],
    created_at: '2026-03-10T08:00:00Z',
  },
]

const MOCK_APPROVAL_RULES = [
  {
    id: 'ar-1',
    resource: 'pagos',
    action: 'aprobar',
    threshold: 500000,
    approver_role: { id: 'role-admin-001', name: 'Administrador' },
    requires_second_approval: true,
    created_at: '2026-04-01T09:00:00Z',
  },
  {
    id: 'ar-2',
    resource: 'pagos',
    action: 'eliminar',
    threshold: null,
    approver_role: { id: 'role-admin-001', name: 'Administrador' },
    requires_second_approval: false,
    created_at: '2026-04-15T12:00:00Z',
  },
]

const MOCK_AUDIT = [
  {
    id: 'audit-1',
    user: { id: 'u-1', name: 'Ana Pérez' },
    action: 'roles.permisos.update',
    resource: 'role-contador-001',
    result: 'granted',
    context: { added: ['pagos.aprobar'], removed: [] },
    created_at: '2026-05-20T10:15:00Z',
  },
  {
    id: 'audit-2',
    user: { id: 'u-1', name: 'Ana Pérez' },
    action: 'roles.asignar',
    resource: 'u-2',
    result: 'granted',
    context: { role_id: 'role-contador-001', scope_type: 'condominium' },
    created_at: '2026-05-20T10:20:00Z',
  },
  {
    id: 'audit-3',
    user: { id: 'u-3', name: 'Lucía Rojas' },
    action: 'pagos.aprobar',
    resource: 'pagos',
    result: 'denied',
    context: { reason: 'role sin permiso pagos.aprobar' },
    created_at: '2026-05-21T16:42:00Z',
  },
]

export const rolesHandlers = [
  // ─── Roles ─────────────────────────────────────────────────────────────
  http.get('*/authorization/roles', () =>
    HttpResponse.json({
      data: MOCK_ROLES,
      meta: { trace_id: 'test-trace-roles-list' },
    }),
  ),

  http.get('*/authorization/roles/:id', ({ params }) => {
    const role = MOCK_ROLES.find((r) => r.id === params.id)
    if (!role) {
      return HttpResponse.json(
        {
          error: {
            code: 'ROLE_NOT_FOUND',
            message: 'Rol no encontrado',
            trace_id: 'test-trace-role-not-found',
          },
        },
        { status: 404 },
      )
    }
    // Permisos efectivos del rol según id
    let permisos: string[] = []
    if (role.id === 'role-admin-001') {
      permisos = MOCK_PERMISSIONS.map((p) => p.name)
    } else if (role.id === 'role-contador-001') {
      permisos = ['pagos.ver', 'pagos.aprobar', 'pagos.exportar']
    }
    return HttpResponse.json({
      data: { ...role, permisos },
      meta: { trace_id: 'test-trace-role-detail' },
    })
  }),

  http.post('*/authorization/roles', async ({ request }) => {
    const body = (await request.json()) as { nombre?: string }
    return HttpResponse.json(
      {
        data: {
          id: 'role-new-001',
          nombre: body.nombre ?? 'Nuevo rol',
          codigo: null,
          descripcion: null,
          es_sistema: false,
          nivel_alcance: 'condominium',
          usuarios_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        meta: { trace_id: 'test-trace-role-create' },
      },
      { status: 201 },
    )
  }),

  http.patch('*/authorization/roles/:id', async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>
    const role = MOCK_ROLES.find((r) => r.id === params.id)
    if (!role) {
      return HttpResponse.json(
        {
          error: {
            code: 'ROLE_NOT_FOUND',
            message: 'Rol no encontrado',
            trace_id: 'test-trace-role-not-found',
          },
        },
        { status: 404 },
      )
    }
    return HttpResponse.json({
      data: { ...role, ...body, updated_at: new Date().toISOString() },
      meta: { trace_id: 'test-trace-role-update' },
    })
  }),

  http.put('*/authorization/roles/:id/permissions', async ({ params, request }) => {
    const body = (await request.json()) as { permissions?: string[] }
    return HttpResponse.json({
      data: {
        id: params.id,
        permisos: body.permissions ?? [],
        updated_at: new Date().toISOString(),
      },
      meta: { trace_id: 'test-trace-role-permissions' },
    })
  }),

  // ─── Catálogo de permisos ──────────────────────────────────────────────
  http.get('*/authorization/permissions', () =>
    HttpResponse.json({
      data: MOCK_PERMISSIONS,
      meta: { trace_id: 'test-trace-permissions' },
    }),
  ),

  // ─── Asignaciones ─────────────────────────────────────────────────────
  http.post('*/authorization/assignments', () =>
    HttpResponse.json(
      {
        data: { id: 'assign-new-001' },
        meta: { trace_id: 'test-trace-assignment-create' },
      },
      { status: 201 },
    ),
  ),

  http.delete('*/authorization/assignments/:id', () => new HttpResponse(null, { status: 204 })),

  // ─── Reglas de aprobación ──────────────────────────────────────────────
  http.get('*/authorization/approval-rules', () =>
    HttpResponse.json({
      data: MOCK_APPROVAL_RULES,
      meta: { trace_id: 'test-trace-approval-rules' },
    }),
  ),

  http.post('*/authorization/approval-rules', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>
    return HttpResponse.json(
      {
        data: {
          id: 'ar-new-001',
          ...body,
          approver_role: { id: 'role-admin-001', name: 'Administrador' },
          created_at: new Date().toISOString(),
        },
        meta: { trace_id: 'test-trace-approval-rule-create' },
      },
      { status: 201 },
    )
  }),

  // ─── Bitácora de auditoría ─────────────────────────────────────────────
  http.get('*/authorization/audit', () =>
    HttpResponse.json({
      data: MOCK_AUDIT,
      meta: {
        trace_id: 'test-trace-audit',
        current_page: 1,
        per_page: 20,
        total: MOCK_AUDIT.length,
        last_page: 1,
      },
    }),
  ),

  // ─── Usuarios del panel ────────────────────────────────────────────────
  http.get('*/authorization/users', () =>
    HttpResponse.json({
      data: MOCK_USERS,
      meta: { trace_id: 'test-trace-panel-users' },
    }),
  ),
]
