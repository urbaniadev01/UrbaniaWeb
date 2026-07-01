import { useState } from 'react'
import { User, UserCheck, UserX, Pencil, Trash2, Link } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { OccupantLinkForm } from './OccupantLinkForm'
import type { PropertyOccupant, OccupantType, Contact, LinkOccupantPayload } from '../types/directorio.types'

interface UnitOccupantListProps {
  propertyId: string
  occupants: PropertyOccupant[] | undefined
  occupantTypes: OccupantType[] | undefined
  contacts: Contact[] | undefined
  isLoading: boolean
  isError: boolean
  onLink: (payload: LinkOccupantPayload) => void
  onUpdate: (id: string) => void
  onUnlink: (id: string) => void
  isLinking?: boolean
}

export function UnitOccupantList({
  propertyId,
  occupants,
  occupantTypes,
  contacts,
  isLoading,
  isError,
  onLink,
  onUpdate,
  onUnlink,
  isLinking = false,
}: UnitOccupantListProps) {
  const [showLinkForm, setShowLinkForm] = useState(false)

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex justify-between">
          <div className="h-6 w-40 animate-pulse rounded bg-muted" />
          <div className="h-9 w-36 animate-pulse rounded bg-muted" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
        <p className="text-sm text-destructive">Error al cargar los ocupantes</p>
      </div>
    )
  }

  const getOccupantTypeName = (occupantTypeId: string) => {
    return occupantTypes?.find((ot) => ot.id === occupantTypeId)?.name ?? 'Sin tipo'
  }

  const activeOccupants = occupants?.filter((o) => o.is_active) ?? []
  const inactiveOccupants = occupants?.filter((o) => !o.is_active) ?? []

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          {activeOccupants.length} ocupante{activeOccupants.length !== 1 ? 's' : ''} activo
          {activeOccupants.length !== 1 ? 's' : ''}
        </h3>
        <Button size="sm" onClick={() => setShowLinkForm(true)}>
          <Link className="mr-1 size-4" />
          Vincular contacto
        </Button>
      </div>

      {/* Lista vacía */}
      {(!occupants || occupants.length === 0) && (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <User className="mx-auto size-10 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            Esta unidad no tiene ocupantes vinculados
          </p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => setShowLinkForm(true)}>
            Vincular primer contacto
          </Button>
        </div>
      )}

      {/* Ocupantes activos */}
      {activeOccupants.length > 0 && (
        <div className="space-y-2">
          {activeOccupants.map((occupant) => (
            <div
              key={occupant.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-full bg-primary/10 p-2">
                  <UserCheck className="size-4 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">
                      {occupant.contact?.full_name ?? 'Contacto'}
                    </p>
                    {occupant.is_primary && (
                      <StatusBadge variant="success" className="text-[10px]">
                        Principal
                      </StatusBadge>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <StatusBadge variant="info" className="text-[10px]">
                      {getOccupantTypeName(occupant.occupant_type_id)}
                    </StatusBadge>
                    {occupant.move_in_date && (
                      <span className="text-xs text-muted-foreground">
                        Desde {occupant.move_in_date}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => onUpdate(occupant.id)}
                  title="Editar vínculo"
                >
                  <Pencil className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => onUnlink(occupant.id)}
                  title="Desvincular"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ocupantes inactivos */}
      {inactiveOccupants.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
            {inactiveOccupants.length} ocupante{inactiveOccupants.length !== 1 ? 's' : ''} inactivo
            {inactiveOccupants.length !== 1 ? 's' : ''}
          </summary>
          <div className="mt-2 space-y-2">
            {inactiveOccupants.map((occupant) => (
              <div
                key={occupant.id}
                className="flex items-center justify-between rounded-lg border border-dashed p-4 opacity-60"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-muted p-2">
                    <UserX className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {occupant.contact?.full_name ?? 'Contacto'}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      <StatusBadge variant="muted" className="text-[10px]">
                        {getOccupantTypeName(occupant.occupant_type_id)}
                      </StatusBadge>
                      {occupant.move_out_date && (
                        <span className="text-xs text-muted-foreground">
                          Hasta {occupant.move_out_date}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => onUnlink(occupant.id)}
                  title="Eliminar vínculo"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </details>
      )}

      {/* Modal vincular */}
      <OccupantLinkForm
        open={showLinkForm}
        onClose={() => setShowLinkForm(false)}
        propertyId={propertyId}
        onSubmit={(payload) => {
          onLink(payload)
          setShowLinkForm(false)
        }}
        contacts={contacts}
        occupantTypes={occupantTypes}
        isSubmitting={isLinking}
      />
    </div>
  )
}
