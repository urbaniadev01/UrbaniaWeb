// =====================================================================
// Tests unitarios de los hooks de ocupantes por unidad
// del feature Directorio (Residentes y Propietarios).
// =====================================================================

import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { TestProviders } from '../../../../tests/components/helpers/TestProviders'
import {
  useUnitOccupants,
  useLinkContactToUnit,
  useUnlinkOccupant,
} from '@/features/directorio/hooks/use-unit-occupants'
import type { ReactNode } from 'react'

const wrapper = ({ children }: { children: ReactNode }) => (
  <TestProviders>{children}</TestProviders>
)

describe('useUnitOccupants', () => {
  it('carga la lista de ocupantes de una unidad con occupant_type anidado', async () => {
    const { result } = renderHook(() => useUnitOccupants('prop-001'), { wrapper })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    // El servicio unwrapea r.data.data → PropertyOccupant[] directo
    expect(result.current.data).toBeDefined()
    expect(result.current.data?.length).toBe(2)
    // El primer ocupante es el propietario
    expect(result.current.data?.[0]).toMatchObject({
      id: 'occ-001',
      property_id: 'prop-001',
      contact_id: 'contact-001',
      is_primary: true,
    })
    // El occupant_type viene anidado como objeto
    expect(result.current.data?.[0].occupant_type?.code).toBe('propietario')
    expect(result.current.data?.[0].occupant_type?.name).toBe('Propietario')
    // El segundo ocupante es un residente
    expect(result.current.data?.[1].occupant_type?.code).toBe('residente')
  })

  it('no hace la query si el propertyId es vacío (enabled: !!propertyId)', async () => {
    const { result } = renderHook(() => useUnitOccupants(''), { wrapper })

    // Permanece en idle sin disparar fetch
    expect(result.current.isFetching).toBe(false)
    expect(result.current.data).toBeUndefined()
  })
})

describe('useLinkContactToUnit', () => {
  it('expone la mutación y mantiene isIdle inicialmente', () => {
    const { result } = renderHook(() => useLinkContactToUnit('prop-001'), { wrapper })
    expect(result.current.isIdle).toBe(true)
    expect(typeof result.current.mutate).toBe('function')
  })
})

describe('useUnlinkOccupant', () => {
  it('expone la mutación y mantiene isIdle inicialmente', () => {
    const { result } = renderHook(() => useUnlinkOccupant(), { wrapper })
    expect(result.current.isIdle).toBe(true)
    expect(typeof result.current.mutate).toBe('function')
  })
})
