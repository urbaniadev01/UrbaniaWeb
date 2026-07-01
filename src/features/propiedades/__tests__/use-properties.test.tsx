// =====================================================================
// Tests unitarios de los hooks del feature Propiedades y Unidades.
// =====================================================================

import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { TestProviders } from '../../../../tests/components/helpers/TestProviders'
import {
  usePropertyList,
  useProperty,
  useCreateProperty,
  useDeleteProperty,
  usePropertyDocuments,
} from '@/features/propiedades/hooks/use-properties'
import type { ReactNode } from 'react'

const wrapper = ({ children }: { children: ReactNode }) => (
  <TestProviders>{children}</TestProviders>
)

describe('usePropertyList', () => {
  it('carga la lista paginada de unidades desde /properties', async () => {
    const { result } = renderHook(() => usePropertyList(), { wrapper })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data).toBeDefined()
    expect(result.current.data?.data.length).toBe(2)
    // El primer mock es la unidad 301 de la Torre 1
    expect(result.current.data?.data[0]).toMatchObject({
      id: 'prop-001',
      unit_number: '301',
      full_designation: 'T1 - 301',
    })
    // La meta de paginación está presente
    expect(result.current.data?.meta.total).toBe(2)
  })
})

describe('useProperty', () => {
  it('carga el detalle de una unidad desde /properties/:id', async () => {
    const { result } = renderHook(() => useProperty('prop-001'), { wrapper })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data).toMatchObject({
      id: 'prop-001',
      unit_number: '301',
    })
    // El detalle incluye la torre y el tipo como objetos
    expect(result.current.data?.data.tower.code).toBe('T1')
    expect(result.current.data?.data.type.code).toBe('apartamento')
  })

  it('no hace la query si el id es null', async () => {
    const { result } = renderHook(() => useProperty(null), { wrapper })
    // Permanece en idle sin disparar fetch
    expect(result.current.isFetching).toBe(false)
    expect(result.current.data).toBeUndefined()
  })
})

describe('useCreateProperty', () => {
  it('expone la mutación y mantiene isIdle inicialmente', () => {
    const { result } = renderHook(() => useCreateProperty(), { wrapper })
    expect(result.current.isIdle).toBe(true)
    expect(typeof result.current.mutate).toBe('function')
  })
})

describe('useDeleteProperty', () => {
  it('expone la mutación y mantiene isIdle inicialmente', () => {
    const { result } = renderHook(() => useDeleteProperty(), { wrapper })
    expect(result.current.isIdle).toBe(true)
    expect(typeof result.current.mutate).toBe('function')
  })
})

describe('usePropertyDocuments', () => {
  it('carga la lista de documentos de una unidad', async () => {
    const { result } = renderHook(() => usePropertyDocuments('prop-001'), { wrapper })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data).toBeDefined()
    expect(result.current.data?.data.length).toBeGreaterThan(0)
    expect(result.current.data?.data[0]).toMatchObject({
      id: 'doc-001',
      name: 'Escritura Pública.pdf',
    })
    // El documento referencia su tipo como objeto
    expect(result.current.data?.data[0].document_type.code).toBe('escritura')
  })

  it('no hace la query si el propertyId es null', async () => {
    const { result } = renderHook(() => usePropertyDocuments(null), { wrapper })
    // Permanece en idle sin disparar fetch
    expect(result.current.isFetching).toBe(false)
    expect(result.current.data).toBeUndefined()
  })
})
