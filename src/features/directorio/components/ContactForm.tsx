import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Contact, CreateContactPayload, UpdateContactPayload } from '../types/directorio.types'

const DOCUMENT_TYPES = ['CC', 'NIT', 'CE', 'Pasaporte', 'Otro'] as const

const contactSchema = z.object({
  full_name: z.string().min(1, 'El nombre es obligatorio'),
  document_type: z.string().min(1, 'El tipo de documento es obligatorio'),
  document_number: z.string().min(5, 'El número de documento debe tener al menos 5 caracteres'),
  email: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: 'Ingresa un email válido',
    }),
  phone: z.string().optional().nullable(),
  emergency_contact_name: z.string().optional().nullable(),
  emergency_contact_phone: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

type ContactFormValues = z.infer<typeof contactSchema>

interface ContactFormProps {
  open: boolean
  onClose: () => void
  initialValues?: Partial<Contact>
  onSubmit: (data: CreateContactPayload | UpdateContactPayload) => void
  isSubmitting?: boolean
}

export function ContactForm({
  open,
  onClose,
  initialValues,
  onSubmit,
  isSubmitting = false,
}: ContactFormProps) {
  const isEditing = !!initialValues

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      full_name: '',
      document_type: 'CC',
      document_number: '',
      email: '',
      phone: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      notes: '',
    },
  })

  useEffect(() => {
    if (open) {
      if (initialValues) {
        reset({
          full_name: initialValues.full_name ?? '',
          document_type: initialValues.document_type ?? 'CC',
          document_number: initialValues.document_number ?? '',
          email: initialValues.email ?? '',
          phone: initialValues.phone ?? '',
          emergency_contact_name: initialValues.emergency_contact_name ?? '',
          emergency_contact_phone: initialValues.emergency_contact_phone ?? '',
          notes: initialValues.notes ?? '',
        })
      } else {
        reset({
          full_name: '',
          document_type: 'CC',
          document_number: '',
          email: '',
          phone: '',
          emergency_contact_name: '',
          emergency_contact_phone: '',
          notes: '',
        })
      }
    }
  }, [open, initialValues, reset])

  const onFormSubmit = (values: ContactFormValues) => {
    if (isEditing) {
      const payload: UpdateContactPayload = {}
      if (values.full_name !== initialValues?.full_name) payload.full_name = values.full_name
      if (values.email !== (initialValues?.email ?? '')) payload.email = values.email || null
      if (values.phone !== (initialValues?.phone ?? '')) payload.phone = values.phone || null
      if (values.emergency_contact_name !== (initialValues?.emergency_contact_name ?? ''))
        payload.emergency_contact_name = values.emergency_contact_name || null
      if (values.emergency_contact_phone !== (initialValues?.emergency_contact_phone ?? ''))
        payload.emergency_contact_phone = values.emergency_contact_phone || null
      if (values.notes !== (initialValues?.notes ?? '')) payload.notes = values.notes || null
      onSubmit(payload)
    } else {
      onSubmit(values as CreateContactPayload)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-lg border bg-card p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {isEditing ? 'Editar contacto' : 'Nuevo contacto'}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          {/* Nombre completo */}
          <div className="space-y-1.5">
            <Label htmlFor="full_name">Nombre completo *</Label>
            <Input id="full_name" {...register('full_name')} />
            {errors.full_name && (
              <p className="text-xs text-destructive">{errors.full_name.message}</p>
            )}
          </div>

          {/* Tipo de documento (solo en creación) */}
          {!isEditing && (
            <div className="space-y-1.5">
              <Label htmlFor="document_type">Tipo de documento *</Label>
              <select
                id="document_type"
                {...register('document_type')}
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                {DOCUMENT_TYPES.map((dt) => (
                  <option key={dt} value={dt}>
                    {dt}
                  </option>
                ))}
              </select>
              {errors.document_type && (
                <p className="text-xs text-destructive">{errors.document_type.message}</p>
              )}
            </div>
          )}

          {/* Número de documento (solo en creación) */}
          {!isEditing && (
            <div className="space-y-1.5">
              <Label htmlFor="document_number">Número de documento *</Label>
              <Input id="document_number" {...register('document_number')} />
              {errors.document_number && (
                <p className="text-xs text-destructive">{errors.document_number.message}</p>
              )}
            </div>
          )}

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Teléfono */}
          <div className="space-y-1.5">
            <Label htmlFor="phone">Teléfono</Label>
            <Input id="phone" {...register('phone')} />
            {errors.phone && (
              <p className="text-xs text-destructive">{errors.phone.message}</p>
            )}
          </div>

          {/* Contacto de emergencia */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="emergency_contact_name">Contacto de emergencia</Label>
              <Input id="emergency_contact_name" {...register('emergency_contact_name')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="emergency_contact_phone">Tel. emergencia</Label>
              <Input id="emergency_contact_phone" {...register('emergency_contact_phone')} />
            </div>
          </div>

          {/* Notas */}
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notas</Label>
            <textarea
              id="notes"
              {...register('notes')}
              className="h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 resize-none"
            />
          </div>

          {/* Acciones */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear contacto'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
