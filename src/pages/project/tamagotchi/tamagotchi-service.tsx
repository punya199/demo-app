import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../../utils/api-client'
import {
  EnumMonsterAction,
  EnumMonsterLine,
  IAdventureArea,
  IBattleData,
  IDexEntry,
  IEnhanceOutcome,
  IEnhancePreview,
  IEquipmentData,
  IEquipmentItem,
  IFriendsData,
  IFriendVisit,
  IProfile,
  IRentableUnit,
  ISupportUnit,
  EnumEquipmentSlot,
  IExpeditionData,
  IExpeditionSummary,
  IInventoryItem,
  IMonsterData,
  IPvpBattleResponse,
  IRaidBattleResponse,
  IRaidData,
  IWorldBossAttackResponse,
  IWorldBossRankingEntry,
  IWorldBossReward,
  IWorldBossStatus,
  IPvpHistoryEntry,
  IPvpLeaderboardEntry,
  IPvpOpponent,
  IPvpReplay,
  IPvpStatus,
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
const EQUIPMENT_KEY = ['equipment']
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
    // A win may have dropped a piece of equipment.
    queryClient.invalidateQueries({ queryKey: EQUIPMENT_KEY })
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

export const useGetEquipment = () => {
  return useQuery({
    queryKey: EQUIPMENT_KEY,
    queryFn: async () => {
      const { data } = await apiClient.get<IEquipmentData>(`/equipment`)
      return data
    },
  })
}

// Equip, unequip and dismantle all answer with the refreshed equipment screen data.
const useEquipmentMutation = <TInput,>(request: (input: TInput) => Promise<IEquipmentData>) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: request,
    onSuccess: (data) => {
      queryClient.setQueryData<IEquipmentData>(EQUIPMENT_KEY, data)
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEY })
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: EQUIPMENT_KEY })
    },
  })
}

export const useEquip = () =>
  useEquipmentMutation(async (equipmentId: string) => {
    const { data } = await apiClient.post<IEquipmentData>(`/equipment/equip`, { equipmentId })
    return data
  })

export const useUnequip = () =>
  useEquipmentMutation(async (slot: EnumEquipmentSlot) => {
    const { data } = await apiClient.post<IEquipmentData>(`/equipment/unequip`, { slot })
    return data
  })

export const useDismantle = () =>
  useEquipmentMutation(async (equipmentId: string) => {
    const { data } = await apiClient.post<IEquipmentData>(`/equipment/dismantle`, { equipmentId })
    return data
  })

export const useGetEnhancePreview = (equipmentId: string | null) => {
  return useQuery({
    queryKey: ['equipment', 'preview', equipmentId],
    enabled: !!equipmentId,
    // The rate changes with every attempt (pity), so never serve a cached one.
    gcTime: 0,
    queryFn: async () => {
      const { data } = await apiClient.get<IEnhancePreview>(
        `/equipment/${equipmentId}/enhance-preview`
      )
      return data
    },
  })
}

export const useEnhance = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { equipmentId: string; useProtect: boolean }) => {
      const { data } = await apiClient.post<{
        result: IEnhanceOutcome
        wallet: IWallet
        equipment: IEquipmentData
        inventory: IInventoryItem[]
      }>(`/equipment/enhance`, input)
      return data
    },
    onSuccess: ({ wallet, equipment, inventory }) => {
      queryClient.setQueryData<IEquipmentData>(EQUIPMENT_KEY, equipment)
      queryClient.setQueryData<IWallet>(WALLET_KEY, wallet)
      queryClient.setQueryData<IInventoryResponse>(INVENTORY_KEY, { items: inventory })
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: EQUIPMENT_KEY })
      queryClient.invalidateQueries({ queryKey: WALLET_KEY })
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEY })
    },
  })
}

export const useBuyEquipmentBox = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post<{ wallet: IWallet; item: IEquipmentItem }>(
        `/shop/buy-box`
      )
      return data
    },
    onSuccess: (data) => {
      queryClient.setQueryData<IWallet>(WALLET_KEY, data.wallet)
      queryClient.invalidateQueries({ queryKey: EQUIPMENT_KEY })
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: WALLET_KEY })
    },
  })
}

export const useBuyMaterial = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (itemId: string) => {
      const { data } = await apiClient.post<IInventoryResponse & { wallet: IWallet }>(
        `/shop/buy-material`,
        { itemId }
      )
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
    queryClient.setQueryData<IGetMyMonsterResponse>(MY_MONSTER_KEY, { monster: data.monster })
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
    queryClient.setQueryData<IGetMyMonsterResponse>(MY_MONSTER_KEY, { monster: data.monster })
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
    queryClient.setQueryData<IGetMyMonsterResponse>(MY_MONSTER_KEY, { monster: data.monster })
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
const useFriendsMutation = <TInput,>(request: (input: TInput) => Promise<IFriendsData>) => {
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
