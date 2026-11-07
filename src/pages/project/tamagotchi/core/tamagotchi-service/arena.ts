import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../../../../utils/api-client'
import {
  IEquipmentItem,
  IPvpBattleResponse,
  IRaidBattleResponse,
  IDummyFightInput,
  IDummyFightResponse,
  IDummyPresets,
  IRaidData,
  IPvpHistoryEntry,
  IPvpLeaderboardEntry,
  IPvpOpponent,
  IPvpReplay,
  IPvpStatus,
  IWallet,
} from '../tamagotchi-interface'
import {
  IInventoryResponse,
  INVENTORY_KEY,
  EQUIPMENT_KEY,
  MY_MONSTER_KEY,
  WALLET_KEY,
  setSelectedMonster,
} from './shared'

const PVP_KEY = ['pvp']

export const useGetPvpStatus = () => {
  return useQuery({
    queryKey: PVP_KEY,
    queryFn: async () => {
      const { data } = await apiClient.get<IPvpStatus>(`/pvp`)
      return data
    },
  })
}

export const useSetPvpDefense = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (displayName?: string) => {
      const { data } = await apiClient.post<IPvpStatus>(`/pvp/defense`, { displayName })
      return data
    },
    onSuccess: (data) => {
      queryClient.setQueryData<IPvpStatus>(PVP_KEY, data)
      queryClient.invalidateQueries({ queryKey: ['pvp', 'opponents'] })
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: PVP_KEY })
    },
  })
}

export const useGetPvpOpponents = (enabled: boolean) => {
  return useQuery({
    queryKey: ['pvp', 'opponents'],
    enabled,
    queryFn: async () => {
      const { data } = await apiClient.get<{ opponents: IPvpOpponent[] }>(`/pvp/opponents`)
      return data
    },
  })
}

// Like the adventure battle: nothing is written to the cache until the replay has been watched
// (useApplyPvpResult), so the rating and coins don't spoil the ending.
export const usePvpBattle = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (opponentId: string) => {
      const { data } = await apiClient.post<IPvpBattleResponse>(`/pvp/battle`, { opponentId })
      return data
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: MY_MONSTER_KEY })
      queryClient.invalidateQueries({ queryKey: PVP_KEY })
    },
  })
}

export const useApplyPvpResult = () => {
  const queryClient = useQueryClient()
  return (data: IPvpBattleResponse) => {
    setSelectedMonster(queryClient, data.monster)
    queryClient.setQueryData<IWallet>(WALLET_KEY, data.wallet)
    queryClient.invalidateQueries({ queryKey: PVP_KEY })
    queryClient.invalidateQueries({ queryKey: ['pvp', 'history'] })
    queryClient.invalidateQueries({ queryKey: ['quests'] })
  }
}

export const useGetPvpHistory = () => {
  return useQuery({
    queryKey: ['pvp', 'history'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ battles: IPvpHistoryEntry[] }>(`/pvp/history`)
      return data
    },
  })
}

export const useGetPvpReplay = () => {
  return useMutation({
    mutationFn: async (battleId: string) => {
      const { data } = await apiClient.get<IPvpReplay>(`/pvp/history/${battleId}/replay`)
      return data
    },
  })
}

export const useGetPvpLeaderboard = (season?: string) => {
  return useQuery({
    queryKey: ['pvp', 'leaderboard', season ?? 'current'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ season: string; entries: IPvpLeaderboardEntry[] }>(
        `/pvp/leaderboard`,
        { params: season ? { season } : undefined }
      )
      return data
    },
  })
}

export const useClaimPvpSeason = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (season: string) => {
      const { data } = await apiClient.post<{ wallet: IWallet }>(`/pvp/season/claim`, { season })
      return data
    },
    onSuccess: (data) => {
      queryClient.setQueryData<IWallet>(WALLET_KEY, data.wallet)
      queryClient.invalidateQueries({ queryKey: PVP_KEY })
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: PVP_KEY })
    },
  })
}

export const useGetDummyPresets = () => {
  return useQuery({
    queryKey: ['dummy-presets'],
    queryFn: async () => {
      const { data } = await apiClient.get<IDummyPresets>(`/dummy/presets`)
      return data
    },
    staleTime: Infinity,
  })
}

// Free and saves nothing, so there is no cache to update afterwards.
export const useDummyFight = () => {
  return useMutation({
    mutationFn: async (input: IDummyFightInput) => {
      const { data } = await apiClient.post<IDummyFightResponse>(`/dummy/fight`, input)
      return data
    },
  })
}

export const useGetRaid = () => {
  return useQuery({
    queryKey: ['raid'],
    queryFn: async () => {
      const { data } = await apiClient.get<IRaidData>(`/raid`)
      return data
    },
  })
}

// Like the other fights, nothing is cached until the replay has been watched (useApplyRaidResult).
export const useRaidBattle = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { bossId: string; difficulty: string }) => {
      const { data } = await apiClient.post<IRaidBattleResponse>(`/raid/battle`, input)
      return data
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: MY_MONSTER_KEY })
      queryClient.invalidateQueries({ queryKey: ['raid'] })
    },
  })
}

export const useApplyRaidResult = () => {
  const queryClient = useQueryClient()
  return (data: IRaidBattleResponse) => {
    setSelectedMonster(queryClient, data.monster)
    queryClient.setQueryData<IWallet>(WALLET_KEY, data.wallet)
    queryClient.invalidateQueries({ queryKey: ['raid'] })
    queryClient.invalidateQueries({ queryKey: INVENTORY_KEY })
    queryClient.invalidateQueries({ queryKey: EQUIPMENT_KEY })
    queryClient.invalidateQueries({ queryKey: ['quests'] })
  }
}

export const useExchangeRaid = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { bossId: string; slot: string; grade: string }) => {
      const { data } = await apiClient.post<IInventoryResponse & { item: IEquipmentItem }>(
        `/raid/exchange`,
        input
      )
      return data
    },
    onSuccess: (data) => {
      queryClient.setQueryData<IInventoryResponse>(INVENTORY_KEY, { items: data.items })
      queryClient.invalidateQueries({ queryKey: ['raid'] })
      queryClient.invalidateQueries({ queryKey: EQUIPMENT_KEY })
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['raid'] })
    },
  })
}
