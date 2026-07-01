// =====================================================================
// Tests unitarios de los hooks del feature Comunicaciones.
// =====================================================================

import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TestProviders } from '../../../../tests/components/helpers/TestProviders'
import {
  useAnnouncements,
  useAnnouncement,
  useCreateAnnouncement,
  ANNOUNCEMENTS_KEYS,
} from '@/features/comunicaciones/hooks/use-announcements'
import type { ReactNode } from 'react'

const wrapper = ({ children }: { children: ReactNode }) => (
  <TestProviders>{children}</TestProviders>
)

/**
 * Crea un QueryClient con la caché limpia y `dataUpdatedAt: 0` para que
 * cada test sea independiente de los datos cacheados del anterior.
 */
function makeIsolatedWrapper() {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  })
  const IsolatedWrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
  return IsolatedWrapper
}

describe('useAnnouncements', () => {
  it('carga la lista de comunicados desde /comunicaciones/announcements', async () => {
    const { result } = renderHook(() => useAnnouncements(), { wrapper })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data).toBeDefined()
    expect(result.current.data?.data.length).toBeGreaterThan(0)
    // El primer mock es un comunicado enviado con métricas
    const first = result.current.data?.data[0]
    expect(first).toMatchObject({
      estado: 'enviado',
      segmento: 'todos',
    })
  })

  it('soporta filtros y los aplica al queryKey', () => {
    const filters = { estado: 'borrador', segmento: 'torre' }
    const key = ANNOUNCEMENTS_KEYS.list(filters)
    // Verifica que el query key se construye de forma estable
    expect(key).toEqual([
      'comunicaciones',
      'announcements',
      'list',
      filters,
    ])
  })
})

describe('useAnnouncement', () => {
  let IsolatedWrapper: ReturnType<typeof makeIsolatedWrapper>
  beforeEach(() => {
    IsolatedWrapper = makeIsolatedWrapper()
  })

  it('carga el detalle de un comunicado enviado', async () => {
    const { result } = renderHook(() => useAnnouncement('ann-1'), {
      wrapper: IsolatedWrapper,
    })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data).toMatchObject({
      id: 'ann-1',
      estado: 'enviado',
    })
    // Detalle incluye deliveries
    expect(result.current.data?.data.deliveries).toBeDefined()
    expect(result.current.data?.data.deliveries.length).toBeGreaterThan(0)
  })

  it('no hace la query si el id es null', async () => {
    const { result } = renderHook(() => useAnnouncement(null), {
      wrapper: IsolatedWrapper,
    })
    // Permanece en idle sin disparar fetch
    expect(result.current.isFetching).toBe(false)
    expect(result.current.data).toBeUndefined()
  })
})

describe('useCreateAnnouncement', () => {
  it('expone la mutación y mantiene isIdle inicialmente', () => {
    const { result } = renderHook(() => useCreateAnnouncement(), { wrapper })
    expect(result.current.isIdle).toBe(true)
    expect(typeof result.current.mutate).toBe('function')
  })

  it('crea un comunicado exitosamente', async () => {
    const IsolatedWrapper = makeIsolatedWrapper()
    const { result } = renderHook(() => useCreateAnnouncement(), {
      wrapper: IsolatedWrapper,
    })

    await act(async () => {
      result.current.mutate({
        titulo: 'Corte de agua',
        cuerpo: 'Mañana no habrá agua de 8am a 12pm',
        segmento: 'todos',
        canales: ['email', 'whatsapp'],
        fijado: false,
      })
      await waitFor(() => expect(result.current.isSuccess).toBe(true))
    })

    expect(result.current.data?.data).toMatchObject({
      titulo: 'Corte de agua',
      estado: 'enviado',
    })
  })
})
