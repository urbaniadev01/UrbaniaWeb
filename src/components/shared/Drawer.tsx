import { useEffect, useRef, type ReactNode, type MouseEvent } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * Drawer lateral derecho (~480px) con scroll interno.
 * Implementación inline (sin Radix) por paridad con el resto del proyecto.
 *
 * Cierra con:
 *   - Click en backdrop
 *   - Botón X del header
 *   - Tecla Escape
 *
 * Atrapa el scroll del body mientras está abierto.
 */
export interface DrawerProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  /** Slot a la derecha del título (botones: Editar, Cambiar estado, etc.) */
  actions?: ReactNode
  /** Ancho: sm=384px, md=480px (default), lg=560px */
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  sm: 'w-full sm:max-w-sm',
  md: 'w-full sm:max-w-md',
  lg: 'w-full sm:max-w-lg',
}

export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  actions,
  size = 'md',
  className,
}: DrawerProps) {
  const backdropRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === backdropRef.current) {
      onClose()
    }
  }

  if (!open) return null

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex justify-end bg-black/50"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        className={cn(
          'flex h-full flex-col border-l bg-card shadow-xl',
          sizeMap[size],
          className,
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        {/* Header */}
        <div className="flex items-start gap-3 border-b p-6">
          <div className="flex-1">
            <h2 id="drawer-title" className="text-lg font-semibold leading-tight">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Cerrar panel"
            className="shrink-0"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  )
}
