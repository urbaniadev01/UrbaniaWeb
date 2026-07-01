import { apiClient } from '@/services/api-client'
import type { ApiResponse, PaginatedResponse } from '@/types/api.types'
import type {
  Announcement,
  AnnouncementDetail,
  ChannelConfig,
  CreateAnnouncementPayload,
  CreateSurveyPayload,
  CreateTemplatePayload,
  Survey,
  SurveyResults,
  Template,
  UpdateChannelPayload,
  UpdateTemplatePayload,
} from '../types/comunicaciones.types'

const BASE = '/comunicaciones'

/**
 * Servicio del feature Comunicaciones.
 * Endpoints base: /api/v1/comunicaciones/*
 *
 * Convención: cada método retorna `ApiResponse<T>['data']` o `PaginatedResponse<T>`
 * para que los hooks TanStack Query operen directamente sobre el payload útil.
 */
export const comunicacionesService = {
  // ─── Anuncios / Comunicados ──────────────────────────────────────────

  /** GET /comunicaciones/announcements — Lista paginada de comunicados */
  listAnnouncements(params?: Record<string, string>): Promise<PaginatedResponse<Announcement>> {
    const searchParams = new URLSearchParams(params)
    const query = searchParams.toString()
    return apiClient
      .get<PaginatedResponse<Announcement>>(`${BASE}/announcements${query ? `?${query}` : ''}`)
      .then((r) => r.data)
  },

  /** GET /comunicaciones/announcements/:id — Detalle + métricas + deliveries */
  getAnnouncement(id: string): Promise<ApiResponse<AnnouncementDetail>> {
    return apiClient
      .get<ApiResponse<AnnouncementDetail>>(`${BASE}/announcements/${id}`)
      .then((r) => r.data)
  },

  /** POST /comunicaciones/announcements — Crear un comunicado */
  createAnnouncement(
    payload: CreateAnnouncementPayload,
  ): Promise<ApiResponse<Announcement>> {
    return apiClient
      .post<ApiResponse<Announcement>>(`${BASE}/announcements`, payload)
      .then((r) => r.data)
  },

  // ─── Plantillas ──────────────────────────────────────────────────────

  /** GET /comunicaciones/templates — Lista de plantillas */
  listTemplates(): Promise<PaginatedResponse<Template>> {
    return apiClient
      .get<PaginatedResponse<Template>>(`${BASE}/templates`)
      .then((r) => r.data)
  },

  /** POST /comunicaciones/templates — Crear una plantilla */
  createTemplate(payload: CreateTemplatePayload): Promise<ApiResponse<Template>> {
    return apiClient
      .post<ApiResponse<Template>>(`${BASE}/templates`, payload)
      .then((r) => r.data)
  },

  /** PATCH /comunicaciones/templates/:id — Actualizar una plantilla */
  updateTemplate(
    id: string,
    payload: UpdateTemplatePayload,
  ): Promise<ApiResponse<Template>> {
    return apiClient
      .patch<ApiResponse<Template>>(`${BASE}/templates/${id}`, payload)
      .then((r) => r.data)
  },

  /** DELETE /comunicaciones/templates/:id — Eliminar una plantilla */
  deleteTemplate(id: string): Promise<void> {
    return apiClient.delete(`${BASE}/templates/${id}`).then(() => undefined)
  },

  // ─── Encuestas ───────────────────────────────────────────────────────

  /** GET /comunicaciones/surveys — Lista paginada de encuestas del conjunto */
  listSurveys(): Promise<PaginatedResponse<Survey>> {
    return apiClient
      .get<PaginatedResponse<Survey>>(`${BASE}/surveys`)
      .then((r) => r.data)
  },

  /** POST /comunicaciones/surveys — Crear una encuesta */
  createSurvey(payload: CreateSurveyPayload): Promise<ApiResponse<Survey>> {
    return apiClient
      .post<ApiResponse<Survey>>(`${BASE}/surveys`, payload)
      .then((r) => r.data)
  },

  /** GET /comunicaciones/surveys/:id/results — Resultados agregados */
  getSurveyResults(id: string): Promise<ApiResponse<SurveyResults>> {
    return apiClient
      .get<ApiResponse<SurveyResults>>(`${BASE}/surveys/${id}/results`)
      .then((r) => r.data)
  },

  // ─── Canales ─────────────────────────────────────────────────────────

  /** GET /comunicaciones/channels — Lista de configuraciones de canal */
  listChannels(): Promise<ApiResponse<ChannelConfig[]>> {
    return apiClient
      .get<ApiResponse<ChannelConfig[]>>(`${BASE}/channels`)
      .then((r) => r.data)
  },

  /** PUT /comunicaciones/channels — Actualizar la configuración de un canal */
  updateChannel(payload: UpdateChannelPayload): Promise<ApiResponse<ChannelConfig>> {
    return apiClient
      .put<ApiResponse<ChannelConfig>>(`${BASE}/channels`, payload)
      .then((r) => r.data)
  },
}
