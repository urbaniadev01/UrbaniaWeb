import { Clock, UserCheck, UserX, ArrowRight } from 'lucide-react'
import { StatusBadge } from '@/components/shared/StatusBadge'
import type { PropertyOccupant } from '../types/directorio.types'

interface OccupantHistoryProps {
  history: PropertyOccupant[]
}

export function OccupantHistory({ history }: OccupantHistoryProps) {
  if (!history || history.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <Clock className="mx-auto size-10 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">
          No hay historial de ocupación para esta unidad
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-0">
      <h3 className="mb-4 text-sm font-medium text-muted-foreground">Historial de ocupación</h3>

      <div className="relative">
        {/* Línea vertical */}
        <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-border" />

        <div className="space-y-6">
          {history.map((occupant) => {
            const isActive = occupant.is_active
            const dateLabel = isActive
              ? `Desde ${occupant.move_in_date ?? 'fecha desconocida'}`
              : occupant.move_out_date
                ? `${occupant.move_in_date ?? '?'} → ${occupant.move_out_date}`
                : 'Inactivo'

            return (
              <div key={occupant.id} className="relative flex gap-4">
                {/* Indicador de timeline */}
                <div
                  className={`relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border-2 ${
                    isActive
                      ? 'border-primary bg-primary/10'
                      : 'border-muted-foreground/30 bg-muted'
                  }`}
                >
                  {isActive ? (
                    <UserCheck className="size-4 text-primary" />
                  ) : (
                    <UserX className="size-4 text-muted-foreground" />
                  )}
                </div>

                {/* Contenido */}
                <div className="flex-1 pb-2">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">
                      {occupant.contact?.full_name ?? 'Contacto'}
                    </p>
                    {isActive ? (
                      <StatusBadge variant="success" className="text-[10px]">
                        Activo
                      </StatusBadge>
                    ) : (
                      <StatusBadge variant="muted" className="text-[10px]">
                        Inactivo
                      </StatusBadge>
                    )}
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>{dateLabel}</span>
                    {occupant.occupant_type && (
                      <>
                        <ArrowRight className="size-3" />
                        <span>{occupant.occupant_type.name}</span>
                      </>
                    )}
                    {occupant.is_primary && (
                      <>
                        <ArrowRight className="size-3" />
                        <span className="font-medium text-primary">Principal</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
