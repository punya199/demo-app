import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { IUser } from '../../service'
import { apiClient } from '../../utils/api-client'
import {
  IGetUserOptionsParams,
  IGetUserOptionsResponse,
  IHouseRentDetailData,
  IHouseRentMemberData,
  ISaveHouseRentParams,
} from './house-rent-interface'

interface IBaseData {
  id: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
  creatorId?: string
  updaterId?: string
  deleterId?: string
}
interface IHouseRentAttachmentData extends IBaseData {
  attachableId?: string
  attachableType?: string
  fileName: string
  filePath: string
  mimeType: string
  size: number
}
export interface IHouseRentDataResponse extends IBaseData {
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
  attachments: IHouseRentAttachmentData[]
}

interface IGetHouseRentResponse {
  houseRent: IHouseRentDataResponse
}

interface IGetHouseRentListResponse {
  houseRents: IHouseRentDataResponse[]
}

interface IGetHouseRentUserListResponse {
  users: IUser[]
}

interface IGetHouseRentUserDetailData {
  group: string
  title: string
  airConditionPrice: number
  waterPrice: number
  electricityRate: number
  individualElectricityPrice: number
  electricityUnit: { diff: number; prev: number; current: number }
}

interface IGetHouseRentUserDetailResponse {
  data: IGetHouseRentUserDetailData[]
  user: IUser
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
    mutationFn: async (params: ISaveHouseRentParams) => {
      const { data } = await apiClient.post<IGetHouseRentResponse>(`/house-rents`, params)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['house-rents'] })
    },
  })
}

export const useUpdateHouseRent = (houseRentId?: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (params: ISaveHouseRentParams) => {
      if (!houseRentId) throw new Error('houseRentId is required')
      const { data } = await apiClient.put<IGetHouseRentResponse>(
        `/house-rents/${houseRentId}`,
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
  return useQuery({
    queryKey: ['house-rents'],
    queryFn: async () => {
      const { data } = await apiClient.get<IGetHouseRentListResponse>(`/house-rents`)
      return data
    },
  })
}

export const useGetHouseRentUserList = () => {
  return useQuery({
    queryKey: ['house-rents', 'user-list'],
    queryFn: async () => {
      const { data } = await apiClient.get<IGetHouseRentUserListResponse>(`/house-rents/users`)
      return data
    },
  })
}

export const useGetHouseRentUserDetail = (userId?: string) => {
  return useQuery({
    queryKey: ['house-rents', 'user-list', userId],
    queryFn: async () => {
      const { data } = await apiClient.get<IGetHouseRentUserDetailResponse>(
        `/house-rents/users/${userId}`
      )
      return data
    },
    enabled: !!userId,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
  })
}

export const useGetUserOptions = (params?: IGetUserOptionsParams) => {
  return useQuery({
    queryKey: ['user-options', params],
    queryFn: async () => {
      const { data } = await apiClient.get<IGetUserOptionsResponse>(`/users/options`, {
        params,
      })
      return data
    },
    gcTime: 0,
    staleTime: 0,
  })
}

export const useFetchUserOptions = () => {
  return useMutation({
    mutationFn: async (params?: IGetUserOptionsParams) => {
      const { data } = await apiClient.get<IGetUserOptionsResponse>(`/users/options`, {
        params,
      })
      return data
    },
  })
}

export const useDeleteHouseRent = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (houseRentId: string) => {
      await apiClient.delete(`/house-rents/${houseRentId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['house-rents'] })
    },
  })
}
