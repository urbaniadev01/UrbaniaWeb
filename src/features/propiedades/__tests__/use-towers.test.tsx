// =====================================================================
// Tests unitarios de los hooks del feature Propiedades — módulo Torres.
// =====================================================================

import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { TestProviders } from '../../../../tests/components/helpers/TestProviders'
import {
  useTowerList,
  useTowers,
  useCreateTower,
} from '@/features/propiedades/hooks/use-towers'
import type { ReactNode } from 'react'

const wrapper = ({ children }: { children: ReactNode }) => (
  <TestProviders>{children}</TestProviders>
)

describe('useTowerList', () => {
  it('carga la lista paginada de torres de un condominio', async () => {
    const { result } = renderHook(() => useTowerList('condo-001'), { wrapper })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data).toBeDefined()
    expect(result.current.data?.data.length).toBe(2)
    // La primera torre es T1
    expect(result.current.data?.data[0]).toMatchObject({
      id: 'tower-001',
      code: 'T1',
      floor_count: 10,
    })
    // Las torres incluyen stats de ocupación
    const firstTower = result.current.data?.data[0]
    expect(firstTower?.stats?.total_units).toBe(20)
  })

  it('no hace la query si el condominiumId es null', async () => {
    const { result } = renderHook(() => useTowerList(null), { wrapper })
    // Permanece en idle sin disparar fetch
    expect(result.current.isFetching).toBe(false)
    expect(result.current.data).toBeUndefined()
  })
})

describe('useTowers', () => {
  it('retorna solo el array de torres (data sin envolver)', async () => {
    const { result } = renderHook(() => useTowers('condo-001'), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    // useTowers expone `data` como el array puro (query.data?.data)
    expect(Array.isArray(result.current.data)).toBe(true)
    expect(result.current.data?.length).toBe(2)
    expect(result.current.data?.[0].code).toBe('T1')
  })

  it('no hace la query si el condominiumId es null', async () => {
    const { result } = renderHook(() => useTowers(null), { wrapper })
    expect(result.current.isFetching).toBe(false)
    expect(result.current.data).toBeUndefined()
  })
})

describe('useCreateTower', () => {
  it('expone la mutación y mantiene isIdle inicialmente', () => {
    const { result } = renderHook(() => useCreateTower('condo-001'), { wrapper })
    expect(result.current.isIdle).toBe(true)
    expect(typeof result.current.mutate).toBe('function')
  })
})
