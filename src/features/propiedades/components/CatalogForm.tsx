import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Modal } from '@/components/shared/Modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { catalogSchema, type CatalogFormValues } from '../validators/propiedades.validators'
import type { PropertyType, PropertyStatus } from '../types/propiedades.types'

export type CatalogFormMode = 'type' | 'status'

export interface CatalogFormProps {
  open: boolean
  onClose: () => void
  /** 'type' = tipo de unidad, 'status' = estado de unidad */
  catalogType: CatalogFormMode
  initialValues?: PropertyType | PropertyStatus
  isSubmitting?: boolean
  onSubmit: (data: CatalogFormValues) => void
}

export function CatalogForm({
  open,
  onClose,
  catalogType,
  initialValues,
  isSubmitting = false,
  onSubmit,
}: CatalogFormProps) {
  const isEditing = !!initialValues
  const isStatus = catalogType === 'status'

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<CatalogFormValues>({
    resolver: zodResolver(catalogSchema),
    defaultValues: defaultsFor(initialValues, isStatus),
  })

  useEffect(() => {
    if (open) reset(defaultsFor(initialValues, isStatus))
  }, [open, initialValues, isStatus, reset])

  const handleClose = () => {
    if (isDirty && !window.confirm('Tienes cambios sin guardar. ¿Salir sin guardar?')) {
      return
    }
    onClose()
  }

  const title = isEditing
    ? `Editar ${isStatus ? 'estado' : 'tipo'}`
    : `Nuevo ${isStatus ? 'estado' : 'tipo'} de unidad`

  return (
    <Modal open={open} onClose={handleClose} title={title} size="md">
      <form onSubmit={handleSubmit((v) => onSubmit(v))} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="cat-code">
              Código <span className="text-destructive">*</span>
            </Label>
            <Input
              id="cat-code"
              placeholder={isStatus ? 'occupied, vacant...' : 'apartment, commercial...'}
              readOnly={isEditing}
              aria-invalid={!!errors.code}
              className={isEditing ? 'bg-muted/50 font-mono' : 'font-mono'}
              {...register('code')}
            />
            {errors.code && (
              <p className="text-xs text-destructive">{errors.code.message}</p>
            )}
            <p className="text-xs text-muted-foreground">Solo minúsculas, números y _</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cat-sort">Orden</Label>
            <Input
              id="cat-sort"
              type="number"
              min={0}
              max={999}
              {...register('sort_order', { valueAsNumber: true })}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cat-name">
            Nombre <span className="text-destructive">*</span>
          </Label>
          <Input
            id="cat-name"
            placeholder={isStatus ? 'Ocupada' : 'Apartamento'}
            {...register('name')}
            aria-invalid={!!errors.name}
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cat-desc">Descripción</Label>
          <textarea
            id="cat-desc"
            rows={2}
            placeholder="Descripción opcional..."
            {...register('description')}
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 resize-none"
          />
        </div>

        {isStatus && (
          <div className="flex items-center gap-2 rounded-md border p-3">
            <input
              id="cat-allows"
              type="checkbox"
              {...register('allows_residents')}
              className="size-4 rounded border-border"
            />
            <Label htmlFor="cat-allows" className="cursor-pointer">
              ¿Permite residentes?
            </Label>
          </div>
        )}

        {isEditing && (
          <div className="flex items-center gap-2 rounded-md border p-3">
            <input
              id="cat-active"
              type="checkbox"
              {...register('is_active')}
              className="size-4 rounded border-border"
            />
            <Label htmlFor="cat-active" className="cursor-pointer">
              Activo
            </Label>
          </div>
        )}

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
              'Crear'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function defaultsFor(
  initial: PropertyType | PropertyStatus | undefined,
  isStatus: boolean,
): CatalogFormValues {
  if (initial) {
    return {
      code: initial.code,
      name: initial.name,
      description: initial.description ?? '',
      sort_order: initial.sort_order,
      allows_residents: isStatus
        ? (initial as PropertyStatus).allows_residents
        : true,
      is_active: initial.is_active,
    }
  }
  return {
    code: '',
    name: '',
    description: '',
    sort_order: 0,
    allows_residents: true,
    is_active: true,
  }
}
