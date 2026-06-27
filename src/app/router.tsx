import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router'
import { FullPageLoader } from '@/components/shared/FullPageLoader'

const LoginPage = lazy(() =>
  import('@/features/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage })),
)
const MfaPage = lazy(() =>
  import('@/features/auth/pages/MfaPage').then((m) => ({ default: m.MfaPage })),
)
const DashboardLayout = lazy(() =>
  import('@/components/layout/DashboardLayout').then((m) => ({ default: m.DashboardLayout })),
)
const DashboardPage = lazy(() =>
  import('@/features/dashboard/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
)

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <Suspense fallback={<FullPageLoader />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: '/login/mfa',
    element: (
      <Suspense fallback={<FullPageLoader />}>
        <MfaPage />
      </Suspense>
    ),
  },
  {
    path: '/',
    element: (
      <Suspense fallback={<FullPageLoader />}>
        <DashboardLayout />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={<FullPageLoader />}>
            <DashboardPage />
          </Suspense>
        ),
      },
    ],
  },
])
