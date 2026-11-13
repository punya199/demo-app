import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../../utils/api-client'
import { buildFinishBody, buildStartBody, ITdBattleResult, ITdBattleStart } from './td-battle'
import { TD_PROFILE_KEY } from './td-profile-query'
import { TD_STAGES_KEY } from './td-stage-query'
import type { SimInput } from '../../../../td-sim/src'

// Energy and coins change on both calls, so the profile is refetched after each.
const useRefreshProfile = () => {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: TD_PROFILE_KEY }),
      queryClient.invalidateQueries({ queryKey: TD_STAGES_KEY }),
    ])
}

export const useStartTdBattle = () => {
  const refresh = useRefreshProfile()
  return useMutation({
    mutationFn: async (stageId: number) =>
      (await apiClient.post<ITdBattleStart>('/td/battles', buildStartBody(stageId))).data,
    onSettled: refresh,
  })
}

export const useFinishTdBattle = () => {
  const refresh = useRefreshProfile()
  return useMutation({
    mutationFn: async (v: {
      battleId: string
      seed: number
      ticks: number
      inputs: readonly SimInput[]
    }) =>
      (
        await apiClient.post<ITdBattleResult>(
          `/td/battles/${v.battleId}/finish`,
          buildFinishBody(v.seed, v.ticks, v.inputs)
        )
      ).data,
    onSettled: refresh,
  })
}
