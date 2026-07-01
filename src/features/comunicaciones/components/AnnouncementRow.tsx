import { Eye, Mail, Smartphone, MessageCircle, Pin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { cn } from '@/lib/utils'
import {
  SEGMENT_LABEL,
  STATUS_LABEL,
  STATUS_VARIANT,
} from '../lib/labels'
import type { Announcement, Channel } from '../types/comunicaciones.types'

// ─── Lookup interno ────────────────────────────────────────────────────

const CHANNEL_META: Record<Channel, { icon: typeof Mail; label: string }> = {
  email: { icon: Mail, label: 'Email' },
  push: { icon: Smartphone, label: 'Push' },
  whatsapp: { icon: MessageCircle, label: 'WhatsApp' },
}

// ─── Props ──────────────────────────────────────────────────────────────

export interface AnnouncementRowProps {
  announcement: Announcement
  onView: (id: string) => void
}

// ─── Componente ─────────────────────────────────────────────────────────

/**
 * Fila de la bandeja de comunicados. Muestra título, segmento, estado,
 * canales (íconos), fecha programada, indicador de fijado y acción Ver.
 */
export function AnnouncementRow({ announcement, onView }: AnnouncementRowProps) {
  return (
    <tr
      className={cn('cursor-pointer transition-colors hover:bg-muted/40')}
      onClick={() => onView(announcement.id)}
    >
      {/* Título + fijado */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {announcement.fijado && (
            <Pin
              className="size-3.5 shrink-0 text-warning"
              aria-label="Fijado en cartelera"
            />
          )}
          <span className="font-medium">{announcement.titulo}</span>
        </div>
      </td>

      {/* Segmento */}
      <td className="px-4 py-3 text-muted-foreground">
        {SEGMENT_LABEL[announcement.segmento]}
      </td>

      {/* Estado */}
      <td className="px-4 py-3">
        <StatusBadge variant={STATUS_VARIANT[announcement.estado]}>
          {STATUS_LABEL[announcement.estado]}
        </StatusBadge>
      </td>

      {/* Canales */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5" aria-label="Canales de envío">
          {announcement.canales.map((c) => {
            const Meta = CHANNEL_META[c]
            const Icon = Meta.icon
            return (
              <span
                key={c}
                title={Meta.label}
                className="inline-flex size-7 items-center justify-center rounded-md border bg-muted/40 text-muted-foreground"
              >
                <Icon className="size-3.5" aria-hidden="true" />
              </span>
            )
          })}
        </div>
      </td>

      {/* Programado */}
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {announcement.programado_para ? (
          formatDateTime(announcement.programado_para)
        ) : (
          <span className="text-muted-foreground/60">—</span>
        )}
      </td>

      {/* Acciones */}
      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onView(announcement.id)}
          aria-label={`Ver detalle de ${announcement.titulo}`}
        >
          <Eye className="size-4" />
        </Button>
      </td>
    </tr>
  )
}

// ─── Helpers ────────────────────────────────────────────────────────────

function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso)
    return new Intl.DateTimeFormat('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d)
  } catch {
    return iso
  }
}
