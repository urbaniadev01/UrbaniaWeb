// =====================================================================
// Helpers de formato y presentación para el feature Propiedades
// =====================================================================

/** Piso 0 → "Sótano"; cualquier otro → string del número */
export function formatFloor(floor: number): string {
  return floor === 0 ? 'Sótano' : String(floor)
}

/** Etiqueta legible de un piso para usar en selectores (rango [0, max]) */
export function floorOptions(maxFloor: number): Array<{ value: number; label: string }> {
  const out: Array<{ value: number; label: string }> = []
  for (let i = 0; i <= maxFloor; i++) {
    out.push({ value: i, label: formatFloor(i) })
  }
  return out
}

/** Formatea un área en m² con 2 decimales y sufijo */
export function formatArea(areaM2: string | number): string {
  const n = typeof areaM2 === 'string' ? Number(areaM2) : areaM2
  if (Number.isNaN(n)) return `${areaM2} m²`
  return `${n.toFixed(2)} m²`
}

/**
 * Formatea un coeficiente con hasta 6 decimales.
 * NUMERIC(7,6) → 6 decimales significativos, hasta 0.999999.
 * Si llega como string (recomendado desde la API) se preserva la precisión.
 */
export function formatCoefficient(coefficient: string | number): string {
  if (typeof coefficient === 'string') return coefficient
  if (Number.isNaN(coefficient)) return String(coefficient)
  return coefficient.toFixed(6).replace(/0+$/, '').replace(/\.$/, '')
}

/** Convierte el coeficiente a porcentaje con 2 decimales para tooltips/ejemplos */
export function coefficientToPercent(coefficient: string | number): string {
  const n = typeof coefficient === 'string' ? Number(coefficient) : coefficient
  if (Number.isNaN(n)) return '0%'
  return `${(n * 100).toFixed(4)}%`
}

/** Formatea bytes a KB/MB legible */
export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes && bytes !== 0) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

/** Tiempo relativo simple (es-CO): "hace 2h", "ayer", "hace 3d" */
export function formatRelativeTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'

  const now = Date.now()
  const diffMs = now - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 30) return 'justo ahora'
  if (diffSec < 60) return `hace ${diffSec}s`
  if (diffMin < 60) return `hace ${diffMin} min`
  if (diffHour < 24) return `hace ${diffHour}h`
  if (diffDay === 1) return 'ayer'
  if (diffDay < 7) return `hace ${diffDay} d`
  if (diffDay < 30) return `hace ${Math.floor(diffDay / 7)} sem`
  if (diffDay < 365) return `hace ${Math.floor(diffDay / 30)} m`
  return `hace ${Math.floor(diffDay / 365)} a`
}

/** Fecha absoluta corta: 27/06/2026 */
export function formatShortDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/** Mapea un status code de unidad a variante del StatusBadge */
export function statusCodeToVariant(
  code: string | null | undefined,
):
  | 'default'
  | 'success'
  | 'warning'
  | 'info'
  | 'destructive'
  | 'secondary'
  | 'muted' {
  if (!code) return 'muted'
  const c = code.toLowerCase()
  if (c === 'occupied' || c === 'occupied_owner' || c === 'occupied_tenant' || c === 'activa')
    return 'success'
  if (c === 'vacant' || c === 'available' || c === 'disponible' || c === 'libre')
    return 'info'
  if (c === 'maintenance' || c === 'mantenimiento' || c === 'reserved' || c === 'reservada')
    return 'warning'
  if (c === 'inactive' || c === 'inactiva' || c === 'archived' || c === 'archivada')
    return 'muted'
  if (c === 'sold' || c === 'vendida' || c === 'blocked' || c === 'bloqueada')
    return 'destructive'
  return 'default'
}

/** Devuelve el ícono Lucide adecuado para un mime type de documento */
export function documentIcon(mime: string | null | undefined): 'file-text' | 'image' | 'file' {
  if (!mime) return 'file'
  if (mime.startsWith('image/')) return 'image'
  if (mime === 'application/pdf' || mime.startsWith('text/')) return 'file-text'
  return 'file'
}

/**
 * Calcula `full_designation` en cliente (para preview en formularios).
 * El server es la fuente de verdad, pero este helper evita un round-trip.
 */
export function computeFullDesignation(
  tower: { code?: string | null; name: string } | null | undefined,
  unitNumber: string,
): string {
  if (!tower) return unitNumber
  const codeOrName = tower.code?.trim() || tower.name
  return `${codeOrName} - ${unitNumber}`
}
