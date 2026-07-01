import { useEffect, useState } from 'react'

/**
 * Hook utilitario: retorna el valor con un debounce de `delay` ms.
 * Actualiza el valor retornado solo después de que el input deja de cambiar
 * durante el período de delay.
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])

  return debounced
}
