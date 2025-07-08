import { useQuery } from '@tanstack/react-query'
import { apiClient } from './utils/api-client'

interface GetMeResponse {
  user: {
    id: number
    username: string
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
