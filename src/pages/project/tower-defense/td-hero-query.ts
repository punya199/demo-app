import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../../utils/api-client'
import { ITdStarUpResult } from './td-gacha'
import { TD_GACHA_KEY } from './td-gacha-query'
import { TD_PROFILE_KEY } from './td-profile-query'

export const useStarUpTdHero = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (heroId: string) =>
      (await apiClient.post<ITdStarUpResult>(`/td/heroes/${heroId}/star-up`)).data,
    // Shards and the hero's star both changed, whether or not the call succeeded.
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: TD_GACHA_KEY }),
        queryClient.invalidateQueries({ queryKey: TD_PROFILE_KEY }),
      ]),
  })
}
