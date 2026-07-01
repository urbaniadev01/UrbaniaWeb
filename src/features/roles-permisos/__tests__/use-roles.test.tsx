// =====================================================================
// Tests unitarios de los hooks del feature Roles y Permisos.
// =====================================================================

import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { TestProviders } from '../../../../tests/components/helpers/TestProviders'
import { useRoleList, useRole, useCreateRole } from '@/features/roles-permisos/hooks/use-roles'
import type { ReactNode } from 'react'

const wrapper = ({ children }: { children: ReactNode }) => (
  <TestProviders>{children}</TestProviders>
)

describe('useRoleList', () => {
  it('carga la lista de roles desde /authorization/roles', async () => {
    const { result } = renderHook(() => useRoleList(), { wrapper })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data).toBeDefined()
    expect(result.current.data?.data.length).toBe(3)
    expect(result.current.data?.data[0]).toMatchObject({
      nombre: 'Administrador',
      es_sistema: true,
    })
  })
})

describe('useRole', () => {
  it('carga el detalle de un rol con sus permisos desde /authorization/roles/:id', async () => {
    const { result } = renderHook(() => useRole('role-admin-001'), { wrapper })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data).toMatchObject({
      id: 'role-admin-001',
      nombre: 'Administrador',
    })
    expect(result.current.data?.data.permisos.length).toBeGreaterThan(0)
  })

  it('no hace la query si el id es null', async () => {
    const { result } = renderHook(() => useRole(null), { wrapper })
    // Permanece en idle sin disparar fetch
    expect(result.current.isFetching).toBe(false)
  })
})

describe('useCreateRole', () => {
  it('expone la mutación y mantiene isIdle inicialmente', () => {
    const { result } = renderHook(() => useCreateRole(), { wrapper })
    expect(result.current.isIdle).toBe(true)
    expect(typeof result.current.mutate).toBe('function')
  })
})
