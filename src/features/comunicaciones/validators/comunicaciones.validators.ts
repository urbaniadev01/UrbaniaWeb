import { z } from 'zod'

// =====================================================================
// Schemas Zod para formularios del feature Comunicaciones.
// Patrón: Zod + React Hook Form. Siguen la convención de los demás
// features del proyecto (auth, propiedades, roles-permisos).
// =====================================================================

/** Schema para redactar un comunicado. */
export const announcementSchema = z.object({
  titulo: z
    .string()
    .min(1, 'El título es obligatorio')
    .max(255, 'El título es demasiado largo'),
  cuerpo: z
    .string()
    .min(1, 'El contenido es obligatorio')
    .max(5000, 'El contenido es demasiado largo'),
  segmento: z.enum(['todos', 'torre', 'morosos', 'unidad'], {
    errorMap: () => ({ message: 'Selecciona un segmento' }),
  }),
  target_id: z.string().uuid('ID inválido').optional().or(z.literal('')),
  canales: z
    .array(z.enum(['whatsapp', 'email', 'push']))
    .min(1, 'Selecciona al menos un canal'),
  programado_para: z.string().optional().or(z.literal('')),
  fijado: z.boolean().default(false),
})

export type AnnouncementFormValues = z.infer<typeof announcementSchema>

/** Schema para crear/actualizar una plantilla. */
export const templateSchema = z.object({
  nombre: z
    .string()
    .min(1, 'El nombre es obligatorio')
    .max(255, 'El nombre es demasiado largo'),
  tipo: z.string().max(50, 'Tipo demasiado largo').optional().or(z.literal('')),
  cuerpo: z
    .string()
    .min(1, 'El contenido es obligatorio')
    .max(5000, 'El contenido es demasiado largo'),
})

export type TemplateFormValues = z.infer<typeof templateSchema>

/** Schema para crear una encuesta. */
export const surveySchema = z.object({
  pregunta: z
    .string()
    .min(1, 'La pregunta es obligatoria')
    .max(500, 'La pregunta es demasiado larga'),
  opciones: z
    .array(z.string().max(255, 'La opción es demasiado larga'))
    .min(2, 'Al menos dos opciones son requeridas')
    .superRefine((arr, ctx) => {
      arr.forEach((opt, i) => {
        if (opt.trim().length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [i],
            message: 'La opción no puede estar vacía',
          })
        }
      })
    }),
  cierra_el: z.string().optional(),
})

export type SurveyFormValues = z.infer<typeof surveySchema>

/** Schema para configurar un canal. */
export const channelSchema = z.object({
  canal: z.enum(['whatsapp', 'email', 'push'], {
    errorMap: () => ({ message: 'Canal inválido' }),
  }),
  config: z.object({
    provider: z.string().min(1, 'El proveedor es obligatorio'),
    token: z.string().min(1, 'El token es obligatorio'),
  }),
  activo: z.boolean(),
})

export type ChannelFormValues = z.infer<typeof channelSchema>
