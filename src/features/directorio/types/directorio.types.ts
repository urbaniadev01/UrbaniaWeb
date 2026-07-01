export interface Contact {
  id: string
  full_name: string
  document_type: string
  document_number: string
  email?: string | null
  phone?: string | null
  emergency_contact_name?: string | null
  emergency_contact_phone?: string | null
  notes?: string | null
  user_id?: string | null
  properties?: PropertyOccupant[]
  created_at: string
  updated_at: string
}

export interface OccupantType {
  id: string
  code: string
  name: string
  sort_order: number
}

export interface PropertyOccupant {
  id: string
  property_id: string
  contact_id: string
  occupant_type_id: string
  occupant_type?: OccupantType
  contact?: Contact
  is_primary: boolean
  is_active: boolean
  move_in_date?: string | null
  move_out_date?: string | null
  created_at: string
}

export interface ContactWithOccupants extends Contact {
  properties: PropertyOccupant[]
}

export interface CreateContactPayload {
  full_name: string
  document_type: string
  document_number: string
  email?: string | null
  phone?: string | null
  emergency_contact_name?: string | null
  emergency_contact_phone?: string | null
  notes?: string | null
}

export interface UpdateContactPayload {
  full_name?: string
  email?: string | null
  phone?: string | null
  emergency_contact_name?: string | null
  emergency_contact_phone?: string | null
  notes?: string | null
}

export interface LinkOccupantPayload {
  contact_id: string
  occupant_type_id: string
  is_primary?: boolean
  move_in_date?: string | null
  move_out_date?: string | null
}

export interface UpdateOccupantPayload {
  occupant_type_id?: string
  is_primary?: boolean
  move_in_date?: string | null
  move_out_date?: string | null
  is_active?: boolean
}
