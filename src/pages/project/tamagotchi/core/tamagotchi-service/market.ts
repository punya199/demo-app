import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../../../../utils/api-client'
import { IMarketFilter, IMarketListing, IMarketMine } from '../tamagotchi-interface'
import { MY_MONSTER_KEY, WALLET_KEY, REFETCH_INTERVAL_MS } from './shared'

const MARKET_KEY = ['market']

export const useGetMarket = (filter: IMarketFilter) => {
  return useQuery({
    queryKey: [...MARKET_KEY, 'browse', filter],
    queryFn: async () => {
      const { data } = await apiClient.get<{ listings: IMarketListing[] }>(`/market`, {
        params: filter,
      })
      return data
    },
    // Other players list and buy all the time; polling is the only refresh (no websockets).
    refetchInterval: REFETCH_INTERVAL_MS,
  })
}

export const useGetMyMarket = () => {
  return useQuery({
    queryKey: [...MARKET_KEY, 'mine'],
    queryFn: async () => {
      const { data } = await apiClient.get<IMarketMine>(`/market/mine`)
      return data
    },
    refetchInterval: REFETCH_INTERVAL_MS,
  })
}

// A listing, a cancel or a purchase changes the market, my pets (frozen or returned) and gems.
const useRefreshMarket = () => {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: MARKET_KEY })
    queryClient.invalidateQueries({ queryKey: MY_MONSTER_KEY })
    queryClient.invalidateQueries({ queryKey: WALLET_KEY })
  }
}

export const useCreateListing = () => {
  const refresh = useRefreshMarket()
  return useMutation({
    mutationFn: async (input: { monsterId: string; price: number }) => {
      const { data } = await apiClient.post(`/market/listings`, input)
      return data
    },
    onSettled: refresh,
  })
}

export const useCancelListing = () => {
  const refresh = useRefreshMarket()
  return useMutation({
    mutationFn: async (listingId: string) => {
      const { data } = await apiClient.delete(`/market/listings/${listingId}`)
      return data
    },
    onSettled: refresh,
  })
}

export const useBuyListing = () => {
  const refresh = useRefreshMarket()
  return useMutation({
    mutationFn: async (listingId: string) => {
      const { data } = await apiClient.post(`/market/listings/${listingId}/buy`)
      return data
    },
    onSettled: refresh,
  })
}
