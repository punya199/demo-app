import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../../../utils/api-client'
import { LedgerData } from './ledger-types'

export const useLedgerData = () => {
  return useQuery({
    queryKey: ['paojiao-ledger'],
    queryFn: async () => {
      const { data } = await apiClient.get<LedgerData>('/paojiao-ledger')
      return data
    },
  })
}
