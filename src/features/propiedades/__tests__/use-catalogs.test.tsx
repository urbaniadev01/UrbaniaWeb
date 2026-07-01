// =====================================================================
// Tests unitarios de los hooks del feature Propiedades — módulo Catálogos.
// =====================================================================

import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { TestProviders } from '../../../../tests/components/helpers/TestProviders'
import {
  usePropertyTypes,
  useAllPropertyTypes,
  usePropertyStatuses,
  useAllPropertyStatuses,
  usePropertyDocumentTypes,
} from '@/features/propiedades/hooks/use-catalogs'
import type { ReactNode } from 'react'

const wrapper = ({ children }: { children: ReactNode }) => (
  <TestProviders>{children}</TestProviders>
)

describe('usePropertyTypes', () => {
  it('carga la lista paginada de tipos de unidad desde /property-types', async () => {
    const { result } = renderHook(() => usePropertyTypes(), { wrapper })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data).toBeDefined()
    expect(result.current.data?.data.length).toBe(2)
    // El primer tipo es "Apartamento"
    expect(result.current.data?.data[0]).toMatchObject({
      id: 'type-001',
      code: 'apartamento',
      name: 'Apartamento',
    })
    // La meta de paginación está presente
    expect(result.current.data?.meta.total).toBe(2)
  })
})

describe('useAllPropertyTypes', () => {
  it('carga la lista plana (sin paginar) desde /property-types/all', async () => {
    const { result } = renderHook(() => useAllPropertyTypes(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    // useAllPropertyTypes retorna ApiResponse<PropertyType[]>
    expect(result.current.data?.data).toBeDefined()
    expect(result.current.data?.data.length).toBe(2)
    // No incluye meta de paginación
    expect(result.current.data?.meta.current_page).toBeUndefined()
  })
})

describe('usePropertyStatuses', () => {
  it('carga la lista paginada de estados de unidad desde /property-statuses', async () => {
    const { result } = renderHook(() => usePropertyStatuses(), { wrapper })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data).toBeDefined()
    expect(result.current.data?.data.length).toBe(2)
    // El primer estado es "Ocupada" y permite residentes
    expect(result.current.data?.data[0]).toMatchObject({
      id: 'status-001',
      code: 'ocupada',
      name: 'Ocupada',
      allows_residents: true,
    })
    // El segundo estado es "Vacía" y NO permite residentes
    expect(result.current.data?.data[1]).toMatchObject({
      code: 'vacia',
      allows_residents: false,
    })
  })
})

describe('useAllPropertyStatuses', () => {
  it('carga la lista plana (sin paginar) desde /property-statuses/all', async () => {
    const { result } = renderHook(() => useAllPropertyStatuses(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data).toBeDefined()
    expect(result.current.data?.data.length).toBe(2)
    // No incluye meta de paginación
    expect(result.current.data?.meta.current_page).toBeUndefined()
  })
})

describe('usePropertyDocumentTypes', () => {
  it('carga la lista paginada de tipos de documento desde /property-document-types', async () => {
    const { result } = renderHook(() => usePropertyDocumentTypes(), { wrapper })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data).toBeDefined()
    expect(result.current.data?.data.length).toBe(1)
    // El único tipo de documento es "Escritura"
    expect(result.current.data?.data[0]).toMatchObject({
      id: 'doctype-001',
      code: 'escritura',
      name: 'Escritura',
    })
  })
})
