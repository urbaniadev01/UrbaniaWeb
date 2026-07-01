import { http, HttpResponse } from 'msw'

/**
 * Handlers MSW para los endpoints del feature Directorio.
 * Coinciden con la convención del backend en /contacts,
 * /properties/:id/occupants, /property-occupants/:id y /occupant-types.
 */

// ─── Datos mock ──────────────────────────────────────────────────────────

const MOCK_CONTACTS = [
  {
    id: 'contact-001',
    full_name: 'Carlos López',
    document_type: 'CC',
    document_number: '12345678',
    email: 'carlos@example.com',
    phone: '3001234567',
    emergency_contact_name: null,
    emergency_contact_phone: null,
    notes: null,
    user_id: 'user-001',
    created_at: '2026-06-01T00:00:00Z',
    updated_at: '2026-06-01T00:00:00Z',
  },
  {
    id: 'contact-002',
    full_name: 'María García',
    document_type: 'CC',
    document_number: '87654321',
    email: 'maria@example.com',
    phone: '3007654321',
    emergency_contact_name: 'Pedro García',
    emergency_contact_phone: '3001112233',
    notes: 'Propietaria',
    user_id: null,
    created_at: '2026-06-01T00:00:00Z',
    updated_at: '2026-06-01T00:00:00Z',
  },
]

const MOCK_OCCUPANT_TYPES = [
  { id: 'otype-001', code: 'propietario', name: 'Propietario', sort_order: 1 },
  { id: 'otype-002', code: 'residente', name: 'Residente', sort_order: 2 },
  { id: 'otype-003', code: 'inquilino', name: 'Inquilino', sort_order: 3 },
]

const MOCK_CONTACT_DETAIL = {
  ...MOCK_CONTACTS[0],
  properties: [
    {
      id: 'occ-001',
      property_id: 'prop-001',
      contact_id: 'contact-001',
      occupant_type_id: 'otype-001',
      occupant_type: {
        id: 'otype-001',
        code: 'propietario',
        name: 'Propietario',
        sort_order: 1,
      },
      contact: MOCK_CONTACTS[0],
      is_primary: true,
      is_active: true,
      move_in_date: '2024-01-01',
      move_out_date: null,
      created_at: '2024-01-01T00:00:00Z',
    },
  ],
}

const MOCK_OCCUPANTS = [
  {
    id: 'occ-001',
    property_id: 'prop-001',
    contact_id: 'contact-001',
    occupant_type_id: 'otype-001',
    occupant_type: {
      id: 'otype-001',
      code: 'propietario',
      name: 'Propietario',
      sort_order: 1,
    },
    contact: MOCK_CONTACTS[0],
    is_primary: true,
    is_active: true,
    move_in_date: '2024-01-01',
    move_out_date: null,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'occ-002',
    property_id: 'prop-001',
    contact_id: 'contact-002',
    occupant_type_id: 'otype-002',
    occupant_type: {
      id: 'otype-002',
      code: 'residente',
      name: 'Residente',
      sort_order: 2,
    },
    contact: MOCK_CONTACTS[1],
    is_primary: false,
    is_active: true,
    move_in_date: '2024-02-15',
    move_out_date: null,
    created_at: '2024-02-15T00:00:00Z',
  },
]

// ─── Handlers ────────────────────────────────────────────────────────────

export const directorioHandlers = [
  // ─── Occupant types (catálogo autenticado) ────────────────────────────

  http.get('*/occupant-types', () =>
    HttpResponse.json({
      data: MOCK_OCCUPANT_TYPES,
      meta: { trace_id: 'test-trace-occupant-types' },
    }),
  ),

  // ─── Contacts CRUD ────────────────────────────────────────────────────

  http.get('*/contacts', ({ request }) => {
    const url = new URL(request.url)
    const fullName = url.searchParams.get('full_name')?.toLowerCase()
    const documentType = url.searchParams.get('document_type')
    const documentNumber = url.searchParams.get('document_number')

    const filtered = MOCK_CONTACTS.filter((c) => {
      if (fullName && !c.full_name.toLowerCase().includes(fullName)) return false
      if (documentType && c.document_type !== documentType) return false
      if (documentNumber && !c.document_number.includes(documentNumber)) return false
      return true
    })

    return HttpResponse.json({
      data: filtered,
      meta: {
        trace_id: 'test-trace-contacts-list',
        current_page: 1,
        per_page: 20,
        total: filtered.length,
        last_page: 1,
      },
    })
  }),

  http.get('*/contacts/:id', ({ params }) => {
    if (params.id === 'contact-001') {
      return HttpResponse.json({
        data: MOCK_CONTACT_DETAIL,
        meta: { trace_id: 'test-trace-contact-detail' },
      })
    }
    if (params.id === 'contact-002') {
      return HttpResponse.json({
        data: { ...MOCK_CONTACTS[1], properties: [] },
        meta: { trace_id: 'test-trace-contact-detail' },
      })
    }
    return HttpResponse.json(
      {
        error: {
          code: 'CONTACT_NOT_FOUND',
          message: 'Contacto no encontrado',
          trace_id: 'test-trace-contact-not-found',
        },
      },
      { status: 404 },
    )
  }),

  http.post('*/contacts', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>
    return HttpResponse.json(
      {
        data: { id: 'contact-new-001', ...body },
        meta: { trace_id: 'test-trace-contact-create' },
      },
      { status: 201 },
    )
  }),

  http.patch('*/contacts/:id', async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>
    const contact = MOCK_CONTACTS.find((c) => c.id === params.id)
    return HttpResponse.json({
      data: { ...(contact ?? MOCK_CONTACTS[0]), ...body, updated_at: new Date().toISOString() },
      meta: { trace_id: 'test-trace-contact-update' },
    })
  }),

  http.delete('*/contacts/:id', () => new HttpResponse(null, { status: 204 })),

  // ─── Property occupants ───────────────────────────────────────────────

  http.get('*/properties/:propertyId/occupants', ({ params }) => {
    const occupants = MOCK_OCCUPANTS.filter((o) => o.property_id === params.propertyId)
    return HttpResponse.json({
      data: occupants,
      meta: {
        trace_id: 'test-trace-occupants-list',
        current_page: 1,
        per_page: 20,
        total: occupants.length,
        last_page: 1,
      },
    })
  }),

  http.post('*/properties/:propertyId/occupants', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>
    return HttpResponse.json(
      {
        data: { id: 'occ-new-001', ...body },
        meta: { trace_id: 'test-trace-occupant-link' },
      },
      { status: 201 },
    )
  }),

  http.patch('*/property-occupants/:id', async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>
    const occupant = MOCK_OCCUPANTS.find((o) => o.id === params.id)
    return HttpResponse.json({
      data: { ...(occupant ?? MOCK_OCCUPANTS[0]), ...body },
      meta: { trace_id: 'test-trace-occupant-update' },
    })
  }),

  http.delete('*/property-occupants/:id', () => new HttpResponse(null, { status: 204 })),
]
