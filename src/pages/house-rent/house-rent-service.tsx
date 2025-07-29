import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useGetMe } from '../../service'
import { apiClient } from '../../utils/api-client'
import {
  IHouseRentDetailData,
  IHouseRentFormValues,
  IHouseRentMemberData,
} from './house-rent-interface'

export interface IHouseRentDataResponse {
  id: string
  name: string
  baseHouseRent: number
  paymentFee: number
  internet: {
    pricePerMonth: number
  }
  airCondition: {
    unit: number
    pricePerUnit: number
  }
  rents: IHouseRentDetailData[]
  members: IHouseRentMemberData[]
  attachments: {
    id: string
    name: string
    url: string
  }[]
  createdAt: string
  updatedAt: string
  deletedAt?: string
  creatorId?: string
  updaterId?: string
  deleterId?: string
}

interface IGetHouseRentResponse {
  houseRent: IHouseRentDataResponse
}

interface IGetHouseRentListResponse {
  houseRents: IHouseRentDataResponse[]
}

export const useGetHouseRent = (houseRentId?: string) => {
  return useQuery({
    queryKey: ['house-rents', houseRentId],
    queryFn: async () => {
      const { data } = await apiClient.get<IGetHouseRentResponse>(`/house-rents/${houseRentId}`)
      return data
    },
    enabled: !!houseRentId,
  })
}

export const useCreateHouseRent = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (params: IHouseRentFormValues) => {
      const { data } = await apiClient.post<IHouseRentFormValues>(`/house-rents`, params)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['house-rents'] })
    },
  })
}

export const useUpdateHouseRent = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (params: IHouseRentFormValues) => {
      const { data } = await apiClient.put<IHouseRentFormValues>(
        `/house-rents/${params.id}`,
        params
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['house-rents'] })
    },
  })
}

export const useGetHouseRentList = () => {
  const { data: getMeData } = useGetMe()
  const isLoggedIn = !!getMeData?.user?.id

  return useQuery({
    queryKey: ['house-rents'],
    queryFn: async () => {
      const { data } = await apiClient.get<IGetHouseRentListResponse>(`/house-rents`)
      return data
    },
    enabled: !!isLoggedIn,
  })
}
