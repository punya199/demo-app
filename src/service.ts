import { useQuery } from '@tanstack/react-query'
import { apiClient } from './utils/api-client'
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}
export const roleLevels: UserRole[] = [UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN]

interface GetMeResponse {
  user: {
    id: number
    username: string
    role: UserRole
  }
}
export const useGetMe = () => {
  return useQuery({
    queryKey: ['getme'],
    queryFn: async () => {
      const { data } = await apiClient.get<GetMeResponse>(`/users/me`, {})
      return data
    },
  })
}
