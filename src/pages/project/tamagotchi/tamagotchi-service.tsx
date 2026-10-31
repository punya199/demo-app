import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../../utils/api-client'
import {
  EnumMonsterAction,
  EnumMonsterLine,
  IAdventureArea,
  IBattleData,
  IDexEntry,
  IExpeditionData,
  IExpeditionSummary,
  IInventoryItem,
  IMonsterData,
  IQuestsData,
  IShopItem,
  IWallet,
  IWikiData,
} from './tamagotchi-interface'

interface IGetMyMonsterResponse {
  monster: IMonsterData | null
}

interface IGetMonsterHistoryResponse {
  monsters: IMonsterData[]
}

export interface IBattleResponse {
  monster: IMonsterData
  battle: IBattleData
  wallet: IWallet
}

interface IMonsterWithWalletResponse {
  monster: IMonsterData
  wallet: IWallet
}

interface IInventoryResponse {
  items: IInventoryItem[]
}

const INVENTORY_KEY = ['inventory']
const MY_MONSTER_KEY = ['monster', 'me']
const WALLET_KEY = ['wallet']

// The server advances the monster's clock on every read, so polling keeps hearts and poops fresh.
// Each poll also marks the player online (evolution x2, slower stamina drain); TanStack Query
// pauses the interval while the tab is in the background, which is what "online" should mean.
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
    mutationFn: async (input: { stageId: string; auto?: boolean }) => {
      const { data } = await apiClient.post<IBattleResponse>(`/adventure/battle`, input)
      return data
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: MY_MONSTER_KEY })
    },
  })
}

export const useApplyBattleResult = () => {
  const queryClient = useQueryClient()
  return (data: IBattleResponse) => {
    queryClient.setQueryData<IGetMyMonsterResponse>(MY_MONSTER_KEY, { monster: data.monster })
    queryClient.setQueryData<IWallet>(WALLET_KEY, data.wallet)
    queryClient.invalidateQueries({ queryKey: ['adventure'] })
  }
}

export const useGetShopItems = () => {
  return useQuery({
    queryKey: ['shop', 'items'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ items: IShopItem[] }>(`/shop/items`)
      return data
    },
  })
}

export const useBuyShopItem = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (itemId: string) => {
      const { data } = await apiClient.post<IInventoryResponse & { wallet: IWallet }>(`/shop/buy`, {
        itemId,
      })
      return data
    },
    onSuccess: (data) => {
      queryClient.setQueryData<IInventoryResponse>(INVENTORY_KEY, { items: data.items })
      queryClient.setQueryData<IWallet>(WALLET_KEY, data.wallet)
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: WALLET_KEY })
    },
  })
}

export const useGetInventory = () => {
  return useQuery({
    queryKey: INVENTORY_KEY,
    queryFn: async () => {
      const { data } = await apiClient.get<IInventoryResponse>(`/inventory`)
      return data
    },
  })
}

export const useUseInventoryItem = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (itemId: string) => {
      const { data } = await apiClient.post<IInventoryResponse & { monster: IMonsterData }>(
        `/inventory/use`,
        { itemId }
      )
      return data
    },
    onSuccess: (data) => {
      queryClient.setQueryData<IGetMyMonsterResponse>(MY_MONSTER_KEY, { monster: data.monster })
      queryClient.setQueryData<IInventoryResponse>(INVENTORY_KEY, { items: data.items })
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: MY_MONSTER_KEY })
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEY })
    },
  })
}

export const useGetQuests = () => {
  return useQuery({
    queryKey: ['quests'],
    queryFn: async () => {
      const { data } = await apiClient.get<IQuestsData>(`/quests`)
      return data
    },
  })
}

export const useClaimQuest = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (questId: string) => {
      const { data } = await apiClient.post<IQuestsData & { wallet: IWallet }>(`/quests/claim`, {
        questId,
      })
      return data
    },
    onSuccess: ({ wallet, ...quests }) => {
      queryClient.setQueryData<IQuestsData>(['quests'], quests)
      queryClient.setQueryData<IWallet>(WALLET_KEY, wallet)
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['quests'] })
    },
  })
}

export const useGetMonsterDex = () => {
  return useQuery({
    queryKey: ['monster', 'dex'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ species: IDexEntry[] }>(`/monster/dex`)
      return data
    },
  })
}

export const usePlayMinigame = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (hits: number) => {
      const { data } = await apiClient.post<{ monster: IMonsterData; reward: number }>(
        `/monster/minigame`,
        { hits }
      )
      return data
    },
    onSuccess: (data) => {
      queryClient.setQueryData<IGetMyMonsterResponse>(MY_MONSTER_KEY, { monster: data.monster })
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: MY_MONSTER_KEY })
    },
  })
}

export const useRefillStamina = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post<IMonsterWithWalletResponse>(`/monster/stamina/refill`)
      return data
    },
    onSuccess: (data) => {
      queryClient.setQueryData<IGetMyMonsterResponse>(MY_MONSTER_KEY, { monster: data.monster })
      queryClient.setQueryData<IWallet>(WALLET_KEY, data.wallet)
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: MY_MONSTER_KEY })
      queryClient.invalidateQueries({ queryKey: WALLET_KEY })
    },
  })
}

export const useGetWiki = () => {
  return useQuery({
    queryKey: ['monster', 'wiki'],
    queryFn: async () => {
      const { data } = await apiClient.get<IWikiData>(`/monster/wiki`)
      return data
    },
    staleTime: Infinity,
  })
}

export const useGetExpedition = () => {
  return useQuery({
    queryKey: ['expedition'],
    queryFn: async () => {
      const { data } = await apiClient.get<IExpeditionData>(`/expedition`)
      return data
    },
  })
}

export const useStartExpedition = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (areaId: string) => {
      const { data } = await apiClient.post<IGetMyMonsterResponse>(`/expedition/start`, {
        areaId,
      })
      return data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(MY_MONSTER_KEY, data)
      queryClient.invalidateQueries({ queryKey: ['quests'] })
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: MY_MONSTER_KEY })
    },
  })
}

export const useClaimExpedition = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post<
        IMonsterWithWalletResponse & { summary: IExpeditionSummary }
      >(`/expedition/claim`)
      return data
    },
    onSuccess: (data) => {
      queryClient.setQueryData<IGetMyMonsterResponse>(MY_MONSTER_KEY, { monster: data.monster })
      queryClient.setQueryData<IWallet>(WALLET_KEY, data.wallet)
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEY })
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: MY_MONSTER_KEY })
    },
  })
}
