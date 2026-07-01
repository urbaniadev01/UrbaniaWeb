import { useState } from 'react'
import { X, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Contact, OccupantType, LinkOccupantPayload } from '../types/directorio.types'

interface OccupantLinkFormProps {
  open: boolean
  onClose: () => void
  propertyId: string
  onSubmit: (payload: LinkOccupantPayload) => void
  contacts?: Contact[]
  occupantTypes?: OccupantType[]
  isSubmitting?: boolean
}

export function OccupantLinkForm({
  open,
  onClose,
  onSubmit,
  contacts = [],
  occupantTypes = [],
  isSubmitting = false,
}: OccupantLinkFormProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedContactId, setSelectedContactId] = useState('')
  const [selectedOccupantTypeId, setSelectedOccupantTypeId] = useState('')
  const [isPrimary, setIsPrimary] = useState(false)
  const [moveInDate, setMoveInDate] = useState('')
  const [error, setError] = useState('')

  const filteredContacts = contacts.filter((c) =>
    c.full_name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!selectedContactId) {
      setError('Debes seleccionar un contacto')
      return
    }

    if (!selectedOccupantTypeId) {
      setError('Debes seleccionar un tipo de ocupante')
      return
    }

    const payload: LinkOccupantPayload = {
      contact_id: selectedContactId,
      occupant_type_id: selectedOccupantTypeId,
      is_primary: isPrimary || undefined,
      move_in_date: moveInDate || undefined,
    }

    onSubmit(payload)
  }

  const handleClose = () => {
    setSearchQuery('')
    setSelectedContactId('')
    setSelectedOccupantTypeId('')
    setIsPrimary(false)
    setMoveInDate('')
    setError('')
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-lg border bg-card p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Vincular contacto a unidad</h2>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="size-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Buscador de contacto */}
          <div className="space-y-1.5">
            <Label>Contacto *</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar contacto por nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {searchQuery && filteredContacts.length > 0 && (
              <div className="max-h-40 overflow-y-auto rounded-md border">
                {filteredContacts.map((contact) => (
                  <button
                    key={contact.id}
                    type="button"
                    onClick={() => {
                      setSelectedContactId(contact.id)
                      setSearchQuery(contact.full_name)
                    }}
                    className={`w-full px-3 py-2 text-left text-sm transition-colors hover:bg-muted ${
                      selectedContactId === contact.id ? 'bg-muted font-medium' : ''
                    }`}
                  >
                    {contact.full_name}{' '}
                    <span className="text-muted-foreground">
                      ({contact.document_type} {contact.document_number})
                    </span>
                  </button>
                ))}
              </div>
            )}

            {searchQuery && filteredContacts.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No se encontraron contactos. Crea el contacto primero en el directorio.
              </p>
            )}
          </div>

          {/* Tipo de ocupante */}
          <div className="space-y-1.5">
            <Label htmlFor="occupant_type_id">Tipo de ocupante *</Label>
            <select
              id="occupant_type_id"
              value={selectedOccupantTypeId}
              onChange={(e) => setSelectedOccupantTypeId(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <option value="">Seleccionar tipo...</option>
              {occupantTypes.map((ot) => (
                <option key={ot.id} value={ot.id}>
                  {ot.name}
                </option>
              ))}
            </select>
          </div>

          {/* Es primary */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_primary"
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
              className="size-4 rounded border-border"
            />
            <Label htmlFor="is_primary" className="cursor-pointer">
              Contacto principal
            </Label>
          </div>

          {/* Fecha de ingreso */}
          <div className="space-y-1.5">
            <Label htmlFor="move_in_date">Fecha de ingreso</Label>
            <Input
              id="move_in_date"
              type="date"
              value={moveInDate}
              onChange={(e) => setMoveInDate(e.target.value)}
            />
          </div>

          {/* Error */}
          {error && <p className="text-xs text-destructive">{error}</p>}

          {/* Acciones */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Vinculando...' : 'Vincular'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
