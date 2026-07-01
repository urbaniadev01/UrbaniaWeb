import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { ChevronLeft, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ErrorState } from '@/components/shared/ErrorState'
import { EmptyState } from '@/components/shared/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { PermissionMatrix } from '../components/PermissionMatrix'
import { usePermissionsCatalog } from '../hooks/use-permissions'
import { useRole } from '../hooks/use-roles'

export function PermissionMatrixPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: role, isLoading: roleLoading, isError, error, refetch } = useRole(id)
  const {
    data: catalog,
    groups,
    isLoading: catalogLoading,
  } = usePermissionsCatalog()

  useEffect(() => {
    // Si el rol no existe (404) redirigir a la lista
    if (!roleLoading && !role?.data && !isError) {
      // Permitir reintento automático — no redirigir agresivamente
    }
  }, [roleLoading, role, isError])

  const currentPermissions = role?.data?.permisos ?? []
  const isLoading = roleLoading || catalogLoading

  if (isLoading) {
    return <PageSkeleton />
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader roleName={null} />
        <ErrorState
          error={error}
          title="Error al cargar el rol"
          onRetry={() => refetch()}
        />
      </div>
    )
  }

  if (!role?.data) {
    return (
      <div className="space-y-6">
        <PageHeader roleName={null} />
        <EmptyState
          icon={<ShieldCheck className="size-8" aria-hidden="true" />}
          title="Rol no encontrado"
          description="Es posible que el rol haya sido eliminado o que no tengas acceso a él."
          action={
            <Button variant="outline" onClick={() => navigate('/admin/roles')}>
              <ChevronLeft className="mr-1.5 size-4" />
              Volver a la lista
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader roleName={role.data.nombre} />

      <div className="rounded-lg border bg-card p-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">{role.data.nombre}</h2>
            <p className="text-sm text-muted-foreground">
              {role.data.descripcion ?? 'Sin descripción'}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>
              {currentPermissions.length} permiso
              {currentPermissions.length !== 1 ? 's' : ''} efectivo
              {currentPermissions.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <PermissionMatrix
          roleId={role.data.id}
          currentPermissions={currentPermissions}
          groups={groups}
          isLoading={catalogLoading}
        />
      </div>

      {/* Catálogo auxiliar oculto (útil en depuración) */}
      <details className="text-xs text-muted-foreground">
        <summary className="cursor-pointer hover:text-foreground">
          Catálogo crudo ({(catalog?.data ?? []).length} permisos)
        </summary>
        <pre className="mt-2 overflow-x-auto rounded-md bg-muted/40 p-3 text-[10px]">
          {JSON.stringify(catalog?.data ?? [], null, 2)}
        </pre>
      </details>
    </div>
  )
}

function PageHeader({ roleName }: { roleName: string | null }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/admin/roles" className="hover:text-foreground">
          Roles
        </Link>
        <span>/</span>
        <span className="text-foreground">Matriz de permisos</span>
      </div>
      <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
        <ShieldCheck className="size-6 text-muted-foreground" aria-hidden="true" />
        {roleName ? `Matriz: ${roleName}` : 'Matriz de permisos'}
      </h1>
    </div>
  )
}

function PageSkeleton() {
  return (
    <div className="space-y-6" aria-label="Cargando matriz">
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-7 w-64" />
      </div>
      <div className="space-y-2 rounded-lg border bg-card p-6">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-3 w-72" />
        <div className="mt-4 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}
