import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../../../../utils/api-client'
import { IArenaLoadout, ISkillState } from '../../arena/arena-interface'
import {
  ICostumeState,
  EnumCostumeSlot,
  IPassiveDraft,
  IPassiveState,
  IMonsterData,
  IWallet,
  ICraftClaimResult,
  ICraftOverview,
} from '../tamagotchi-interface'
import {
  INVENTORY_KEY,
  EQUIPMENT_KEY,
  MY_MONSTER_KEY,
  WALLET_KEY,
  setSelectedMonster,
} from './shared'

const PASSIVE_KEY = ['passive']

export const useGetPassive = () => {
  return useQuery({
    queryKey: PASSIVE_KEY,
    queryFn: async () => {
      const { data } = await apiClient.get<IPassiveState>(`/passive`)
      return data
    },
  })
}

// Allocate, deallocate and respec all answer with the refreshed tree. Gems (respec) and the
// battle stats shown on the care and equipment screens change with it.
const usePassiveMutation = <TInput>(request: (input: TInput) => Promise<IPassiveState>) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: request,
    onSuccess: (data) => {
      queryClient.setQueryData<IPassiveState>(PASSIVE_KEY, data)
      queryClient.invalidateQueries({ queryKey: WALLET_KEY })
      queryClient.invalidateQueries({ queryKey: EQUIPMENT_KEY })
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: PASSIVE_KEY })
      queryClient.invalidateQueries({ queryKey: WALLET_KEY })
    },
  })
}

// The panel edits a draft locally and saves the whole tree in one request.
export const usePassiveSave = () =>
  usePassiveMutation(async (draft: IPassiveDraft) => {
    const { data } = await apiClient.post<IPassiveState>(`/passive/save`, draft)
    return data
  })

const COSTUME_KEY = ['costume']

// The catalog never changes within a session; what the player owns and wears does.
export const useGetCostumes = () => {
  return useQuery({
    queryKey: COSTUME_KEY,
    queryFn: async () => {
      const { data } = await apiClient.get<ICostumeState>(`/costume`)
      return data
    },
  })
}

// Every costume write answers with the fresh state, so the shop and every pet view stay in step.
const useCostumeMutation = <T>(path: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: T) => {
      const { data } = await apiClient.post<ICostumeState>(`/costume/${path}`, input)
      return data
    },
    onSuccess: (data) => {
      queryClient.setQueryData<ICostumeState>(COSTUME_KEY, data)
      queryClient.invalidateQueries({ queryKey: MY_MONSTER_KEY })
      queryClient.invalidateQueries({ queryKey: WALLET_KEY })
      queryClient.invalidateQueries({ queryKey: INVENTORY_KEY })
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: COSTUME_KEY })
      queryClient.invalidateQueries({ queryKey: WALLET_KEY })
    },
  })
}

export const useBuyCostume = () => useCostumeMutation<{ costumeId: string }>('buy')
export const useEquipCostume = () =>
  useCostumeMutation<{ costumeId: string; monsterId?: string }>('equip')
export const useUnequipCostume = () =>
  useCostumeMutation<{ slot: EnumCostumeSlot; monsterId?: string }>('unequip')
export const useSetShowCostume = () => useCostumeMutation<{ show: boolean }>('privacy')

export const usePlayMinigame = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { hits: number; monsterId: string }) => {
      const { data } = await apiClient.post<{ monster: IMonsterData; reward: number }>(
        `/monster/minigame`,
        input
      )
      return data
    },
    onSuccess: (data) => {
      setSelectedMonster(queryClient, data.monster)
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: MY_MONSTER_KEY })
    },
  })
}

export const useRefillStamina = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (monsterId: string) => {
      const { data } = await apiClient.post<{ monster: IMonsterData; wallet: IWallet }>(
        `/monster/stamina/refill`,
        { monsterId }
      )
      return data
    },
    onSuccess: (data) => {
      setSelectedMonster(queryClient, data.monster)
      queryClient.setQueryData<IWallet>(WALLET_KEY, data.wallet)
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: MY_MONSTER_KEY })
      queryClient.invalidateQueries({ queryKey: WALLET_KEY })
    },
  })
}

// The forms one monster has been, egg first (for its evolution tree).
export const useGetEvolutionPath = (monsterId: string | null) => {
  return useQuery({
    queryKey: ['monster', 'evolution-path', monsterId],
    enabled: !!monsterId,
    queryFn: async () => {
      const { data } = await apiClient.get<{ monsterId: string; path: string[] }>(
        `/monster/${monsterId}/evolution-path`
      )
      return data
    },
  })
}

const SKILLS_KEY = ['skills']

// Skill catalog, unlocks (from the Dex) and each living pet's innate skill and slots.
export const useGetSkills = () => {
  return useQuery({
    queryKey: SKILLS_KEY,
    queryFn: async () => {
      const { data } = await apiClient.get<ISkillState>(`/skills`)
      return data
    },
  })
}

export const useSetSkillLoadout = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: IArenaLoadout & { monsterId?: string }) => {
      const { data } = await apiClient.post<ISkillState>(`/skills/loadout`, input)
      return data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(SKILLS_KEY, data)
    },
  })
}

const CRAFT_KEY = ['monster', 'craft']

export const useGetCraft = () =>
  useQuery({
    queryKey: CRAFT_KEY,
    queryFn: async () => {
      const { data } = await apiClient.get<ICraftOverview>(`/monster/craft`)
      return data
    },
  })

// Start and claim change coin, materials and (on claim) the bag.
const useCraftMutation = <TInput, TResult>(
  request: (input: TInput) => Promise<TResult>,
  overviewOf: (result: TResult) => ICraftOverview
) => {
  const queryClient = useQueryClient()
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: CRAFT_KEY })
    queryClient.invalidateQueries({ queryKey: EQUIPMENT_KEY })
    queryClient.invalidateQueries({ queryKey: INVENTORY_KEY })
    queryClient.invalidateQueries({ queryKey: WALLET_KEY })
  }
  return useMutation({
    mutationFn: request,
    onSuccess: (result) => {
      queryClient.setQueryData<ICraftOverview>(CRAFT_KEY, overviewOf(result))
      refresh()
    },
    // A refused claim (409 bag full) or start leaves the server state as it was: re-read it.
    onError: refresh,
  })
}

export const useStartCraft = () =>
  useCraftMutation(
    async (input: { recipeId: string; useCatalyst: boolean }) => {
      const { data } = await apiClient.post<ICraftOverview>(`/monster/craft/start`, input)
      return data
    },
    (data) => data
  )

export const useClaimCraft = () =>
  useCraftMutation(
    async () => {
      const { data } = await apiClient.post<ICraftClaimResult>(`/monster/craft/claim`)
      return data
    },
    (data) => data.overview
  )
