import { type ReactNode } from 'react'

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 border-r bg-card md:block">
        <div className="flex h-16 items-center border-b px-6">
          <span className="text-lg font-semibold">Urbania</span>
        </div>
        <nav className="p-4">
          <p className="text-sm text-muted-foreground">Menú — Sesión 2</p>
        </nav>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-end border-b px-6">
          <p className="text-sm text-muted-foreground">Header — Sesión 2</p>
        </header>
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-7xl px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
