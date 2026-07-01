import { useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Mail,
  Phone,
  User,
  IdCard,
  Building,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ContactForm } from '../components/ContactForm'
import { useContact, useUpdateContact, useDeleteContact } from '../hooks/use-contact-list'
import type { UpdateContactPayload } from '../types/directorio.types'

export function ContactoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [showEditForm, setShowEditForm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const { data: contact, isLoading, isError, error } = useContact(id ?? '')
  const updateMutation = useUpdateContact(id ?? '')
  const deleteMutation = useDeleteContact()

  const handleUpdate = useCallback(
    (payload: UpdateContactPayload) => {
      if (!id) return
      updateMutation.mutate(payload, {
        onSuccess: () => {
          toast.success('Contacto actualizado exitosamente')
          setShowEditForm(false)
        },
        onError: () => {
          toast.error('Error al actualizar el contacto')
        },
      })
    },
    [id, updateMutation],
  )

  const handleDelete = useCallback(() => {
    if (!id) return
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success('Contacto eliminado exitosamente')
        navigate('/directorio', { replace: true })
      },
      onError: (err) => {
        const apiError = err as { code?: string; message?: string }
        if (apiError.code === 'HAS_ACTIVE_OCCUPANTS') {
          toast.error(
            'El contacto tiene vínculos activos como ocupante. Desvincúlelo de todas las unidades antes de eliminarlo.',
          )
        } else {
          toast.error(apiError.message ?? 'Error al eliminar el contacto')
        }
        setShowDeleteConfirm(false)
      },
    })
  }, [id, deleteMutation, navigate])

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 animate-pulse rounded bg-muted" />
        <div className="h-48 animate-pulse rounded-lg bg-muted" />
      </div>
    )
  }

  // Error state
  if (isError || !contact) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/directorio')}>
          <ArrowLeft className="mr-1.5 size-4" />
          Volver al directorio
        </Button>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
          <AlertTriangle className="mx-auto size-10 text-destructive" />
          <p className="mt-2 text-sm text-destructive">
            {error?.message ?? 'Contacto no encontrado'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Navegación */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate('/directorio')}>
          <ArrowLeft className="mr-1.5 size-4" />
          Volver al directorio
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowEditForm(true)}>
            <Pencil className="mr-1.5 size-4" />
            Editar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="mr-1.5 size-4" />
            Eliminar
          </Button>
        </div>
      </div>

      {/* Información del contacto */}
      <div className="rounded-lg border p-6">
        <div className="flex items-start gap-4">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
            <User className="size-7 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-semibold">{contact.full_name}</h1>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-2 text-sm">
                <IdCard className="size-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Documento:</span>
                <span className="font-medium">
                  {contact.document_type} {contact.document_number}
                </span>
              </div>
              {contact.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="size-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{contact.email}</span>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="size-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">Teléfono:</span>
                  <span className="font-medium">{contact.phone}</span>
                </div>
              )}
            </div>

            {/* Contacto de emergencia */}
            {(contact.emergency_contact_name || contact.emergency_contact_phone) && (
              <div className="mt-4 rounded-lg bg-muted/50 p-3">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Contacto de emergencia
                </p>
                <p className="mt-1 text-sm">
                  {contact.emergency_contact_name && (
                    <span className="font-medium">{contact.emergency_contact_name}</span>
                  )}
                  {contact.emergency_contact_name && contact.emergency_contact_phone && ' — '}
                  {contact.emergency_contact_phone && (
                    <span>{contact.emergency_contact_phone}</span>
                  )}
                </p>
              </div>
            )}

            {/* Notas */}
            {contact.notes && (
              <div className="mt-3 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Notas:</span> {contact.notes}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Unidades asociadas */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">Unidades asociadas</h2>
        {!contact.properties || contact.properties.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <Building className="mx-auto size-10 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              Este contacto no está vinculado a ninguna unidad
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {contact.properties.map((occupant) => (
              <div
                key={occupant.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-3">
                  <Building className="size-5 text-muted-foreground shrink-0" />
                  <div>
                    <Link
                      to={`/unidades/${occupant.property_id}/ocupantes`}
                      className="text-sm font-medium hover:text-primary"
                    >
                      Unidad {occupant.property_id}
                    </Link>
                    <div className="mt-0.5 flex flex-wrap gap-1.5">
                      <StatusBadge variant="info" className="text-[10px]">
                        {occupant.occupant_type?.name ?? 'Ocupante'}
                      </StatusBadge>
                      {occupant.is_primary && (
                        <StatusBadge variant="success" className="text-[10px]">
                          Principal
                        </StatusBadge>
                      )}
                      {occupant.is_active ? (
                        <StatusBadge variant="success" className="text-[10px]">
                          Activo
                        </StatusBadge>
                      ) : (
                        <StatusBadge variant="muted" className="text-[10px]">
                          Inactivo
                        </StatusBadge>
                      )}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {occupant.move_in_date && `Desde ${occupant.move_in_date}`}
                      {occupant.move_out_date && ` — Hasta ${occupant.move_out_date}`}
                    </div>
                  </div>
                </div>
                <Link
                  to={`/unidades/${occupant.property_id}/ocupantes`}
                  className="text-sm text-primary hover:underline"
                >
                  Ver ocupantes
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal editar */}
      <ContactForm
        open={showEditForm}
        onClose={() => setShowEditForm(false)}
        initialValues={contact}
        onSubmit={handleUpdate}
        isSubmitting={updateMutation.isPending}
      />

      {/* Confirmación eliminar */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-lg border bg-card p-6 shadow-lg">
            <div className="mb-4 flex items-center gap-3 text-destructive">
              <AlertTriangle className="size-6" />
              <h2 className="text-lg font-semibold">Eliminar contacto</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              ¿Estás seguro de eliminar a <strong>{contact.full_name}</strong>? Esta acción no se
              puede deshacer.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
