import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Modal } from '@/components/shared/Modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScopePicker } from './ScopePicker'
import {
  assignmentSchema,
  type AssignmentFormValues,
} from '../validators/roles-permisos.validators'
import type { PanelUser, Role, ScopeLevel } from '../types/roles.types'

export interface UserRoleAssignerProps {
  open: boolean
  onClose: () => void
  /** Lista de usuarios del panel para elegir destinatario. */
  users: PanelUser[]
  /** Roles disponibles para asignar. */
  roles: Role[]
  isSubmitting?: boolean
  /** Usuario preseleccionado (opcional). */
  defaultUserId?: string
  onSubmit: (data: AssignmentFormValues) => void
}

const SCOPE_OPTIONS: Array<{ value: ScopeLevel; label: string }> = [
  { value: 'organization', label: 'Organización' },
  { value: 'condominium', label: 'Conjunto' },
  { value: 'tower', label: 'Torre' },
  { value: 'unit', label: 'Unidad' },
]

/**
 * Modal para asignar un rol a un usuario con su alcance y vigencia.
 */
export function UserRoleAssigner({
  open,
  onClose,
  users,
  roles,
  isSubmitting = false,
  defaultUserId,
  onSubmit,
}: UserRoleAssignerProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      user_id: defaultUserId ?? '',
      role_id: '',
      scope_type: 'condominium',
      scope_id: '',
      vigencia_inicio: '',
      vigencia_fin: '',
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        user_id: defaultUserId ?? '',
        role_id: '',
        scope_type: 'condominium',
        scope_id: '',
        vigencia_inicio: '',
        vigencia_fin: '',
      })
    }
  }, [open, defaultUserId, reset])

  const watchedScopeType = watch('scope_type')

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
      title="Asignar rol a usuario"
      description="Define el usuario, rol, alcance y vigencia de la asignación."
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="user_id">
            Usuario <span className="text-destructive">*</span>
          </Label>
          <select
            id="user_id"
            {...register('user_id')}
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <option value="">Seleccionar usuario...</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} — {u.email}
              </option>
            ))}
          </select>
          {errors.user_id && (
            <p className="text-xs text-destructive">{errors.user_id.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="role_id">
            Rol <span className="text-destructive">*</span>
          </Label>
          <select
            id="role_id"
            {...register('role_id')}
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <option value="">Seleccionar rol...</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nombre} {r.es_sistema ? '(sistema)' : ''}
              </option>
            ))}
          </select>
          {errors.role_id && (
            <p className="text-xs text-destructive">{errors.role_id.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="scope_type">
              Tipo de alcance <span className="text-destructive">*</span>
            </Label>
            <select
              id="scope_type"
              {...register('scope_type', {
                onChange: () => setValue('scope_id', '', { shouldDirty: true }),
              })}
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              {SCOPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.scope_type && (
              <p className="text-xs text-destructive">{errors.scope_type.message}</p>
            )}
          </div>

          <ScopePicker
            scopeType={watchedScopeType}
            value={watch('scope_id') ?? ''}
            onChange={(v) => setValue('scope_id', v, { shouldDirty: true })}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="vigencia_inicio">Vigencia desde (opcional)</Label>
            <Input
              id="vigencia_inicio"
              type="datetime-local"
              {...register('vigencia_inicio')}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="vigencia_fin">Vigencia hasta (opcional)</Label>
            <Input id="vigencia_fin" type="datetime-local" {...register('vigencia_fin')} />
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Si la asignación ya existe (mismo usuario + rol + alcance), el servidor devolverá
          ASSIGNMENT_EXISTS.
        </p>

        <div className="flex items-center justify-end gap-2 border-t pt-4">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Asignando...
              </>
            ) : (
              'Asignar rol'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
