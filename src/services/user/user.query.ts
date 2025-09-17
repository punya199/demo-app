import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { IGetUserResponse, IGetUsersResponse } from '../../service'
import { apiClient } from '../../utils/api-client'
import { sleep } from '../../utils/helper'
import { IEditUserPermissionsParams, IGetUserPermissionsResponse } from './user.params'

export const useGetUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await apiClient.get<IGetUsersResponse>(`/users`)
      return data
    },
  })
}

export const useGetUser = (userId: string) => {
  return useQuery({
    queryKey: ['users', userId],
    queryFn: async () => {
      const { data } = await apiClient.get<IGetUserResponse>(`/users/${userId}`)
      return data
    },
    enabled: !!userId,
  })
}

export const useGetUserPermissions = (userId: string) => {
  return useQuery({
    queryKey: ['users', userId, 'permissions'],
    queryFn: async () => {
      const { data } = await apiClient.get<IGetUserPermissionsResponse>(
        `/users/${userId}/permissions`
      )
      return data
    },
    enabled: !!userId,
  })
}

export const useEditUserPermissions = (userId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (params: IEditUserPermissionsParams) => {
      const [data] = await Promise.all([
        apiClient.put(`/users/${userId}/permissions`, params),
        sleep(300),
      ])
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
