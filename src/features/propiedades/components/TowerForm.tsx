import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Modal } from '@/components/shared/Modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { towerSchema, type TowerFormValues } from '../validators/propiedades.validators'
import type { Tower } from '../types/propiedades.types'

export interface TowerFormProps {
  open: boolean
  onClose: () => void
  initialValues?: Tower
  isSubmitting?: boolean
  onSubmit: (data: TowerFormValues) => void
}

export function TowerForm({
  open,
  onClose,
  initialValues,
  isSubmitting = false,
  onSubmit,
}: TowerFormProps) {
  const isEditing = !!initialValues

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<TowerFormValues>({
    resolver: zodResolver(towerSchema),
    defaultValues: defaultsFor(initialValues),
  })

  useEffect(() => {
    if (open) reset(defaultsFor(initialValues))
  }, [open, initialValues, reset])

  const handleClose = () => {
    if (isDirty && !window.confirm('Tienes cambios sin guardar. ¿Salir sin guardar?')) {
      return
    }
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isEditing ? `Editar torre ${initialValues!.name}` : 'Nueva torre'}
      size="md"
    >
      <form onSubmit={handleSubmit((v) => onSubmit(v))} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="tower-name">
              Nombre <span className="text-destructive">*</span>
            </Label>
            <Input
              id="tower-name"
              placeholder="Torre 1"
              {...register('name')}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tower-code">Código</Label>
            <Input
              id="tower-code"
              placeholder="T1"
              maxLength={20}
              {...register('code')}
              aria-invalid={!!errors.code}
            />
            {errors.code && (
              <p className="text-xs text-destructive">{errors.code.message}</p>
            )}
            <p className="text-xs text-muted-foreground">Opcional, se muestra en unidades</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="tower-floors">
              N° de pisos <span className="text-destructive">*</span>
            </Label>
            <Input
              id="tower-floors"
              type="number"
              min={0}
              max={200}
              {...register('floor_count', { valueAsNumber: true })}
              aria-invalid={!!errors.floor_count}
            />
            {errors.floor_count && (
              <p className="text-xs text-destructive">{errors.floor_count.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tower-sort">Orden</Label>
            <Input
              id="tower-sort"
              type="number"
              min={0}
              max={999}
              {...register('sort_order', { valueAsNumber: true })}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-md border p-3">
          <input
            id="tower-elevator"
            type="checkbox"
            {...register('has_elevator')}
            className="size-4 rounded border-border"
          />
          <Label htmlFor="tower-elevator" className="cursor-pointer">
            Tiene ascensor
          </Label>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="tower-desc">Descripción</Label>
          <textarea
            id="tower-desc"
            rows={2}
            placeholder="Descripción opcional..."
            {...register('description')}
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-2 border-t pt-4">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Guardando...
              </>
            ) : isEditing ? (
              'Guardar cambios'
            ) : (
              'Crear torre'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function defaultsFor(initial?: Tower): TowerFormValues {
  if (initial) {
    return {
      name: initial.name,
      code: initial.code ?? '',
      floor_count: initial.floor_count,
      has_elevator: initial.has_elevator,
      description: initial.description ?? '',
      sort_order: initial.sort_order,
    }
  }
  return {
    name: '',
    code: '',
    floor_count: 5,
    has_elevator: false,
    description: '',
    sort_order: 0,
  }
}
