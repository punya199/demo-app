import { ConfigProvider, theme } from 'antd'
import thTH from 'antd/locale/th_TH'
import 'dayjs/locale/th'
import { PropsWithChildren, useEffect } from 'react'
import { LoadingSpin } from '../../../layouts/LoadingSpin'
import { computeBase } from './ledger-calculations'
import { LedgerBottomNav } from './LedgerBottomNav'
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
    // The ledger never uses the site's dark/light toggle (its own design is always light/cream),
    // but any AntD component used within it (Modal, DatePicker, ...) would otherwise inherit
    // whatever theme the rest of the site is currently in - forcing the light algorithm here
    // keeps every AntD component in the ledger consistent with its own always-light design.
    <ConfigProvider theme={{ algorithm: theme.defaultAlgorithm }} locale={thTH}>
      <LedgerContext.Provider value={{ data, base }}>
        <div
          className="paojiao-ledger-shell"
          style={{
            display: 'grid',
            // minmax(0, 1fr), not bare 1fr - a grid track defaults to min-width: auto, so a wide
            // unshrinkable child (e.g. the draff-sales line chart's fixed-width SVG) would force
            // this whole column wider instead of the intended overflow-x:auto scroll kicking in.
            gridTemplateColumns: '232px minmax(0, 1fr)',
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
          .paojiao-ledger input[type=number]::-webkit-inner-spin-button,
          .paojiao-ledger input[type=number]::-webkit-outer-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          .paojiao-ledger input[type=number] {
            -moz-appearance: textfield;
          }
          .paojiao-ledger-row-action:hover {
            border-color: ${ledgerColor.accent} !important;
            color: ${ledgerColor.accent} !important;
          }
          /* Not scoped under .paojiao-ledger - AntD's Modal renders its content into a portal
             attached to document.body, outside this shell's own DOM subtree, so a descendant
             selector wouldn't reach the date picker used inside EditEntryModal. */
          .ledger-date-picker.ant-picker {
            padding: 9px 10px;
            border-radius: 8px;
            border-color: ${ledgerColor.inputBorder};
          }
          .ledger-date-picker.ant-picker:hover,
          .ledger-date-picker.ant-picker-focused {
            border-color: ${ledgerColor.accent} !important;
          }
          /* Desktop sidebar becomes a fixed bottom tab bar below this width - a 232px side
             column doesn't fit a phone screen, so LedgerBottomNav takes over instead. */
          @media (max-width: 768px) {
            .paojiao-ledger-shell {
              display: block !important;
            }
            .paojiao-ledger-sidebar {
              display: none !important;
            }
            .paojiao-ledger-bottom-nav {
              display: flex !important;
            }
            .paojiao-ledger-main {
              padding: 20px 16px 88px !important;
              max-width: none !important;
            }
          }
        `}</style>
          <LedgerSidebar />
          <main
            className="paojiao-ledger paojiao-ledger-main"
            style={{
              padding: '34px 40px 60px',
              maxWidth: 1180,
              margin: '0 auto',
              width: '100%',
              minWidth: 0,
            }}
          >
            {children}
          </main>
          <LedgerBottomNav />
        </div>
      </LedgerContext.Provider>
    </ConfigProvider>
  )
}
