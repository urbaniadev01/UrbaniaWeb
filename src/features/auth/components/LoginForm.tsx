import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { loginSchema, type LoginFormData } from '@/lib/validators'
import { useLogin } from '../hooks/use-login'

export function LoginForm() {
  const [serverError, setServerError] = useState<string | null>(null)
  const loginMutation = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = (data: LoginFormData) => {
    setServerError(null)
    loginMutation.mutate(data, {
      onError: (error) => {
        if (error.code === 'MFA_REQUIRED' || error.code === 'FORCE_PASSWORD_CHANGE') {
          return // useLogin.onError maneja la navegación
        }
        setServerError(error.message)
      },
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
          {serverError}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="admin@urbania.com"
          {...register('email')}
          aria-invalid={!!errors.email}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          {...register('password')}
          aria-invalid={!!errors.password}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
        {loginMutation.isPending ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Iniciando sesión...
          </>
        ) : (
          <>
            <LogIn className="mr-2 size-4" />
            Iniciar sesión
          </>
        )}
      </Button>
    </form>
  )
}
