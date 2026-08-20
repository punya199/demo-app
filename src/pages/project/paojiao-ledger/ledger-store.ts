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
  removeExtraEntry: (id: number) => void
  setRatio: (ratio: number) => void
}

export const useLedgerStore = create<LedgerStoreState & LedgerStoreActions>((set) => ({
  extraEntries: [],
  extraWages: [],
  ratio: 50,
  addEntry: (entry) => set((s) => ({ extraEntries: [...s.extraEntries, entry] })),
  addWage: (wage) => set((s) => ({ extraWages: [...s.extraWages, wage] })),
  // Called once the backend confirms a locally-added entry actually persisted, so it isn't
  // shown twice (once from this optimistic list, once from the refetched real sheet data).
  removeExtraEntry: (id) =>
    set((s) => ({ extraEntries: s.extraEntries.filter((e) => e.id !== id) })),
  setRatio: (ratio) => set({ ratio }),
}))
