import { useQuery } from '@tanstack/react-query'
import { contactsService } from '../api/contacts.service'
import type { OccupantType } from '../types/directorio.types'

export function useOccupantTypes() {
  return useQuery<OccupantType[]>({
    queryKey: ['occupant-types'],
    queryFn: () => contactsService.getOccupantTypes(),
    staleTime: 5 * 60 * 1000,
  })
}
