import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../../utils/api-client'
import { ITdGacha, ITdPullResult, TdGachaMode } from './td-gacha'
import { TD_PROFILE_KEY } from './td-profile-query'

export const TD_GACHA_KEY = ['td', 'gacha']

export const useGetTdGacha = () =>
  useQuery({
    queryKey: TD_GACHA_KEY,
    queryFn: async () => (await apiClient.get<ITdGacha>('/td/gacha')).data,
  })

export const usePullTdGacha = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (mode: TdGachaMode) =>
      (await apiClient.post<ITdPullResult>('/td/gacha/pull', { mode })).data,
    // Balances, pity and owned heroes all change after a pull, whether or not it succeeded.
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: TD_GACHA_KEY }),
        queryClient.invalidateQueries({ queryKey: TD_PROFILE_KEY }),
      ]),
  })
}
