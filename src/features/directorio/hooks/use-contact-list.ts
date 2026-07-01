import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { contactsService } from '../api/contacts.service'
import type { Contact } from '../types/directorio.types'

const QUERY_KEY = ['contacts']

export function useContactList(filters?: Record<string, string>) {
  return useQuery<Contact[]>({
    queryKey: [...QUERY_KEY, filters],
    queryFn: () => contactsService.list(filters),
    staleTime: 30 * 1000,
  })
}

export function useContact(id: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => contactsService.getById(id),
    staleTime: 60 * 1000,
    enabled: !!id,
  })
}

export function useCreateContact() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: contactsService.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}

export function useUpdateContact(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Parameters<typeof contactsService.update>[1]) =>
      contactsService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, id] })
    },
  })
}

export function useDeleteContact() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => contactsService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}
