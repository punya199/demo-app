import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../../utils/api-client'
import { EnumMonsterAction, EnumMonsterLine, IMonsterData } from './tamagotchi-interface'

interface IGetMyMonsterResponse {
  monster: IMonsterData | null
}

interface IGetMonsterHistoryResponse {
  monsters: IMonsterData[]
}

const MY_MONSTER_KEY = ['monster', 'me']

// The server advances the monster's clock on every read, so polling keeps hearts and poops fresh.
const REFETCH_INTERVAL_MS = 60 * 1000

export const useGetMyMonster = () => {
  return useQuery({
    queryKey: MY_MONSTER_KEY,
    queryFn: async () => {
      const { data } = await apiClient.get<IGetMyMonsterResponse>(`/monster/me`)
      return data
    },
    refetchInterval: REFETCH_INTERVAL_MS,
  })
}

export const useGetMonsterHistory = () => {
  return useQuery({
    queryKey: ['monster', 'history'],
    queryFn: async () => {
      const { data } = await apiClient.get<IGetMonsterHistoryResponse>(`/monster/history`)
      return data
    },
  })
}

export const useHatchMonster = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (line: EnumMonsterLine) => {
      const { data } = await apiClient.post<IGetMyMonsterResponse>(`/monster/hatch`, { line })
      return data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(MY_MONSTER_KEY, data)
      queryClient.invalidateQueries({ queryKey: ['monster', 'history'] })
    },
  })
}

export const useMonsterAction = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (type: EnumMonsterAction) => {
      const { data } = await apiClient.post<IGetMyMonsterResponse>(`/monster/action`, { type })
      return data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(MY_MONSTER_KEY, data)
    },
    onError: () => {
      // The monster may have changed (fallen asleep, died) since the last poll.
      queryClient.invalidateQueries({ queryKey: MY_MONSTER_KEY })
    },
  })
}
