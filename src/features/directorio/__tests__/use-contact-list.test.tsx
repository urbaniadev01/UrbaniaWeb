// =====================================================================
// Tests unitarios de los hooks de contactos y CRUD básico
// del feature Directorio (Residentes y Propietarios).
// =====================================================================

import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { TestProviders } from '../../../../tests/components/helpers/TestProviders'
import {
  useContactList,
  useContact,
  useCreateContact,
  useDeleteContact,
} from '@/features/directorio/hooks/use-contact-list'
import type { ReactNode } from 'react'

const wrapper = ({ children }: { children: ReactNode }) => (
  <TestProviders>{children}</TestProviders>
)

describe('useContactList', () => {
  it('carga la lista de contactos desde /contacts', async () => {
    const { result } = renderHook(() => useContactList(), { wrapper })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBeDefined()
    expect(result.current.data?.length).toBe(2)
    // El servicio unwrapea r.data.data → Contact[] directo
    expect(result.current.data?.[0]).toMatchObject({
      id: 'contact-001',
      full_name: 'Carlos López',
      document_type: 'CC',
    })
  })

  it('filtra la lista por nombre cuando se pasan filtros', async () => {
    const { result } = renderHook(
      () => useContactList({ full_name: 'María' }),
      { wrapper },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.length).toBe(1)
    expect(result.current.data?.[0]).toMatchObject({
      id: 'contact-002',
      full_name: 'María García',
    })
  })
})

describe('useContact', () => {
  it('carga el detalle de un contacto con sus ocupantes desde /contacts/:id', async () => {
    const { result } = renderHook(() => useContact('contact-001'), { wrapper })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    // El servicio unwrapea r.data.data → ContactWithOccupants (objeto único)
    expect(result.current.data).toMatchObject({
      id: 'contact-001',
      full_name: 'Carlos López',
    })
    // El detalle incluye las propiedades como array
    expect(result.current.data?.properties?.length).toBeGreaterThan(0)
    // La primera propiedad referencia el occupant_type anidado
    expect(result.current.data?.properties?.[0].occupant_type?.code).toBe('propietario')
  })

  it('no hace la query si el id es vacío (enabled: !!id)', async () => {
    const { result } = renderHook(() => useContact(''), { wrapper })

    // Permanece en idle sin disparar fetch
    expect(result.current.isFetching).toBe(false)
    expect(result.current.data).toBeUndefined()
  })
})

describe('useCreateContact', () => {
  it('expone la mutación y mantiene isIdle inicialmente', () => {
    const { result } = renderHook(() => useCreateContact(), { wrapper })
    expect(result.current.isIdle).toBe(true)
    expect(typeof result.current.mutate).toBe('function')
  })
})

describe('useDeleteContact', () => {
  it('expone la mutación y mantiene isIdle inicialmente', () => {
    const { result } = renderHook(() => useDeleteContact(), { wrapper })
    expect(result.current.isIdle).toBe(true)
    expect(typeof result.current.mutate).toBe('function')
  })
})
