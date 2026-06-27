import { LayoutDashboard } from 'lucide-react'

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Métricas y estadísticas — Sesión 3
        </p>
      </div>
      <div className="flex items-center justify-center rounded-lg border border-dashed p-12">
        <div className="text-center space-y-3">
          <LayoutDashboard className="mx-auto size-12 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            El dashboard estará disponible en la Sesión 3
          </p>
        </div>
      </div>
    </div>
  )
}
