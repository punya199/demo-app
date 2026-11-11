import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../../../../utils/api-client'
import {
  IDexEntry,
  IExpeditionData,
  IExpeditionSummary,
  ILoginGranted,
  IMonsterData,
  IQuestsData,
  IShopItem,
  IWallet,
  IWikiData,
} from '../tamagotchi-interface'
import {
  IMonsterWithWalletResponse,
  IInventoryResponse,
  INVENTORY_KEY,
  MY_MONSTER_KEY,
  WALLET_KEY,
  setSelectedMonster,
} from './shared'

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
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity?: number }) => {
      const { data } = await apiClient.post<IInventoryResponse & { wallet: IWallet }>(`/shop/buy`, {
        itemId,
        quantity,
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
      setSelectedMonster(queryClient, data.monster)
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

export const useClaimLogin = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post<
        IQuestsData & { wallet: IWallet; granted: ILoginGranted }
      >(`/quests/login`)
      const { wallet, granted, ...quests } = data
      return { wallet, granted, quests }
    },
    onSuccess: ({ wallet, quests }) => {
      queryClient.setQueryData<IQuestsData>(['quests'], quests)
      queryClient.setQueryData<IWallet>(WALLET_KEY, wallet)
      // A slot can put items in the bag or unlock the monthly costume.
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEY })
      queryClient.invalidateQueries({ queryKey: ['costume'] })
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
      const { data } = await apiClient.post<{ monster: IMonsterData }>(`/expedition/start`, {
        areaId,
      })
      return data
    },
    onSuccess: (data) => {
      setSelectedMonster(queryClient, data.monster)
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
      setSelectedMonster(queryClient, data.monster)
      queryClient.setQueryData<IWallet>(WALLET_KEY, data.wallet)
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEY })
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: MY_MONSTER_KEY })
    },
  })
}
