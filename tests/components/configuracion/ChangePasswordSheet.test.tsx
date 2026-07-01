// =====================================================================
// Tests del componente ChangePasswordSheet
// =====================================================================
// Verifica renderizado, validación, manejo de errores del servidor.
// =====================================================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { TestProviders } from '../helpers/TestProviders'
import { server } from '../../mocks/server'
import { ChangePasswordSheet } from '@/features/configuracion/components/ChangePasswordSheet'

describe('ChangePasswordSheet', () => {
  const onClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock window.location.replace para no navegar en tests
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...window.location, replace: vi.fn() },
    })
  })

  afterEach(() => {
    server.resetHandlers()
  })

  it('renderiza los 3 campos: actual, nueva y confirmación', () => {
    render(
      <TestProviders>
        <ChangePasswordSheet open onClose={onClose} />
      </TestProviders>,
    )

    expect(screen.getByLabelText('Contraseña actual')).toBeInTheDocument()
    expect(screen.getByLabelText('Nueva contraseña')).toBeInTheDocument()
    expect(screen.getByLabelText('Confirmar nueva contraseña')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /actualizar contraseña/i })).toBeInTheDocument()
  })

  it('botón Actualizar está deshabilitado cuando las contraseñas no coinciden', async () => {
    const user = userEvent.setup()
    render(
      <TestProviders>
        <ChangePasswordSheet open onClose={onClose} />
      </TestProviders>,
    )

    await user.type(screen.getByLabelText('Contraseña actual'), 'OldPass2024!')
    await user.type(screen.getByLabelText('Nueva contraseña'), 'NewPass2024!')
    await user.type(screen.getByLabelText('Confirmar nueva contraseña'), 'DifferentPass2024!')

    const submitBtn = screen.getByRole('button', { name: /actualizar contraseña/i })
    expect(submitBtn).toBeDisabled()
  })

  it('muestra mensaje de error cuando el servidor devuelve PASSWORD_REUSED', async () => {
    const user = userEvent.setup()

    // Sobrescribimos el handler para este caso
    server.use(
      http.post('*/auth/change-password', () =>
        HttpResponse.json(
          {
            error: {
              code: 'PASSWORD_REUSED',
              message: 'No puedes reutilizar una de tus últimas 12 contraseñas',
              trace_id: 'test-reused',
            },
          },
          { status: 422 },
        ),
      ),
    )

    render(
      <TestProviders>
        <ChangePasswordSheet open onClose={onClose} />
      </TestProviders>,
    )

    await user.type(screen.getByLabelText('Contraseña actual'), 'OldPass2024!')
    await user.type(screen.getByLabelText('Nueva contraseña'), 'NewPass2024!')
    await user.type(screen.getByLabelText('Confirmar nueva contraseña'), 'NewPass2024!')

    const submitBtn = screen.getByRole('button', { name: /actualizar contraseña/i })
    await waitFor(() => expect(submitBtn).not.toBeDisabled())

    await user.click(submitBtn)

    // Debe mostrar el error en formato accesible
    expect(await screen.findByRole('alert')).toHaveTextContent(
      /no puedes reutilizar una de tus últimas 12 contraseñas/i,
    )
  })

  it('muestra error de contraseña actual incorrecta', async () => {
    const user = userEvent.setup()
    render(
      <TestProviders>
        <ChangePasswordSheet open onClose={onClose} />
      </TestProviders>,
    )

    await user.type(screen.getByLabelText('Contraseña actual'), 'wrong-current')
    await user.type(screen.getByLabelText('Nueva contraseña'), 'NewPass2024!')
    await user.type(screen.getByLabelText('Confirmar nueva contraseña'), 'NewPass2024!')

    const submitBtn = screen.getByRole('button', { name: /actualizar contraseña/i })
    await waitFor(() => expect(submitBtn).not.toBeDisabled())
    await user.click(submitBtn)

    expect(await screen.findByRole('alert')).toHaveTextContent(/contraseña actual es incorrecta/i)
  })
})
