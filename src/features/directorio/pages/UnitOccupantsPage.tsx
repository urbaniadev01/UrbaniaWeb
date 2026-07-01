import { useCallback } from 'react'
import { useParams, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { ArrowLeft, Building } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UnitOccupantList } from '../components/UnitOccupantList'
import { OccupantHistory } from '../components/OccupantHistory'
import { useContactList } from '../hooks/use-contact-list'
import { useUnitOccupants, useLinkContactToUnit, useUnlinkOccupant } from '../hooks/use-unit-occupants'
import { useOccupantTypes } from '../hooks/use-occupant-types'
import type { LinkOccupantPayload } from '../types/directorio.types'

export function UnitOccupantsPage() {
  const { propertyId } = useParams<{ propertyId: string }>()
  const navigate = useNavigate()

  const { data: occupants, isLoading, isError } = useUnitOccupants(propertyId ?? '')
  const { data: occupantTypes } = useOccupantTypes()
  const { data: contacts } = useContactList()

  const linkMutation = useLinkContactToUnit(propertyId ?? '')
  const unlinkMutation = useUnlinkOccupant()

  const handleLink = useCallback(
    (payload: LinkOccupantPayload) => {
      if (!propertyId) return
      linkMutation.mutate(payload, {
        onSuccess: () => {
          toast.success('Contacto vinculado exitosamente')
        },
        onError: () => {
          toast.error('Error al vincular el contacto')
        },
      })
    },
    [propertyId, linkMutation],
  )

  const handleUnlink = useCallback(
    (id: string) => {
      unlinkMutation.mutate(id, {
        onSuccess: () => {
          toast.success('Ocupante desvinculado exitosamente')
        },
        onError: () => {
          toast.error('Error al desvincular el ocupante')
        },
      })
    },
    [unlinkMutation],
  )

  const handleUpdate = useCallback((_id: string) => {
    // Placeholder: en una iteración futura se abriría un modal de edición
    toast.info('Funcionalidad de edición próximamente')
  }, [])

  return (
    <div className="space-y-6">
      {/* Navegación */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/directorio')}>
          <ArrowLeft className="mr-1.5 size-4" />
          Volver al directorio
        </Button>
      </div>

      {/* Título */}
      <div className="flex items-center gap-3">
        <Building className="size-6 text-muted-foreground" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {propertyId ? `Unidad ${propertyId.slice(0, 8)}` : 'Unidad'}
          </h1>
          <p className="text-sm text-muted-foreground">Gestión de ocupantes de la unidad</p>
        </div>
      </div>

      {/* Lista de ocupantes */}
      <UnitOccupantList
        propertyId={propertyId ?? ''}
        occupants={occupants}
        occupantTypes={occupantTypes}
        contacts={contacts}
        isLoading={isLoading}
        isError={isError}
        onLink={handleLink}
        onUpdate={handleUpdate}
        onUnlink={handleUnlink}
        isLinking={linkMutation.isPending}
      />

      {/* Historial */}
      <OccupantHistory history={occupants ?? []} />
    </div>
  )
}
