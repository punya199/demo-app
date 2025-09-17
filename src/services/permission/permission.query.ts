import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { apiClient } from '../../utils/api-client'
import { IPermissionOptionResponse } from './permission.params'

export const useGetPermissionOptions = (
  options?: Omit<UseQueryOptions<IPermissionOptionResponse>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['permissionsData'],
    queryFn: async () => {
      const { data } = await apiClient.get<IPermissionOptionResponse>(`/permissions/options`)
      return data
    },
    staleTime: 0,
    ...options,
  })
}
