import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../../utils/api-client'
import { TD_PROFILE_KEY } from './td-profile-query'

export interface ITdSweepResult {
  stageId: number
  energy: number
  coins: number
  shards: number
}

// Cost and reward are decided by the server; balances and energy are refetched either way.
export const useSweepTdStage = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (stageId: number) =>
      (await apiClient.post<ITdSweepResult>(`/td/stages/${stageId}/sweep`)).data,
    onSettled: () => queryClient.invalidateQueries({ queryKey: TD_PROFILE_KEY }),
  })
}
