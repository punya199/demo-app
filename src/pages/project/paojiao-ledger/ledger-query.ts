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

export const useEditLedgerEntry = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ row, entry }: { row: number; entry: AddLedgerEntryPayload }) => {
      await apiClient.put(`/paojiao-ledger/entries/${row}`, entry)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: LEDGER_QUERY_KEY }),
  })
}

// Backend only allows deleting rows after the last closed round (see deleteEntry in
// paojiao-ledger.service.ts) - callers should already be gating the delete UI on that (entry.row
// > data.lastRoundRow) rather than relying on this to fail; the 400 it'd return isn't a great UX.
export const useDeleteLedgerEntry = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (row: number) => {
      await apiClient.delete(`/paojiao-ledger/entries/${row}`)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: LEDGER_QUERY_KEY }),
  })
}

export interface LedgerItemRecord {
  id: string
  name: string
  // Rename/delete would 400 server-side for these (calculation logic references them by exact
  // name) - the editor uses this to hide those buttons instead of letting the user hit the error.
  protected: boolean
}

const LEDGER_ITEMS_QUERY_KEY = ['paojiao-ledger-items']

export const useLedgerItems = () => {
  return useQuery({
    queryKey: LEDGER_ITEMS_QUERY_KEY,
    queryFn: async () => {
      const { data } = await apiClient.get<LedgerItemRecord[]>('/paojiao-ledger/items')
      return data
    },
  })
}

// Item name changes feed the add-entry dropdown (useLedgerData's `items: string[]`) as well as
// the editor's own id-keyed list - both queries need invalidating, not just this one.
const invalidateLedgerItems = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: LEDGER_ITEMS_QUERY_KEY })
  queryClient.invalidateQueries({ queryKey: LEDGER_QUERY_KEY })
}

export const useAddLedgerItem = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (name: string) => {
      const { data } = await apiClient.post<LedgerItemRecord>('/paojiao-ledger/items', { name })
      return data
    },
    onSuccess: () => invalidateLedgerItems(queryClient),
  })
}

export const useRenameLedgerItem = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { data } = await apiClient.put<LedgerItemRecord>(`/paojiao-ledger/items/${id}`, {
        name,
      })
      return data
    },
    onSuccess: () => invalidateLedgerItems(queryClient),
  })
}

export const useDeleteLedgerItem = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/paojiao-ledger/items/${id}`)
    },
    onSuccess: () => invalidateLedgerItems(queryClient),
  })
}
