import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { mfaCodeSchema, type MfaCodeFormData } from '@/lib/validators'
import { useMfaVerify } from '../hooks/use-mfa-verify'
import { useMfaVerifyBackup } from '../hooks/use-mfa-verify-backup'

export function MfaVerifyForm() {
  const [useBackup, setUseBackup] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const totpMutation = useMfaVerify()
  const backupMutation = useMfaVerifyBackup()
  const activeMutation = useBackup ? backupMutation : totpMutation

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<MfaCodeFormData>({
    resolver: zodResolver(mfaCodeSchema),
  })

  const onSubmit = (data: MfaCodeFormData) => {
    setServerError(null)
    activeMutation.mutate(data.code, {
      onError: (error) => {
        setServerError(error.message)
      },
    })
  }

  const toggleMethod = () => {
    setUseBackup((prev) => !prev)
    setValue('code', '')
    setServerError(null)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
          {serverError}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="code">
          {useBackup ? 'Código de respaldo (8 dígitos)' : 'Código de verificación (6 dígitos)'}
        </Label>
        <Input
          id="code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={useBackup ? 8 : 6}
          placeholder={useBackup ? '12345678' : '123456'}
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          {...register('code')}
          aria-invalid={!!errors.code}
        />
        {errors.code && (
          <p className="text-sm text-destructive">{errors.code.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={activeMutation.isPending}>
        {activeMutation.isPending ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Verificando...
          </>
        ) : (
          <>
            <ShieldCheck className="mr-2 size-4" />
            Verificar código
          </>
        )}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={toggleMethod}
          className="text-sm text-muted-foreground underline hover:text-foreground"
        >
          {useBackup ? 'Usar código TOTP' : 'Usar código de respaldo'}
        </button>
      </div>
    </form>
  )
}
