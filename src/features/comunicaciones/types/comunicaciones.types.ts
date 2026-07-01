// =====================================================================
// Tipos del feature Comunicaciones (comunicados, plantillas, encuestas y
// canales). Coinciden con los endpoints de /api/v1/comunicaciones/* y con
// los detalles del contrato del backend en 01-api/endpoints/COMUNICACIONES.
// =====================================================================

export type Channel = 'whatsapp' | 'email' | 'push'
export type Segment = 'todos' | 'torre' | 'morosos' | 'unidad'
export type AnnouncementStatus = 'borrador' | 'programado' | 'enviado'

/** Comunicado básico (fila de la bandeja). */
export interface Announcement {
  id: string
  titulo: string
  cuerpo: string
  segmento: Segment
  target_id: string | null
  estado: AnnouncementStatus
  programado_para: string | null
  fijado: boolean
  canales: Channel[]
  metrics?: Metrics
  created_at: string
  updated_at: string
}

/** Métricas agregadas de entrega/lectura del comunicado. */
export interface Metrics {
  enviados: number
  entregados: number
  leidos: number
}

/** Detalle de un comunicado: incluye el listado de deliveries. */
export interface AnnouncementDetail extends Announcement {
  deliveries: Delivery[]
}

/** Estado de un envío individual a un contacto. */
export interface Delivery {
  id: string
  contact_id: string
  contact_name: string
  canal: Channel
  estado: string
}

export interface CreateAnnouncementPayload {
  titulo: string
  cuerpo: string
  segmento: Segment
  target_id?: string
  canales: Channel[]
  programado_para?: string
  fijado: boolean
}

// ─── Plantillas ─────────────────────────────────────────────────────────

export interface Template {
  id: string
  nombre: string
  tipo: string
  cuerpo: string
  created_at: string
  updated_at: string
}

export interface CreateTemplatePayload {
  nombre: string
  tipo?: string
  cuerpo: string
}

export interface UpdateTemplatePayload {
  nombre?: string
  tipo?: string
  cuerpo?: string
}

// ─── Encuestas ──────────────────────────────────────────────────────────

export type SurveyType = 'simple' | 'multiple'

export interface SurveyOption {
  id: string
  texto: string
  orden: number
  responses_count?: number
}

export interface Survey {
  id: string
  pregunta: string
  tipo: SurveyType
  cierra_el: string | null
  activa: boolean
  opciones: SurveyOption[]
}

export interface SurveyResults {
  survey_id: string
  pregunta: string
  total_responses: number
  opciones: SurveyOptionResult[]
  cerrada: boolean
}

export interface SurveyOptionResult {
  option_id: string
  texto: string
  count: number
}

export interface CreateSurveyPayload {
  pregunta: string
  opciones: string[]
  cierra_el?: string
}

// ─── Canales ────────────────────────────────────────────────────────────

export interface ChannelConfig {
  id: string
  canal: Channel
  provider: string | null
  activo: boolean
}

export interface UpdateChannelPayload {
  canal: Channel
  config: { provider: string; token: string }
  activo: boolean
}
