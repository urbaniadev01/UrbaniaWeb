import { http, HttpResponse } from 'msw'

export const authHandlers = [
  http.post('*/auth/login', async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string }

    // Simular MFA requerido
    if (body.email === 'mfa@urbania.com') {
      return HttpResponse.json(
        {
          error: {
            code: 'MFA_REQUIRED',
            message: 'MFA requerido, verificación pendiente',
            trace_id: 'test-trace-mfa',
          },
        },
        { status: 401 },
      )
    }

    // Simular credenciales inválidas
    if (body.password === 'wrong') {
      return HttpResponse.json(
        {
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Las credenciales proporcionadas son incorrectas',
            trace_id: 'test-trace-invalid',
          },
        },
        { status: 401 },
      )
    }

    return HttpResponse.json({
      data: {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        token_type: 'bearer',
        expires_in: 900,
        user: {
          id: '00000000-0000-0000-0000-000000000001',
          name: 'Admin Urbania',
          email: 'admin@urbania.com',
          role: 'admin',
          status: 'active',
          mfa_enabled: false,
          phone: null,
          unit: null,
          avatar_url: null,
        },
      },
      meta: { trace_id: 'test-trace-login' },
    })
  }),

  http.post('*/auth/refresh', async ({ request }) => {
    const body = (await request.json()) as { refresh_token: string }

    if (!body.refresh_token) {
      return HttpResponse.json(
        {
          error: {
            code: 'TOKEN_INVALID',
            message: 'Token inválido',
            trace_id: 'test-trace-refresh-invalid',
          },
        },
        { status: 401 },
      )
    }

    return HttpResponse.json({
      data: {
        access_token: 'new-mock-access-token',
        refresh_token: 'new-mock-refresh-token',
        token_type: 'bearer',
        expires_in: 900,
      },
      meta: { trace_id: 'test-trace-refresh' },
    })
  }),

  http.get('*/auth/me', () =>
    HttpResponse.json({
      data: {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Admin Urbania',
        email: 'admin@urbania.com',
        role: 'admin',
        status: 'active',
        mfa_enabled: false,
        phone: null,
        unit: null,
        avatar_url: null,
      },
      meta: { trace_id: 'test-trace-me' },
    }),
  ),

  http.post('*/auth/logout', () => new HttpResponse(null, { status: 204 })),

  http.post('*/auth/mfa/verify', async ({ request }) => {
    const body = (await request.json()) as { code: string }

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

    return HttpResponse.json({
      data: {
        access_token: 'mock-access-token-mfa',
        refresh_token: 'mock-refresh-token-mfa',
        token_type: 'bearer',
        expires_in: 900,
        user: {
          id: '00000000-0000-0000-0000-000000000001',
          name: 'Admin Urbania',
          email: 'admin@urbania.com',
          role: 'admin',
          status: 'active',
          mfa_enabled: true,
          phone: null,
          unit: null,
          avatar_url: null,
        },
      },
      meta: { trace_id: 'test-trace-mfa-verify' },
    })
  }),

  http.post('*/auth/mfa/verify-backup', async ({ request }) => {
    const body = (await request.json()) as { code: string }

    if (body.code === '00000000') {
      return HttpResponse.json(
        {
          error: {
            code: 'MFA_BACKUP_USED',
            message: 'Código de respaldo ya utilizado',
            trace_id: 'test-trace-backup-used',
          },
        },
        { status: 401 },
      )
    }

    return HttpResponse.json({
      data: {
        access_token: 'mock-access-token-backup',
        refresh_token: 'mock-refresh-token-backup',
        token_type: 'bearer',
        expires_in: 900,
        user: {
          id: '00000000-0000-0000-0000-000000000001',
          name: 'Admin Urbania',
          email: 'admin@urbania.com',
          role: 'admin',
          status: 'active',
          mfa_enabled: true,
          phone: null,
          unit: null,
          avatar_url: null,
        },
      },
      meta: { trace_id: 'test-trace-backup-verify' },
    })
  }),
]
