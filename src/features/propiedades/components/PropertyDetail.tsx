import { useState } from 'react'
import { toast } from 'sonner'
import {
  Edit,
  ArrowRightLeft,
  History,
  FileText,
} from 'lucide-react'
import { Drawer } from '@/components/shared/Drawer'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { ErrorState } from '@/components/shared/ErrorState'
import {
  useProperty,
  useStatusLog,
  usePropertyDocuments,
  useDeleteDocument,
  useUploadDocument,
  useChangePropertyStatus,
} from '../hooks/use-properties'
import { useAllPropertyDocumentTypes, useAllPropertyStatuses } from '../hooks/use-catalogs'
import { useAuthStore } from '@/stores/auth.store'
import { PropertyStatusForm } from './PropertyStatusForm'
import { DocumentList } from './DocumentList'
import {
  formatArea,
  formatCoefficient,
  coefficientToPercent,
  formatFloor,
  formatRelativeTime,
  statusCodeToVariant,
} from '../lib/format'
import { parseApiError } from '@/lib/utils'
import type { ChangeStatusPayload, Property } from '../types/propiedades.types'

export interface PropertyDetailProps {
  propertyId: string | null
  onClose: () => void
  onEdit: (property: Property) => void
  onStatusChanged?: () => void
}

/**
 * Drawer de detalle de una unidad. Solo lee, salvo por los botones admin
 * (cambiar estado, editar) y la lista de documentos (upload/delete).
 */
export function PropertyDetail({
  propertyId,
  onClose,
  onEdit,
  onStatusChanged,
}: PropertyDetailProps) {
  const role = useAuthStore((s) => s.user?.role)
  const isAdmin = role === 'admin'

  const { data: apiResponse, isLoading, isError, refetch } = useProperty(propertyId)
  const { data: statusesResp } = useAllPropertyStatuses(true)
  const { data: docTypesResp } = useAllPropertyDocumentTypes(true)
  const { data: statusLog, isLoading: isLoadingLog } = useStatusLog(propertyId, 1)
  const documentsQuery = usePropertyDocuments(propertyId)

  const [showStatusForm, setShowStatusForm] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const uploadDoc = useUploadDocument(propertyId ?? '')
  const deleteDoc = useDeleteDocument(propertyId ?? '')
  const changeStatus = useChangePropertyStatus(propertyId ?? '')

  const property = apiResponse?.data

  const handleChangeStatus = (data: ChangeStatusPayload) => {
    changeStatus.mutate(data, {
      onSuccess: () => {
        toast.success('Estado actualizado correctamente')
        setShowStatusForm(false)
        onStatusChanged?.()
      },
      onError: (err) => {
        const apiError = parseApiError(err)
        if (apiError.code === 'STATUS_HAS_ACTIVE_RESIDENTS') {
          toast.error(
            'La unidad tiene residentes activos y el nuevo estado no los permite',
          )
        } else {
          toast.error(apiError.message, {
            description: `Código: ${apiError.code}`,
          })
        }
      },
    })
  }

  const handleUpload = async (formData: FormData): Promise<void> => {
    if (!propertyId) return
    setUploadProgress(0)

    // Simulación de progreso visual (XMLHttpRequest proveería progreso real;
    // axios + React Query no lo expone out-of-the-box, así que animamos).
    let progress = 0
    const interval = window.setInterval(() => {
      progress = Math.min(90, progress + 10)
      setUploadProgress(progress)
    }, 200)

    try {
      await uploadDoc.mutateAsync(formData)
      window.clearInterval(interval)
      setUploadProgress(100)
      toast.success('Documento subido correctamente')
    } catch (err) {
      window.clearInterval(interval)
      setUploadProgress(0)
      const apiError = parseApiError(err)
      toast.error(apiError.message, { description: `Código: ${apiError.code}` })
      throw err
    } finally {
      window.setTimeout(() => setUploadProgress(0), 600)
    }
  }

  const handleDeleteDoc = async (docId: string): Promise<void> => {
    try {
      await deleteDoc.mutateAsync(docId)
      toast.success('Documento eliminado')
    } catch (err) {
      const apiError = parseApiError(err)
      toast.error(apiError.message, { description: `Código: ${apiError.code}` })
      throw err
    }
  }

  return (
    <>
      <Drawer
        open={!!propertyId}
        onClose={onClose}
        title={property?.full_designation ?? 'Cargando...'}
        description={property ? `Torre ${property.tower.name}` : undefined}
        size="lg"
        actions={
          property && isAdmin ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowStatusForm(true)}
              >
                <ArrowRightLeft className="mr-1.5 size-4" />
                Cambiar estado
              </Button>
              <Button size="sm" onClick={() => onEdit(property)}>
                <Edit className="mr-1.5 size-4" />
                Editar
              </Button>
            </>
          ) : undefined
        }
      >
        {isLoading && (
          <div className="space-y-3">
            <div className="h-6 w-1/2 animate-pulse rounded bg-muted" />
            <div className="h-40 animate-pulse rounded-md bg-muted" />
            <div className="h-32 animate-pulse rounded-md bg-muted" />
            <div className="h-24 animate-pulse rounded-md bg-muted" />
          </div>
        )}

        {isError && (
          <ErrorState
            error={isError}
            title="No se pudo cargar el detalle"
            onRetry={() => refetch()}
          />
        )}

        {property && (
          <div className="space-y-6">
            {/* Status badge grande */}
            <div>
              <StatusBadge
                variant={statusCodeToVariant(property.status.code)}
                className="text-sm"
              >
                {property.status.name}
              </StatusBadge>
              <p className="mt-1 text-xs text-muted-foreground">
                {property.residents_count > 0
                  ? `${property.residents_count} residente${
                      property.residents_count !== 1 ? 's' : ''
                    } activo${property.residents_count !== 1 ? 's' : ''}`
                  : 'Sin residentes asignados'}
              </p>
            </div>

            {/* Sección 1: Datos físicos */}
            <section className="space-y-3 rounded-lg border p-4">
              <h3 className="text-sm font-semibold">Datos físicos</h3>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
                <dt className="text-muted-foreground">Torre</dt>
                <dd>
                  {property.tower.name}
                  {property.tower.code && (
                    <span className="ml-1 text-muted-foreground">
                      ({property.tower.code})
                    </span>
                  )}
                </dd>

                <dt className="text-muted-foreground">Piso</dt>
                <dd>{formatFloor(property.floor)}</dd>

                <dt className="text-muted-foreground">Tipo</dt>
                <dd>{property.type.name}</dd>

                <dt className="text-muted-foreground">Área</dt>
                <dd className="font-mono tabular-nums">{formatArea(property.area_m2)}</dd>

                <dt className="text-muted-foreground" title="Porcentaje de copropiedad">
                  Coeficiente
                </dt>
                <dd>
                  <span className="font-mono">{formatCoefficient(property.coefficient)}</span>
                  <span className="ml-1 text-muted-foreground">
                    ({coefficientToPercent(property.coefficient)})
                  </span>
                </dd>

                <dt className="text-muted-foreground">Habitaciones</dt>
                <dd>{property.bedrooms ?? '—'}</dd>

                <dt className="text-muted-foreground">Baños</dt>
                <dd>{property.bathrooms ?? '—'}</dd>

                <dt className="text-muted-foreground">Parqueadero</dt>
                <dd>
                  {property.has_parking
                    ? `Sí${property.parking_lot ? ` (${property.parking_lot})` : ''}`
                    : 'No'}
                </dd>

                {property.notes && (
                  <>
                    <dt className="text-muted-foreground">Notas</dt>
                    <dd className="whitespace-pre-wrap sm:col-span-2">{property.notes}</dd>
                  </>
                )}
              </dl>
            </section>

            {/* Sección 2: Historial de estados */}
            <section className="rounded-lg border p-4">
              <div className="mb-3 flex items-center gap-2">
                <History className="size-4 text-muted-foreground" aria-hidden="true" />
                <h3 className="text-sm font-semibold">Historial de estados</h3>
              </div>
              {isLoadingLog ? (
                <div className="h-20 animate-pulse rounded bg-muted" />
              ) : statusLog?.data && statusLog.data.length > 0 ? (
                <ol className="space-y-3">
                  {statusLog.data.slice(0, 10).map((entry) => (
                    <li
                      key={entry.id}
                      className="relative pl-6 before:absolute before:left-2 before:top-2 before:size-2 before:rounded-full before:bg-muted-foreground/40"
                    >
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        {entry.from_status ? (
                          <>
                            <StatusBadge
                              variant={statusCodeToVariant(entry.from_status.code)}
                              className="text-[10px]"
                            >
                              {entry.from_status.name}
                            </StatusBadge>
                            <span className="text-muted-foreground">→</span>
                          </>
                        ) : (
                          <span className="text-muted-foreground">(estado inicial)</span>
                        )}
                        <StatusBadge
                          variant={statusCodeToVariant(entry.to_status.code)}
                          className="text-[10px]"
                        >
                          {entry.to_status.name}
                        </StatusBadge>
                        <span className="text-xs text-muted-foreground">
                          · {entry.changed_by.name} ·{' '}
                          <span title={entry.created_at}>
                            {formatRelativeTime(entry.created_at)}
                          </span>
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{entry.reason}</p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No hay cambios de estado registrados todavía.
                </p>
              )}
            </section>

            {/* Sección 3: Documentos */}
            <section className="rounded-lg border p-4">
              <div className="mb-3 flex items-center gap-2">
                <FileText className="size-4 text-muted-foreground" aria-hidden="true" />
                <h3 className="text-sm font-semibold">Documentos</h3>
              </div>
              <DocumentList
                documents={documentsQuery.data?.data ?? []}
                documentTypes={docTypesResp?.data ?? []}
                isLoading={documentsQuery.isLoading}
                isAdmin={isAdmin}
                onUpload={handleUpload}
                onDelete={handleDeleteDoc}
                isUploading={uploadDoc.isPending}
                uploadProgress={uploadProgress}
              />
            </section>
          </div>
        )}
      </Drawer>

      {property && (
        <PropertyStatusForm
          open={showStatusForm}
          onClose={() => setShowStatusForm(false)}
          property={property}
          statuses={statusesResp?.data ?? []}
          isSubmitting={changeStatus.isPending}
          onSubmit={handleChangeStatus}
        />
      )}
    </>
  )
}
