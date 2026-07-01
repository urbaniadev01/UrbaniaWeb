import { useMemo } from 'react'
import { Label } from '@/components/ui/label'
import { useCurrentCondominiumId } from '@/features/propiedades/hooks/use-current-condominium'
import type { ScopeLevel } from '../types/roles.types'

export interface ScopeOption {
  id: string
  name: string
  type: ScopeLevel
}

export interface ScopePickerProps {
  value: string
  onChange: (id: string) => void
  scopeType: ScopeLevel
  /** Lista opcional de opciones. Si no se pasa, se usa el condominio actual. */
  options?: ScopeOption[]
  disabled?: boolean
  id?: string
}

/**
 * Selector de alcance (scope) para asignaciones de rol.
 * Para el MVP se ofrece:
 *   - organization → la organización del admin (placeholder)
 *   - condominium → el condominio actual resuelto del store
 *   - tower / unit → inputs deshabilitados (resolver con selector específico post-MVP)
 */
export function ScopePicker({
  value,
  onChange,
  scopeType,
  options,
  disabled = false,
  id = 'scope_id',
}: ScopePickerProps) {
  const condominiumId = useCurrentCondominiumId()

  const resolvedOptions = useMemo<ScopeOption[]>(() => {
    if (options && options.length > 0) return options
    if (scopeType === 'condominium' && condominiumId) {
      return [{ id: condominiumId, name: 'Condominio actual', type: 'condominium' }]
    }
    if (scopeType === 'organization') {
      return [{ id: 'org-default', name: 'Toda la organización', type: 'organization' }]
    }
    return []
  }, [options, scopeType, condominiumId])

  const placeholder = useMemo(() => {
    switch (scopeType) {
      case 'organization':
        return 'Toda la organización'
      case 'condominium':
        return 'Conjunto actual'
      case 'tower':
        return 'Torre (no disponible en MVP)'
      case 'unit':
        return 'Unidad (no disponible en MVP)'
    }
  }, [scopeType])

  const isEffectivelyDisabled =
    disabled || (scopeType === 'tower' || scopeType === 'unit')

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>Alcance</Label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={isEffectivelyDisabled}
        className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="">{placeholder}</option>
        {resolvedOptions.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.name}
          </option>
        ))}
      </select>
      {isEffectivelyDisabled && (
        <p className="text-xs text-muted-foreground">
          Selector específico de torre/unidad disponible en próxima iteración.
        </p>
      )}
    </div>
  )
}
