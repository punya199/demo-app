import { useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { apiClient } from './utils/api-client'
import { sleep } from './utils/helper'

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}
export const roleLevels: UserRole[] = [UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN]

export enum EnumFeatureName {
  HOUSE_RENT = 'house_rent',
  BILL = 'bill',
  USER = 'user',
}

interface IPermissionAction {
  canRead: boolean
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
}

const defaultPermissionAction: IPermissionAction = {
  canRead: false,
  canCreate: false,
  canUpdate: false,
  canDelete: false,
}

export interface IPermission {
  id: string
  featureName: EnumFeatureName
  action: IPermissionAction
}

interface IGetMeResponse {
  user: {
    id: number
    username: string
    role: UserRole
    permissions: IPermission[]
  }
}
export const useGetMe = () => {
  const queryClient = useQueryClient()
  return useQuery<IGetMeResponse>({
    queryKey: ['getme'],
    queryFn: async () => {
      const { data } = await apiClient.get<IGetMeResponse>(`/users/me`)
      return data
    },
    select: (data) => {
      for (const featureName of Object.values(EnumFeatureName)) {
        queryClient.setQueryData(
          ['permissions', featureName],
          data.user.permissions.find((permission) => permission.featureName === featureName)
            ?.action || defaultPermissionAction
        )
      }

      return data
    },
    enabled: !!localStorage.getItem('accessToken'),
  })
}

export const useGetMeSuspense = () => {
  const queryClient = useQueryClient()
  return useSuspenseQuery<IGetMeResponse>({
    queryKey: ['getme'],
    queryFn: async () => {
      if (!localStorage.getItem('accessToken')) {
        throw new Error('Unauthorized')
      }
      const [{ data }] = await Promise.all([apiClient.get<IGetMeResponse>(`/users/me`), sleep(500)])
      return data
    },
    select: (data) => {
      for (const featureName of Object.values(EnumFeatureName)) {
        queryClient.setQueryData(
          ['permissions', featureName],
          data.user.permissions.find((permission) => permission.featureName === featureName)
            ?.action || defaultPermissionAction
        )
      }

      return data
    },
  })
}

export const useGetFeaturePermissionAction = (featureName: EnumFeatureName) => {
  const { data: getMeResponse } = useGetMe()
  return useQuery<IPermissionAction>({
    queryKey: ['permissions', featureName],
    queryFn: async () => {
      return (
        getMeResponse?.user.permissions.find((permission) => permission.featureName === featureName)
          ?.action || defaultPermissionAction
      )
    },
    enabled: !!featureName,
  })
}
