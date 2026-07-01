import { User, Loader2 } from 'lucide-react'
import { ProfileForm } from '../components/ProfileForm'
import { useProfile } from '../hooks/use-profile'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/shared/ErrorState'

export function ProfilePage() {
  const { isLoading, isError, error, refetch } = useProfile()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <User className="size-6 text-muted-foreground" aria-hidden="true" />
          Perfil
        </h1>
        <p className="text-sm text-muted-foreground">
          Actualiza tu información personal y foto de perfil.
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6">
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            <Skeleton className="h-4 w-32" />
          </div>
        ) : isError ? (
          <ErrorState
            error={error}
            title="Error al cargar tu perfil"
            onRetry={() => void refetch()}
          />
        ) : (
          <ProfileForm />
        )}
      </div>
    </div>
  )
}
