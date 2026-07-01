import { http, HttpResponse } from 'msw'

/**
 * Handlers MSW para los endpoints del feature Propiedades y Unidades.
 * Coinciden con la convención del backend en /properties, /towers,
 * /property-types, /property-statuses y /property-document-types.
 *
 * Source of truth: PROPIEDADES_SPEC.md (Sesión 4) y API_CONTRACT.
 */

// ─── Datos mock ──────────────────────────────────────────────────────────

const MOCK_PROPERTIES = [
  {
    id: 'prop-001',
    condominium_id: 'condo-001',
    condominium_name: 'Conjunto Residencial Urbania',
    tower: { id: 'tower-001', name: 'Torre 1', code: 'T1' },
    type: { id: 'type-001', code: 'apartamento', name: 'Apartamento' },
    status: { id: 'status-001', code: 'ocupada', name: 'Ocupada' },
    floor: 3,
    unit_number: '301',
    full_designation: 'T1 - 301',
    area_m2: '85.50',
    coefficient: '0.050000',
    bedrooms: 3,
    bathrooms: 2,
    has_parking: true,
    parking_lot: 'P-12',
    notes: null,
    residents_count: 2,
    documents_count: 1,
    created_at: '2026-06-01T00:00:00Z',
    updated_at: '2026-06-01T00:00:00Z',
  },
  {
    id: 'prop-002',
    condominium_id: 'condo-001',
    condominium_name: 'Conjunto Residencial Urbania',
    tower: { id: 'tower-001', name: 'Torre 1', code: 'T1' },
    type: { id: 'type-001', code: 'apartamento', name: 'Apartamento' },
    status: { id: 'status-002', code: 'vacia', name: 'Vacía' },
    floor: 3,
    unit_number: '302',
    full_designation: 'T1 - 302',
    area_m2: '75.00',
    coefficient: '0.045000',
    bedrooms: 2,
    bathrooms: 1,
    has_parking: false,
    parking_lot: null,
    notes: null,
    residents_count: 0,
    documents_count: 0,
    created_at: '2026-06-01T00:00:00Z',
    updated_at: '2026-06-01T00:00:00Z',
  },
]

const MOCK_TOWERS = [
  {
    id: 'tower-001',
    condominium_id: 'condo-001',
    condominium_name: 'Conjunto Residencial Urbania',
    name: 'Torre 1',
    code: 'T1',
    floor_count: 10,
    has_elevator: true,
    description: null,
    sort_order: 1,
    stats: { total_units: 20, occupied_units: 15, vacant_units: 5 },
    created_at: '2026-06-01T00:00:00Z',
    updated_at: '2026-06-01T00:00:00Z',
  },
  {
    id: 'tower-002',
    condominium_id: 'condo-001',
    condominium_name: 'Conjunto Residencial Urbania',
    name: 'Torre 2',
    code: 'T2',
    floor_count: 8,
    has_elevator: true,
    description: null,
    sort_order: 2,
    stats: { total_units: 16, occupied_units: 10, vacant_units: 6 },
    created_at: '2026-06-01T00:00:00Z',
    updated_at: '2026-06-01T00:00:00Z',
  },
]

const MOCK_PROPERTY_TYPES = [
  {
    id: 'type-001',
    code: 'apartamento',
    name: 'Apartamento',
    description: null,
    sort_order: 1,
    is_active: true,
    properties_count: 10,
  },
  {
    id: 'type-002',
    code: 'local',
    name: 'Local Comercial',
    description: null,
    sort_order: 2,
    is_active: true,
    properties_count: 2,
  },
]

const MOCK_PROPERTY_STATUSES = [
  {
    id: 'status-001',
    code: 'ocupada',
    name: 'Ocupada',
    description: null,
    allows_residents: true,
    is_active: true,
    sort_order: 1,
    properties_count: 5,
  },
  {
    id: 'status-002',
    code: 'vacia',
    name: 'Vacía',
    description: null,
    allows_residents: false,
    is_active: true,
    sort_order: 2,
    properties_count: 3,
  },
]

const MOCK_DOCUMENT_TYPES = [
  {
    id: 'doctype-001',
    code: 'escritura',
    name: 'Escritura',
    description: null,
    sort_order: 1,
    is_active: true,
  },
]

// ─── Handlers ────────────────────────────────────────────────────────────

export const propiedadesHandlers = [
  // ─── Properties CRUD ──────────────────────────────────────────────────

  http.get('*/properties', () =>
    HttpResponse.json({
      data: MOCK_PROPERTIES,
      meta: {
        trace_id: 'test-trace-properties-list',
        current_page: 1,
        per_page: 15,
        total: MOCK_PROPERTIES.length,
        last_page: 1,
      },
    }),
  ),

  http.get('*/properties/:id', ({ params }) => {
    const property = MOCK_PROPERTIES.find((p) => p.id === params.id)
    if (!property) {
      return HttpResponse.json(
        {
          error: {
            code: 'PROPERTY_NOT_FOUND',
            message: 'Unidad no encontrada',
            trace_id: 'test-trace-property-not-found',
          },
        },
        { status: 404 },
      )
    }
    return HttpResponse.json({
      data: property,
      meta: { trace_id: 'test-trace-property-detail' },
    })
  }),

  http.post('*/properties', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>
    return HttpResponse.json(
      {
        data: { id: 'prop-new-001', ...body },
        meta: { trace_id: 'test-trace-property-create' },
      },
      { status: 201 },
    )
  }),

  http.patch('*/properties/:id', async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>
    const property = MOCK_PROPERTIES.find((p) => p.id === params.id)
    if (!property) {
      return HttpResponse.json(
        {
          error: {
            code: 'PROPERTY_NOT_FOUND',
            message: 'Unidad no encontrada',
            trace_id: 'test-trace-property-not-found',
          },
        },
        { status: 404 },
      )
    }
    return HttpResponse.json({
      data: { ...property, ...body, updated_at: new Date().toISOString() },
      meta: { trace_id: 'test-trace-property-update' },
    })
  }),

  http.delete('*/properties/:id', () => new HttpResponse(null, { status: 204 })),

  // ─── Property status ──────────────────────────────────────────────────

  http.patch('*/properties/:id/status', async ({ params, request }) => {
    const body = (await request.json()) as { property_status_id?: string; reason?: string }
    const property = MOCK_PROPERTIES.find((p) => p.id === params.id)
    if (!property) {
      return HttpResponse.json(
        {
          error: {
            code: 'PROPERTY_NOT_FOUND',
            message: 'Unidad no encontrada',
            trace_id: 'test-trace-property-not-found',
          },
        },
        { status: 404 },
      )
    }
    const newStatus = MOCK_PROPERTY_STATUSES.find(
      (s) => s.id === body.property_status_id,
    ) ?? {
      id: body.property_status_id ?? 'status-new',
      code: 'nuevo',
      name: 'Nuevo Estado',
    }
    return HttpResponse.json({
      data: { ...property, status: newStatus },
      meta: { trace_id: 'test-trace-property-status' },
    })
  }),

  http.get('*/properties/:id/status-log', () =>
    HttpResponse.json({
      data: [
        {
          id: 'log-001',
          from_status: { id: 'status-002', code: 'vacia', name: 'Vacía' },
          to_status: { id: 'status-001', code: 'ocupada', name: 'Ocupada' },
          changed_by: { id: 'user-001', name: 'Admin' },
          reason: 'Cambio de estado',
          created_at: '2026-06-01T00:00:00Z',
        },
      ],
      meta: {
        trace_id: 'test-trace-property-status-log',
        current_page: 1,
        per_page: 15,
        total: 1,
        last_page: 1,
      },
    }),
  ),

  // ─── Coefficient validation ───────────────────────────────────────────

  http.get('*/condominiums/:id/coefficient-validation', () =>
    HttpResponse.json({
      data: {
        condominium_id: 'condo-001',
        condominium_name: 'Conjunto Residencial Urbania',
        total_coefficient_expected: '1.000000',
        total_coefficient_sum: '1.000000',
        difference: '0.000000',
        is_balanced: true,
        total_units: 20,
        units_with_coefficient_zero: 0,
        warnings: [],
        checked_at: '2026-06-01T00:00:00Z',
      },
      meta: { trace_id: 'test-trace-coefficient' },
    }),
  ),

  // ─── Documents ────────────────────────────────────────────────────────

  http.get('*/properties/:id/documents', () =>
    HttpResponse.json({
      data: [
        {
          id: 'doc-001',
          document_type: { id: 'doctype-001', code: 'escritura', name: 'Escritura' },
          name: 'Escritura Pública.pdf',
          file_url: '/storage/docs/doc-001.pdf',
          file_size_bytes: 1024000,
          mime_type: 'application/pdf',
          notes: null,
          uploaded_by: { id: 'user-001', name: 'Admin' },
          created_at: '2026-06-01T00:00:00Z',
        },
      ],
      meta: { trace_id: 'test-trace-documents' },
    }),
  ),

  http.post('*/properties/:id/documents', () =>
    HttpResponse.json(
      {
        data: {
          id: 'doc-new-001',
          document_type: { id: 'doctype-001', code: 'escritura', name: 'Escritura' },
          name: 'Nuevo Documento.pdf',
          file_url: '/storage/docs/doc-new-001.pdf',
          file_size_bytes: 512000,
          mime_type: 'application/pdf',
          notes: null,
          uploaded_by: { id: 'user-001', name: 'Admin' },
          created_at: new Date().toISOString(),
        },
        meta: { trace_id: 'test-trace-document-upload' },
      },
      { status: 201 },
    ),
  ),

  http.delete(
    '*/properties/:id/documents/:docId',
    () => new HttpResponse(null, { status: 204 }),
  ),

  // ─── Towers ───────────────────────────────────────────────────────────

  http.get('*/condominiums/:condominiumId/towers', () =>
    HttpResponse.json({
      data: MOCK_TOWERS,
      meta: {
        trace_id: 'test-trace-towers-list',
        current_page: 1,
        per_page: 15,
        total: MOCK_TOWERS.length,
        last_page: 1,
      },
    }),
  ),

  http.post('*/towers', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>
    return HttpResponse.json(
      {
        data: { id: 'tower-new-001', ...body },
        meta: { trace_id: 'test-trace-tower-create' },
      },
      { status: 201 },
    )
  }),

  http.patch('*/towers/:id', async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>
    const tower = MOCK_TOWERS.find((t) => t.id === params.id)
    if (!tower) {
      return HttpResponse.json(
        {
          error: {
            code: 'TOWER_NOT_FOUND',
            message: 'Torre no encontrada',
            trace_id: 'test-trace-tower-not-found',
          },
        },
        { status: 404 },
      )
    }
    return HttpResponse.json({
      data: { ...tower, ...body, updated_at: new Date().toISOString() },
      meta: { trace_id: 'test-trace-tower-update' },
    })
  }),

  http.delete('*/towers/:id', () => new HttpResponse(null, { status: 204 })),

  // ─── Catalogs: Property Types ─────────────────────────────────────────

  http.get('*/property-types', () =>
    HttpResponse.json({
      data: MOCK_PROPERTY_TYPES,
      meta: {
        trace_id: 'test-trace-property-types',
        current_page: 1,
        per_page: 15,
        total: MOCK_PROPERTY_TYPES.length,
        last_page: 1,
      },
    }),
  ),

  http.get('*/property-types/all', () =>
    HttpResponse.json({
      data: MOCK_PROPERTY_TYPES,
      meta: { trace_id: 'test-trace-property-types-all' },
    }),
  ),

  http.post('*/property-types', () =>
    HttpResponse.json(
      {
        data: { id: 'type-new-001' },
        meta: { trace_id: 'test-trace-property-type-create' },
      },
      { status: 201 },
    ),
  ),

  http.patch('*/property-types/:id', async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>
    const type = MOCK_PROPERTY_TYPES.find((t) => t.id === params.id)
    return HttpResponse.json({
      data: { ...(type ?? MOCK_PROPERTY_TYPES[0]), ...body },
      meta: { trace_id: 'test-trace-property-type-update' },
    })
  }),

  http.delete('*/property-types/:id', () => new HttpResponse(null, { status: 204 })),

  // ─── Catalogs: Property Statuses ──────────────────────────────────────

  http.get('*/property-statuses', () =>
    HttpResponse.json({
      data: MOCK_PROPERTY_STATUSES,
      meta: {
        trace_id: 'test-trace-property-statuses',
        current_page: 1,
        per_page: 15,
        total: MOCK_PROPERTY_STATUSES.length,
        last_page: 1,
      },
    }),
  ),

  http.get('*/property-statuses/all', () =>
    HttpResponse.json({
      data: MOCK_PROPERTY_STATUSES,
      meta: { trace_id: 'test-trace-property-statuses-all' },
    }),
  ),

  http.post('*/property-statuses', () =>
    HttpResponse.json(
      {
        data: { id: 'status-new-001' },
        meta: { trace_id: 'test-trace-property-status-create' },
      },
      { status: 201 },
    ),
  ),

  http.patch('*/property-statuses/:id', async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>
    const status = MOCK_PROPERTY_STATUSES.find((s) => s.id === params.id)
    return HttpResponse.json({
      data: { ...(status ?? MOCK_PROPERTY_STATUSES[0]), ...body },
      meta: { trace_id: 'test-trace-property-status-update' },
    })
  }),

  http.delete(
    '*/property-statuses/:id',
    () => new HttpResponse(null, { status: 204 }),
  ),

  // ─── Catalogs: Document Types ─────────────────────────────────────────

  http.get('*/property-document-types', () =>
    HttpResponse.json({
      data: MOCK_DOCUMENT_TYPES,
      meta: {
        trace_id: 'test-trace-doc-types',
        current_page: 1,
        per_page: 15,
        total: MOCK_DOCUMENT_TYPES.length,
        last_page: 1,
      },
    }),
  ),

  http.get('*/property-document-types/all', () =>
    HttpResponse.json({
      data: MOCK_DOCUMENT_TYPES,
      meta: { trace_id: 'test-trace-doc-types-all' },
    }),
  ),

  http.post('*/property-document-types', () =>
    HttpResponse.json(
      {
        data: { id: 'doctype-new-001' },
        meta: { trace_id: 'test-trace-doc-type-create' },
      },
      { status: 201 },
    ),
  ),

  http.patch('*/property-document-types/:id', async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>
    const docType = MOCK_DOCUMENT_TYPES.find((d) => d.id === params.id)
    return HttpResponse.json({
      data: { ...(docType ?? MOCK_DOCUMENT_TYPES[0]), ...body },
      meta: { trace_id: 'test-trace-doc-type-update' },
    })
  }),

  http.delete(
    '*/property-document-types/:id',
    () => new HttpResponse(null, { status: 204 }),
  ),
]
