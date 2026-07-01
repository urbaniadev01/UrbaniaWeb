import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, ShieldOff, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
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
import { useMfaDisable } from '../hooks/use-mfa'
import { parseApiError } from '@/lib/utils'

// ─── Schema ───────────────────────────────────────────────────────────────

const disableSchema = z.object({
  password: z.string().min(1, 'La contraseña es obligatoria'),
  code: z
    .string()
    .min(1, 'El código es obligatorio')
    .regex(/^\d{6}$/, 'El código debe tener exactamente 6 dígitos'),
})
type DisableFormValues = z.infer<typeof disableSchema>

// ─── Componente ───────────────────────────────────────────────────────────

export interface MfaDisableSheetProps {
  open: boolean
  onClose: () => void
}

export function MfaDisableSheet({ open, onClose }: MfaDisableSheetProps) {
  const disableMutation = useMfaDisable()
  const [serverError, setServerError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isDirty },
  } = useForm<DisableFormValues>({
    resolver: zodResolver(disableSchema),
    mode: 'onChange',
    defaultValues: { password: '', code: '' },
  })

  const handleClose = () => {
    if (isDirty && !window.confirm('Tienes cambios sin guardar. ¿Salir sin guardar?')) return
    reset()
    setServerError(null)
    onClose()
  }

  const onSubmit = (values: DisableFormValues) => {
    setServerError(null)
    disableMutation.mutate(
      { password: values.password, code: values.code },
      {
        onSuccess: () => {
          toast.success('MFA desactivado')
          reset()
          onClose()
        },
        onError: (err) => {
          const apiError = parseApiError(err)
          if (apiError.code === 'INVALID_CREDENTIALS' || apiError.code === 'WRONG_PASSWORD') {
            setServerError('La contraseña es incorrecta')
            return
          }
          if (apiError.code === 'MFA_INVALID_CODE') {
            setServerError('El código TOTP es incorrecto o ha expirado')
            return
          }
          setServerError(apiError.message)
        },
      },
    )
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && handleClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-destructive/10 p-2 text-destructive">
              <ShieldOff className="size-5" />
            </div>
            <SheetTitle>Desactivar autenticación de dos factores</SheetTitle>
          </div>
          <SheetDescription>
            Por seguridad, confirma tu contraseña y un código TOTP actual para desactivar MFA.
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
            <Label htmlFor="mfa-disable-password">Contraseña actual</Label>
            <div className="relative">
              <Input
                id="mfa-disable-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                {...register('password')}
                aria-invalid={!!errors.password}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="mfa-disable-code">Código TOTP</Label>
            <Input
              id="mfa-disable-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="123456"
              className="text-center font-mono text-lg tracking-widest"
              {...register('code')}
              aria-invalid={!!errors.code}
            />
            {errors.code && (
              <p className="text-xs text-destructive">{errors.code.message}</p>
            )}
          </div>

          <div className="mt-auto flex justify-end gap-2 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={disableMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={!isValid || disableMutation.isPending}
            >
              {disableMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Desactivando...
                </>
              ) : (
                'Desactivar MFA'
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
