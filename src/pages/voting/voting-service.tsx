import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../utils/api-client'
import {
  ICreatePollParams,
  IEditPollParams,
  IPollData,
  IPollResultsData,
  IPublicPollData,
  ISubmitVoteParams,
  IVoteSelection,
} from './voting-interface'

interface IGetMyPollsResponse {
  polls: IPollData[]
}

interface IGetPollResponse {
  poll: IPollData
}

interface IGetPublicPollResponse {
  poll: IPublicPollData
  myVote: IVoteSelection[] | null
}

interface ISubmitVoteResponse {
  vote: {
    selections: IVoteSelection[]
  }
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

export const useGetPoll = (pollId?: string) => {
  return useQuery({
    queryKey: ['polls', pollId],
    queryFn: async () => {
      const { data } = await apiClient.get<IGetPollResponse>(`/polls/${pollId}`)
      return data
    },
    enabled: !!pollId,
  })
}

export const useEditPoll = (pollId?: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (params: IEditPollParams) => {
      const { data } = await apiClient.put<IGetPollResponse>(`/polls/${pollId}`, params)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls'] })
    },
  })
}

export const useClosePoll = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (pollId: string) => {
      const { data } = await apiClient.post<IGetPollResponse>(`/polls/${pollId}/close`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls'] })
    },
  })
}

export const useGetPublicPoll = (slug?: string) => {
  return useQuery({
    queryKey: ['polls', 'public', slug],
    queryFn: async () => {
      const { data } = await apiClient.get<IGetPublicPollResponse>(`/polls/public/${slug}`)
      return data
    },
    enabled: !!slug,
  })
}

export const useGetPollResults = (slug?: string, options?: { isClosed?: boolean }) => {
  return useQuery({
    queryKey: ['polls', 'public', slug, 'results'],
    queryFn: async () => {
      const { data } = await apiClient.get<IPollResultsData>(`/polls/public/${slug}/results`)
      return data
    },
    enabled: !!slug,
    // A closed poll's tally can never change again - no point polling it forever.
    refetchInterval: options?.isClosed ? false : 3000,
  })
}

export const useSubmitVote = (slug?: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (params: ISubmitVoteParams) => {
      const { data } = await apiClient.post<ISubmitVoteResponse>(
        `/polls/public/${slug}/vote`,
        params
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls', 'public', slug] })
    },
  })
}
