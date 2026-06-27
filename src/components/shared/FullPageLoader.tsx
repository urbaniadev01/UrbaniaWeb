import { Loader2 } from 'lucide-react'

export function FullPageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="mx-auto size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Cargando...</p>
      </div>
    </div>
  )
}
