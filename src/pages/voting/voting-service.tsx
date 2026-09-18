import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../utils/api-client'
import { ICreatePollParams, IPollData } from './voting-interface'

interface IGetMyPollsResponse {
  polls: IPollData[]
}

interface IGetPollResponse {
  poll: IPollData
}

export const useGetMyPolls = () => {
  return useQuery({
    queryKey: ['polls', 'mine'],
    queryFn: async () => {
      const { data } = await apiClient.get<IGetMyPollsResponse>(`/polls/mine`)
      return data
    },
  })
}

export const useCreatePoll = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (params: ICreatePollParams) => {
      const { data } = await apiClient.post<IGetPollResponse>(`/polls`, params)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls'] })
    },
  })
}
