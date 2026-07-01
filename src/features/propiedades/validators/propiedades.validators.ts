import { z } from 'zod'

// =====================================================================
// Schemas Zod para formularios del feature Propiedades
// Siguen el patrón establecido por auth/directorio: Zod + RHF.
// =====================================================================

/** Torre: nombre obligatorio, código opcional, N° pisos entero >= 0 */
export const towerSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(100),
  code: z
    .string()
    .max(20, 'Máximo 20 caracteres')
    .regex(/^[A-Za-z0-9_-]*$/, 'Solo letras, números, guion y guion bajo')
    .optional()
    .or(z.literal('')),
  floor_count: z.coerce
    .number({ invalid_type_error: 'Debe ser un número' })
    .int('Debe ser entero')
    .min(0, 'Mínimo 0 (solo sótano)')
    .max(200, 'Máximo 200 pisos'),
  has_elevator: z.boolean().default(false),
  description: z.string().max(500).optional().or(z.literal('')),
  sort_order: z.coerce.number().int().min(0).max(999).default(0),
})

export type TowerFormValues = z.infer<typeof towerSchema>

/** Catálogo: tipo o estado. `catalogType` define qué campos se aplican. */
export const catalogTypeSchema = z.object({
  code: z
    .string()
    .min(1, 'El código es obligatorio')
    .max(50, 'Máximo 50 caracteres')
    .regex(/^[a-z0-9_]+$/, 'Solo minúsculas, números y guion bajo'),
  name: z.string().min(1, 'El nombre es obligatorio').max(100),
  description: z.string().max(500).optional().or(z.literal('')),
  sort_order: z.coerce.number().int().min(0).max(999).default(0),
  is_active: z.boolean().default(true),
})

export const catalogStatusSchema = catalogTypeSchema.extend({
  allows_residents: z.boolean().default(true),
})

export type CatalogTypeFormValues = z.infer<typeof catalogTypeSchema>
export type CatalogStatusFormValues = z.infer<typeof catalogStatusSchema>

/** Schema unificado usado por CatalogForm */
export const catalogSchema = z.object({
  code: z
    .string()
    .min(1, 'El código es obligatorio')
    .max(50)
    .regex(/^[a-z0-9_]+$/, 'Solo minúsculas, números y guion bajo'),
  name: z.string().min(1, 'El nombre es obligatorio').max(100),
  description: z.string().max(500).optional().or(z.literal('')),
  sort_order: z.coerce.number().int().min(0).max(999).default(0),
  allows_residents: z.boolean().default(true),
  is_active: z.boolean().default(true),
})

export type CatalogFormValues = z.infer<typeof catalogSchema>
