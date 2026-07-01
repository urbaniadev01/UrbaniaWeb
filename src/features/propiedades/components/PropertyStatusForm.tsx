import { useEffect, useState } from 'react'
import { Loader2, AlertTriangle } from 'lucide-react'
import { Modal } from '@/components/shared/Modal'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { statusCodeToVariant } from '../lib/format'
import type { ChangeStatusPayload, Property, PropertyStatus } from '../types/propiedades.types'

export interface PropertyStatusFormProps {
  open: boolean
  onClose: () => void
  property: Property
  statuses: PropertyStatus[]
  isSubmitting?: boolean
  onSubmit: (data: ChangeStatusPayload) => void
}

/**
 * Modal de cambio de estado de una unidad.
 * - Muestra el estado actual (no editable)
 * - Selector de nuevo estado (excluye el actual, solo estados activos)
 * - Motivo obligatorio
 * - Advertencia si el nuevo estado NO permite residentes
 */
export function PropertyStatusForm({
  open,
  onClose,
  property,
  statuses,
  isSubmitting = false,
  onSubmit,
}: PropertyStatusFormProps) {
  const [newStatusId, setNewStatusId] = useState('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Reset al abrir
  useEffect(() => {
    if (open) {
      setNewStatusId('')
      setReason('')
      setError(null)
    }
  }, [open])

  const availableStatuses = statuses.filter(
    (s) => s.is_active && s.id !== property.status.id,
  )
  const selectedStatus = availableStatuses.find((s) => s.id === newStatusId)
  const willBlockResidents = selectedStatus ? !selectedStatus.allows_residents : false

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!newStatusId) {
      setError('Selecciona el nuevo estado')
      return
    }
    if (!reason.trim()) {
      setError('El motivo del cambio es obligatorio')
      return
    }

    onSubmit({
      property_status_id: newStatusId,
      reason: reason.trim(),
    })
  }

  const canSubmit = !!newStatusId && reason.trim().length > 0 && !isSubmitting

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Cambiar estado de ${property.full_designation}`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Estado actual */}
        <div className="space-y-2">
          <Label>Estado actual</Label>
          <div>
            <StatusBadge variant={statusCodeToVariant(property.status.code)}>
              {property.status.name}
            </StatusBadge>
          </div>
        </div>

        {/* Nuevo estado */}
        <div className="space-y-1.5">
          <Label htmlFor="new_status_id">
            Nuevo estado <span className="text-destructive">*</span>
          </Label>
          <select
            id="new_status_id"
            value={newStatusId}
            onChange={(e) => setNewStatusId(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <option value="">Seleccionar nuevo estado...</option>
            {availableStatuses.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
                {!s.allows_residents ? ' (no permite residentes)' : ''}
              </option>
            ))}
          </select>
          {availableStatuses.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No hay otros estados activos disponibles. Crea más en Catálogos.
            </p>
          )}
        </div>

        {/* Advertencia de no permite residentes */}
        {willBlockResidents && (
          <div
            className="flex items-start gap-2 rounded-md border border-warning/40 bg-warning-muted/40 p-3 text-sm"
            role="alert"
          >
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
            <p>
              Este estado <strong>no permite residentes</strong>. Si la unidad tiene residentes
              activos, el cambio será rechazado por el servidor.
            </p>
          </div>
        )}

        {/* Motivo */}
        <div className="space-y-1.5">
          <Label htmlFor="reason">
            Motivo del cambio <span className="text-destructive">*</span>
          </Label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Ej: Cambio de inquilino, contrato finalizado, mantenimiento programado..."
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 resize-none"
          />
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <div className="flex items-center justify-end gap-2 border-t pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={!canSubmit}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Cambiando...
              </>
            ) : (
              'Cambiar estado'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
