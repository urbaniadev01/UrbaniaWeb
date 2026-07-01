import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { ClipboardCheck, Plus, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Modal } from '@/components/shared/Modal'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { Skeleton } from '@/components/ui/skeleton'
import { useApprovalRules, useCreateApprovalRule } from '../hooks/use-approval-rules'
import { useRoleList } from '../hooks/use-roles'
import { parseApiError } from '@/lib/utils'
import {
  approvalRuleSchema,
  type ApprovalRuleFormValues,
} from '../validators/roles-permisos.validators'
import type { ApprovalRule, PermissionAction, Role } from '../types/roles.types'

const ACTION_OPTIONS: Array<{ value: PermissionAction; label: string }> = [
  { value: 'ver', label: 'Ver' },
  { value: 'crear', label: 'Crear' },
  { value: 'editar', label: 'Editar' },
  { value: 'eliminar', label: 'Eliminar' },
  { value: 'aprobar', label: 'Aprobar' },
  { value: 'exportar', label: 'Exportar' },
  { value: 'configurar', label: 'Configurar' },
]

export function ApprovalRulesPage() {
  const { data, isLoading, isError, error, refetch } = useApprovalRules()
  const { data: rolesResp } = useRoleList()
  const [showForm, setShowForm] = useState(false)

  const rules = useMemo<ApprovalRule[]>(() => data?.data ?? [], [data])
  const roles = useMemo<Role[]>(() => rolesResp?.data ?? [], [rolesResp])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <ClipboardCheck className="size-6 text-muted-foreground" aria-hidden="true" />
            Reglas de aprobación
          </h1>
          <p className="text-sm text-muted-foreground">
            Define umbrales que requieren aprobación de un rol distinto al autor.
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-1.5 size-4" />
          Nueva regla
        </Button>
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : isError ? (
        <ErrorState
          error={error}
          title="Error al cargar las reglas"
          onRetry={() => refetch()}
        />
      ) : rules.length === 0 ? (
        <EmptyState
          icon={<ClipboardCheck className="size-8" aria-hidden="true" />}
          title="Sin reglas de aprobación"
          description="Crea la primera regla para exigir segregación de funciones en acciones críticas."
          action={
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-1.5 size-4" />
              Crear primera regla
            </Button>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Recurso
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Acción
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Umbral
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Rol aprobador
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Doble aprobación
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rules.map((r) => (
                <tr key={r.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs">
                      {r.resource}
                    </span>
                  </td>
                  <td className="px-4 py-3">{r.action}</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums">
                    {r.threshold != null ? formatCOP(r.threshold) : '—'}
                  </td>
                  <td className="px-4 py-3">{r.approver_role.name}</td>
                  <td className="px-4 py-3 text-center">
                    {r.requires_second_approval ? (
                      <span className="text-success">Sí</span>
                    ) : (
                      <span className="text-muted-foreground">No</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ApprovalRuleForm
        open={showForm}
        onClose={() => setShowForm(false)}
        roles={roles}
        isSubmitting={false}
        onSubmit={() => {
          // delegation
        }}
      />
    </div>
  )
}

// ─── Form ─────────────────────────────────────────────────────────────────

function ApprovalRuleForm({
  open,
  onClose,
  roles,
  isSubmitting,
  onSubmit: _onSubmit,
}: {
  open: boolean
  onClose: () => void
  roles: Role[]
  isSubmitting: boolean
  onSubmit: (values: ApprovalRuleFormValues) => void
}) {
  const createRule = useCreateApprovalRule()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ApprovalRuleFormValues>({
    resolver: zodResolver(approvalRuleSchema),
    defaultValues: {
      resource: '',
      action: 'aprobar',
      threshold: '',
      approver_role_id: '',
      requires_second_approval: false,
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        resource: '',
        action: 'aprobar',
        threshold: '',
        approver_role_id: '',
        requires_second_approval: false,
      })
    }
  }, [open, reset])

  const handleClose = () => {
    if (isDirty && !window.confirm('Tienes cambios sin guardar. ¿Salir sin guardar?')) {
      return
    }
    onClose()
  }

  const onFormSubmit = (values: ApprovalRuleFormValues) => {
    createRule.mutate(
      {
        resource: values.resource,
        action: values.action,
        threshold: values.threshold === '' ? null : Number(values.threshold),
        approver_role_id: values.approver_role_id,
        requires_second_approval: values.requires_second_approval,
      },
      {
        onSuccess: () => {
          toast.success('Regla creada')
          onClose()
        },
        onError: (err) => {
          const apiError = parseApiError(err)
          toast.error(apiError.message, { description: `Código: ${apiError.code}` })
        },
      },
    )
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Nueva regla de aprobación"
      description="Define cuándo una acción requiere aprobación de un rol distinto al autor."
      size="lg"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="resource">
              Recurso <span className="text-destructive">*</span>
            </Label>
            <Input
              id="resource"
              placeholder="pagos, propiedades, …"
              {...register('resource')}
              aria-invalid={!!errors.resource}
            />
            {errors.resource && (
              <p className="text-xs text-destructive">{errors.resource.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="action">
              Acción <span className="text-destructive">*</span>
            </Label>
            <select
              id="action"
              {...register('action')}
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              {ACTION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.action && (
              <p className="text-xs text-destructive">{errors.action.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="threshold">Umbral (COP, opcional)</Label>
          <Input
            id="threshold"
            type="number"
            min={0}
            placeholder="500000"
            {...register('threshold')}
          />
          <p className="text-xs text-muted-foreground">
            Si se define, la regla aplica solo cuando el monto supere este valor.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="approver_role_id">
            Rol aprobador <span className="text-destructive">*</span>
          </Label>
          <select
            id="approver_role_id"
            {...register('approver_role_id')}
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <option value="">Seleccionar rol...</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nombre}
              </option>
            ))}
          </select>
          {errors.approver_role_id && (
            <p className="text-xs text-destructive">{errors.approver_role_id.message}</p>
          )}
        </div>

        <div className="flex items-start gap-2 rounded-md border border-info/30 bg-info-muted/40 p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-info" aria-hidden="true" />
          <p className="text-muted-foreground">
            Por segregación de funciones, el rol aprobador debe ser distinto al rol del
            solicitante. El servidor rechazará la regla si el aprobador podría ser el autor.
          </p>
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            {...register('requires_second_approval')}
            className="size-4 rounded border-border"
          />
          <span>Requiere doble aprobación</span>
        </label>

        <div className="flex items-center justify-end gap-2 border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting || createRule.isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting || createRule.isPending}>
            {createRule.isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Guardando...
              </>
            ) : (
              'Crear regla'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function formatCOP(n: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n)
}

function TableSkeleton() {
  return (
    <div className="space-y-2" aria-label="Cargando reglas">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  )
}
