import { useEffect, useMemo, useState } from 'react'
import { Loader2, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type {
  Permission,
  PermissionAction,
  PermissionGroup,
} from '../types/roles.types'
import { useSetRolePermissions } from '../hooks/use-roles'

export interface PermissionMatrixProps {
  roleId: string
  /** Set actual de permisos efectivos del rol (claves "recurso.accion"). */
  currentPermissions: string[]
  /** Catálogo completo de permisos agrupados por recurso. */
  groups: PermissionGroup[]
  isLoading?: boolean
  /** Si true, oculta permisos con `is_system=true` (operador SaaS únicamente). */
  hideSystemPermissions?: boolean
}

/** Tipo unión de acciones que la matriz sabe representar. */
const VISIBLE_ACTIONS: PermissionAction[] = [
  'ver',
  'crear',
  'editar',
  'eliminar',
  'aprobar',
  'exportar',
  'configurar',
]

const ACTION_LABEL: Record<PermissionAction, string> = {
  ver: 'Ver',
  crear: 'Crear',
  editar: 'Editar',
  eliminar: 'Eliminar',
  aprobar: 'Aprobar',
  exportar: 'Exportar',
  configurar: 'Configurar',
}

/**
 * Matriz de permisos de un rol.
 * - Filas: recursos
 * - Columnas: acciones (ver, crear, editar, eliminar, aprobar, exportar, configurar)
 * - Atajos: "Todo" por fila (recurso) y "Todo" por columna (acción)
 * - Sin cambios = sin mutación. "Guardar matriz" envía PUT /authorization/roles/:id/permissions
 */
export function PermissionMatrix({
  roleId,
  currentPermissions,
  groups,
  isLoading = false,
  hideSystemPermissions = false,
}: PermissionMatrixProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set(currentPermissions))
  const [dirty, setDirty] = useState(false)
  const setPermissions = useSetRolePermissions(roleId)

  // Re-sincronizar cuando cambia el rol o el catálogo de permisos efectivos
  useEffect(() => {
    setSelected(new Set(currentPermissions))
    setDirty(false)
  }, [currentPermissions, roleId])

  /** Set de permisos filtrado (saca los is_system si aplica). */
  const visibleGroups = useMemo<PermissionGroup[]>(() => {
    if (!hideSystemPermissions) return groups
    return groups.map((g) => ({
      resource: g.resource,
      actions: g.actions.filter((a) => !a.is_system),
    }))
  }, [groups, hideSystemPermissions])

  /** Set de acciones efectivamente visibles (columnas). */
  const visibleActions = useMemo<PermissionAction[]>(() => {
    const all = new Set<PermissionAction>()
    for (const g of visibleGroups) {
      for (const a of g.actions) all.add(a.action)
    }
    return VISIBLE_ACTIONS.filter((a) => all.has(a))
  }, [visibleGroups])

  const keyFor = (resource: string, action: PermissionAction): string => `${resource}.${action}`

  const toggleCell = (resource: string, action: PermissionAction) => {
    const key = keyFor(resource, action)
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
    setDirty(true)
  }

  const toggleRow = (group: PermissionGroup) => {
    setSelected((prev) => {
      const next = new Set(prev)
      const allSelected = group.actions.every((a) => next.has(keyFor(group.resource, a.action)))
      if (allSelected) {
        for (const a of group.actions) next.delete(keyFor(group.resource, a.action))
      } else {
        for (const a of group.actions) next.add(keyFor(group.resource, a.action))
      }
      return next
    })
    setDirty(true)
  }

  const toggleColumn = (action: PermissionAction) => {
    setSelected((prev) => {
      const next = new Set(prev)
      const allSelected = visibleGroups.every((g) =>
        g.actions.some((a) => a.action === action && next.has(keyFor(g.resource, action))),
      )
      if (allSelected) {
        for (const g of visibleGroups) {
          if (g.actions.some((a) => a.action === action)) {
            next.delete(keyFor(g.resource, action))
          }
        }
      } else {
        for (const g of visibleGroups) {
          if (g.actions.some((a) => a.action === action)) {
            next.add(keyFor(g.resource, action))
          }
        }
      }
      return next
    })
    setDirty(true)
  }

  const isRowAllSelected = (group: PermissionGroup): boolean =>
    group.actions.length > 0 &&
    group.actions.every((a) => selected.has(keyFor(group.resource, a.action)))

  const isColAllSelected = (action: PermissionAction): boolean => {
    const groupsWithAction = visibleGroups.filter((g) =>
      g.actions.some((a) => a.action === action),
    )
    if (groupsWithAction.length === 0) return false
    return groupsWithAction.every((g) => selected.has(keyFor(g.resource, action)))
  }

  const handleSave = () => {
    setPermissions.mutate(
      { permissions: Array.from(selected) },
      {
        onSuccess: () => {
          setDirty(false)
        },
      },
    )
  }

  const handleReset = () => {
    setSelected(new Set(currentPermissions))
    setDirty(false)
  }

  if (isLoading) {
    return <MatrixSkeleton />
  }

  if (visibleGroups.length === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-muted/30 p-12 text-center text-sm text-muted-foreground">
        <ShieldCheck className="mx-auto mb-2 size-8 text-muted-foreground" aria-hidden="true" />
        No hay permisos disponibles para asignar.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Recurso
              </th>
              {visibleActions.map((action) => (
                <th
                  key={action}
                  className="px-3 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground"
                >
                  <div className="flex flex-col items-center gap-1">
                    <span>{ACTION_LABEL[action]}</span>
                    <label className="flex cursor-pointer items-center gap-1 text-[10px] normal-case text-muted-foreground hover:text-foreground">
                      <input
                        type="checkbox"
                        checked={isColAllSelected(action)}
                        onChange={() => toggleColumn(action)}
                        className="size-3 rounded border-border"
                        aria-label={`Seleccionar todos los permisos de ${ACTION_LABEL[action]}`}
                      />
                      <span>Todo</span>
                    </label>
                  </div>
                </th>
              ))}
              <th className="px-3 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Todo
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {visibleGroups.map((group) => {
              const rowAllSelected = isRowAllSelected(group)
              return (
                <tr key={group.resource} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">
                    <div className="capitalize">{group.resource.replace(/_/g, ' ')}</div>
                    <div className="text-xs font-normal text-muted-foreground">
                      {group.actions.length} acción{group.actions.length !== 1 ? 'es' : ''}
                    </div>
                  </td>
                  {visibleActions.map((action) => {
                    const perm: Permission | undefined = group.actions.find(
                      (a) => a.action === action,
                    )
                    const key = keyFor(group.resource, action)
                    const checked = perm ? selected.has(key) : false
                    return (
                      <td key={action} className="px-3 py-3 text-center">
                        {perm ? (
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleCell(group.resource, action)}
                            className="size-4 cursor-pointer rounded border-border"
                            aria-label={`${group.resource}.${action}`}
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground/40">—</span>
                        )}
                      </td>
                    )
                  })}
                  <td className="px-3 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={rowAllSelected}
                      onChange={() => toggleRow(group)}
                      className="size-4 cursor-pointer rounded border-border"
                      aria-label={`Seleccionar todos los permisos de ${group.resource}`}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-4">
        <p className="text-xs text-muted-foreground">
          {selected.size} permiso{selected.size !== 1 ? 's' : ''} seleccionado
          {selected.size !== 1 ? 's' : ''}
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={!dirty || setPermissions.isPending}
          >
            Descartar cambios
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!dirty || setPermissions.isPending}
          >
            {setPermissions.isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar matriz'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

function MatrixSkeleton() {
  return (
    <div className="space-y-2" aria-label="Cargando matriz de permisos">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  )
}
