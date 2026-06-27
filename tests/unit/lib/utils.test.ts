import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn', () => {
  it('combina clases condicionales y elimina duplicados', () => {
    const isActive = true
    const isIgnored = false
    expect(cn('base', isActive && 'active', isIgnored && 'ignored')).toBe('base active')
  })

  it('resuelve conflictos de utilidades de Tailwind', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
  })
})
