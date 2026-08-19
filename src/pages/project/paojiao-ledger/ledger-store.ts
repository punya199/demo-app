import { create } from 'zustand'
import { LedgerEntry, LedgerWage } from './ledger-types'

// Deliberately in-memory only (no persist middleware) - this is real financial data and
// Phase A has no backend write yet, so it shouldn't sit around in localStorage.
interface LedgerStoreState {
  extraEntries: LedgerEntry[]
  extraWages: LedgerWage[]
  ratio: number
}

interface LedgerStoreActions {
  addEntry: (entry: LedgerEntry) => void
  addWage: (wage: LedgerWage) => void
  setRatio: (ratio: number) => void
}

export const useLedgerStore = create<LedgerStoreState & LedgerStoreActions>((set) => ({
  extraEntries: [],
  extraWages: [],
  ratio: 50,
  addEntry: (entry) => set((s) => ({ extraEntries: [...s.extraEntries, entry] })),
  addWage: (wage) => set((s) => ({ extraWages: [...s.extraWages, wage] })),
  setRatio: (ratio) => set({ ratio }),
}))
