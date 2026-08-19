import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../../utils/api-client'
import { LedgerData, LedgerEntry, LedgerWage } from './ledger-types'

const LEDGER_QUERY_KEY = ['paojiao-ledger']

export const useLedgerData = () => {
  return useQuery({
    queryKey: LEDGER_QUERY_KEY,
    queryFn: async () => {
      const { data } = await apiClient.get<LedgerData>('/paojiao-ledger')
      return data
    },
  })
}

type AddLedgerEntryPayload = Omit<LedgerEntry, 'id' | 'row'>

export const useAddLedgerEntry = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (entry: AddLedgerEntryPayload) => {
      await apiClient.post('/paojiao-ledger/entries', entry)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: LEDGER_QUERY_KEY }),
  })
}

export const useAddLedgerWage = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (wage: LedgerWage) => {
      await apiClient.post('/paojiao-ledger/wages', wage)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: LEDGER_QUERY_KEY }),
  })
}
