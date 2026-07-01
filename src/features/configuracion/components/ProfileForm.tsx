import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Camera, User } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthStore } from '@/stores/auth.store'
import { useProfile, useUpdateProfile } from '../hooks/use-profile'
import { parseApiError } from '@/lib/utils'
import type { Profile } from '../types/account.types'

// ─── Schema ───────────────────────────────────────────────────────────────

/**
 * Schema de validación del formulario de perfil.
 * - name: obligatorio, 2-100 caracteres
 * - phone: opcional, pero si se proporciona debe ser válido
 * - avatar_url: opcional, debe ser URL válida
 */
const profileSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre es demasiado largo'),
  phone: z
    .string()
    .regex(/^[\d\s+\-()]{0,20}$/, 'Formato de teléfono inválido')
    .or(z.literal(''))
    .optional(),
  avatar_url: z
    .string()
    .url('Debe ser una URL válida')
    .or(z.literal(''))
    .optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

/**
 * Resuelve el ID de la organización/condominio desde la fuente disponible.
 * `Profile` (servidor) usa `organization_id`; `AuthUser` (store) usa `condominium_id`.
 */
function resolveOrganizationId(
  source: (Profile & { condominium_id?: string | null }) | { condominium_id?: string | null } | null,
): string {
  if (!source) return '—'
  if ('organization_id' in source && source.organization_id) return source.organization_id
  if ('condominium_id' in source && source.condominium_id) return source.condominium_id
  return '—'
}

// ─── Helpers ──────────────────────────────────────────────────────────────

/** Iniciales a partir del nombre (máx 2 letras). */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/** Convierte un File a data URL (base64). Usado para preview antes de subir. */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// ─── Componente ───────────────────────────────────────────────────────────

export function ProfileForm() {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // Datos del store de auth (cacheados tras login/bootstrap)
  const storeUser = useAuthStore((s) => s.user)
  // Datos frescos del servidor
  const { data: profile, isLoading, isError, error, refetch } = useProfile()
  const updateMutation = useUpdateProfile()

  // El perfil que se muestra es el del servidor si está disponible,
  // sino el del store (datos cacheados del login).
  const currentUser = profile ?? storeUser

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: currentUser?.name ?? '',
      phone: currentUser?.phone ?? '',
      avatar_url: currentUser?.avatar_url ?? '',
    },
  })

  const watchedAvatar = watch('avatar_url')
  const avatarToShow = previewUrl ?? watchedAvatar ?? currentUser?.avatar_url ?? null

  // Cuando llegan los datos del servidor, reseteamos el form
  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name,
        phone: profile.phone ?? '',
        avatar_url: profile.avatar_url ?? '',
      })
      setPreviewUrl(null)
    }
  }, [profile, reset])

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten imágenes')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('La imagen no puede pesar más de 2 MB')
      return
    }
    try {
      const dataUrl = await fileToDataUrl(file)
      setPreviewUrl(dataUrl)
      setValue('avatar_url', dataUrl, { shouldDirty: true })
    } catch {
      toast.error('No se pudo leer la imagen')
    }
  }

  const onSubmit = (values: ProfileFormValues) => {
    const payload = {
      name: values.name.trim(),
      phone: values.phone?.trim() || null,
      avatar_url: values.avatar_url?.trim() || null,
    }
    updateMutation.mutate(payload, {
      onSuccess: () => {
        toast.success('Perfil actualizado correctamente')
        setPreviewUrl(null)
        void refetch()
      },
      onError: (err) => {
        const apiError = parseApiError(err)
        toast.error(apiError.message, { description: `Código: ${apiError.code}` })
      },
    })
  }

  // ─── Loading ──────────────────────────────────────────────────────────
  if (isLoading && !currentUser) {
    return <ProfileFormSkeleton />
  }

  // ─── Error ────────────────────────────────────────────────────────────
  if (isError && !currentUser) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-6" role="alert">
        <p className="text-sm text-destructive">No se pudo cargar el perfil.</p>
        <p className="mt-1 text-xs text-muted-foreground">{parseApiError(error).message}</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={() => void refetch()}>
          Reintentar
        </Button>
      </div>
    )
  }

  if (!currentUser) return null

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* ─── Avatar ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <Avatar className="size-20">
          {avatarToShow ? (
            <AvatarImage src={avatarToShow} alt={currentUser.name} />
          ) : null}
          <AvatarFallback className="text-lg">
            {getInitials(currentUser.name) || <User className="size-8" />}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="mr-1.5 size-4" />
            Cambiar foto
          </Button>
          <p className="text-xs text-muted-foreground">PNG, JPG o WEBP. Máx 2 MB.</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            aria-label="Subir nueva foto de perfil"
          />
        </div>
      </div>

      {/* ─── Campos ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">
            Nombre completo <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            autoComplete="name"
            placeholder="Tu nombre completo"
            {...register('name')}
            aria-invalid={!!errors.name}
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <div className="flex items-center gap-2">
            <Input
              id="email"
              type="email"
              value={currentUser.email}
              readOnly
              className="bg-muted/50"
              aria-readonly
            />
            <span className="inline-flex shrink-0 items-center rounded-full bg-success-muted px-2 py-0.5 text-xs font-medium text-success">
              Verificado
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            El email no se puede cambiar desde aquí.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+57 300 123 4567"
            {...register('phone')}
            aria-invalid={!!errors.phone}
          />
          {errors.phone && (
            <p className="text-xs text-destructive">{errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="organization">Organización</Label>
          <Input
            id="organization"
            value={resolveOrganizationId(currentUser)}
            readOnly
            className="bg-muted/50 font-mono text-xs"
            aria-readonly
          />
          <p className="text-xs text-muted-foreground">ID de la organización a la que perteneces.</p>
        </div>
      </div>

      {/* ─── Acciones ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-2 border-t pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            reset({
              name: currentUser.name,
              phone: currentUser.phone ?? '',
              avatar_url: currentUser.avatar_url ?? '',
            })
            setPreviewUrl(null)
          }}
          disabled={!isDirty || updateMutation.isPending}
        >
          Descartar cambios
        </Button>
        <Button type="submit" disabled={!isDirty || updateMutation.isPending}>
          {updateMutation.isPending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Guardando...
            </>
          ) : (
            'Guardar cambios'
          )}
        </Button>
      </div>
    </form>
  )
}

function ProfileFormSkeleton() {
  return (
    <div className="space-y-6" aria-label="Cargando perfil">
      <div className="flex items-center gap-4">
        <Skeleton className="size-20 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-9 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-9 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-9 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-full" />
        </div>
      </div>
    </div>
  )
}
