import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../../../utils/api-client'
import { ITdProfile } from './td-energy'

export const TD_PROFILE_KEY = ['td', 'profile']

// The server settles energy on every read, so a slow poll is enough; the countdown in between is
// drawn locally (see liveEnergy). Query keys under ['td', ...] are shared with the game page.
export const useGetTdProfile = () =>
  useQuery({
    queryKey: TD_PROFILE_KEY,
    queryFn: async () => {
      const { data } = await apiClient.get<ITdProfile>('/td/profile')
      return data
    },
    refetchInterval: 60_000,
  })
