import { http, HttpResponse } from 'msw'

/**
 * Handlers MSW para los endpoints del feature Configuración.
 * Coinciden con los endpoints del backend (ver §C de la spec del feature 3).
 */

const MOCK_PROFILE = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'admin@urbania.com',
  name: 'Admin Urbania',
  phone: '+57 300 123 4567',
  avatar_url: null,
  mfa_enabled: false,
  organization_id: '00000000-0000-0000-0000-0000000000a1',
  role: 'admin',
  status: 'active',
}

const MOCK_SESSIONS = [
  {
    id: 'sess-current-001',
    device_name: 'Chrome en macOS',
    ip_address: '192.168.1.10',
    last_used_at: new Date().toISOString(),
    is_current: true,
  },
  {
    id: 'sess-002',
    device_name: 'Safari en iPhone',
    ip_address: '10.0.0.5',
    last_used_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    is_current: false,
  },
  {
    id: 'sess-003',
    device_name: null,
    ip_address: '186.116.5.20',
    last_used_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    is_current: false,
  },
]

const MOCK_MFA_SETUP = {
  secret: 'JBSWY3DPEHPK3PXP',
  qr_code_url:
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciLz4=',
  backup_codes: [
    'ABCD-1234',
    'EFGH-5678',
    'IJKL-9012',
    'MNOP-3456',
    'QRST-7890',
    'UVWX-1234',
    'YZAB-5678',
    'CDEF-9012',
    'GHIJ-3456',
    'KLMN-7890',
  ],
}

export const accountHandlers = [
  // ─── Profile ───────────────────────────────────────────────────────────
  http.get('*/auth/me', () =>
    HttpResponse.json({
      data: MOCK_PROFILE,
      meta: { trace_id: 'test-trace-me' },
    }),
  ),

  http.patch('*/auth/profile', async ({ request }) => {
    const body = (await request.json()) as Partial<typeof MOCK_PROFILE>
    return HttpResponse.json({
      data: { ...MOCK_PROFILE, ...body },
      meta: { trace_id: 'test-trace-profile-update' },
    })
  }),

  // ─── Change password ───────────────────────────────────────────────────
  http.post('*/auth/change-password', async ({ request }) => {
    const body = (await request.json()) as { new_password?: string; current_password?: string }

    // Simular "contraseña reutilizada"
    if (body.new_password === 'Reused2024!') {
      return HttpResponse.json(
        {
          error: {
            code: 'PASSWORD_REUSED',
            message: 'No puedes reutilizar una de tus últimas 12 contraseñas',
            trace_id: 'test-trace-password-reused',
          },
        },
        { status: 422 },
      )
    }

    // Simular "contraseña actual incorrecta"
    if (body.current_password === 'wrong-current') {
      return HttpResponse.json(
        {
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'La contraseña actual es incorrecta',
            trace_id: 'test-trace-wrong-current',
          },
        },
        { status: 401 },
      )
    }

    return new HttpResponse(null, { status: 204 })
  }),

  // ─── Sessions ──────────────────────────────────────────────────────────
  http.get('*/auth/sessions', () =>
    HttpResponse.json({
      data: MOCK_SESSIONS,
      meta: { trace_id: 'test-trace-sessions' },
    }),
  ),

  http.delete('*/auth/sessions/:id', ({ params }) => {
    if (params.id === 'sess-002' || params.id === 'sess-003') {
      return new HttpResponse(null, { status: 204 })
    }
    return HttpResponse.json(
      {
        error: {
          code: 'SESSION_NOT_FOUND',
          message: 'Sesión no encontrada',
          trace_id: 'test-trace-session-not-found',
        },
      },
      { status: 404 },
    )
  }),

  http.delete('*/auth/sessions', () => new HttpResponse(null, { status: 204 })),

  // ─── MFA ───────────────────────────────────────────────────────────────
  http.post('*/auth/mfa/setup', () =>
    HttpResponse.json({
      data: MOCK_MFA_SETUP,
      meta: { trace_id: 'test-trace-mfa-setup' },
    }),
  ),

  http.post('*/auth/mfa/enable', async ({ request }) => {
    const body = (await request.json()) as { code?: string }
    if (body.code === '000000') {
      return HttpResponse.json(
        {
          error: {
            code: 'MFA_INVALID_CODE',
            message: 'Código TOTP incorrecto',
            trace_id: 'test-trace-mfa-invalid',
          },
        },
        { status: 401 },
      )
    }
    return new HttpResponse(null, { status: 204 })
  }),

  http.post('*/auth/mfa/disable', async ({ request }) => {
    const body = (await request.json()) as { code?: string; password?: string }
    if (body.code === '000000') {
      return HttpResponse.json(
        {
          error: {
            code: 'MFA_INVALID_CODE',
            message: 'Código TOTP incorrecto',
            trace_id: 'test-trace-mfa-disable-invalid',
          },
        },
        { status: 401 },
      )
    }
    if (body.password === 'wrong') {
      return HttpResponse.json(
        {
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'La contraseña es incorrecta',
            trace_id: 'test-trace-mfa-disable-wrong',
          },
        },
        { status: 401 },
      )
    }
    return new HttpResponse(null, { status: 204 })
  }),

  http.post('*/auth/mfa/backup-codes', () =>
    HttpResponse.json({
      data: MOCK_MFA_SETUP,
      meta: { trace_id: 'test-trace-mfa-backup-codes' },
    }),
  ),
]
