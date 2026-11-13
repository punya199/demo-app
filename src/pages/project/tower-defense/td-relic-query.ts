import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../../utils/api-client'
import type { ITdRelics } from './td-relic'
import { TD_PROFILE_KEY } from './td-profile-query'

export const TD_RELICS_KEY = ['td', 'relics']

export const useGetTdRelics = () =>
  useQuery({
    queryKey: TD_RELICS_KEY,
    queryFn: async () => (await apiClient.get<ITdRelics>('/td/relics')).data,
  })

// Eligibility and price are decided by the server; the lists are refetched whether or not the call succeeded.
export const useUnlockTdRelic = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => (await apiClient.post(`/td/relics/${id}/unlock`)).data,
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: TD_RELICS_KEY }),
        queryClient.invalidateQueries({ queryKey: TD_PROFILE_KEY }),
      ]),
  })
}
