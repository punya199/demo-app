export type LedgerPerson = 'น้าปุ้ม' | 'ปัญญา'

export interface LedgerEntry {
  id: number
  row: number
  date: string
  item: string
  inCash: number
  inBank: number
  outCash: number
  outBank: number
  note: string
}

export interface LedgerRound {
  date: string
  fromRow: number
  toRow: number
  profit: number
}

export interface LedgerWithdrawal {
  who: LedgerPerson
  row: number
  date: string
  bank: number
  cash: number
  note: string
}

export interface LedgerWage {
  row: number
  date: string
  amount: number
  // Local-only marker for an optimistic add not yet confirmed persisted - never present on data
  // that came from the API. Lets removeExtraWage find and clear this exact entry once the
  // backend confirms it, the same way LedgerEntry's `id` does for extraEntries.
  tempId?: number
}

export interface LedgerOpening {
  cash: number
  bank: number
  priorProfit: number
  priorWithdraw: Record<LedgerPerson, number>
}

export interface LedgerData {
  opening: LedgerOpening
  startDate: string
  lastRoundRow: number
  entries: LedgerEntry[]
  rounds: LedgerRound[]
  withdrawals: LedgerWithdrawal[]
  wages: LedgerWage[]
  items: string[]
}

export type LedgerEntryDirection = 'inCash' | 'inBank' | 'outCash' | 'outBank'

export type LedgerSummaryPeriod =
  | 'round'
  | 'oilSales'
  | 'draffSales'
  | 'day'
  | 'expenses'
  | 'month'
  | 'all'
