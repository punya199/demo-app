import { useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { some } from 'lodash'
import { useMemo } from 'react'
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

export enum EnumUserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BLOCKED = 'blocked',
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

export interface IUser {
  id: string
  username: string
  role: UserRole
  status: EnumUserStatus
  createdAt: string
  updatedAt: string
  deletedAt: string
}

export interface IGetUsersResponse {
  users: IUser[]
}

export interface IGetUserResponse {
  user: IUser
}

interface IGetMeResponse {
  user: Pick<IUser, 'id' | 'username' | 'role'> & {
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
  })
}

export const useGetMeSuspense = () => {
  const queryClient = useQueryClient()
  return useSuspenseQuery<IGetMeResponse | null>({
    queryKey: ['getme'],
    queryFn: async () => {
      const [{ data }] = await Promise.all([apiClient.get<IGetMeResponse>(`/users/me`), sleep(500)])
      return data
    },
    select: (data) => {
      if (!data) {
        return null
      }

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
  const userId = getMeResponse?.user?.id
  return useQuery<IPermissionAction>({
    queryKey: ['permissions', featureName, userId],
    queryFn: async () => {
      return (
        getMeResponse?.user.permissions.find((permission) => permission.featureName === featureName)
          ?.action || defaultPermissionAction
      )
    },
    enabled: !!featureName && !!userId,
  })
}

export const usePermissionRouteAllow = (
  featureName: EnumFeatureName,
  options: {
    requiredRead?: boolean
    requiredCreate?: boolean
    requiredUpdate?: boolean
    requiredDelete?: boolean
  }
) => {
  const { requiredRead, requiredCreate, requiredUpdate, requiredDelete } = options
  const { data: permissionAction } = useGetFeaturePermissionAction(featureName)

  const actionAllowed = useMemo(() => {
    const _requiredRead = requiredRead || requiredCreate || requiredUpdate || requiredDelete
    if (_requiredRead) {
      const d = some([
        _requiredRead && permissionAction?.canRead,
        requiredCreate && permissionAction?.canCreate,
        requiredUpdate && permissionAction?.canUpdate,
        requiredDelete && permissionAction?.canDelete,
      ])

      return d
    }

    return true
  }, [permissionAction, requiredRead, requiredCreate, requiredUpdate, requiredDelete])
  return actionAllowed
}
