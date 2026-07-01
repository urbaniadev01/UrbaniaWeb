import { useEffect, useRef, type ReactNode, type MouseEvent } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * Modal centrado con backdrop. Implementación inline (sin Radix) por paridad
 * con el resto del proyecto. Cierra con Escape y click en backdrop.
 *
 * Estructura DOM:
 *   <div role="presentation">   ← backdrop (no onClick)
 *     <div role="dialog" aria-modal="true">   ← contenido (no onClick)
 *
 * Para cerrar al hacer click en el backdrop (no en el contenido), comparamos
 * el target del evento con el ref del backdrop. Esto evita el lint
 * `no-noninteractive-element-interactions` que aparece con onClick+stopPropagation
 * en un div con role="dialog".
 */
export interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  /** sm=384px, md=480px (default), lg=560px, xl=720px */
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeMap = {
  sm: 'w-full max-w-sm',
  md: 'w-full max-w-md',
  lg: 'w-full max-w-lg',
  xl: 'w-full max-w-2xl',
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = 'md',
  className,
}: ModalProps) {
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        className={cn(
          'flex max-h-[90vh] w-full flex-col rounded-lg border bg-card shadow-xl',
          sizeMap[size],
          className,
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-start gap-3 border-b p-6">
          <div className="flex-1">
            <h2 id="modal-title" className="text-lg font-semibold leading-tight">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Cerrar"
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
