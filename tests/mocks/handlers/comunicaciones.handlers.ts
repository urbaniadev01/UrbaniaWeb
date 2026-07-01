import { http, HttpResponse } from 'msw'

/**
 * Handlers MSW para los endpoints del feature Comunicaciones.
 * Coinciden con la convención del backend en /api/v1/comunicaciones/*.
 */

// ─── Mocks ──────────────────────────────────────────────────────────────

const MOCK_ANNOUNCEMENTS = [
  {
    id: 'ann-1',
    titulo: 'Corte de agua programado',
    cuerpo: 'Mañana no habrá agua entre 8am y 12pm. Recomendamos almacenar agua.',
    segmento: 'todos',
    target_id: null,
    estado: 'enviado',
    programado_para: null,
    fijado: true,
    canales: ['email', 'whatsapp'],
    metrics: { enviados: 120, entregados: 118, leidos: 87 },
    created_at: '2026-06-20T08:00:00Z',
    updated_at: '2026-06-20T08:00:05Z',
  },
  {
    id: 'ann-2',
    titulo: 'Asamblea general de copropietarios',
    cuerpo: 'Convocatoria a la asamblea anual el próximo 15 de julio a las 7pm.',
    segmento: 'torre',
    target_id: '00000000-0000-0000-0000-000000000010',
    estado: 'programado',
    programado_para: '2026-07-10T19:00:00Z',
    fijado: false,
    canales: ['email'],
    metrics: { enviados: 0, entregados: 0, leidos: 0 },
    created_at: '2026-06-25T14:30:00Z',
    updated_at: '2026-06-25T14:30:00Z',
  },
  {
    id: 'ann-3',
    titulo: 'Borrador — limpieza de tanque',
    cuerpo: 'Se realizará limpieza del tanque de reserva el sábado.',
    segmento: 'todos',
    target_id: null,
    estado: 'borrador',
    programado_para: null,
    fijado: false,
    canales: ['push'],
    created_at: '2026-06-28T10:00:00Z',
    updated_at: '2026-06-28T10:00:00Z',
  },
]

const MOCK_DELIVERIES_ANN1 = [
  {
    id: 'd-1',
    contact_id: 'c-1',
    contact_name: 'Juan Pérez',
    canal: 'email',
    estado: 'entregado',
  },
  {
    id: 'd-2',
    contact_id: 'c-2',
    contact_name: 'María López',
    canal: 'whatsapp',
    estado: 'leido',
  },
  {
    id: 'd-3',
    contact_id: 'c-3',
    contact_name: 'Carlos Ruiz',
    canal: 'email',
    estado: 'entregado',
  },
]

const MOCK_TEMPLATES = [
  {
    id: 'tpl-1',
    nombre: 'Corte de servicios',
    tipo: 'mantenimiento',
    cuerpo:
      'Estimado residente, le informamos que se interrumpirá el servicio de {servicio} el día {fecha} entre {hora_inicio} y {hora_fin}.',
    created_at: '2026-05-10T09:00:00Z',
    updated_at: '2026-05-10T09:00:00Z',
  },
  {
    id: 'tpl-2',
    nombre: 'Convocatoria asamblea',
    tipo: 'asamblea',
    cuerpo:
      'Se convoca a la {tipo_asamblea} de copropietarios el {fecha} a las {hora} en {lugar}.',
    created_at: '2026-05-15T11:00:00Z',
    updated_at: '2026-05-15T11:00:00Z',
  },
]

const MOCK_SURVEYS = [
  {
    id: 'srv-1',
    pregunta: '¿Aprobamos la instalación de cámaras adicionales?',
    tipo: 'multiple',
    cierra_el: '2026-07-15T23:59:59Z',
    activa: true,
    opciones: [
      { id: 'opt-1', texto: 'Sí', orden: 1, responses_count: 45 },
      { id: 'opt-2', texto: 'No', orden: 2, responses_count: 12 },
      { id: 'opt-3', texto: 'Me abstengo', orden: 3, responses_count: 3 },
    ],
  },
  {
    id: 'srv-2',
    pregunta: '¿Qué día prefiere para la reunión mensual?',
    tipo: 'simple',
    cierra_el: null,
    activa: true,
    opciones: [
      { id: 'opt-4', texto: 'Primer lunes', orden: 1, responses_count: 8 },
      { id: 'opt-5', texto: 'Último viernes', orden: 2, responses_count: 15 },
    ],
  },
]

const MOCK_SURVEY_RESULTS: Record<string, { total: number; cerrada: boolean }> = {
  'srv-1': { total: 60, cerrada: false },
  'srv-2': { total: 23, cerrada: false },
}

const MOCK_CHANNELS = [
  {
    id: 'ch-1',
    canal: 'whatsapp',
    provider: 'twilio',
    activo: true,
  },
  {
    id: 'ch-2',
    canal: 'email',
    provider: 'sendgrid',
    activo: true,
  },
  {
    id: 'ch-3',
    canal: 'push',
    provider: 'fcm',
    activo: false,
  },
]

// ─── Handlers ───────────────────────────────────────────────────────────

export const comunicacionesHandlers = [
  // ─── Announcements ───────────────────────────────────────────────────

  http.get('*/comunicaciones/announcements', ({ request }) => {
    const url = new URL(request.url)
    const estado = url.searchParams.get('estado')
    const segmento = url.searchParams.get('segmento')
    const items = MOCK_ANNOUNCEMENTS.filter((a) => {
      if (estado && a.estado !== estado) return false
      if (segmento && a.segmento !== segmento) return false
      return true
    })
    return HttpResponse.json({
      data: items,
      meta: {
        trace_id: 'test-trace-ann-list',
        current_page: 1,
        per_page: 20,
        total: items.length,
        last_page: 1,
      },
    })
  }),

  http.get('*/comunicaciones/announcements/:id', ({ params }) => {
    const ann = MOCK_ANNOUNCEMENTS.find((a) => a.id === params.id)
    if (!ann) {
      return HttpResponse.json(
        {
          error: {
            code: 'ANNOUNCEMENT_NOT_FOUND',
            message: 'Comunicado no encontrado',
            trace_id: 'test-trace-ann-not-found',
          },
        },
        { status: 404 },
      )
    }
    return HttpResponse.json({
      data: { ...ann, deliveries: MOCK_DELIVERIES_ANN1 },
      meta: { trace_id: 'test-trace-ann-detail' },
    })
  }),

  http.post('*/comunicaciones/announcements', async ({ request }) => {
    const body = (await request.json()) as { titulo?: string; canales?: string[] }
    // Simular NO_ACTIVE_CHANNEL si no hay canales activos
    if (!body.canales || body.canales.length === 0) {
      return HttpResponse.json(
        {
          error: {
            code: 'NO_ACTIVE_CHANNEL',
            message: 'Ninguno de los canales seleccionados está activo',
            trace_id: 'test-trace-no-channel',
          },
        },
        { status: 422 },
      )
    }
    return HttpResponse.json(
      {
        data: {
          id: 'ann-new-001',
          titulo: body.titulo ?? 'Nuevo comunicado',
          cuerpo: '',
          segmento: 'todos',
          target_id: null,
          estado: 'enviado',
          programado_para: null,
          fijado: false,
          canales: (body.canales ?? []) as ('whatsapp' | 'email' | 'push')[],
          metrics: { enviados: 0, entregados: 0, leidos: 0 },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        meta: { trace_id: 'test-trace-ann-create' },
      },
      { status: 201 },
    )
  }),

  // ─── Templates ───────────────────────────────────────────────────────

  http.get('*/comunicaciones/templates', () =>
    HttpResponse.json({
      data: MOCK_TEMPLATES,
      meta: {
        trace_id: 'test-trace-tpl-list',
        current_page: 1,
        per_page: 20,
        total: MOCK_TEMPLATES.length,
        last_page: 1,
      },
    }),
  ),

  http.post('*/comunicaciones/templates', async ({ request }) => {
    const body = (await request.json()) as { nombre?: string; cuerpo?: string }
    return HttpResponse.json(
      {
        data: {
          id: 'tpl-new-001',
          nombre: body.nombre ?? 'Nueva plantilla',
          tipo: 'general',
          cuerpo: body.cuerpo ?? '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        meta: { trace_id: 'test-trace-tpl-create' },
      },
      { status: 201 },
    )
  }),

  http.patch('*/comunicaciones/templates/:id', async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>
    const tpl = MOCK_TEMPLATES.find((t) => t.id === params.id)
    if (!tpl) {
      return HttpResponse.json(
        {
          error: {
            code: 'TEMPLATE_NOT_FOUND',
            message: 'Plantilla no encontrada',
            trace_id: 'test-trace-tpl-not-found',
          },
        },
        { status: 404 },
      )
    }
    return HttpResponse.json({
      data: { ...tpl, ...body, updated_at: new Date().toISOString() },
      meta: { trace_id: 'test-trace-tpl-update' },
    })
  }),

  http.delete('*/comunicaciones/templates/:id', () => new HttpResponse(null, { status: 204 })),

  // ─── Surveys ─────────────────────────────────────────────────────────

  http.get('*/comunicaciones/surveys', () =>
    HttpResponse.json({
      data: MOCK_SURVEYS,
      meta: {
        trace_id: 'test-trace-srv-list',
        current_page: 1,
        per_page: 20,
        total: MOCK_SURVEYS.length,
        last_page: 1,
      },
    }),
  ),

  http.post('*/comunicaciones/surveys', async ({ request }) => {
    const body = (await request.json()) as {
      pregunta?: string
      opciones?: string[]
    }
    return HttpResponse.json(
      {
        data: {
          id: 'srv-new-001',
          pregunta: body.pregunta ?? 'Nueva encuesta',
          tipo: 'multiple',
          cierra_el: null,
          activa: true,
          opciones: (body.opciones ?? []).map((texto, idx) => ({
            id: `opt-new-${idx + 1}`,
            texto,
            orden: idx + 1,
            responses_count: 0,
          })),
        },
        meta: { trace_id: 'test-trace-srv-create' },
      },
      { status: 201 },
    )
  }),

  http.get('*/comunicaciones/surveys/:id/results', ({ params }) => {
    const id = String(params.id)
    const survey = MOCK_SURVEYS.find((s) => s.id === id)
    if (!survey) {
      return HttpResponse.json(
        {
          error: {
            code: 'SURVEY_NOT_FOUND',
            message: 'Encuesta no encontrada',
            trace_id: 'test-trace-srv-not-found',
          },
        },
        { status: 404 },
      )
    }
    const meta = MOCK_SURVEY_RESULTS[id] ?? { total: 0, cerrada: false }
    return HttpResponse.json({
      data: {
        survey_id: id,
        pregunta: survey.pregunta,
        total_responses: meta.total,
        cerrada: meta.cerrada,
        opciones: survey.opciones.map((o) => ({
          option_id: o.id,
          texto: o.texto,
          count: o.responses_count ?? 0,
        })),
      },
      meta: { trace_id: 'test-trace-srv-results' },
    })
  }),

  // ─── Channels ────────────────────────────────────────────────────────

  http.get('*/comunicaciones/channels', () =>
    HttpResponse.json({
      data: MOCK_CHANNELS,
      meta: { trace_id: 'test-trace-ch-list' },
    }),
  ),

  http.put('*/comunicaciones/channels', async ({ request }) => {
    const body = (await request.json()) as {
      canal?: string
      activo?: boolean
      config?: { provider?: string }
    }
    const existing = MOCK_CHANNELS.find((c) => c.canal === body.canal)
    if (!existing) {
      return HttpResponse.json(
        {
          error: {
            code: 'CHANNEL_NOT_FOUND',
            message: 'Canal no encontrado',
            trace_id: 'test-trace-ch-not-found',
          },
        },
        { status: 404 },
      )
    }
    return HttpResponse.json({
      data: {
        ...existing,
        provider: body.config?.provider ?? existing.provider,
        activo: body.activo ?? existing.activo,
      },
      meta: { trace_id: 'test-trace-ch-update' },
    })
  }),
]
