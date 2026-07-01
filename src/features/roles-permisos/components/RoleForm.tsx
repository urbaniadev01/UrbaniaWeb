import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Modal } from '@/components/shared/Modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { roleSchema, type RoleFormValues } from '../validators/roles-permisos.validators'
import type { Role, ScopeLevel } from '../types/roles.types'

export interface RoleFormProps {
  open: boolean
  onClose: () => void
  /** Cuando está presente, el formulario opera en modo edición. */
  initialValues?: Role
  /** Roles existentes — se usan en el selector "Basado en rol existente" (solo crear). */
  availableBaseRoles?: Role[]
  isSubmitting?: boolean
  onSubmit: (data: RoleFormValues) => void
}

const SCOPE_OPTIONS: Array<{ value: ScopeLevel; label: string }> = [
  { value: 'organization', label: 'Organización' },
  { value: 'condominium', label: 'Conjunto' },
  { value: 'tower', label: 'Torre' },
  { value: 'unit', label: 'Unidad' },
]

/**
 * Formulario para crear/editar un rol.
 * - nombre: 2-100 caracteres, obligatorio
 * - descripcion: hasta 500 caracteres
 * - nivel_alcance: organization | condominium | tower | unit
 * - base_role_id (solo en crear): opcional — clonar permisos de un rol existente
 */
export function RoleForm({
  open,
  onClose,
  initialValues,
  availableBaseRoles = [],
  isSubmitting = false,
  onSubmit,
}: RoleFormProps) {
  const isEditing = !!initialValues

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: defaultValuesFor(initialValues),
  })

  useEffect(() => {
    if (open) {
      reset(defaultValuesFor(initialValues))
    }
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
      title={isEditing ? `Editar rol: ${initialValues?.nombre}` : 'Nuevo rol'}
      description={
        isEditing
          ? 'Modifica los datos básicos del rol. La matriz de permisos se edita aparte.'
          : 'Crea un rol nuevo. Podrás asignarle permisos inmediatamente después.'
      }
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="nombre">
            Nombre <span className="text-destructive">*</span>
          </Label>
          <Input
            id="nombre"
            placeholder="Contador, Recepcionista, Operador..."
            {...register('nombre')}
            aria-invalid={!!errors.nombre}
            disabled={isEditing && initialValues?.es_sistema}
          />
          {errors.nombre && (
            <p className="text-xs text-destructive">{errors.nombre.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="descripcion">Descripción</Label>
          <textarea
            id="descripcion"
            rows={3}
            placeholder="Describe brevemente el propósito de este rol."
            {...register('descripcion')}
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 resize-none"
          />
          {errors.descripcion && (
            <p className="text-xs text-destructive">{errors.descripcion.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="nivel_alcance">
            Nivel de alcance <span className="text-destructive">*</span>
          </Label>
          <select
            id="nivel_alcance"
            {...register('nivel_alcance')}
            disabled={isEditing && initialValues?.es_sistema}
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {SCOPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {errors.nivel_alcance && (
            <p className="text-xs text-destructive">{errors.nivel_alcance.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Determina sobre qué tipo de entidad aplica este rol.
          </p>
        </div>

        {!isEditing && availableBaseRoles.length > 0 && (
          <div className="space-y-1.5">
            <Label htmlFor="base_role_id">Basado en rol existente (opcional)</Label>
            <select
              id="base_role_id"
              {...register('base_role_id')}
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <option value="">— Crear desde cero —</option>
              {availableBaseRoles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nombre}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              Si eliges un rol base, el nuevo rol heredará sus permisos.
            </p>
          </div>
        )}

        {isEditing && initialValues?.es_sistema && (
          <div className="rounded-md border border-warning/30 bg-warning-muted/40 p-3 text-sm">
            <p className="font-medium text-foreground">Rol de sistema</p>
            <p className="mt-1 text-muted-foreground">
              Este rol fue creado por el operador de Urbania. Sus datos básicos no se pueden
              modificar desde aquí; solo el operador SaaS puede hacerlo.
            </p>
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
              'Crear rol'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function defaultValuesFor(initial: Role | undefined): RoleFormValues {
  if (initial) {
    return {
      nombre: initial.nombre,
      descripcion: initial.descripcion ?? '',
      nivel_alcance: initial.nivel_alcance,
      base_role_id: '',
    }
  }
  return {
    nombre: '',
    descripcion: '',
    nivel_alcance: 'condominium',
    base_role_id: '',
  }
}
