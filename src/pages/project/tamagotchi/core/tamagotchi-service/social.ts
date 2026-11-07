import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../../../../utils/api-client'
import {
  IEquipmentItem,
  IFriendsData,
  IFriendVisit,
  IProfile,
  IRentableUnit,
  ISupportUnit,
  IWorldBossAttackResponse,
  IWorldBossRankingEntry,
  IWorldBossReward,
  IWorldBossStatus,
  IWallet,
} from '../tamagotchi-interface'
import {
  IInventoryResponse,
  INVENTORY_KEY,
  EQUIPMENT_KEY,
  MY_MONSTER_KEY,
  WALLET_KEY,
  setSelectedMonster,
  REFETCH_INTERVAL_MS,
} from './shared'

const WORLD_BOSS_KEY = ['world-boss']
const FRIENDS_KEY = ['friends']
const SUPPORT_KEY = ['support']

export const useGetWorldBoss = () => {
  return useQuery({
    queryKey: WORLD_BOSS_KEY,
    queryFn: async () => {
      const { data } = await apiClient.get<IWorldBossStatus>(`/world-boss`)
      return data
    },
    // Other players keep hitting the boss, so keep its HP reasonably fresh while the tab is open.
    refetchInterval: REFETCH_INTERVAL_MS,
  })
}

// Like the other fights, nothing is cached until the replay has been watched.
export const useWorldBossAttack = () => {
  const queryClient = useQueryClient()
  return useMutation({
    // `supportId`: a friend's support unit to rent for this fight.
    mutationFn: async (supportId?: string) => {
      const { data } = await apiClient.post<IWorldBossAttackResponse>(`/world-boss/attack`, {
        supportId,
      })
      return data
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: MY_MONSTER_KEY })
      queryClient.invalidateQueries({ queryKey: WORLD_BOSS_KEY })
    },
  })
}

export const useApplyWorldBossResult = () => {
  const queryClient = useQueryClient()
  return (data: IWorldBossAttackResponse) => {
    setSelectedMonster(queryClient, data.monster)
    queryClient.invalidateQueries({ queryKey: WORLD_BOSS_KEY })
    queryClient.invalidateQueries({ queryKey: ['quests'] })
    if (data.ally) {
      // The rental fee changed the renter's coins, and friendship points moved.
      queryClient.invalidateQueries({ queryKey: WALLET_KEY })
      queryClient.invalidateQueries({ queryKey: FRIENDS_KEY })
    }
  }
}

export const useGetWorldBossRanking = (week?: string) => {
  return useQuery({
    queryKey: ['world-boss', 'ranking', week ?? 'current'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ week: string; entries: IWorldBossRankingEntry[] }>(
        `/world-boss/ranking`,
        { params: week ? { week } : undefined }
      )
      return data
    },
  })
}

export const useClaimWorldBoss = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (week: string) => {
      const { data } = await apiClient.post<{
        week: string
        rank: number
        reward: IWorldBossReward
        drop: IEquipmentItem | null
        wallet: IWallet
      }>(`/world-boss/claim`, { week })
      return data
    },
    onSuccess: (data) => {
      queryClient.setQueryData<IWallet>(WALLET_KEY, data.wallet)
      queryClient.invalidateQueries({ queryKey: WORLD_BOSS_KEY })
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEY })
      queryClient.invalidateQueries({ queryKey: EQUIPMENT_KEY })
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: WORLD_BOSS_KEY })
    },
  })
}

export const useExchangeWorldBoss = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { bossId: string; slot: string; grade: string }) => {
      const { data } = await apiClient.post<IInventoryResponse & { item: IEquipmentItem }>(
        `/world-boss/exchange`,
        input
      )
      return data
    },
    onSuccess: (data) => {
      queryClient.setQueryData<IInventoryResponse>(INVENTORY_KEY, { items: data.items })
      queryClient.invalidateQueries({ queryKey: EQUIPMENT_KEY })
    },
  })
}

export const useGetProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await apiClient.get<IProfile>(`/profile`)
      return data
    },
  })
}

export const useSetProfileName = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (displayName: string) => {
      const { data } = await apiClient.post<IProfile>(`/profile/name`, { displayName })
      return data
    },
    onSuccess: (data) => {
      queryClient.setQueryData<IProfile>(['profile'], data)
      // Everyone sees the name: arena status and the boss ranking use it too.
      queryClient.invalidateQueries({ queryKey: ['pvp'] })
      queryClient.invalidateQueries({ queryKey: WORLD_BOSS_KEY })
    },
  })
}

export const useGetFriends = () => {
  return useQuery({
    queryKey: FRIENDS_KEY,
    queryFn: async () => {
      const { data } = await apiClient.get<IFriendsData>(`/friends`)
      return data
    },
  })
}

// Request, respond and remove all answer with the refreshed friend list.
const useFriendsMutation = <TInput>(request: (input: TInput) => Promise<IFriendsData>) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: request,
    onSuccess: (data) => {
      queryClient.setQueryData<IFriendsData>(FRIENDS_KEY, data)
      queryClient.invalidateQueries({ queryKey: SUPPORT_KEY })
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: FRIENDS_KEY })
    },
  })
}

export const useFriendRequest = () =>
  useFriendsMutation(async (friendCode: string) => {
    const { data } = await apiClient.post<IFriendsData>(`/friends/request`, { friendCode })
    return data
  })

export const useFriendRespond = () =>
  useFriendsMutation(async (input: { relationId: string; accept: boolean }) => {
    const { data } = await apiClient.post<IFriendsData>(`/friends/respond`, input)
    return data
  })

export const useRemoveFriend = () =>
  useFriendsMutation(async (relationId: string) => {
    const { data } = await apiClient.delete<IFriendsData>(`/friends/${relationId}`)
    return data
  })

export const useVisitFriend = () => {
  return useMutation({
    mutationFn: async (relationId: string) => {
      const { data } = await apiClient.get<IFriendVisit>(`/friends/${relationId}/visit`)
      return data
    },
  })
}

export const useGreetFriend = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (relationId: string) => {
      const { data } = await apiClient.post<{ points: number }>(`/friends/${relationId}/greet`)
      return data
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: FRIENDS_KEY })
    },
  })
}

export const useGiftFriend = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { relationId: string; itemId: string }) => {
      const { data } = await apiClient.post<IInventoryResponse & { giftsLeft: number }>(
        `/friends/${input.relationId}/gift`,
        { itemId: input.itemId }
      )
      return data
    },
    onSuccess: (data) => {
      queryClient.setQueryData<IInventoryResponse>(INVENTORY_KEY, { items: data.items })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: FRIENDS_KEY })
    },
  })
}

export const useGetSupport = () => {
  return useQuery({
    queryKey: SUPPORT_KEY,
    queryFn: async () => {
      const { data } = await apiClient.get<{ support: ISupportUnit | null }>(`/support`)
      return data
    },
  })
}

export const useSetSupport = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post<{ support: ISupportUnit | null }>(`/support`)
      return data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(SUPPORT_KEY, data)
      queryClient.invalidateQueries({ queryKey: FRIENDS_KEY })
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: SUPPORT_KEY })
    },
  })
}

export const useGetRentable = () => {
  return useQuery({
    queryKey: ['support', 'rentable'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ fee: number; units: IRentableUnit[] }>(
        `/support/rentable`
      )
      return data
    },
  })
}
