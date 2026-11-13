import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../../utils/api-client'
import type { ITdGoalClaim, ITdGoals } from './td-goals'
import { TD_PROFILE_KEY } from './td-profile-query'

export const TD_GOALS_KEY = ['td', 'goals']

export const useGetTdGoals = () =>
  useQuery({
    queryKey: TD_GOALS_KEY,
    queryFn: async () => (await apiClient.get<ITdGoals>('/td/goals')).data,
  })

// `path` is relative to /td/goals, e.g. `daily/win_battle/claim`. Gems and goal state both change
// whether or not the call succeeded (a second tab may have claimed first).
export const useClaimTdGoal = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (path: string) =>
      (await apiClient.post<ITdGoalClaim>(`/td/goals/${path}`)).data,
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: TD_GOALS_KEY }),
        queryClient.invalidateQueries({ queryKey: TD_PROFILE_KEY }),
      ]),
  })
}
