// =====================================================================
// Tests del componente RoleForm
// =====================================================================
// Verifica el formulario de crear/editar rol: renderizado en cada modo,
// validación Zod, manejo de roles de sistema, base_role selector, estado
// de submitting y cancelación.
// =====================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RoleForm } from '@/features/roles-permisos/components/RoleForm'
import { TestProviders } from '../../../tests/components/helpers/TestProviders'
import type { Role } from '@/features/roles-permisos/types/roles.types'

const mockRole: Role = {
  id: 'role-1',
  nombre: 'Contador',
  codigo: 'contador',
  descripcion: 'Gestiona pagos',
  es_sistema: false,
  nivel_alcance: 'condominium',
  usuarios_count: 1,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

const mockSystemRole: Role = {
  ...mockRole,
  id: 'role-admin',
  nombre: 'Administrador',
  codigo: 'admin',
  es_sistema: true,
}

describe('RoleForm', () => {
  const onSubmit = vi.fn()
  const onClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza el formulario vacío en modo creación', () => {
    render(
      <TestProviders>
        <RoleForm open={true} onClose={onClose} onSubmit={onSubmit} />
      </TestProviders>,
    )
    expect(screen.getByText('Nuevo rol')).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre *')).toBeInTheDocument()
    expect(screen.getByLabelText('Descripción')).toBeInTheDocument()
    expect(screen.getByLabelText('Nivel de alcance *')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /crear rol/i })).toBeInTheDocument()
  })

  it('renderiza valores iniciales en modo edición', () => {
    render(
      <TestProviders>
        <RoleForm
          open={true}
          onClose={onClose}
          initialValues={mockRole}
          onSubmit={onSubmit}
        />
      </TestProviders>,
    )
    expect(screen.getByText(/editar rol.*contador/i)).toBeInTheDocument()
    const nombreInput = screen.getByLabelText('Nombre *') as HTMLInputElement
    expect(nombreInput.value).toBe('Contador')
    expect(screen.getByRole('button', { name: /guardar cambios/i })).toBeInTheDocument()
  })

  it('deshabilita campos para roles de sistema', () => {
    render(
      <TestProviders>
        <RoleForm
          open={true}
          onClose={onClose}
          initialValues={mockSystemRole}
          onSubmit={onSubmit}
        />
      </TestProviders>,
    )
    expect(screen.getByLabelText('Nombre *')).toBeDisabled()
    expect(screen.getByLabelText('Nivel de alcance *')).toBeDisabled()
    expect(screen.getByText(/rol de sistema/i)).toBeInTheDocument()
  })

  it('valida nombre vacío al enviar', async () => {
    const user = userEvent.setup()
    render(
      <TestProviders>
        <RoleForm open={true} onClose={onClose} onSubmit={onSubmit} />
      </TestProviders>,
    )
    await user.click(screen.getByRole('button', { name: /crear rol/i }))
    expect(
      await screen.findByText(/El nombre debe tener al menos 2 caracteres/i),
    ).toBeInTheDocument()
  })

  it('llama onSubmit con los datos del formulario', async () => {
    const user = userEvent.setup()
    render(
      <TestProviders>
        <RoleForm open={true} onClose={onClose} onSubmit={onSubmit} />
      </TestProviders>,
    )
    await user.type(screen.getByLabelText('Nombre *'), 'Nuevo Rol')
    await user.click(screen.getByRole('button', { name: /crear rol/i }))
    // RHF pasa (data, event) al callback de handleSubmit. Verificamos el
    // primer argumento (datos) y dejamos el segundo libre (evento sintético).
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ nombre: 'Nuevo Rol' }),
        expect.anything(),
      )
    })
  })

  it('muestra selector de base_role en creación si hay roles disponibles', () => {
    const baseRoles: Role[] = [mockRole]
    render(
      <TestProviders>
        <RoleForm
          open={true}
          onClose={onClose}
          onSubmit={onSubmit}
          availableBaseRoles={baseRoles}
        />
      </TestProviders>,
    )
    expect(screen.getByText(/basado en rol existente/i)).toBeInTheDocument()
    // El nombre del rol base aparece como <option> dentro del <select>
    expect(screen.getByText('Contador')).toBeInTheDocument()
  })

  it('deshabilita botón submit cuando isSubmitting es true', () => {
    render(
      <TestProviders>
        <RoleForm open={true} onClose={onClose} onSubmit={onSubmit} isSubmitting />
      </TestProviders>,
    )
    expect(screen.getByRole('button', { name: /guardando/i })).toBeDisabled()
  })

  it('llama onClose al cancelar', async () => {
    const user = userEvent.setup()
    // Mock window.confirm por si el formulario tiene cambios sucios
    const originalConfirm = window.confirm
    window.confirm = vi.fn(() => true)
    try {
      render(
        <TestProviders>
          <RoleForm open={true} onClose={onClose} onSubmit={onSubmit} />
        </TestProviders>,
      )
      await user.click(screen.getByRole('button', { name: /cancelar/i }))
      expect(onClose).toHaveBeenCalled()
    } finally {
      window.confirm = originalConfirm
    }
  })
})
