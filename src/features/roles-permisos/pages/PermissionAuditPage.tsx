import { Activity } from 'lucide-react'
import { AuditTable } from '../components/AuditTable'

export function PermissionAuditPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <Activity className="size-6 text-muted-foreground" aria-hidden="true" />
          Auditoría de permisos
        </h1>
        <p className="text-sm text-muted-foreground">
          Bitácora inmutable de cambios sobre roles, permisos y asignaciones.
        </p>
      </div>

      <AuditTable />
    </div>
  )
}
