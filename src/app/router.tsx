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
const DirectorioPage = lazy(() =>
  import('@/features/directorio/pages/DirectorioPage').then((m) => ({ default: m.DirectorioPage })),
)
const ContactoDetailPage = lazy(() =>
  import('@/features/directorio/pages/ContactoDetailPage').then((m) => ({
    default: m.ContactoDetailPage,
  })),
)
const UnitOccupantsPage = lazy(() =>
  import('@/features/directorio/pages/UnitOccupantsPage').then((m) => ({
    default: m.UnitOccupantsPage,
  })),
)
const PropertiesListPage = lazy(() =>
  import('@/features/propiedades/pages/PropertiesListPage').then((m) => ({
    default: m.PropertiesListPage,
  })),
)
const TowersPage = lazy(() =>
  import('@/features/propiedades/pages/TowersPage').then((m) => ({ default: m.TowersPage })),
)
const CatalogsPage = lazy(() =>
  import('@/features/propiedades/pages/CatalogsPage').then((m) => ({ default: m.CatalogsPage })),
)
const ProfilePage = lazy(() =>
  import('@/features/configuracion/pages/ProfilePage').then((m) => ({ default: m.ProfilePage })),
)
const SecurityPage = lazy(() =>
  import('@/features/configuracion/pages/SecurityPage').then((m) => ({ default: m.SecurityPage })),
)
const RolesPage = lazy(() =>
  import('@/features/roles-permisos/pages/RolesPage').then((m) => ({ default: m.RolesPage })),
)
const PermissionMatrixPage = lazy(() =>
  import('@/features/roles-permisos/pages/PermissionMatrixPage').then((m) => ({
    default: m.PermissionMatrixPage,
  })),
)
const PanelUsersPage = lazy(() =>
  import('@/features/roles-permisos/pages/PanelUsersPage').then((m) => ({
    default: m.PanelUsersPage,
  })),
)
const ApprovalRulesPage = lazy(() =>
  import('@/features/roles-permisos/pages/ApprovalRulesPage').then((m) => ({
    default: m.ApprovalRulesPage,
  })),
)
const PermissionAuditPage = lazy(() =>
  import('@/features/roles-permisos/pages/PermissionAuditPage').then((m) => ({
    default: m.PermissionAuditPage,
  })),
)
const AnnouncementsInboxPage = lazy(() =>
  import('@/features/comunicaciones/pages/AnnouncementsInboxPage').then((m) => ({
    default: m.AnnouncementsInboxPage,
  })),
)
const ComposeAnnouncementPage = lazy(() =>
  import('@/features/comunicaciones/pages/ComposeAnnouncementPage').then((m) => ({
    default: m.ComposeAnnouncementPage,
  })),
)
const SurveysPage = lazy(() =>
  import('@/features/comunicaciones/pages/SurveysPage').then((m) => ({
    default: m.SurveysPage,
  })),
)
const ChannelsPage = lazy(() =>
  import('@/features/comunicaciones/pages/ChannelsPage').then((m) => ({
    default: m.ChannelsPage,
  })),
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
      {
        path: 'directorio',
        element: (
          <Suspense fallback={<FullPageLoader />}>
            <DirectorioPage />
          </Suspense>
        ),
      },
      {
        path: 'directorio/:id',
        element: (
          <Suspense fallback={<FullPageLoader />}>
            <ContactoDetailPage />
          </Suspense>
        ),
      },
      {
        path: 'unidades/:propertyId/ocupantes',
        element: (
          <Suspense fallback={<FullPageLoader />}>
            <UnitOccupantsPage />
          </Suspense>
        ),
      },
      {
        path: 'properties',
        element: (
          <Suspense fallback={<FullPageLoader />}>
            <PropertiesListPage />
          </Suspense>
        ),
      },
      {
        path: 'properties/towers',
        element: (
          <Suspense fallback={<FullPageLoader />}>
            <TowersPage />
          </Suspense>
        ),
      },
      {
        path: 'properties/catalogs',
        element: (
          <Suspense fallback={<FullPageLoader />}>
            <CatalogsPage />
          </Suspense>
        ),
      },
      {
        path: 'settings/profile',
        element: (
          <Suspense fallback={<FullPageLoader />}>
            <ProfilePage />
          </Suspense>
        ),
      },
      {
        path: 'settings/security',
        element: (
          <Suspense fallback={<FullPageLoader />}>
            <SecurityPage />
          </Suspense>
        ),
      },
      {
        path: 'admin/roles',
        element: (
          <Suspense fallback={<FullPageLoader />}>
            <RolesPage />
          </Suspense>
        ),
      },
      {
        path: 'admin/roles/:id/permisos',
        element: (
          <Suspense fallback={<FullPageLoader />}>
            <PermissionMatrixPage />
          </Suspense>
        ),
      },
      {
        path: 'admin/usuarios',
        element: (
          <Suspense fallback={<FullPageLoader />}>
            <PanelUsersPage />
          </Suspense>
        ),
      },
      {
        path: 'admin/aprobaciones',
        element: (
          <Suspense fallback={<FullPageLoader />}>
            <ApprovalRulesPage />
          </Suspense>
        ),
      },
      {
        path: 'admin/auditoria',
        element: (
          <Suspense fallback={<FullPageLoader />}>
            <PermissionAuditPage />
          </Suspense>
        ),
      },
      {
        path: 'comunicaciones',
        element: (
          <Suspense fallback={<FullPageLoader />}>
            <AnnouncementsInboxPage />
          </Suspense>
        ),
      },
      {
        path: 'comunicaciones/nuevo',
        element: (
          <Suspense fallback={<FullPageLoader />}>
            <ComposeAnnouncementPage />
          </Suspense>
        ),
      },
      {
        path: 'comunicaciones/encuestas',
        element: (
          <Suspense fallback={<FullPageLoader />}>
            <SurveysPage />
          </Suspense>
        ),
      },
      {
        path: 'comunicaciones/canales',
        element: (
          <Suspense fallback={<FullPageLoader />}>
            <ChannelsPage />
          </Suspense>
        ),
      },
    ],
  },
])
