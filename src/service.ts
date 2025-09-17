import { useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { some } from 'lodash'
import { useMemo } from 'react'
import { EnumPermissionFeatureName } from './services/permission/permission.params'
import { apiClient } from './utils/api-client'
import { sleep } from './utils/helper'
import { localStorageHelper } from './utils/local-storage-helper'

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}
export const roleLevels: UserRole[] = [UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN]

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
  featureName: EnumPermissionFeatureName
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
    queryKey: ['users', 'me'],
    queryFn: async () => {
      const { data } = await apiClient.get<IGetMeResponse>(`/users/me`)
      return data
    },
    select: (data) => {
      localStorageHelper.set({
        uid: data.user.id,
      })
      for (const featureName of Object.values(EnumPermissionFeatureName)) {
        queryClient.setQueryData(
          ['users', data.user.id, 'permissions', featureName],
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
    queryKey: ['users', 'me'],
    queryFn: async () => {
      const [{ data }] = await Promise.all([apiClient.get<IGetMeResponse>(`/users/me`), sleep(500)])
      return data
    },
    select: (data) => {
      if (!data) {
        return null
      }

      for (const featureName of Object.values(EnumPermissionFeatureName)) {
        queryClient.setQueryData(
          ['users', data.user.id, 'permissions', featureName],
          data.user.permissions.find((permission) => permission.featureName === featureName)
            ?.action || defaultPermissionAction
        )
      }

      return data
    },
  })
}

export const useGetFeaturePermissionAction = (featureName: EnumPermissionFeatureName) => {
  const { data: getMeResponse } = useGetMe()
  const userId = getMeResponse?.user?.id
  const featurePermissionAction =
    getMeResponse?.user.permissions.find((permission) => permission.featureName === featureName)
      ?.action || defaultPermissionAction
  const key = ['users', userId, 'permissions', featureName, featurePermissionAction]
  return useQuery<IPermissionAction>({
    queryKey: key,
    queryFn: async () => {
      return featurePermissionAction
    },
    enabled: !!featureName && !!userId,
  })
}

export const usePermissionRouteAllow = (
  featureName: EnumPermissionFeatureName,
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
