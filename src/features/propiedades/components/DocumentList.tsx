import { useState, type FormEvent } from 'react'
import {
  FileText,
  FileImage,
  File,
  Download,
  Trash2,
  Upload,
  X,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Modal } from '@/components/shared/Modal'
import { EmptyState } from '@/components/shared/EmptyState'
import {
  documentIcon,
  formatFileSize,
  formatRelativeTime,
} from '../lib/format'
import type { PropertyDocument, PropertyDocumentType } from '../types/propiedades.types'

export interface DocumentListProps {
  documents: PropertyDocument[]
  documentTypes: PropertyDocumentType[]
  isLoading?: boolean
  isAdmin: boolean
  onUpload: (formData: FormData) => Promise<void> | void
  onDelete: (docId: string) => Promise<void> | void
  isUploading?: boolean
  uploadProgress?: number
}

const MAX_SIZE_BYTES = 20 * 1024 * 1024 // 20 MB
const ACCEPTED_MIME = ['application/pdf', 'image/jpeg', 'image/png']

export function DocumentList({
  documents,
  documentTypes,
  isLoading = false,
  isAdmin,
  onUpload,
  onDelete,
  isUploading = false,
  uploadProgress = 0,
}: DocumentListProps) {
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">
          Documentos ({documents.length})
        </h3>
        {isAdmin && (
          <Button size="sm" variant="outline" onClick={() => setShowUploadModal(true)}>
            <Upload className="mr-1.5 size-4" />
            Subir documento
          </Button>
        )}
      </div>

      {/* Estados */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-md bg-muted" />
          ))}
        </div>
      ) : documents.length === 0 ? (
        <EmptyState
          title="Sin documentos"
          description="Esta unidad aún no tiene documentos asociados."
          icon={<FileText className="size-8" aria-hidden="true" />}
        />
      ) : (
        <ul className="space-y-2">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="flex items-center gap-3 rounded-md border p-3"
            >
              <div className="rounded-md bg-muted p-2">
                <DocumentIcon mime={doc.mime_type} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium" title={doc.name}>
                  {doc.name}
                </p>
                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full bg-muted px-2 py-0.5">
                    {doc.document_type.name}
                  </span>
                  <span>{formatFileSize(doc.file_size_bytes ?? null)}</span>
                  <span>·</span>
                  <span>{doc.uploaded_by.name}</span>
                  <span>·</span>
                  <span title={doc.created_at}>{formatRelativeTime(doc.created_at)}</span>
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button variant="ghost" size="icon-xs" asChild title="Descargar">
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Descargar ${doc.name}`}
                  >
                    <Download className="size-3.5" />
                  </a>
                </Button>
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    disabled={deletingId === doc.id}
                    onClick={async () => {
                      if (
                        !window.confirm(`¿Eliminar el documento "${doc.name}"?`)
                      ) {
                        return
                      }
                      setDeletingId(doc.id)
                      try {
                        await onDelete(doc.id)
                      } finally {
                        setDeletingId(null)
                      }
                    }}
                    title="Eliminar"
                    aria-label={`Eliminar ${doc.name}`}
                  >
                    {deletingId === doc.id ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="size-3.5" />
                    )}
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Modal de subida */}
      <UploadDocumentModal
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        documentTypes={documentTypes}
        onUpload={onUpload}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
      />
    </div>
  )
}

// ─── Subcomponentes ───────────────────────────────────────────────────────

function DocumentIcon({ mime }: { mime: string | null | undefined }) {
  const kind = documentIcon(mime)
  const className = 'size-4 text-muted-foreground'
  if (kind === 'image') return <FileImage className={className} aria-hidden="true" />
  if (kind === 'file-text') return <FileText className={className} aria-hidden="true" />
  return <File className={className} aria-hidden="true" />
}

interface UploadDocumentModalProps {
  open: boolean
  onClose: () => void
  documentTypes: PropertyDocumentType[]
  onUpload: (formData: FormData) => Promise<void> | void
  isUploading: boolean
  uploadProgress: number
}

function UploadDocumentModal({
  open,
  onClose,
  documentTypes,
  onUpload,
  isUploading,
  uploadProgress,
}: UploadDocumentModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [docTypeId, setDocTypeId] = useState('')
  const [name, setName] = useState('')
  const [notes, setNotes] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const reset = () => {
    setFile(null)
    setDocTypeId('')
    setName('')
    setNotes('')
    setValidationError(null)
    setIsDragOver(false)
  }

  const handleClose = () => {
    if (isUploading) return
    reset()
    onClose()
  }

  const handleFileSelect = (f: File | null) => {
    if (!f) {
      setFile(null)
      return
    }
    if (!ACCEPTED_MIME.includes(f.type)) {
      setValidationError('Solo se permiten archivos PDF, JPEG o PNG')
      return
    }
    if (f.size > MAX_SIZE_BYTES) {
      setValidationError('El archivo supera el tamaño máximo de 20MB')
      return
    }
    setValidationError(null)
    setFile(f)
    if (!name.trim()) setName(f.name.replace(/\.[^.]+$/, ''))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!file || !docTypeId) {
      setValidationError('Selecciona un archivo y un tipo de documento')
      return
    }
    setValidationError(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('document_type_id', docTypeId)
    formData.append('name', name.trim() || file.name)
    if (notes.trim()) formData.append('notes', notes.trim())

    try {
      await onUpload(formData)
      reset()
      onClose()
    } catch {
      // El componente padre (página) muestra el toast; no cerramos el modal
    }
  }

  const activeTypes = documentTypes.filter((t) => t.is_active)

  return (
    <Modal open={open} onClose={handleClose} title="Subir documento" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* File picker con drag & drop */}
        <div className="space-y-1.5">
          <Label>
            Archivo <span className="text-destructive">*</span>
          </Label>
          <label
            htmlFor="file-input"
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragOver(true)
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault()
              setIsDragOver(false)
              const f = e.dataTransfer.files?.[0]
              if (f) handleFileSelect(f)
            }}
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-6 text-sm transition-colors ${
              isDragOver
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
          >
            <Upload className="size-6 text-muted-foreground" aria-hidden="true" />
            {file ? (
              <div className="text-center">
                <p className="font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)} · {file.type}
                </p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-muted-foreground">
                  Arrastra un archivo o haz click para seleccionar
                </p>
                <p className="text-xs text-muted-foreground">PDF, JPEG, PNG (máx. 20MB)</p>
              </div>
            )}
            <input
              id="file-input"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
              className="sr-only"
              onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
            />
          </label>
          {file && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => setFile(null)}
            >
              <X className="mr-1 size-3" />
              Quitar archivo
            </Button>
          )}
        </div>

        {/* Tipo de documento */}
        <div className="space-y-1.5">
          <Label htmlFor="doc_type">
            Tipo de documento <span className="text-destructive">*</span>
          </Label>
          <select
            id="doc_type"
            value={docTypeId}
            onChange={(e) => setDocTypeId(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <option value="">Seleccionar tipo...</option>
            {activeTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          {activeTypes.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No hay tipos de documento activos. Crea uno en Catálogos.
            </p>
          )}
        </div>

        {/* Nombre */}
        <div className="space-y-1.5">
          <Label htmlFor="doc_name">Nombre</Label>
          <Input
            id="doc_name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre del documento"
            maxLength={255}
          />
        </div>

        {/* Notas */}
        <div className="space-y-1.5">
          <Label htmlFor="doc_notes">Notas</Label>
          <textarea
            id="doc_notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Notas opcionales..."
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 resize-none"
          />
        </div>

        {/* Barra de progreso */}
        {isUploading && (
          <div className="space-y-1">
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${Math.min(100, uploadProgress)}%` }}
                role="progressbar"
                aria-valuenow={uploadProgress}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Subiendo... {Math.round(uploadProgress)}%
            </p>
          </div>
        )}

        {validationError && (
          <p className="text-sm text-destructive" role="alert">
            {validationError}
          </p>
        )}

        <div className="flex items-center justify-end gap-2 border-t pt-4">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isUploading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={!file || !docTypeId || isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Subiendo...
              </>
            ) : (
              'Subir'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
