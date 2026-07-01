import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Info } from 'lucide-react'
import { Modal } from '@/components/shared/Modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { floorOptions, formatFloor, computeFullDesignation } from '../lib/format'
import type {
  CreatePropertyPayload,
  Property,
  PropertyType,
  Tower,
  UpdatePropertyPayload,
} from '../types/propiedades.types'

// ─── Schema ───────────────────────────────────────────────────────────────

/**
 * Schema único para crear y editar. El campo `tower_id` no es editable
 * en update (cambiar de torre es una operación compleja, fuera de scope).
 */
const propertySchema = z
  .object({
    tower_id: z.string().min(1, 'Selecciona una torre'),
    floor: z.coerce
      .number({ invalid_type_error: 'Ingresa un número' })
      .int('Debe ser un número entero')
      .min(0, 'Mínimo 0 (sótano)'),
    unit_number: z
      .string()
      .min(1, 'El número de unidad es obligatorio')
      .max(20, 'Máximo 20 caracteres'),
    property_type_id: z.string().min(1, 'Selecciona un tipo de unidad'),
    area_m2: z.coerce
      .number({ invalid_type_error: 'Ingresa un número' })
      .positive('El área debe ser mayor a 0')
      .max(99999, 'Área demasiado grande'),
    coefficient: z.coerce
      .number({ invalid_type_error: 'Ingresa un número' })
      .positive('El coeficiente debe ser mayor a 0')
      .max(1, 'El coeficiente no puede ser mayor a 1'),
    bedrooms: z.coerce.number().int().min(0).max(50).optional().or(z.literal(0)),
    bathrooms: z.coerce.number().int().min(0).max(50).optional().or(z.literal(0)),
    has_parking: z.boolean().default(false),
    parking_lot: z.string().max(50).optional().or(z.literal('')),
    notes: z.string().max(1000).optional().or(z.literal('')),
  })
  .superRefine((val, ctx) => {
    if (val.has_parking && !val.parking_lot?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['parking_lot'],
        message: 'Indica el número de parqueadero',
      })
    }
  })

type PropertyFormValues = z.infer<typeof propertySchema>

// ─── Props ────────────────────────────────────────────────────────────────

export interface PropertyFormProps {
  open: boolean
  onClose: () => void
  /** Cuando está presente, el formulario opera en modo edición */
  initialValues?: Property
  towers: Tower[]
  types: PropertyType[]
  /** ID del condominio para create (opcional si hay initialValues) */
  condominiumId?: string
  /** ID del status inicial para create (opcional) */
  defaultStatusId?: string
  isSubmitting?: boolean
  onSubmit: (data: CreatePropertyPayload | UpdatePropertyPayload) => void
}

// ─── Componente ───────────────────────────────────────────────────────────

export function PropertyForm({
  open,
  onClose,
  initialValues,
  towers,
  types,
  condominiumId,
  defaultStatusId,
  isSubmitting = false,
  onSubmit,
}: PropertyFormProps) {
  const isEditing = !!initialValues
  const selectedTower = useMemo<Tower | undefined>(() => {
    if (isEditing) return towers.find((t) => t.id === initialValues.tower.id)
    return undefined
  }, [isEditing, initialValues, towers])

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: defaultValuesFor(initialValues, towers, types),
  })

  const watchedTowerId = watch('tower_id')
  const watchedUnitNumber = watch('unit_number')
  const watchedHasParking = watch('has_parking')

  // La torre actual puede cambiar solo en creación (en edición está fija)
  const currentTower = useMemo<Tower | undefined>(() => {
    if (isEditing && selectedTower) return selectedTower
    return towers.find((t) => t.id === watchedTowerId)
  }, [isEditing, selectedTower, towers, watchedTowerId])

  // Resetear formulario al abrir / cambiar initialValues
  useEffect(() => {
    if (open) {
      reset(defaultValuesFor(initialValues, towers, types))
    }
  }, [open, initialValues, reset, towers, types])

  // Validación dinámica: piso <= floor_count
  const floorError = useMemo<string | null>(() => {
    const f = Number(watch('floor'))
    if (Number.isNaN(f)) return null
    if (currentTower && f > currentTower.floor_count) {
      return `La torre ${currentTower.name} solo tiene ${currentTower.floor_count} pisos`
    }
    return null
  }, [currentTower, watch])

  const onFormSubmit = (values: PropertyFormValues) => {
    const basePayload: CreatePropertyPayload = {
      condominium_id: initialValues?.condominium_id ?? condominiumId ?? '',
      tower_id: values.tower_id,
      property_type_id: values.property_type_id,
      property_status_id: defaultStatusId,
      floor: values.floor,
      unit_number: values.unit_number.trim(),
      area_m2: values.area_m2,
      coefficient: values.coefficient,
      bedrooms: values.bedrooms || undefined,
      bathrooms: values.bathrooms || undefined,
      has_parking: values.has_parking,
      parking_lot: values.has_parking ? values.parking_lot?.trim() || undefined : undefined,
      notes: values.notes?.trim() || undefined,
    }

    if (isEditing) {
      // En edición NO se permite cambiar tower_id ni unit_number
      const updatePayload: UpdatePropertyPayload = {
        property_type_id: values.property_type_id,
        area_m2: values.area_m2,
        coefficient: values.coefficient,
        bedrooms: values.bedrooms || undefined,
        bathrooms: values.bathrooms || undefined,
        has_parking: values.has_parking,
        parking_lot: values.has_parking ? values.parking_lot?.trim() || undefined : undefined,
        notes: values.notes?.trim() || undefined,
      }
      onSubmit(updatePayload)
    } else {
      onSubmit(basePayload)
    }
  }

  const handleClose = () => {
    if (isDirty && !window.confirm('Tienes cambios sin guardar. ¿Salir sin guardar?')) {
      return
    }
    onClose()
  }

  // Vista previa de la designación completa
  const previewDesignation = computeFullDesignation(
    currentTower ?? null,
    String(watchedUnitNumber ?? ''),
  )

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={
        isEditing
          ? `Editar unidad ${initialValues!.full_designation}`
          : 'Nueva unidad'
      }
      description={
        isEditing
          ? 'Modifica los datos físicos de la unidad. La ubicación (torre + unidad) no se puede editar.'
          : 'Registra una nueva unidad en el conjunto.'
      }
      size="xl"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* ─── Ubicación ──────────────────────────────────────────────── */}
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-foreground">Ubicación</legend>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="tower_id">
                Torre <span className="text-destructive">*</span>
              </Label>
              <select
                id="tower_id"
                {...register('tower_id')}
                disabled={isEditing}
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Seleccionar torre...</option>
                {towers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.code?.trim() ? `${t.code} - ${t.name}` : t.name}
                  </option>
                ))}
              </select>
              {errors.tower_id && (
                <p className="text-xs text-destructive">{errors.tower_id.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="floor">
                Piso <span className="text-destructive">*</span>
              </Label>
              {isEditing ? (
                // En edición, mostrar el piso actual como texto
                <Input
                  id="floor"
                  value={formatFloor(initialValues!.floor)}
                  readOnly
                  className="bg-muted/50"
                />
              ) : currentTower ? (
                <select
                  id="floor"
                  {...register('floor', { valueAsNumber: true })}
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  <option value="">Seleccionar piso...</option>
                  {floorOptions(currentTower.floor_count).map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  id="floor"
                  type="number"
                  min={0}
                  max={200}
                  placeholder="0"
                  {...register('floor', { valueAsNumber: true })}
                />
              )}
              {errors.floor && (
                <p className="text-xs text-destructive">{errors.floor.message}</p>
              )}
              {floorError && !errors.floor && (
                <p className="text-xs text-warning">{floorError}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="unit_number">
                N° de unidad <span className="text-destructive">*</span>
              </Label>
              <Input
                id="unit_number"
                placeholder="302, 101A"
                disabled={isEditing}
                {...register('unit_number')}
              />
              {errors.unit_number && (
                <p className="text-xs text-destructive">{errors.unit_number.message}</p>
              )}
            </div>
          </div>

          {previewDesignation && (
            <p className="text-xs text-muted-foreground">
              Designación: <span className="font-mono">{previewDesignation}</span>
            </p>
          )}
        </fieldset>

        {/* ─── Datos físicos ──────────────────────────────────────────── */}
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-foreground">Datos físicos</legend>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="property_type_id">
                Tipo de unidad <span className="text-destructive">*</span>
              </Label>
              <select
                id="property_type_id"
                {...register('property_type_id')}
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <option value="">Seleccionar tipo...</option>
                {types.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              {errors.property_type_id && (
                <p className="text-xs text-destructive">
                  {errors.property_type_id.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="area_m2">
                Área (m²) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="area_m2"
                type="number"
                step="0.01"
                min={0}
                placeholder="65.50"
                {...register('area_m2', { valueAsNumber: true })}
              />
              {errors.area_m2 && (
                <p className="text-xs text-destructive">{errors.area_m2.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="coefficient">
                Coeficiente <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="coefficient"
                  type="number"
                  step="0.000001"
                  min={0}
                  max={1}
                  placeholder="0.008333"
                  title="Coeficiente de copropiedad (porcentaje de participación)"
                  {...register('coefficient', { valueAsNumber: true })}
                />
                <Info
                  className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-label="Coeficiente de copropiedad"
                />
              </div>
              {errors.coefficient && (
                <p className="text-xs text-destructive">{errors.coefficient.message}</p>
              )}
              <p className="text-xs text-muted-foreground">Coeficiente de copropiedad</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bedrooms">Habitaciones</Label>
              <Input
                id="bedrooms"
                type="number"
                min={0}
                max={50}
                {...register('bedrooms', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bathrooms">Baños</Label>
              <Input
                id="bathrooms"
                type="number"
                min={0}
                max={50}
                {...register('bathrooms', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="space-y-2 rounded-md border p-3">
            <div className="flex items-center gap-2">
              <input
                id="has_parking"
                type="checkbox"
                {...register('has_parking')}
                className="size-4 rounded border-border"
                onChange={(e) => {
                  setValue('has_parking', e.target.checked, { shouldDirty: true })
                  if (!e.target.checked) setValue('parking_lot', '', { shouldDirty: true })
                }}
              />
              <Label htmlFor="has_parking" className="cursor-pointer">
                Tiene parqueadero
              </Label>
            </div>

            {watchedHasParking && (
              <div className="space-y-1.5">
                <Label htmlFor="parking_lot">N° de parqueadero</Label>
                <Input
                  id="parking_lot"
                  placeholder="P-12, 23, etc."
                  {...register('parking_lot')}
                />
                {errors.parking_lot && (
                  <p className="text-xs text-destructive">{errors.parking_lot.message}</p>
                )}
              </div>
            )}
          </div>
        </fieldset>

        {/* ─── Notas ──────────────────────────────────────────────────── */}
        <fieldset className="space-y-1.5">
          <legend className="text-sm font-medium text-foreground">Notas</legend>
          <textarea
            id="notes"
            placeholder="Notas opcionales sobre la unidad..."
            rows={3}
            {...register('notes')}
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 resize-none"
          />
        </fieldset>

        {/* ─── Acciones ───────────────────────────────────────────────── */}
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
              'Crear unidad'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function defaultValuesFor(
  initial: Property | undefined,
  _towers: Tower[],
  _types: PropertyType[],
): PropertyFormValues {
  if (initial) {
    return {
      tower_id: initial.tower.id,
      floor: initial.floor,
      unit_number: initial.unit_number,
      property_type_id: initial.type.id,
      area_m2: Number(initial.area_m2),
      coefficient: Number(initial.coefficient),
      bedrooms: initial.bedrooms ?? 0,
      bathrooms: initial.bathrooms ?? 0,
      has_parking: initial.has_parking,
      parking_lot: initial.parking_lot ?? '',
      notes: initial.notes ?? '',
    }
  }
  return {
    tower_id: '',
    floor: 0,
    unit_number: '',
    property_type_id: '',
    area_m2: 0,
    coefficient: 0,
    bedrooms: 0,
    bathrooms: 0,
    has_parking: false,
    parking_lot: '',
    notes: '',
  }
}
