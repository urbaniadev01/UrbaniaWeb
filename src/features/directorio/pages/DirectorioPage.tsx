import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ContactTable } from '../components/ContactTable'
import { ContactForm } from '../components/ContactForm'
import { useContactList, useCreateContact } from '../hooks/use-contact-list'
import type { ContactTableFilters } from '../components/ContactTable'
import type { CreateContactPayload, UpdateContactPayload } from '../types/directorio.types'

export function DirectorioPage() {
  const [filters, setFilters] = useState<ContactTableFilters>({})
  const [showCreateForm, setShowCreateForm] = useState(false)

  const { data, isLoading, isError, error } = useContactList(
    filters.full_name || filters.document_type || filters.document_number
      ? (Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== undefined && v !== ''),
        ) as Record<string, string>)
      : undefined,
  )

  const createMutation = useCreateContact()

  const handleCreate = useCallback(
    (payload: CreateContactPayload | UpdateContactPayload) => {
      createMutation.mutate(payload as CreateContactPayload, {
        onSuccess: () => {
          toast.success('Contacto creado exitosamente')
          setShowCreateForm(false)
        },
        onError: () => {
          toast.error('Error al crear el contacto')
        },
      })
    },
    [createMutation],
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Directorio</h1>
          <p className="text-sm text-muted-foreground">
            Gestión de residentes y propietarios
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <UserPlus className="mr-1.5 size-4" />
          Nuevo contacto
        </Button>
      </div>

      <ContactTable
        data={data}
        isLoading={isLoading}
        isError={isError}
        error={error}
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Modal de creación */}
      <ContactForm
        open={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSubmit={handleCreate}
        isSubmitting={createMutation.isPending}
      />
    </div>
  )
}
