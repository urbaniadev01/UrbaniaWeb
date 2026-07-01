import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useChangePassword } from '../hooks/use-change-password'
import { parseApiError } from '@/lib/utils'


// ─── Schema ───────────────────────────────────────────────────────────────

/**
 * Política de contraseñas Urbania (alineada con spec §C.2):
 * - Mínimo 8 caracteres
 * - Al menos 1 mayúscula, 1 minúscula y 1 número
 * - No puede ser igual a ninguna de las últimas 12 (validado en servidor)
 */
const passwordPolicy = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/

const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, 'La contraseña actual es obligatoria'),
    new_password: z
      .string()
      .min(8, 'La nueva contraseña debe tener al menos 8 caracteres')
      .regex(passwordPolicy, 'Debe incluir mayúscula, minúscula y número'),
    new_password_confirmation: z.string().min(1, 'Confirma la nueva contraseña'),
  })
  .refine((data) => data.new_password === data.new_password_confirmation, {
    message: 'Las contraseñas no coinciden',
    path: ['new_password_confirmation'],
  })

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>

// ─── Componente ───────────────────────────────────────────────────────────

export interface ChangePasswordSheetProps {
  open: boolean
  onClose: () => void
}

export function ChangePasswordSheet({ open, onClose }: ChangePasswordSheetProps) {
  const changePassword = useChangePassword()
  const [serverError, setServerError] = useState<string | null>(null)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid, isDirty },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onChange',
    defaultValues: {
      current_password: '',
      new_password: '',
      new_password_confirmation: '',
    },
  })

  const newPassword = watch('new_password')
  const confirmPassword = watch('new_password_confirmation')
  const passwordsMatch = newPassword === confirmPassword && newPassword.length > 0

  const handleClose = () => {
    if (isDirty && !window.confirm('Tienes cambios sin guardar. ¿Salir sin guardar?')) return
    reset()
    setServerError(null)
    onClose()
  }

  const onSubmit = (values: ChangePasswordFormValues) => {
    setServerError(null)
    changePassword.mutate(
      {
        current_password: values.current_password,
        new_password: values.new_password,
        new_password_confirmation: values.new_password_confirmation,
      },
      {
        onError: (err) => {
          const apiError = parseApiError(err)
          // Mapeo contextual del error al campo correspondiente
          if (apiError.code === 'INVALID_CREDENTIALS' || apiError.code === 'WRONG_PASSWORD') {
            setServerError('La contraseña actual es incorrecta')
            return
          }
          if (apiError.code === 'PASSWORD_REUSED') {
            setServerError('No puedes reutilizar una de tus últimas 12 contraseñas')
            return
          }
          if (apiError.code === 'PASSWORD_TOO_WEAK') {
            setServerError('La nueva contraseña no cumple la política de seguridad')
            return
          }
          setServerError(apiError.message)
        },
      },
    )
  }

  // El sheet no debe cerrarse mientras la mutación está en curso
  // (el onSuccess hace logout + redirect, así que onClose nunca se llama allí)
  const handleOpenChange = (next: boolean) => {
    if (!next) handleClose()
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-primary/10 p-2 text-primary">
              <ShieldCheck className="size-5" />
            </div>
            <SheetTitle>Cambiar contraseña</SheetTitle>
          </div>
          <SheetDescription>
            Por seguridad, todas las demás sesiones se cerrarán al cambiar la contraseña.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-6 flex flex-1 flex-col gap-4 overflow-y-auto"
        >
          {serverError && (
            <div
              className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
              role="alert"
            >
              {serverError}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="current_password">Contraseña actual</Label>
            <div className="relative">
              <Input
                id="current_password"
                type={showCurrent ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                {...register('current_password')}
                aria-invalid={!!errors.current_password}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                aria-label={showCurrent ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.current_password && (
              <p className="text-xs text-destructive">{errors.current_password.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="new_password">Nueva contraseña</Label>
            <div className="relative">
              <Input
                id="new_password"
                type={showNew ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                {...register('new_password')}
                aria-invalid={!!errors.new_password}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                aria-label={showNew ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.new_password && (
              <p className="text-xs text-destructive">{errors.new_password.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Mínimo 8 caracteres, con mayúscula, minúscula y número. No puede coincidir con tus
              últimas 12 contraseñas.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="new_password_confirmation">Confirmar nueva contraseña</Label>
            <Input
              id="new_password_confirmation"
              type={showNew ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              {...register('new_password_confirmation')}
              aria-invalid={!!errors.new_password_confirmation}
            />
            {errors.new_password_confirmation && (
              <p className="text-xs text-destructive">
                {errors.new_password_confirmation.message}
              </p>
            )}
            {confirmPassword.length > 0 && !passwordsMatch && !errors.new_password_confirmation && (
              <p className="text-xs text-warning">Las contraseñas aún no coinciden</p>
            )}
          </div>

          <div className="mt-auto flex justify-end gap-2 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={changePassword.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!isValid || !passwordsMatch || changePassword.isPending}
            >
              {changePassword.isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Actualizando...
                </>
              ) : (
                'Actualizar contraseña'
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
