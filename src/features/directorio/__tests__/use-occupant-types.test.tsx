// =====================================================================
// Tests unitarios del hook de catálogo de tipos de ocupante
// del feature Directorio (Residentes y Propietarios).
// =====================================================================

import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { TestProviders } from '../../../../tests/components/helpers/TestProviders'
import { useOccupantTypes } from '@/features/directorio/hooks/use-occupant-types'
import type { ReactNode } from 'react'

const wrapper = ({ children }: { children: ReactNode }) => (
  <TestProviders>{children}</TestProviders>
)

describe('useOccupantTypes', () => {
  it('carga los tipos de ocupante desde /occupant-types', async () => {
    const { result } = renderHook(() => useOccupantTypes(), { wrapper })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    // El servicio unwrapea r.data.data → OccupantType[] directo
    expect(result.current.data).toBeDefined()
    expect(result.current.data?.length).toBe(3)
    // El primer tipo es Propietario
    expect(result.current.data?.[0]).toMatchObject({
      id: 'otype-001',
      code: 'propietario',
      name: 'Propietario',
      sort_order: 1,
    })
    // El segundo es Residente
    expect(result.current.data?.[1]).toMatchObject({
      code: 'residente',
      name: 'Residente',
    })
    // El tercero es Inquilino
    expect(result.current.data?.[2]).toMatchObject({
      code: 'inquilino',
      name: 'Inquilino',
    })
  })
})
