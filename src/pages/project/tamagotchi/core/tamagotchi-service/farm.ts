import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../../../../utils/api-client'
import { EnumFurnitureKind, IFarmData } from '../tamagotchi-interface'
import { INVENTORY_KEY, MY_MONSTER_KEY, WALLET_KEY } from './shared'

const FARM_KEY = ['monster', 'farm']

export const useGetFarm = () =>
  useQuery({
    queryKey: FARM_KEY,
    queryFn: async () => {
      const { data } = await apiClient.get<IFarmData>(`/monster/farm`)
      return data
    },
  })

// Buying, upgrading and claiming change coins, materials and the shared craft queue; the server
// also catches every monster up first, so the pet list is re-read too.
const useFarmMutation = <TInput>(request: (input: TInput) => Promise<IFarmData>) => {
  const queryClient = useQueryClient()
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: FARM_KEY })
    queryClient.invalidateQueries({ queryKey: MY_MONSTER_KEY })
    queryClient.invalidateQueries({ queryKey: INVENTORY_KEY })
    queryClient.invalidateQueries({ queryKey: WALLET_KEY })
    queryClient.invalidateQueries({ queryKey: ['monster', 'craft'] })
  }
  return useMutation({
    mutationFn: request,
    onSuccess: (data) => {
      queryClient.setQueryData<IFarmData>(FARM_KEY, data)
      refresh()
    },
    // A refused request leaves the server state as it was: re-read it.
    onError: refresh,
  })
}

export const useBuyFurniture = () =>
  useFarmMutation(async (kind: EnumFurnitureKind) => {
    const { data } = await apiClient.post<IFarmData>(`/monster/farm/buy`, { kind })
    return data
  })

export const useUpgradeFurniture = () =>
  useFarmMutation(async (kind: EnumFurnitureKind) => {
    const { data } = await apiClient.post<IFarmData>(`/monster/farm/upgrade`, { kind })
    return data
  })

export const useClaimFurniture = () =>
  useFarmMutation(async () => {
    const { data } = await apiClient.post<IFarmData>(`/monster/farm/claim`)
    return data
  })
