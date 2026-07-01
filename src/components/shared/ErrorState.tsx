import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { parseApiError } from '@/lib/utils'

export interface ErrorStateProps {
  error: unknown
  title?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({ error, title = 'Algo salió mal', onRetry, className }: ErrorStateProps) {
  const apiError = parseApiError(error)
  return (
    <div
      className={`rounded-lg border border-destructive/40 bg-destructive/5 p-6 ${className ?? ''}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden="true" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-destructive">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{apiError.message}</p>
          {apiError.code && apiError.code !== 'NETWORK_ERROR' && (
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              Código: {apiError.code}
            </p>
          )}
        </div>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Reintentar
          </Button>
        )}
      </div>
    </div>
  )
}
