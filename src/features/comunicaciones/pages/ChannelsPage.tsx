import { useState, useEffect } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  Radio,
  MessageCircle,
  Mail,
  Smartphone,
  Settings,
  Loader2,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { Modal } from '@/components/shared/Modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ErrorState } from '@/components/shared/ErrorState'
import { useChannels, useUpdateChannel } from '../hooks/use-channels'
import { channelSchema, type ChannelFormValues } from '../validators/comunicaciones.validators'
import { parseApiError } from '@/lib/utils'
import type { Channel } from '../types/comunicaciones.types'

// ─── Configuración visual de cada canal ─────────────────────────────────

interface ChannelMeta {
  id: Channel
  nombre: string
  descripcion: string
  icon: typeof Mail
  providers: string[]
}

const CHANNEL_META: ChannelMeta[] = [
  {
    id: 'whatsapp',
    nombre: 'WhatsApp',
    descripcion: 'Mensajes a través de WhatsApp Business API.',
    icon: MessageCircle,
    providers: ['twilio', 'meta', 'gupshup'],
  },
  {
    id: 'email',
    nombre: 'Email',
    descripcion: 'Correos transaccionales vía SMTP o proveedor dedicado.',
    icon: Mail,
    providers: ['sendgrid', 'mailgun', 'smtp', 'ses'],
  },
  {
    id: 'push',
    nombre: 'Push notifications',
    descripcion: 'Notificaciones push a la app móvil.',
    icon: Smartphone,
    providers: ['fcm', 'apns', 'onesignal'],
  },
]

const META_BY_ID: Record<Channel, ChannelMeta> = {
  whatsapp: CHANNEL_META[0],
  email: CHANNEL_META[1],
  push: CHANNEL_META[2],
}

// ─── Página ─────────────────────────────────────────────────────────────

export function ChannelsPage() {
  const { data, isLoading, isError, error, refetch } = useChannels()
  const channels = data?.data ?? []

  const [editing, setEditing] = useState<Channel | null>(null)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <Radio className="size-6 text-muted-foreground" aria-hidden="true" />
          Canales de comunicación
        </h1>
        <p className="text-sm text-muted-foreground">
          Configura los canales por los que se enviarán los comunicados.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {CHANNEL_META.map((m) => (
            <div key={m.id} className="h-40 animate-pulse rounded-lg border bg-muted" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          error={error}
          title="Error al cargar los canales"
          onRetry={() => refetch()}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {CHANNEL_META.map((meta) => {
            const config = channels.find((c) => c.canal === meta.id)
            const Icon = meta.icon
            const activo = config?.activo ?? false
            return (
              <article
                key={meta.id}
                className="flex flex-col rounded-lg border bg-card p-5 shadow-xs"
              >
                <div className="mb-3 flex items-start gap-3">
                  <span className="inline-flex size-10 items-center justify-center rounded-md bg-muted">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div className="flex-1">
                    <h2 className="text-sm font-semibold">{meta.nombre}</h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {meta.descripcion}
                    </p>
                  </div>
                </div>

                <div className="mt-auto space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Estado</span>
                    <span
                      className={
                        activo
                          ? 'inline-flex items-center gap-1 text-success'
                          : 'inline-flex items-center gap-1 text-muted-foreground'
                      }
                    >
                      {activo ? (
                        <>
                          <CheckCircle2 className="size-3.5" aria-hidden="true" />
                          Activo
                        </>
                      ) : (
                        <>
                          <XCircle className="size-3.5" aria-hidden="true" />
                          Inactivo
                        </>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Proveedor</span>
                    <span className="font-mono text-xs">
                      {config?.provider ?? '—'}
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setEditing(meta.id)}
                  >
                    <Settings className="mr-1.5 size-4" />
                    Configurar
                  </Button>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {editing && (
        <ChannelConfigModal
          channelId={editing}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}

// ─── Modal de configuración ────────────────────────────────────────────

interface ChannelConfigModalProps {
  channelId: Channel
  onClose: () => void
}

function ChannelConfigModal({ channelId, onClose }: ChannelConfigModalProps) {
  const { data } = useChannels()
  const updateMutation = useUpdateChannel()
  const channels = data?.data ?? []
  const current = channels.find((c) => c.canal === channelId)
  const meta = META_BY_ID[channelId]

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<ChannelFormValues>({
    resolver: zodResolver(channelSchema),
    defaultValues: {
      canal: channelId,
      config: {
        provider: current?.provider ?? meta.providers[0],
        token: '',
      },
      activo: current?.activo ?? false,
    },
  })

  // Reset al cambiar de canal o al llegar datos del backend
  useEffect(() => {
    reset({
      canal: channelId,
      config: {
        provider: current?.provider ?? meta.providers[0],
        token: '',
      },
      activo: current?.activo ?? false,
    })
  }, [channelId, current?.provider, current?.activo, meta.providers, reset])

  const watchedProvider = watch('config.provider')
  const watchedActivo = watch('activo')

  const onFormSubmit: SubmitHandler<ChannelFormValues> = (values) => {
    updateMutation.mutate(
      {
        canal: values.canal,
        config: {
          provider: values.config.provider,
          token: values.config.token,
        },
        activo: values.activo,
      },
      {
        onSuccess: () => {
          toast.success(`Canal ${meta.nombre} actualizado`)
          onClose()
        },
        onError: (err) => {
          const apiError = parseApiError(err)
          toast.error(apiError.message, { description: `Código: ${apiError.code}` })
        },
      },
    )
  }

  const handleClose = () => {
    if (isDirty && !window.confirm('Tienes cambios sin guardar. ¿Salir sin guardar?')) {
      return
    }
    onClose()
  }

  const Icon = meta.icon

  return (
    <Modal
      open
      onClose={handleClose}
      title={`Configurar ${meta.nombre}`}
      description="Establece el proveedor y el token de acceso."
      size="md"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
        <div className="flex items-center gap-3 rounded-md border bg-muted/30 p-3">
          <span className="inline-flex size-9 items-center justify-center rounded-md bg-card">
            <Icon className="size-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-medium">{meta.nombre}</p>
            <p className="text-xs text-muted-foreground">
              {current?.provider
                ? `Proveedor actual: ${current.provider}`
                : 'Sin configurar'}
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="provider">
            Proveedor <span className="text-destructive">*</span>
          </Label>
          <select
            id="provider"
            value={watchedProvider}
            onChange={(e) =>
              setValue('config.provider', e.target.value, { shouldDirty: true })
            }
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            {meta.providers.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          {errors.config?.provider && (
            <p className="text-xs text-destructive">{errors.config.provider.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="token">
            Token / API key <span className="text-destructive">*</span>
          </Label>
          <Input
            id="token"
            type="password"
            placeholder="Ingresa el token del proveedor"
            autoComplete="off"
            {...register('config.token')}
            aria-invalid={!!errors.config?.token}
          />
          {errors.config?.token && (
            <p className="text-xs text-destructive">{errors.config.token.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            El token se almacena cifrado en el servidor.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-md border p-3">
          <input
            id="activo"
            type="checkbox"
            checked={watchedActivo}
            onChange={(e) =>
              setValue('activo', e.target.checked, { shouldDirty: true })
            }
            className="size-4 rounded border-border accent-primary"
          />
          <Label htmlFor="activo" className="flex-1 cursor-pointer">
            Canal activo
          </Label>
          <span
            className={
              watchedActivo
                ? 'text-xs text-success'
                : 'text-xs text-muted-foreground'
            }
          >
            {watchedActivo ? 'Habilitado' : 'Deshabilitado'}
          </span>
        </div>

        <div className="flex items-center justify-end gap-2 border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={updateMutation.isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar cambios'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
