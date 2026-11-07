import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../../../../utils/api-client'
import {
  EnumMonsterAction,
  EnumMonsterLine,
  IAdventureArea,
  IEquipmentItem,
  IGetMyMonsterResponse,
  IMonsterData,
  IWallet,
  IReturnHomeResult,
} from '../tamagotchi-interface'
import {
  IAdventureBattleResponse,
  IGetMonsterHistoryResponse,
  EQUIPMENT_KEY,
  MY_MONSTER_KEY,
  WALLET_KEY,
  setSelectedMonster,
  REFETCH_INTERVAL_MS,
} from './shared'

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
      const { data } = await apiClient.post<{ monster: IMonsterData }>(`/monster/hatch`, { line })
      return data
    },
    onSuccess: (data) => {
      // The reply is only the new egg: fold it into the cached list so the other pets stay.
      setSelectedMonster(queryClient, data.monster)
      queryClient.invalidateQueries({ queryKey: MY_MONSTER_KEY })
      queryClient.invalidateQueries({ queryKey: ['monster', 'history'] })
      // A rare egg is paid for in Raid Tokens.
      queryClient.invalidateQueries({ queryKey: WALLET_KEY })
    },
  })
}

export const useMonsterAction = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { type: EnumMonsterAction; monsterId?: string }) => {
      const { data } = await apiClient.post<{ monster: IMonsterData }>(`/monster/action`, input)
      return data
    },
    onSuccess: (data) => {
      setSelectedMonster(queryClient, data.monster)
    },
    onError: () => {
      // The monster may have changed (fallen asleep, died) since the last poll.
      queryClient.invalidateQueries({ queryKey: MY_MONSTER_KEY })
    },
  })
}

export const useMergeMonsters = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { firstId: string; secondId: string; baseId: string }) => {
      const { data } = await apiClient.post<{ monster: IMonsterData; wallet: IWallet }>(
        `/monster/merge`,
        input
      )
      return data
    },
    // The parents are gone and the new monster is selected, so every tab's data may have changed.
    onSettled: () => {
      queryClient.invalidateQueries()
    },
  })
}

export const useReturnHome = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (monsterId: string) => {
      const { data } = await apiClient.post<IReturnHomeResult>(`/monster/return-home`, {
        monsterId,
      })
      return data
    },
    // The pet is gone, its slot is free, its gear is back in the bag and a core was added.
    onSettled: () => {
      queryClient.invalidateQueries()
    },
  })
}

export const useRenameMonster = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { monsterId: string; name: string }) => {
      const { data } = await apiClient.post<{ monster: IMonsterData }>(`/monster/rename`, input)
      return data
    },
    onSuccess: (data) => {
      setSelectedMonster(queryClient, data.monster)
    },
  })
}

export const useSelectMonster = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (monsterId: string) => {
      const { data } = await apiClient.post<{ monster: IMonsterData }>(`/monster/select`, {
        monsterId,
      })
      return data
    },
    onSuccess: () => {
      // Every other tab now plays with this monster.
      queryClient.invalidateQueries()
    },
  })
}

export const useGetWallet = () => {
  return useQuery({
    queryKey: WALLET_KEY,
    queryFn: async () => {
      const { data } = await apiClient.get<IWallet>(`/wallet`)
      return data
    },
  })
}

export const useGetAdventure = () => {
  return useQuery({
    queryKey: ['adventure'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ areas: IAdventureArea[] }>(`/adventure`)
      return data
    },
  })
}

// The battle result is not written to the cache here: the caller replays the fight first and
// then calls useApplyBattleResult, so coins and unlocked stages don't spoil the ending.
export const useAdventureBattle = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { stageId: string }) => {
      const { data } = await apiClient.post<IAdventureBattleResponse>(`/adventure/battle`, input)
      return data
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: MY_MONSTER_KEY })
    },
  })
}

export interface IAdventureSkipResponse {
  monster: IMonsterData
  wallet: IWallet
  skip: {
    stageId: string
    runs: number
    coins: number
    drops: IEquipmentItem[]
    // Pieces lost to a full bag.
    dropsLost: number
  }
}

// Skip pays out at once (no replay to wait for), so the result goes straight into the cache.
export const useAdventureSkip = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { stageId: string; runs: number }) => {
      const { data } = await apiClient.post<IAdventureSkipResponse>(`/adventure/skip`, input)
      return data
    },
    onSuccess: (data) => {
      setSelectedMonster(queryClient, data.monster)
      queryClient.setQueryData<IWallet>(WALLET_KEY, data.wallet)
      queryClient.invalidateQueries({ queryKey: ['adventure'] })
      queryClient.invalidateQueries({ queryKey: EQUIPMENT_KEY })
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: MY_MONSTER_KEY })
    },
  })
}

export const useApplyBattleResult = () => {
  const queryClient = useQueryClient()
  return (data: { monster: IMonsterData; wallet: IWallet }) => {
    setSelectedMonster(queryClient, data.monster)
    queryClient.setQueryData<IWallet>(WALLET_KEY, data.wallet)
    queryClient.invalidateQueries({ queryKey: ['adventure'] })
    // A win may have dropped a piece of equipment.
    queryClient.invalidateQueries({ queryKey: EQUIPMENT_KEY })
  }
}
