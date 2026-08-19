import { CSSProperties } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { appPath } from '../../../config/app-paths'
import { useLedgerContext } from './ledger-context'
import { fmtFull, THB } from './ledger-format'
import { ledgerColor, ledgerFont } from './ledger-tokens'

const NAV_ITEMS = [
  { path: appPath.paojiaoLedgerEntries(), label: 'รายการ', sub: 'count' as const },
  { path: appPath.paojiaoLedgerSummary(), label: 'สรุปเงิน', sub: 'กำไร/ขาดทุน' },
  { path: appPath.paojiaoLedgerShare(), label: 'กำไร & ยอดถอน', sub: undefined },
  { path: appPath.paojiaoLedgerWages(), label: 'ค่าแรง', sub: undefined },
]

export const LedgerSidebar = () => {
  const location = useLocation()
  const { data, base } = useLedgerContext()

  const navButtonStyle = (active: boolean): CSSProperties => ({
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 8,
    width: '100%',
    textAlign: 'left',
    padding: '10px 12px',
    border: 'none',
    borderRadius: 9,
    cursor: 'pointer',
    background: active ? ledgerColor.accent : 'transparent',
    color: active ? ledgerColor.cardSurface : ledgerColor.darkNavInactive,
    fontFamily: ledgerFont.sans,
  })

  return (
    <aside
      style={{
        background: ledgerColor.darkSurface,
        color: ledgerColor.darkText,
        padding: '26px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 28,
        position: 'sticky',
        top: 0,
        height: '100vh',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.01em' }}>
          เจ้ปุ้ม พาเจียว
        </div>
        <div style={{ fontSize: 12.5, color: ledgerColor.darkTextMuted }}>บัญชีรายรับรายจ่าย</div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {NAV_ITEMS.map((item) => {
          const active = location.pathname === item.path
          return (
            <Link key={item.path} to={item.path} style={navButtonStyle(active)}>
              <span style={{ fontSize: 14.5, fontWeight: 500 }}>{item.label}</span>
              {item.sub === 'count' ? (
                <span style={{ fontSize: 12, opacity: 0.55 }}>{base.entries.length}</span>
              ) : item.sub ? (
                <span style={{ fontSize: 12, opacity: 0.55 }}>{item.sub}</span>
              ) : null}
            </Link>
          )
        })}
      </nav>

      <div
        style={{
          marginTop: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          borderTop: `1px solid ${ledgerColor.darkDivider}`,
          paddingTop: 18,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span
            style={{ fontSize: 11.5, color: ledgerColor.darkTextMuted, letterSpacing: '0.04em' }}
          >
            เงินสด
          </span>
          <span style={{ fontFamily: ledgerFont.mono, fontSize: 19, fontWeight: 500 }}>
            {THB(base.cash)}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span
            style={{ fontSize: 11.5, color: ledgerColor.darkTextMuted, letterSpacing: '0.04em' }}
          >
            ในบัญชี
          </span>
          <span style={{ fontFamily: ledgerFont.mono, fontSize: 19, fontWeight: 500 }}>
            {THB(base.bank)}
          </span>
        </div>
        <div style={{ fontSize: 11.5, color: ledgerColor.darkTextMuted2, lineHeight: 1.5 }}>
          ทำมาแล้ว {base.daysRun} วัน
          <br />
          เริ่ม {fmtFull(data.startDate)}
        </div>
      </div>
    </aside>
  )
}
