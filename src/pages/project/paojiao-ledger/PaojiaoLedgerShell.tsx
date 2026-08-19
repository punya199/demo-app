import { PropsWithChildren, useEffect } from 'react'
import { LoadingSpin } from '../../../layouts/LoadingSpin'
import { computeBase } from './ledger-calculations'
import { LedgerContext } from './ledger-context'
import { LEDGER_FONT_STYLESHEET_HREF, ledgerColor, ledgerFont } from './ledger-tokens'
import { useLedgerData } from './ledger-query'
import { useLedgerStore } from './ledger-store'
import { LedgerSidebar } from './LedgerSidebar'

const useLedgerFonts = () => {
  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = LEDGER_FONT_STYLESHEET_HREF
    document.head.appendChild(link)
    return () => {
      document.head.removeChild(link)
    }
  }, [])
}

export const PaojiaoLedgerShell = ({ children }: PropsWithChildren) => {
  useLedgerFonts()
  const { data, isLoading, isError } = useLedgerData()
  const extraEntries = useLedgerStore((s) => s.extraEntries)

  if (isLoading) return <LoadingSpin />
  if (isError || !data) {
    return (
      <div
        style={{
          display: 'flex',
          minHeight: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          color: ledgerColor.textMuted,
        }}
      >
        โหลดข้อมูลไม่สำเร็จ ลองรีเฟรชหน้าใหม่
      </div>
    )
  }

  const base = computeBase(data, extraEntries)

  return (
    <LedgerContext.Provider value={{ data, base }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '232px 1fr',
          minHeight: '100%',
          alignItems: 'stretch',
          fontFamily: ledgerFont.sans,
          background: ledgerColor.pageBg,
          color: ledgerColor.textPrimary,
        }}
      >
        <style>{`
          .paojiao-ledger input:focus,
          .paojiao-ledger select:focus {
            outline: 2px solid ${ledgerColor.accent};
            outline-offset: -1px;
          }
          .paojiao-ledger-primary-btn:hover {
            background: ${ledgerColor.accent} !important;
          }
        `}</style>
        <LedgerSidebar />
        <main className="paojiao-ledger" style={{ padding: '34px 40px 60px', maxWidth: 1180 }}>
          {children}
        </main>
      </div>
    </LedgerContext.Provider>
  )
}
