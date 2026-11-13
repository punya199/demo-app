import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../../../utils/api-client'
import type { ITdStages } from './td-stage'

export const TD_STAGES_KEY = ['td', 'stages']

export const useGetTdStages = () =>
  useQuery({
    queryKey: TD_STAGES_KEY,
    queryFn: async () => (await apiClient.get<ITdStages>('/td/stages')).data,
  })
