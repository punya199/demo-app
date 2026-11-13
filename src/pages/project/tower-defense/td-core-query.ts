import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../../utils/api-client'
import type { ITdCores } from './td-core'
import { TD_PROFILE_KEY } from './td-profile-query'

export const TD_CORES_KEY = ['td', 'cores']

export const useGetTdCores = () =>
  useQuery({
    queryKey: TD_CORES_KEY,
    queryFn: async () => (await apiClient.get<ITdCores>('/td/cores')).data,
  })

// Slot and rarity are decided by the server; the lists are refetched whether or not a call succeeded.
const useRefresh = () => {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: TD_CORES_KEY }),
      queryClient.invalidateQueries({ queryKey: TD_PROFILE_KEY }),
    ])
}

export const useEquipTdCore = () =>
  useMutation({
    mutationFn: async (v: { id: string; slot: number }) =>
      (await apiClient.post<ITdCores>(`/td/cores/${v.id}/equip`, { slot: v.slot })).data,
    onSettled: useRefresh(),
  })

export const usePromoteTdCore = () =>
  useMutation({
    mutationFn: async (id: string) => (await apiClient.post(`/td/cores/${id}/promote`)).data,
    onSettled: useRefresh(),
  })
