// =====================================================================
// Tests unitarios del hook usePermissionsCatalog.
// =====================================================================

import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { TestProviders } from '../../../../tests/components/helpers/TestProviders'
import { usePermissionsCatalog } from '@/features/roles-permisos/hooks/use-permissions'
import type { ReactNode } from 'react'

const wrapper = ({ children }: { children: ReactNode }) => (
  <TestProviders>{children}</TestProviders>
)

describe('usePermissionsCatalog', () => {
  it('carga el catálogo desde /authorization/permissions', async () => {
    const { result } = renderHook(() => usePermissionsCatalog(), { wrapper })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data).toBeDefined()
    expect(result.current.data?.data.length).toBeGreaterThan(0)
  })

  it('agrupa los permisos por recurso en `groups`', async () => {
    const { result } = renderHook(() => usePermissionsCatalog(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // El mock tiene permisos en 4 recursos distintos
    const resources = result.current.groups.map((g) => g.resource)
    expect(resources).toContain('roles')
    expect(resources).toContain('propiedades')
    expect(resources).toContain('pagos')
    expect(resources).toContain('directorio')

    // Cada grupo debe tener al menos una acción
    for (const g of result.current.groups) {
      expect(g.actions.length).toBeGreaterThan(0)
    }
  })
})
