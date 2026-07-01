import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Check, Copy, Download, Loader2, QrCode, ShieldCheck } from 'lucide-react'
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
import { Skeleton } from '@/components/ui/skeleton'
import { useMfaEnable, useMfaSetup } from '../hooks/use-mfa'
import { parseApiError } from '@/lib/utils'
import type { MfaSetupResponse } from '../types/account.types'

// ─── Schema ───────────────────────────────────────────────────────────────

const verifySchema = z.object({
  code: z
    .string()
    .min(1, 'El código es obligatorio')
    .regex(/^\d{6}$/, 'El código debe tener exactamente 6 dígitos'),
})
type VerifyFormValues = z.infer<typeof verifySchema>

// ─── Componente ───────────────────────────────────────────────────────────

export interface MfaSetupSheetProps {
  open: boolean
  onClose: () => void
}

type Step = 'qr' | 'verify' | 'backup'

export function MfaSetupSheet({ open, onClose }: MfaSetupSheetProps) {
  const [step, setStep] = useState<Step>('qr')
  const [setupData, setSetupData] = useState<MfaSetupResponse | null>(null)
  const [setupError, setSetupError] = useState<string | null>(null)
  const [verifyError, setVerifyError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const setupMutation = useMfaSetup()
  const enableMutation = useMfaEnable()

  // Cargar datos de setup al abrir
  useEffect(() => {
    if (open) {
      setStep('qr')
      setSetupData(null)
      setSetupError(null)
      setVerifyError(null)
      setCopied(false)
      setupMutation.mutate(undefined, {
        onSuccess: (data) => {
          setSetupData(data)
        },
        onError: (err) => {
          const apiError = parseApiError(err)
          setSetupError(apiError.message)
        },
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<VerifyFormValues>({
    resolver: zodResolver(verifySchema),
    mode: 'onChange',
  })

  const handleClose = () => {
    if (enableMutation.isPending) return
    reset()
    onClose()
  }

  const onVerify = (values: VerifyFormValues) => {
    setVerifyError(null)
    enableMutation.mutate(
      { code: values.code },
      {
        onSuccess: () => {
          setStep('backup')
        },
        onError: (err) => {
          const apiError = parseApiError(err)
          setVerifyError(apiError.message)
        },
      },
    )
  }

  const handleCopyCodes = async () => {
    if (!setupData) return
    const text = setupData.backup_codes.join('\n')
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success('Códigos copiados al portapapeles')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('No se pudieron copiar los códigos')
    }
  }

  const handleDownloadCodes = () => {
    if (!setupData) return
    const text = [
      'Códigos de respaldo MFA — Urbania',
      '====================================',
      '',
      'IMPORTANTE: Guarda estos códigos en un lugar seguro.',
      'Cada código solo puede usarse una vez.',
      'Los necesitarás si pierdes acceso a tu app autenticadora.',
      '',
      ...setupData.backup_codes.map((code, i) => `${i + 1}. ${code}`),
    ].join('\n')
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'urbania-backup-codes.txt'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success('Archivo descargado')
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && handleClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-primary/10 p-2 text-primary">
              <ShieldCheck className="size-5" />
            </div>
            <SheetTitle>Configurar autenticación de dos factores</SheetTitle>
          </div>
          <SheetDescription>
            {step === 'qr' && 'Escanea el código QR con tu app autenticadora.'}
            {step === 'verify' && 'Ingresa el código de 6 dígitos que muestra tu app.'}
            {step === 'backup' && 'Guarda estos códigos de respaldo en un lugar seguro.'}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 flex-1 overflow-y-auto">
          {step === 'qr' && (
            <div className="space-y-4">
              {setupMutation.isPending || !setupData ? (
                <SetupSkeleton error={setupError} onRetry={() => setupMutation.mutate()} />
              ) : (
                <>
                  <div className="flex flex-col items-center gap-3 rounded-lg border bg-muted/30 p-6">
                    <div className="rounded-md bg-white p-3">
                      {setupData.qr_code_url.startsWith('data:image') ? (
                        <img
                          src={setupData.qr_code_url}
                          alt="Código QR para configurar MFA"
                          className="size-40"
                        />
                      ) : (
                        <div className="flex size-40 items-center justify-center">
                          <QrCode className="size-32 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <p className="text-center text-xs text-muted-foreground">
                      Escanea con Google Authenticator, Authy o 1Password.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label>O ingresa el código manualmente</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={setupData.secret}
                        readOnly
                        className="bg-muted/50 font-mono text-sm"
                        aria-label="Secreto MFA"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          void navigator.clipboard.writeText(setupData.secret)
                          toast.success('Secreto copiado')
                        }}
                        aria-label="Copiar secreto"
                      >
                        <Copy className="size-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 border-t pt-4">
                    <Button type="button" variant="outline" onClick={handleClose}>
                      Cancelar
                    </Button>
                    <Button type="button" onClick={() => setStep('verify')}>
                      Siguiente
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}

          {step === 'verify' && (
            <form onSubmit={handleSubmit(onVerify)} className="space-y-4">
              {verifyError && (
                <div
                  className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
                  role="alert"
                >
                  {verifyError}
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="mfa-code">Código de verificación</Label>
              <Input
                id="mfa-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="123456"
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
                className="text-center font-mono text-lg tracking-widest"
                {...register('code')}
                aria-invalid={!!errors.code}
              />
                {errors.code && (
                  <p className="text-xs text-destructive">{errors.code.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Ingresa el código actual de 6 dígitos que muestra tu app autenticadora.
                </p>
              </div>
              <div className="flex justify-end gap-2 border-t pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('qr')}
                  disabled={enableMutation.isPending}
                >
                  Atrás
                </Button>
                <Button type="submit" disabled={!isValid || enableMutation.isPending}>
                  {enableMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    'Verificar y activar'
                  )}
                </Button>
              </div>
            </form>
          )}

          {step === 'backup' && setupData && (
            <div className="space-y-4">
              <div className="rounded-md border border-warning/30 bg-warning-muted/40 p-3 text-sm">
                <p className="font-medium text-foreground">Importante</p>
                <p className="mt-1 text-muted-foreground">
                  Estos códigos son tu único acceso si pierdes tu app autenticadora. Cada uno
                  solo se puede usar una vez. Guárdalos en un lugar seguro.
                </p>
              </div>

              <div className="rounded-md border bg-muted/30 p-4">
                <ol className="grid grid-cols-2 gap-2 font-mono text-sm">
                  {setupData.backup_codes.map((code, i) => (
                    <li
                      key={i}
                      className="rounded bg-background px-2 py-1 text-center"
                    >
                      {i + 1}. {code}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" onClick={handleCopyCodes}>
                  {copied ? (
                    <>
                      <Check className="mr-1.5 size-4" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1.5 size-4" />
                      Copiar todos
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={handleDownloadCodes}>
                  <Download className="mr-1.5 size-4" />
                  Descargar .txt
                </Button>
                <Button type="button" onClick={handleClose}>
                  Listo
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function SetupSkeleton({ error, onRetry }: { error: string | null; onRetry: () => void }) {
  if (error) {
    return (
      <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
        <p>{error}</p>
        <Button type="button" variant="outline" size="sm" className="mt-2" onClick={onRetry}>
          Reintentar
        </Button>
      </div>
    )
  }
  return (
    <div className="space-y-4" aria-label="Cargando configuración MFA">
      <div className="flex justify-center">
        <Skeleton className="size-40" />
      </div>
      <div className="space-y-1.5">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-9 w-full" />
      </div>
    </div>
  )
}
