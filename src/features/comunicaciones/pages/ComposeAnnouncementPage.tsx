import { useState, useCallback } from 'react'
import { useNavigate, Link } from 'react-router'
import { toast } from 'sonner'
import { Megaphone, ArrowLeft, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/shared/Modal'
import { ErrorState } from '@/components/shared/ErrorState'
import { AnnouncementComposer } from '../components/AnnouncementComposer'
import { useCreateAnnouncement } from '../hooks/use-announcements'
import { useChannels } from '../hooks/use-channels'
import { useTemplates } from '../hooks/use-templates'
import { parseApiError } from '@/lib/utils'
import type { Channel } from '../types/comunicaciones.types'
import type { AnnouncementFormValues } from '../validators/comunicaciones.validators'

// ─── Página ─────────────────────────────────────────────────────────────

/**
 * Página de redacción de un comunicado. Incluye:
 *  - AnnouncementComposer con RHF + Zod.
 *  - Botón "Usar plantilla" que abre un drawer con la lista de plantillas.
 *  - Manejo de error `NO_ACTIVE_CHANNEL` (muestra mensaje claro).
 */
export function ComposeAnnouncementPage() {
  const navigate = useNavigate()
  const createMutation = useCreateAnnouncement()
  const { data: channelsResp } = useChannels()
  const { data: templatesResp, isError: templatesError, refetch: refetchTemplates } = useTemplates()

  const channels = channelsResp?.data ?? []
  const templates = templatesResp?.data ?? []

  // Mapa canal → activo, para deshabilitar checkboxes en el composer
  const activeChannels = channels.reduce<Record<Channel, boolean>>(
    (acc, c) => {
      acc[c.canal] = c.activo
      return acc
    },
    { whatsapp: false, email: false, push: false },
  )

  const [templateModalOpen, setTemplateModalOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<{
    nombre: string
    cuerpo: string
  } | null>(null)

  const handleSubmit = useCallback(
    (values: AnnouncementFormValues, _action: 'send' | 'schedule') => {
      const payload = {
        titulo: values.titulo.trim(),
        cuerpo: values.cuerpo.trim(),
        segmento: values.segmento,
        target_id: values.target_id?.trim() || undefined,
        canales: values.canales,
        programado_para: values.programado_para?.trim() || undefined,
        fijado: values.fijado,
      }
      createMutation.mutate(payload, {
        onSuccess: () => {
          navigate('/comunicaciones')
        },
        onError: (err) => {
          const apiError = parseApiError(err)
          if (apiError.code === 'NO_ACTIVE_CHANNEL') {
            toast.error('Ninguno de los canales seleccionados está activo', {
              description: 'Configura los canales en la sección de Canales.',
            })
          } else {
            toast.error(apiError.message, { description: `Código: ${apiError.code}` })
          }
        },
      })
    },
    [createMutation, navigate],
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-1 -ml-2">
            <Link to="/comunicaciones">
              <ArrowLeft className="mr-1 size-4" />
              Volver a la bandeja
            </Link>
          </Button>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Megaphone className="size-6 text-muted-foreground" aria-hidden="true" />
            Redactar comunicado
          </h1>
          <p className="text-sm text-muted-foreground">
            Completa los datos y elige los canales de envío.
          </p>
        </div>
        <Button variant="outline" onClick={() => setTemplateModalOpen(true)}>
          <FileText className="mr-1.5 size-4" />
          Usar plantilla
        </Button>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <AnnouncementComposer
          initialTemplate={selectedTemplate}
          activeChannels={activeChannels}
          isSubmitting={createMutation.isPending}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/comunicaciones')}
        />
      </div>

      {/* ─── Modal de plantillas ────────────────────────────── */}
      <Modal
        open={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        title="Plantillas disponibles"
        description="Selecciona una plantilla para precargar título y cuerpo."
        size="lg"
      >
        {templatesError ? (
          <ErrorState
            error={templatesError}
            title="No se pudieron cargar las plantillas"
            onRetry={() => refetchTemplates()}
          />
        ) : templates.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No hay plantillas guardadas todavía.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-md border">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Nombre
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Tipo
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Vista previa
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {templates.map((t) => (
                  <tr key={t.id}>
                    <td className="px-3 py-2 font-medium">{t.nombre}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {t.tipo || '—'}
                    </td>
                    <td className="max-w-xs truncate px-3 py-2 text-xs text-muted-foreground">
                      {t.cuerpo}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => {
                          setSelectedTemplate({ nombre: t.nombre, cuerpo: t.cuerpo })
                          setTemplateModalOpen(false)
                          toast.success(`Plantilla "${t.nombre}" aplicada`)
                        }}
                      >
                        Usar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </div>
  )
}
