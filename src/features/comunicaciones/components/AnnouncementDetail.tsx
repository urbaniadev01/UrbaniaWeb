import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ErrorState } from '@/components/shared/ErrorState'
import { Mail, Smartphone, MessageCircle, Send, CheckCircle2, Eye } from 'lucide-react'
import { useAnnouncement } from '../hooks/use-announcements'
import { SEGMENT_LABEL, STATUS_LABEL, STATUS_VARIANT } from '../lib/labels'
import type { Channel } from '../types/comunicaciones.types'

// ─── Props ──────────────────────────────────────────────────────────────

export interface AnnouncementDetailProps {
  announcementId: string | null
  onClose: () => void
}

// ─── Componente ─────────────────────────────────────────────────────────

const CHANNEL_META: Record<Channel, { icon: typeof Mail; label: string }> = {
  email: { icon: Mail, label: 'Email' },
  push: { icon: Smartphone, label: 'Push' },
  whatsapp: { icon: MessageCircle, label: 'WhatsApp' },
}

/**
 * Drawer (Sheet side="right") con el detalle completo de un comunicado:
 * título, cuerpo, segmento, canales, métricas y tabla de deliveries.
 * Hace polling cada 15s mientras el comunicado no esté enviado.
 */
export function AnnouncementDetail({ announcementId, onClose }: AnnouncementDetailProps) {
  const { data, isLoading, isError, error, refetch } = useAnnouncement(
    announcementId ?? undefined,
  )
  const open = !!announcementId
  const announcement = data?.data
  const metrics = announcement?.metrics
  const deliveries = announcement?.deliveries ?? []

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg"
        aria-describedby={undefined}
      >
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="pr-8">
            {isLoading ? 'Cargando...' : announcement?.titulo ?? '—'}
          </SheetTitle>
          {announcement && (
            <SheetDescription>
              <StatusBadge
                variant={STATUS_VARIANT[announcement.estado]}
                className="mt-2"
              >
                {STATUS_LABEL[announcement.estado]}
              </StatusBadge>
            </SheetDescription>
          )}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading && <DetailSkeleton />}

          {isError && (
            <ErrorState
              error={error}
              title="No se pudo cargar el comunicado"
              onRetry={() => refetch()}
            />
          )}

          {announcement && (
            <div className="space-y-6">
              {/* ─── Cuerpo ──────────────────────────────────────── */}
              <section>
                <h3 className="mb-2 text-sm font-semibold">Mensaje</h3>
                <div className="whitespace-pre-wrap rounded-md border bg-muted/30 p-3 text-sm">
                  {announcement.cuerpo}
                </div>
              </section>

              {/* ─── Segmento + Canales ──────────────────────────── */}
              <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <h3 className="mb-2 text-sm font-semibold">Audiencia</h3>
                  <div className="space-y-1 text-sm">
                    <p>{SEGMENT_LABEL[announcement.segmento]}</p>
                    {announcement.target_id && (
                      <p className="font-mono text-xs text-muted-foreground">
                        {announcement.target_id}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-semibold">Canales</h3>
                  <div className="flex flex-wrap gap-2">
                    {announcement.canales.map((c) => {
                      const Meta = CHANNEL_META[c]
                      const Icon = Meta.icon
                      return (
                        <span
                          key={c}
                          className="inline-flex items-center gap-1.5 rounded-md border bg-muted/40 px-2 py-1 text-xs"
                        >
                          <Icon className="size-3.5" aria-hidden="true" />
                          {Meta.label}
                        </span>
                      )
                    })}
                  </div>
                </div>
              </section>

              {announcement.programado_para && (
                <section>
                  <h3 className="mb-2 text-sm font-semibold">Programado para</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(announcement.programado_para).toLocaleString('es-CO')}
                  </p>
                </section>
              )}

              {/* ─── Métricas ────────────────────────────────────── */}
              {metrics && (
                <section>
                  <h3 className="mb-3 text-sm font-semibold">Métricas</h3>
                  <div className="space-y-3">
                    <MetricBar
                      icon={<Send className="size-3.5" />}
                      label="Enviados"
                      value={metrics.enviados}
                      total={Math.max(metrics.enviados, 1)}
                    />
                    <MetricBar
                      icon={<CheckCircle2 className="size-3.5" />}
                      label="Entregados"
                      value={metrics.entregados}
                      total={Math.max(metrics.enviados, 1)}
                    />
                    <MetricBar
                      icon={<Eye className="size-3.5" />}
                      label="Leídos"
                      value={metrics.leidos}
                      total={Math.max(metrics.enviados, 1)}
                    />
                  </div>
                </section>
              )}

              {/* ─── Deliveries ─────────────────────────────────── */}
              {deliveries.length > 0 && (
                <section>
                  <h3 className="mb-3 text-sm font-semibold">
                    Envíos ({deliveries.length})
                  </h3>
                  <div className="overflow-hidden rounded-md border">
                    <table className="min-w-full divide-y divide-border text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Contacto
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Canal
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Estado
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {deliveries.slice(0, 50).map((d) => {
                          const Meta = CHANNEL_META[d.canal]
                          const Icon = Meta.icon
                          return (
                            <tr key={d.id}>
                              <td className="px-3 py-2 text-sm">{d.contact_name}</td>
                              <td className="px-3 py-2">
                                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                  <Icon className="size-3.5" aria-hidden="true" />
                                  {Meta.label}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-xs text-muted-foreground">
                                {d.estado}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                    {deliveries.length > 50 && (
                      <p className="border-t bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                        Mostrando los primeros 50 de {deliveries.length} envíos.
                      </p>
                    )}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

// ─── Subcomponentes ────────────────────────────────────────────────────

function MetricBar({
  icon,
  label,
  value,
  total,
}: {
  icon: React.ReactNode
  label: string
  value: number
  total: number
}) {
  const pct = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          {icon}
          {label}
        </span>
        <span className="font-mono tabular-nums">
          {value} <span className="text-muted-foreground">({pct}%)</span>
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-primary transition-[width]"
          style={{ width: `${pct}%` }}
          aria-label={`${label}: ${pct}%`}
        />
      </div>
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="space-y-4" aria-label="Cargando detalle">
      <div className="h-20 animate-pulse rounded-md bg-muted" />
      <div className="h-16 animate-pulse rounded-md bg-muted" />
      <div className="h-24 animate-pulse rounded-md bg-muted" />
      <div className="h-32 animate-pulse rounded-md bg-muted" />
    </div>
  )
}
