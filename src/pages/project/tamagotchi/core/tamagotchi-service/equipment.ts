import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../../../../utils/api-client'
import {
  IEnhanceOutcome,
  IEnhancePreview,
  IEquipmentData,
  IEquipmentItem,
  EnumEquipmentSlot,
  IInventoryItem,
  IWallet,
  StatKey,
} from '../tamagotchi-interface'
import { IInventoryResponse, INVENTORY_KEY, EQUIPMENT_KEY, WALLET_KEY } from './shared'

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
const useEquipmentMutation = <TInput>(request: (input: TInput) => Promise<IEquipmentData>) => {
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

// `move` takes a piece another pet is wearing and puts it on the selected one; without it the
// server refuses a piece that is already worn.
export const useEquip = () =>
  useEquipmentMutation(async (input: { equipmentId: string; move?: boolean }) => {
    const { data } = await apiClient.post<IEquipmentData>(`/equipment/equip`, input)
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

export const useDismantleMany = () =>
  useEquipmentMutation(async (equipmentIds: string[]) => {
    const { data } = await apiClient.post<IEquipmentData>(`/equipment/dismantle-many`, {
      equipmentIds,
    })
    return data
  })

// Rolls a new value for one secondary stat line; it waits to be kept or discarded.
export const useRefine = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { equipmentId: string; line: StatKey }) => {
      const { data } = await apiClient.post<{
        pending: { line: StatKey; oldValue: number; newValue: number }
        wallet: IWallet
        equipment: IEquipmentData
        inventory: IInventoryItem[]
      }>(`/equipment/refine`, input)
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

export const useResolveRefine = () =>
  useEquipmentMutation(async (input: { equipmentId: string; keep: boolean }) => {
    const { data } = await apiClient.post<IEquipmentData>(`/equipment/refine/resolve`, input)
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
