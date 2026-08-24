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
  addWage: (wage: Omit<LedgerWage, 'row'> & { tempId: number }) => void
  removeExtraEntry: (id: number) => void
  removeExtraWage: (tempId: number) => void
  setRatio: (ratio: number) => void
}

export const useLedgerStore = create<LedgerStoreState & LedgerStoreActions>((set) => ({
  extraEntries: [],
  extraWages: [],
  ratio: 50,
  addEntry: (entry) => set((s) => ({ extraEntries: [...s.extraEntries, entry] })),
  // row: 0 marks a locally-added wage not yet confirmed persisted - same convention as
  // addEntry's row: 0 sentinel, used to gate the edit button on rows that can actually be edited.
  addWage: (wage) => set((s) => ({ extraWages: [...s.extraWages, { row: 0, ...wage }] })),
  // Called once the backend confirms a locally-added entry actually persisted, so it isn't
  // shown twice (once from this optimistic list, once from the refetched real sheet data).
  removeExtraEntry: (id) =>
    set((s) => ({ extraEntries: s.extraEntries.filter((e) => e.id !== id) })),
  // Same reasoning as removeExtraEntry, for wages - without this, a confirmed wage add stayed in
  // extraWages forever and showed twice once the refetched real sheet data included it too.
  removeExtraWage: (tempId) =>
    set((s) => ({ extraWages: s.extraWages.filter((w) => w.tempId !== tempId) })),
  setRatio: (ratio) => set({ ratio }),
}))
