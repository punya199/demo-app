import { CSSProperties } from 'react'
import { MdBarChart, MdPayments, MdReceiptLong, MdSavings } from 'react-icons/md'
import { Link, useLocation } from 'react-router-dom'
import { appPath } from '../../../config/app-paths'
import { ledgerColor, ledgerFont } from './ledger-tokens'

const NAV_ITEMS = [
  { path: appPath.paojiaoLedgerEntries(), label: 'รายการ', Icon: MdReceiptLong },
  { path: appPath.paojiaoLedgerSummary(), label: 'สรุปเงิน', Icon: MdBarChart },
  { path: appPath.paojiaoLedgerShare(), label: 'กำไร', Icon: MdSavings },
  { path: appPath.paojiaoLedgerWages(), label: 'ค่าแรง', Icon: MdPayments },
]

// Mobile-only bottom tab bar - the desktop sidebar (LedgerSidebar) is hidden below the
// paojiao-ledger-mobile-breakpoint (see PaojiaoLedgerShell's injected stylesheet) and this
// takes its place instead, since a fixed side column doesn't fit a phone-width screen.
export const LedgerBottomNav = () => {
  const location = useLocation()

  const tabStyle = (active: boolean): CSSProperties => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    flex: 1,
    padding: '8px 4px 6px',
    color: active ? ledgerColor.accent : ledgerColor.darkNavInactive,
    fontFamily: ledgerFont.sans,
    fontSize: 11,
    fontWeight: 500,
  })

  return (
    <nav
      className="paojiao-ledger-bottom-nav"
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        height: 70,
        display: 'none',
        background: ledgerColor.darkSurface,
        borderTop: `1px solid ${ledgerColor.darkDivider}`,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        zIndex: 20,
        alignItems: 'center',
      }}
    >
      {NAV_ITEMS.map(({ path, label, Icon }) => {
        const active = location.pathname === path
        return (
          <Link key={path} to={path} style={tabStyle(active)}>
            <Icon size={22} />
            <span>{label}</span>
          </Link>
        )
      })}
      <Link
        to={appPath.home()}
        style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '6px 4px' }}
      >
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: ledgerColor.accent,
            color: ledgerColor.cardSurface,
            fontFamily: ledgerFont.sans,
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          Y
        </span>
      </Link>
    </nav>
  )
}
