// =====================================================================
// Tipos del feature: Propiedades y Unidades
// =====================================================================
// Source of truth: PROPIEDADES_SPEC.md §"Tipos TypeScript"
// Endpoints:    /api/v1/properties, /towers, /property-types, etc.
// =====================================================================

// ---------- Entidades principales ----------

export interface Condominium {
  id: string
  name: string
  address?: string
  city?: string
  department?: string
  country: string
  nit?: string
  phone?: string
  email?: string
  legal_representative?: string
  /** NUMERIC(7,6) — se serializa como string para evitar pérdida de precisión */
  total_coefficient: string
  logo_url?: string
  is_active: boolean
  stats?: CondominiumStats
  created_at: string
  updated_at: string
}

export interface CondominiumStats {
  total_towers: number
  total_units: number
  occupied_units: number
  vacant_units: number
  occupied_percentage?: number
}

export interface Tower {
  id: string
  condominium_id: string
  condominium_name?: string
  name: string
  code?: string | null
  floor_count: number
  has_elevator: boolean
  description?: string | null
  sort_order: number
  stats?: TowerStats
  created_at: string
  updated_at: string
}

export interface TowerStats {
  total_units: number
  occupied_units: number
  vacant_units: number
  occupied_percentage?: number
}

export interface PropertyType {
  id: string
  code: string
  name: string
  description?: string | null
  sort_order: number
  is_active: boolean
  properties_count?: number
}

export interface PropertyStatus {
  id: string
  code: string
  name: string
  description?: string | null
  allows_residents: boolean
  is_active: boolean
  sort_order: number
  properties_count?: number
}

export interface PropertyDocumentType {
  id: string
  code: string
  name: string
  description?: string | null
  sort_order: number
  is_active: boolean
  documents_count?: number
}

export interface PropertyTowerRef {
  id: string
  name: string
  code?: string | null
}

export interface PropertyTypeRef {
  id: string
  code: string
  name: string
}

export interface PropertyStatusRef {
  id: string
  code: string
  name: string
}

export interface Property {
  id: string
  condominium_id: string
  condominium_name?: string
  tower: PropertyTowerRef
  type: PropertyTypeRef
  status: PropertyStatusRef
  floor: number
  unit_number: string
  /** "T1 - 302" — calculado server-side como "{code|name} - {unit_number}" */
  full_designation: string
  /** NUMERIC(10,2) → string */
  area_m2: string
  /** NUMERIC(7,6) → string */
  coefficient: string
  bedrooms?: number | null
  bathrooms?: number | null
  has_parking: boolean
  parking_lot?: string | null
  notes?: string | null
  /** post-MVP: requiere feature #4 Directorio de Residentes */
  residents_count: number
  documents_count?: number
  status_history?: StatusLogEntry[]
  created_at: string
  updated_at: string
}

export interface StatusLogEntry {
  id: string
  from_status?: { id: string; code: string; name: string } | null
  to_status: { id: string; code: string; name: string }
  changed_by: { id: string; name: string }
  reason: string
  created_at: string
}

export interface PropertyDocument {
  id: string
  document_type: { id: string; code: string; name: string }
  name: string
  file_url: string
  file_size_bytes?: number | null
  mime_type?: string | null
  notes?: string | null
  uploaded_by: { id: string; name: string }
  created_at: string
}

// ---------- Payloads ----------

export interface CreatePropertyPayload {
  condominium_id: string
  tower_id: string
  property_type_id: string
  property_status_id?: string
  floor: number
  unit_number: string
  area_m2: number
  coefficient: number
  bedrooms?: number
  bathrooms?: number
  has_parking?: boolean
  parking_lot?: string
  notes?: string
}

export interface UpdatePropertyPayload {
  property_type_id?: string
  tower_id?: string
  floor?: number
  unit_number?: string
  area_m2?: number
  coefficient?: number
  bedrooms?: number
  bathrooms?: number
  has_parking?: boolean
  parking_lot?: string
  notes?: string
}

export interface ChangeStatusPayload {
  property_status_id: string
  reason: string
}

export interface CreateTowerPayload {
  condominium_id: string
  name: string
  code?: string
  floor_count: number
  has_elevator?: boolean
  description?: string
  sort_order?: number
}

export interface UpdateTowerPayload {
  name?: string
  code?: string | null
  floor_count?: number
  has_elevator?: boolean
  description?: string | null
  sort_order?: number
}

export interface CreatePropertyTypePayload {
  code: string
  name: string
  description?: string
  sort_order?: number
}

export interface UpdatePropertyTypePayload {
  name?: string
  description?: string | null
  sort_order?: number
  is_active?: boolean
}

export interface CreatePropertyStatusPayload {
  code: string
  name: string
  description?: string
  sort_order?: number
  allows_residents?: boolean
}

export interface UpdatePropertyStatusPayload {
  name?: string
  description?: string | null
  sort_order?: number
  allows_residents?: boolean
  is_active?: boolean
}

export interface CreatePropertyDocumentTypePayload {
  code: string
  name: string
  description?: string
  sort_order?: number
}

export interface UpdatePropertyDocumentTypePayload {
  name?: string
  description?: string | null
  sort_order?: number
  is_active?: boolean
}

// ---------- Responses ----------

export interface CoefficientValidation {
  condominium_id: string
  condominium_name: string
  total_coefficient_expected: string
  total_coefficient_sum: string
  difference: string
  is_balanced: boolean
  total_units: number
  units_with_coefficient_zero: number
  warnings: Array<{ type: string; message: string }>
  checked_at: string
}

// ---------- Filtros de lista ----------

/**
 * Query params aceptados por GET /properties según el contrato de la API.
 * Todos los campos son opcionales; las claves vacías se omiten al construir la URL.
 */
export interface PropertyFilters {
  page?: number
  per_page?: number
  search?: string
  tower_id?: string
  property_type_id?: string
  property_status_id?: string
  condominium_id?: string
  floor?: number
  /** Filtrar por torre con código (T1, T2, etc.) */
  tower_code?: string
  sort_by?: 'unit_number' | 'floor' | 'created_at' | 'area_m2'
  sort_dir?: 'asc' | 'desc'
}

export interface TowerFilters {
  page?: number
  per_page?: number
  search?: string
  is_active?: boolean
}

export interface CatalogFilters {
  page?: number
  per_page?: number
  search?: string
  is_active?: boolean
}
