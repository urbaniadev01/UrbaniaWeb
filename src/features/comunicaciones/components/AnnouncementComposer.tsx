import { useEffect } from 'react'
import { useForm, Controller, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Send, Calendar, Pin, Mail, Smartphone, MessageCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import {
  announcementSchema,
  type AnnouncementFormValues,
} from '../validators/comunicaciones.validators'
import type { Channel, Segment } from '../types/comunicaciones.types'

// ─── Opciones de selector ───────────────────────────────────────────────

const SEGMENT_OPTIONS: { value: Segment; label: string; disabled?: boolean }[] = [
  { value: 'todos', label: 'Todos los residentes' },
  { value: 'torre', label: 'Por torre' },
  { value: 'morosos', label: 'Morosos (próximamente)', disabled: true },
  { value: 'unidad', label: 'Por unidad' },
]

const CHANNEL_OPTIONS: { value: Channel; label: string; icon: typeof Mail }[] = [
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'push', label: 'Push', icon: Smartphone },
]

// ─── Props ──────────────────────────────────────────────────────────────

export interface AnnouncementComposerProps {
  /** Plantilla precargada (opcional). Si llega con `nombre`, se aplica al título. */
  initialTemplate?: { nombre: string; cuerpo: string } | null
  /** Mapa de canales activos (los inactivos se muestran deshabilitados). */
  activeChannels?: Record<Channel, boolean>
  isSubmitting?: boolean
  onSubmit: (values: AnnouncementFormValues, action: 'send' | 'schedule') => void
  onCancel?: () => void
}

// ─── Componente ─────────────────────────────────────────────────────────

/**
 * Formulario de redacción de un comunicado.
 * - Título + cuerpo (textarea grande, simula editor de texto).
 * - Selector de segmento. Si es `torre` o `unidad`, muestra input para `target_id`.
 * - Toggles por canal. Los canales inactivos (en `activeChannels`) se deshabilitan.
 * - Programado (datetime-local opcional). Si está vacío → envío inmediato.
 * - Toggle "Fijar en cartelera".
 * - Botones: "Programar" (requiere fecha) y "Enviar ahora".
 */
export function AnnouncementComposer({
  initialTemplate,
  activeChannels,
  isSubmitting = false,
  onSubmit,
  onCancel,
}: AnnouncementComposerProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      titulo: '',
      cuerpo: '',
      segmento: 'todos',
      target_id: '',
      canales: ['email'],
      programado_para: '',
      fijado: false,
    },
  })

  // Si llega una plantilla, precarga título y cuerpo (una sola vez al montar).
  useEffect(() => {
    if (initialTemplate) {
      setValue('titulo', initialTemplate.nombre, { shouldDirty: true })
      setValue('cuerpo', initialTemplate.cuerpo, { shouldDirty: true })
    }
  }, [initialTemplate, setValue])

  // Reset al desmontar (al navegar a otra página)
  useEffect(() => {
    return () => reset()
  }, [reset])

  const watchedSegmento = watch('segmento')
  const watchedCanales = watch('canales') ?? []
  const watchedProgramado = watch('programado_para')
  const requiresTarget = watchedSegmento === 'torre' || watchedSegmento === 'unidad'

  // Si el segmento cambia y NO requiere target, limpiamos target_id.
  useEffect(() => {
    if (!requiresTarget) {
      setValue('target_id', '', { shouldDirty: true })
    }
  }, [requiresTarget, setValue])

  const onFormSubmit: SubmitHandler<AnnouncementFormValues> = (values) => {
    const action: 'send' | 'schedule' = values.programado_para ? 'schedule' : 'send'
    onSubmit(values, action)
  }

  const handleCancel = () => {
    if (isDirty && !window.confirm('Tienes cambios sin guardar. ¿Salir sin guardar?')) {
      return
    }
    onCancel?.()
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* ─── Contenido ────────────────────────────────────────────── */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-foreground">Contenido</legend>

        <div className="space-y-1.5">
          <Label htmlFor="titulo">
            Título <span className="text-destructive">*</span>
          </Label>
          <Input
            id="titulo"
            placeholder="Ej: Corte de agua programado"
            maxLength={255}
            {...register('titulo')}
            aria-invalid={!!errors.titulo}
          />
          {errors.titulo && (
            <p className="text-xs text-destructive">{errors.titulo.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cuerpo">
            Mensaje <span className="text-destructive">*</span>
          </Label>
          <textarea
            id="cuerpo"
            rows={10}
            placeholder="Escribe el mensaje que recibirán los residentes..."
            className="w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive"
            {...register('cuerpo')}
            aria-invalid={!!errors.cuerpo}
          />
          {errors.cuerpo && (
            <p className="text-xs text-destructive">{errors.cuerpo.message}</p>
          )}
        </div>
      </fieldset>

      {/* ─── Segmento ─────────────────────────────────────────────── */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-foreground">Segmento</legend>

        <div className="space-y-1.5">
          <Label htmlFor="segmento">
            Audiencia <span className="text-destructive">*</span>
          </Label>
          <select
            id="segmento"
            {...register('segmento')}
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            {SEGMENT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          {errors.segmento && (
            <p className="text-xs text-destructive">{errors.segmento.message}</p>
          )}
        </div>

        {requiresTarget && (
          <div className="space-y-1.5">
            <Label htmlFor="target_id">
              {watchedSegmento === 'torre' ? 'ID de la torre' : 'ID de la unidad'}{' '}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="target_id"
              placeholder="00000000-0000-0000-0000-000000000000"
              {...register('target_id')}
              aria-invalid={!!errors.target_id}
            />
            {errors.target_id && (
              <p className="text-xs text-destructive">{errors.target_id.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Ingresa el identificador (UUID) de la {watchedSegmento}.
            </p>
          </div>
        )}
      </fieldset>

      {/* ─── Canales ──────────────────────────────────────────────── */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-foreground">Canales</legend>
        {errors.canales && (
          <p className="text-xs text-destructive">{errors.canales.message}</p>
        )}
        <Controller
          name="canales"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {CHANNEL_OPTIONS.map((opt) => {
                const Icon = opt.icon
                const isActive = activeChannels?.[opt.value] !== false
                const checked = field.value?.includes(opt.value) ?? false
                const isDisabled = !isActive
                return (
                  <label
                    key={opt.value}
                    className={cn(
                      'flex items-center gap-3 rounded-md border p-3 text-sm transition-colors',
                      isDisabled
                        ? 'cursor-not-allowed bg-muted/30 text-muted-foreground'
                        : checked
                          ? 'cursor-pointer border-primary bg-primary/5 text-foreground'
                          : 'cursor-pointer hover:bg-muted/40',
                    )}
                  >
                    <input
                      type="checkbox"
                      className="size-4 rounded border-border accent-primary"
                      checked={checked}
                      disabled={isDisabled}
                      onChange={(e) => {
                        const current = field.value ?? []
                        const next = e.target.checked
                          ? [...current, opt.value]
                          : current.filter((c) => c !== opt.value)
                        field.onChange(next)
                      }}
                    />
                    <Icon className="size-4" aria-hidden="true" />
                    <span className="flex-1 font-medium">{opt.label}</span>
                    {isDisabled && (
                      <span className="text-xs text-muted-foreground">(no configurado)</span>
                    )}
                  </label>
                )
              })}
            </div>
          )}
        />
      </fieldset>

      {/* ─── Programación ─────────────────────────────────────────── */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-foreground">Programación</legend>

        <div className="space-y-1.5">
          <Label htmlFor="programado_para">
            <Calendar className="mr-1 inline size-3.5" />
            Programado para (opcional)
          </Label>
          <Input
            id="programado_para"
            type="datetime-local"
            {...register('programado_para')}
          />
          <p className="text-xs text-muted-foreground">
            Si lo dejas vacío, el comunicado se enviará al guardar.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-md border bg-muted/30 p-3">
          <input
            id="fijado"
            type="checkbox"
            {...register('fijado')}
            className="size-4 rounded border-border accent-primary"
          />
          <Pin className="size-4 text-muted-foreground" aria-hidden="true" />
          <Label htmlFor="fijado" className="cursor-pointer">
            Fijar en cartelera
          </Label>
        </div>
      </fieldset>

      {/* ─── Acciones ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-end gap-2 border-t pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
        )}
        {watchedProgramado && (
          <Button type="submit" variant="outline" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Calendar className="mr-2 size-4" />
            )}
            Programar
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Send className="mr-2 size-4" />
          )}
          {watchedCanales.length === 0 ? 'Selecciona un canal' : 'Enviar ahora'}
        </Button>
      </div>
    </form>
  )
}
