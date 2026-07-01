import { useRef, type MouseEvent } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Diálogo de confirmación de acción destructiva.
 * Implementación inline (no usa Radix Dialog) para mantener paridad con el resto del proyecto.
 * Reutilizable para eliminar unidades, torres, catálogos, documentos, etc.
 */
export interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: string
  /** Líneas extra de advertencia (dependencias, consecuencias) */
  warnings?: string[]
  confirmLabel?: string
  cancelLabel?: string
  isLoading?: boolean
  /** "destructive" usa botón rojo, "default" usa botón primario */
  variant?: 'destructive' | 'default'
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  warnings = [],
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  isLoading = false,
  variant = 'destructive',
}: ConfirmDialogProps) {
  const backdropRef = useRef<HTMLDivElement | null>(null)

  if (!open) return null

  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === backdropRef.current) {
      onClose()
    }
  }

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        className="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
      >
        <div className="mb-4 flex items-start gap-3">
          {variant === 'destructive' && (
            <div className="rounded-full bg-destructive/10 p-2">
              <AlertTriangle className="size-5 text-destructive" aria-hidden="true" />
            </div>
          )}
          <div className="flex-1">
            <h2 id="confirm-dialog-title" className="text-lg font-semibold">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            )}
            {warnings.length > 0 && (
              <ul className="mt-3 space-y-1.5 rounded-md border border-warning/30 bg-warning-muted/40 p-3 text-sm text-foreground">
                {warnings.map((w, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-0.5 text-warning">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <p className="mt-2 text-sm text-muted-foreground">
          Esta acción no se puede deshacer.
        </p>

        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Procesando...' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
