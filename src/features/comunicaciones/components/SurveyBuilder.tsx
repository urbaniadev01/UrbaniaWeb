import { useState } from 'react'
import { useForm, useFieldArray, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Modal } from '@/components/shared/Modal'
import {
  surveySchema,
  type SurveyFormValues,
} from '../validators/comunicaciones.validators'

// ─── Props ──────────────────────────────────────────────────────────────

export interface SurveyBuilderProps {
  open: boolean
  onClose: () => void
  isSubmitting?: boolean
  onSubmit: (values: SurveyFormValues) => void
}

// ─── Componente ─────────────────────────────────────────────────────────

/**
 * Modal para crear una encuesta: pregunta, opciones dinámicas (mín 2)
 * y fecha de cierre opcional.
 */
export function SurveyBuilder({ open, onClose, isSubmitting = false, onSubmit }: SurveyBuilderProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<SurveyFormValues>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      pregunta: '',
      opciones: ['', ''],
      cierra_el: '',
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'opciones' as never,
  })
  const [showCloseConfirm, setShowCloseConfirm] = useState(false)

  const handleClose = () => {
    if (isDirty && !showCloseConfirm) {
      if (!window.confirm('Tienes cambios sin guardar. ¿Salir sin guardar?')) {
        return
      }
    }
    setShowCloseConfirm(false)
    reset()
    onClose()
  }

  const onFormSubmit: SubmitHandler<SurveyFormValues> = (values) => {
    onSubmit(values)
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Nueva encuesta"
      description="Crea una encuesta para que los residentes voten desde la app."
      size="md"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
        {/* ─── Pregunta ─────────────────────────────────────────── */}
        <div className="space-y-1.5">
          <Label htmlFor="pregunta">
            Pregunta <span className="text-destructive">*</span>
          </Label>
          <Input
            id="pregunta"
            placeholder="Ej: ¿Aprobamos instalar cámaras adicionales?"
            maxLength={500}
            {...register('pregunta')}
            aria-invalid={!!errors.pregunta}
          />
          {errors.pregunta && (
            <p className="text-xs text-destructive">{errors.pregunta.message}</p>
          )}
        </div>

        {/* ─── Opciones ─────────────────────────────────────────── */}
        <fieldset className="space-y-2">
          <div className="flex items-center justify-between">
            <legend className="text-sm font-medium text-foreground">
              Opciones <span className="text-destructive">*</span>
            </legend>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => append('')}
              disabled={isSubmitting}
            >
              <Plus className="mr-1 size-3.5" />
              Agregar opción
            </Button>
          </div>

          {errors.opciones && (
            <p className="text-xs text-destructive">
              {Array.isArray(errors.opciones) ? 'Revisa las opciones' : errors.opciones.message}
            </p>
          )}

          <div className="space-y-2">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-2">
                <div className="flex-1 space-y-1">
                  <Input
                    placeholder={`Opción ${index + 1}`}
                    maxLength={255}
                    {...register(`opciones.${index}` as const)}
                    aria-invalid={!!errors.opciones?.[index]}
                  />
                  {errors.opciones?.[index] && (
                    <p className="text-xs text-destructive">
                      {errors.opciones[index]?.message}
                    </p>
                  )}
                </div>
                {fields.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => remove(index)}
                    aria-label={`Eliminar opción ${index + 1}`}
                    disabled={isSubmitting}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </fieldset>

        {/* ─── Cierre ───────────────────────────────────────────── */}
        <div className="space-y-1.5">
          <Label htmlFor="cierra_el">Fecha de cierre (opcional)</Label>
          <Input
            id="cierra_el"
            type="datetime-local"
            {...register('cierra_el')}
          />
          <p className="text-xs text-muted-foreground">
            Si no defines una fecha, la encuesta quedará abierta hasta que la cierres manualmente.
          </p>
        </div>

        {/* ─── Acciones ─────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-2 border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            <X className="mr-1.5 size-4" />
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Creando...
              </>
            ) : (
              'Crear encuesta'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
