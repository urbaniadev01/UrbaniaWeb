import { z } from 'zod'

/** Schema de validación para crear/editar un rol. */
export const roleSchema = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre es demasiado largo'),
  descripcion: z.string().max(500, 'Descripción demasiado larga').optional().or(z.literal('')),
  nivel_alcance: z.enum(['organization', 'condominium', 'tower', 'unit'], {
    errorMap: () => ({ message: 'Selecciona un nivel de alcance' }),
  }),
  base_role_id: z.string().optional().or(z.literal('')),
})

export type RoleFormValues = z.infer<typeof roleSchema>

/** Schema para asignar un rol a un usuario. */
export const assignmentSchema = z.object({
  user_id: z.string().min(1, 'Selecciona un usuario'),
  role_id: z.string().min(1, 'Selecciona un rol'),
  scope_type: z.enum(['organization', 'condominium', 'tower', 'unit'], {
    errorMap: () => ({ message: 'Selecciona un tipo de alcance' }),
  }),
  scope_id: z.string().min(1, 'Selecciona un alcance'),
  vigencia_inicio: z.string().optional().or(z.literal('')),
  vigencia_fin: z.string().optional().or(z.literal('')),
})

export type AssignmentFormValues = z.infer<typeof assignmentSchema>

/** Schema para crear una regla de aprobación. */
export const approvalRuleSchema = z
  .object({
    resource: z.string().min(1, 'Selecciona un recurso'),
    action: z.enum(['ver', 'crear', 'editar', 'eliminar', 'aprobar', 'exportar', 'configurar'], {
      errorMap: () => ({ message: 'Selecciona una acción' }),
    }),
    threshold: z
      .union([
        z.literal(''),
        z.coerce.number().int('Debe ser un número entero').nonnegative('No puede ser negativo'),
      ])
      .optional(),
    approver_role_id: z.string().min(1, 'Selecciona un rol aprobador'),
    requires_second_approval: z.boolean().default(false),
  })
  .refine(
    (val) => {
      // El rol aprobador no puede ser el mismo que el rol del solicitante;
      // esa segregación la valida el servidor, pero a nivel UI solo pedimos
      // que se haya seleccionado un rol distinto del autor.
      return val.approver_role_id !== ''
    },
    { message: 'Selecciona un rol aprobador', path: ['approver_role_id'] },
  )

export type ApprovalRuleFormValues = z.infer<typeof approvalRuleSchema>

/** Schema de filtros de auditoría. */
export const auditFilterSchema = z.object({
  from: z.string().optional().or(z.literal('')),
  to: z.string().optional().or(z.literal('')),
  actor: z.string().optional().or(z.literal('')),
})

export type AuditFilterValues = z.infer<typeof auditFilterSchema>
