import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es obligatorio')
    .email('Ingresa un email válido'),
  password: z
    .string()
    .min(1, 'La contraseña es obligatoria'),
})

export type LoginFormData = z.infer<typeof loginSchema>

export const mfaCodeSchema = z.object({
  code: z
    .string()
    .min(1, 'El código es obligatorio')
    .regex(/^\d+$/, 'Solo se permiten números'),
})

export type MfaCodeFormData = z.infer<typeof mfaCodeSchema>
