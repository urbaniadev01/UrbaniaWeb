import type { AnnouncementStatus, Segment } from '../types/comunicaciones.types'

// =====================================================================
// Constantes de lookup del feature Comunicaciones.
// Mantener en archivo separado para no romper fast-refresh de Vite.
// =====================================================================

export const SEGMENT_LABEL: Record<Segment, string> = {
  todos: 'Todos',
  torre: 'Por torre',
  morosos: 'Morosos',
  unidad: 'Por unidad',
}

export const STATUS_LABEL: Record<AnnouncementStatus, string> = {
  borrador: 'Borrador',
  programado: 'Programado',
  enviado: 'Enviado',
}

export const STATUS_VARIANT: Record<
  AnnouncementStatus,
  'info' | 'success' | 'warning' | 'muted'
> = {
  borrador: 'muted',
  programado: 'info',
  enviado: 'success',
}
