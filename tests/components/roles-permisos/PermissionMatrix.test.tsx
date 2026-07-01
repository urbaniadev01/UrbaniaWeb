// =====================================================================
// Tests del componente PermissionMatrix
// =====================================================================
// Verifica el grid de permisos recurso×acción: renderizado, estado
// de checkboxes, skeleton, empty state, ocultamiento de permisos de
// sistema y contador de permisos seleccionados.
// =====================================================================

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PermissionMatrix } from '@/features/roles-permisos/components/PermissionMatrix'
import type { PermissionGroup } from '@/features/roles-permisos/types/roles.types'
import type { ReactNode } from 'react'

// QueryClient aislado para tests.
// El componente usa `useSetRolePermissions(roleId)` (mutation) pero en estos
// tests nunca disparamos el "Guardar matriz", así que solo necesitamos un
// QueryClient válido para que la mutación se inicialice sin lanzar.
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
})

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

const mockGroups: PermissionGroup[] = [
  {
    resource: 'propiedades',
    actions: [
      { id: 'p-1', resource: 'propiedades', action: 'ver', name: 'propiedades.ver', is_system: false },
      { id: 'p-2', resource: 'propiedades', action: 'crear', name: 'propiedades.crear', is_system: false },
      { id: 'p-3', resource: 'propiedades', action: 'editar', name: 'propiedades.editar', is_system: false },
    ],
  },
  {
    resource: 'pagos',
    actions: [
      { id: 'p-4', resource: 'pagos', action: 'ver', name: 'pagos.ver', is_system: false },
      { id: 'p-5', resource: 'pagos', action: 'aprobar', name: 'pagos.aprobar', is_system: true },
    ],
  },
]

describe('PermissionMatrix', () => {
  it('renderiza el grid con recursos y acciones', () => {
    render(
      <PermissionMatrix roleId="role-1" currentPermissions={[]} groups={mockGroups} />,
      { wrapper },
    )
    // El componente renderiza el nombre del recurso capitalizado visualmente,
    // pero el text node sigue siendo "propiedades" / "pagos".
    expect(screen.getByText('propiedades')).toBeInTheDocument()
    expect(screen.getByText('pagos')).toBeInTheDocument()
    // ACTION_LABEL provee las etiquetas en español
    expect(screen.getByText('Ver')).toBeInTheDocument()
    expect(screen.getByText('Crear')).toBeInTheDocument()
    expect(screen.getByText('Editar')).toBeInTheDocument()
  })

  it('muestra permisos actuales como seleccionados', () => {
    render(
      <PermissionMatrix
        roleId="role-1"
        currentPermissions={['propiedades.ver', 'propiedades.editar']}
        groups={mockGroups}
      />,
      { wrapper },
    )
    const verCheckbox = screen.getByLabelText('propiedades.ver') as HTMLInputElement
    expect(verCheckbox.checked).toBe(true)
    const crearCheckbox = screen.getByLabelText('propiedades.crear') as HTMLInputElement
    expect(crearCheckbox.checked).toBe(false)
    const editarCheckbox = screen.getByLabelText('propiedades.editar') as HTMLInputElement
    expect(editarCheckbox.checked).toBe(true)
  })

  it('alterna un permiso al hacer click', async () => {
    const user = userEvent.setup()
    render(
      <PermissionMatrix roleId="role-1" currentPermissions={[]} groups={mockGroups} />,
      { wrapper },
    )
    const checkbox = screen.getByLabelText('propiedades.ver') as HTMLInputElement
    expect(checkbox.checked).toBe(false)
    await user.click(checkbox)
    expect(checkbox.checked).toBe(true)
  })

  it('muestra skeleton cuando isLoading es true', () => {
    render(
      <PermissionMatrix
        roleId="role-1"
        currentPermissions={[]}
        groups={mockGroups}
        isLoading={true}
      />,
      { wrapper },
    )
    expect(screen.getByLabelText('Cargando matriz de permisos')).toBeInTheDocument()
  })

  it('muestra empty state cuando no hay grupos', () => {
    render(
      <PermissionMatrix roleId="role-1" currentPermissions={[]} groups={[]} />,
      { wrapper },
    )
    expect(screen.getByText('No hay permisos disponibles para asignar.')).toBeInTheDocument()
  })

  it('oculta permisos de sistema cuando hideSystemPermissions es true', () => {
    render(
      <PermissionMatrix
        roleId="role-1"
        currentPermissions={[]}
        groups={mockGroups}
        hideSystemPermissions={true}
      />,
      { wrapper },
    )
    // 'pagos.aprobar' tiene is_system=true, no debe renderizar checkbox
    expect(screen.queryByLabelText('pagos.aprobar')).not.toBeInTheDocument()
    // El resto sigue visible
    expect(screen.getByLabelText('pagos.ver')).toBeInTheDocument()
  })

  it('muestra contador de permisos seleccionados', () => {
    render(
      <PermissionMatrix
        roleId="role-1"
        currentPermissions={['propiedades.ver']}
        groups={mockGroups}
      />,
      { wrapper },
    )
    expect(screen.getByText(/1 permiso seleccionado/i)).toBeInTheDocument()
  })
})
