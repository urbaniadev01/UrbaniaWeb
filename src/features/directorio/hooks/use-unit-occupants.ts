import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { contactsService } from '../api/contacts.service'
import type { PropertyOccupant } from '../types/directorio.types'

export function useUnitOccupants(propertyId: string) {
  return useQuery<PropertyOccupant[]>({
    queryKey: ['unit-occupants', propertyId],
    queryFn: () => contactsService.listByUnit(propertyId),
    staleTime: 30 * 1000,
    enabled: !!propertyId,
  })
}

export function useLinkContactToUnit(propertyId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Parameters<typeof contactsService.linkToUnit>[1]) =>
      contactsService.linkToUnit(propertyId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unit-occupants', propertyId] })
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    },
  })
}

export function useUpdateOccupant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: Parameters<typeof contactsService.updateOccupant>[1]
    }) => contactsService.updateOccupant(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unit-occupants'] })
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    },
  })
}

export function useUnlinkOccupant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => contactsService.unlinkOccupant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unit-occupants'] })
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    },
  })
}
