import { useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router'
import {
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  Building2,
  Users,
  Shield,
  Activity,
  ClipboardCheck,
  UserCog,
  Megaphone,
  Mail,
  BarChart3,
  Radio,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { UserMenu } from '@/components/layout/UserMenu'

/**
 * Shell de dashboard. Sidebar fijo de 240px (md) + área principal.
 *
 * Items de navegación:
 *   - Dashboard              → /dashboard
 *   - Directorio             → /directorio
 *   - Propiedades            → /properties (submenu: Unidades, Torres, Catálogos)
 *   - Roles y Permisos       → /admin/* (submenu: Roles, Usuarios, Aprobaciones, Auditoría)
 */
export function DashboardShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 border-r bg-card md:block">
        <div className="flex h-16 items-center border-b px-6">
          <Link to="/dashboard" className="text-lg font-semibold">
            Urbania
          </Link>
        </div>
        <nav className="space-y-1 p-4">
          <NavItem
            to="/dashboard"
            label="Dashboard"
            icon={<LayoutDashboard className="size-4" aria-hidden="true" />}
            active={pathname.startsWith('/dashboard')}
          />

          <NavItem
            to="/directorio"
            label="Directorio"
            icon={<Users className="size-4" aria-hidden="true" />}
            active={pathname.startsWith('/directorio')}
          />

          <NavGroup
            label="Propiedades"
            icon={<Building2 className="size-4" aria-hidden="true" />}
            active={pathname.startsWith('/properties')}
            items={[
              { to: '/properties', label: 'Unidades' },
              { to: '/properties/towers', label: 'Torres' },
              { to: '/properties/catalogs', label: 'Catálogos' },
            ]}
          />

          <NavGroup
            label="Roles y Permisos"
            icon={<Shield className="size-4" aria-hidden="true" />}
            active={pathname.startsWith('/admin')}
            items={[
              { to: '/admin/roles', label: 'Roles', icon: <UserCog className="size-3.5" /> },
              { to: '/admin/usuarios', label: 'Usuarios', icon: <Users className="size-3.5" /> },
              {
                to: '/admin/aprobaciones',
                label: 'Aprobaciones',
                icon: <ClipboardCheck className="size-3.5" />,
              },
              { to: '/admin/auditoria', label: 'Auditoría', icon: <Activity className="size-3.5" /> },
            ]}
          />

          <NavGroup
            label="Comunicaciones"
            icon={<Megaphone className="size-4" aria-hidden="true" />}
            active={pathname.startsWith('/comunicaciones')}
            items={[
              { to: '/comunicaciones', label: 'Bandeja', icon: <Mail className="size-3.5" /> },
              {
                to: '/comunicaciones/encuestas',
                label: 'Encuestas',
                icon: <BarChart3 className="size-3.5" />,
              },
              {
                to: '/comunicaciones/canales',
                label: 'Canales',
                icon: <Radio className="size-3.5" />,
              },
            ]}
          />
        </nav>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-end border-b px-6">
          <UserMenu />
        </header>
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-7xl px-6 py-8">{children}</div>
        </main>
      </div>
    </div>
  )
}

// ─── Subcomponentes ───────────────────────────────────────────────────────

function NavItem({
  to,
  label,
  icon,
  active,
}: {
  to: string
  label: string
  icon: ReactNode
  active: boolean
}) {
  return (
    <Link
      to={to}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  )
}

function NavGroup({
  label,
  icon,
  active,
  items,
}: {
  label: string
  icon: ReactNode
  active: boolean
  items: Array<{ to: string; label: string; icon?: ReactNode }>
}) {
  const { pathname } = useLocation()
  // Inicia expandido si la ruta actual cae dentro del grupo
  const [open, setOpen] = useState(active)

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
          active
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        )}
        aria-expanded={open}
      >
        {icon}
        <span className="flex-1 text-left">{label}</span>
        {open ? (
          <ChevronDown className="size-4" aria-hidden="true" />
        ) : (
          <ChevronRight className="size-4" aria-hidden="true" />
        )}
      </button>
      {open && (
        <div className="mt-1 ml-3 space-y-1 border-l pl-3">
          {items.map((item) => {
            const itemActive = pathname === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors',
                  itemActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
