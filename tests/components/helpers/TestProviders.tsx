import { useState, type ReactNode } from 'react'
import { MemoryRouter, useLocation } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  })
}

function LocationProbe() {
  const location = useLocation()
  return (
    <div data-testid="current-location" style={{ display: 'none' }}>
      {location.pathname}
    </div>
  )
}

export function TestProviders({
  children,
  initialEntries = ['/login'],
}: {
  children: ReactNode
  initialEntries?: string[]
}) {
  const [queryClient] = useState(() => makeQueryClient())
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <LocationProbe />
        {children}
      </MemoryRouter>
    </QueryClientProvider>
  )
}
