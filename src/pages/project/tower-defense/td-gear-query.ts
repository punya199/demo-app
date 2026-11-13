import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../../utils/api-client'
import { ITdGearUpgradeResult } from './td-gacha'
import { TD_GACHA_KEY } from './td-gacha-query'
import { TD_PROFILE_KEY } from './td-profile-query'

export const useUpgradeTdGear = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (heroId: string) =>
      (await apiClient.post<ITdGearUpgradeResult>(`/td/gear/${heroId}/upgrade`)).data,
    // Coins and the hero's mod level both changed, whether or not the call succeeded.
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: TD_GACHA_KEY }),
        queryClient.invalidateQueries({ queryKey: TD_PROFILE_KEY }),
      ]),
  })
}
