// =====================================================================
// Tests del componente AnnouncementComposer
// =====================================================================
// Verifica renderizado, validación con Zod, submit (send/schedule),
// precarga desde plantilla, canales inactivos y estado de submitting.
// =====================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AnnouncementComposer } from '@/features/comunicaciones/components/AnnouncementComposer'

describe('AnnouncementComposer', () => {
  const onSubmit = vi.fn()
  const onCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza todos los campos del formulario', () => {
    render(<AnnouncementComposer onSubmit={onSubmit} />)
    expect(screen.getByLabelText('Título *')).toBeInTheDocument()
    expect(screen.getByLabelText('Mensaje *')).toBeInTheDocument()
    expect(screen.getByLabelText('Audiencia *')).toBeInTheDocument()
    // Etiquetas de los 3 canales disponibles
    expect(screen.getByText('WhatsApp')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Push')).toBeInTheDocument()
  })

  it('valida campos obligatorios al enviar vacío', async () => {
    render(<AnnouncementComposer onSubmit={onSubmit} />)
    await userEvent.click(screen.getByRole('button', { name: /enviar ahora/i }))
    // announcementSchema: titulo min(1, 'El título es obligatorio')
    expect(await screen.findByText('El título es obligatorio')).toBeInTheDocument()
  })

  it('llama onSubmit con send cuando no hay fecha programada', async () => {
    render(<AnnouncementComposer onSubmit={onSubmit} />)
    await userEvent.type(screen.getByLabelText('Título *'), 'Aviso importante')
    await userEvent.type(screen.getByLabelText('Mensaje *'), 'Contenido del aviso')
    // Email ya está seleccionado por defecto (defaultValues.canales = ['email'])
    await userEvent.click(screen.getByRole('button', { name: /enviar ahora/i }))
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ titulo: 'Aviso importante' }),
        'send',
      )
    })
  })

  it('habilita programar cuando se ingresa fecha', async () => {
    render(<AnnouncementComposer onSubmit={onSubmit} />)
    // Ingresar fecha programada
    const dateInput = screen.getByLabelText(/programado para/i)
    await userEvent.type(dateInput, '2026-07-15T14:00')
    // Cuando watch('programado_para') es truthy aparece el botón Programar
    expect(screen.getByRole('button', { name: /programar/i })).toBeInTheDocument()
  })

  it('llama onCancel al hacer click en cancelar', async () => {
    render(<AnnouncementComposer onSubmit={onSubmit} onCancel={onCancel} />)
    await userEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(onCancel).toHaveBeenCalled()
  })

  it('precarga título y cuerpo desde una plantilla', async () => {
    const template = { nombre: 'Plantilla test', cuerpo: 'Cuerpo de prueba' }
    render(<AnnouncementComposer onSubmit={onSubmit} initialTemplate={template} />)
    // El useEffect de precarga llama setValue; esperamos al re-render
    expect(await screen.findByDisplayValue('Plantilla test')).toBeInTheDocument()
    expect(await screen.findByDisplayValue('Cuerpo de prueba')).toBeInTheDocument()
  })

  it('deshabilita canales inactivos', () => {
    const activeChannels = { whatsapp: true, email: true, push: false }
    render(
      <AnnouncementComposer
        onSubmit={onSubmit}
        activeChannels={activeChannels}
      />,
    )
    // El label del canal no tiene htmlFor explícito (input anidado), usamos role
    const pushCheckbox = screen.getByRole('checkbox', { name: /push/i })
    expect(pushCheckbox).toBeDisabled()
    // El label muestra el texto "(no configurado)" cuando está deshabilitado
    expect(screen.getByText('(no configurado)')).toBeInTheDocument()
  })

  it('muestra spinner cuando isSubmitting es true', () => {
    const { container } = render(
      <AnnouncementComposer onSubmit={onSubmit} isSubmitting />,
    )
    // El botón "Enviar ahora" debe estar deshabilitado durante el submit
    expect(
      screen.getByRole('button', { name: /enviar ahora/i }),
    ).toBeDisabled()
    // El spinner (Loader2 con clase animate-spin) debe estar presente
    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })
})
