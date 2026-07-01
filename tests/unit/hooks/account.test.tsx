// =====================================================================
// Tests unitarios de los hooks del feature Configuración.
// =====================================================================
// Verifica que los hooks retornen datos correctos desde MSW y manejen
// estados loading / error.
// =====================================================================

import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { TestProviders } from '../../components/helpers/TestProviders'
import { useProfile } from '@/features/configuracion/hooks/use-profile'
import { useSessions } from '@/features/configuracion/hooks/use-sessions'

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <TestProviders>{children}</TestProviders>
)

describe('useProfile', () => {
  it('carga el perfil del usuario desde /auth/me', async () => {
    const { result } = renderHook(() => useProfile(), { wrapper })

    // Estado inicial: loading
    expect(result.current.isLoading).toBe(true)

    // Después de la carga: perfil completo
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toMatchObject({
      id: '00000000-0000-0000-0000-000000000001',
      email: 'admin@urbania.com',
      name: 'Admin Urbania',
      mfa_enabled: false,
      role: 'admin',
    })
  })
})

describe('useSessions', () => {
  it('carga la lista de sesiones desde /auth/sessions', async () => {
    const { result } = renderHook(() => useSessions(), { wrapper })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBeDefined()
    expect(result.current.data).toHaveLength(3)
    expect(result.current.data?.[0]).toMatchObject({
      is_current: true,
      device_name: 'Chrome en macOS',
    })
    expect(result.current.data?.filter((s) => !s.is_current)).toHaveLength(2)
  })

  it('marca exactamente una sesión como current', async () => {
    const { result } = renderHook(() => useSessions(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    const currentSessions = result.current.data?.filter((s) => s.is_current) ?? []
    expect(currentSessions).toHaveLength(1)
  })
})
