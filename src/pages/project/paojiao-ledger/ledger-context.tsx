import { createContext, useContext } from 'react'
import { LedgerBase } from './ledger-calculations'
import { LedgerData } from './ledger-types'

export interface LedgerContextValue {
  data: LedgerData
  base: LedgerBase
}

export const LedgerContext = createContext<LedgerContextValue | null>(null)

export const useLedgerContext = () => {
  const ctx = useContext(LedgerContext)
  if (!ctx) {
    throw new Error('useLedgerContext must be used within PaojiaoLedgerShell')
  }
  return ctx
}
