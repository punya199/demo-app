import { CSSProperties } from 'react'
import { ledgerColor, ledgerFont } from './ledger-tokens'

export const ledgerCardStyle: CSSProperties = {
  background: ledgerColor.cardSurface,
  border: `1px solid ${ledgerColor.cardBorder}`,
  borderRadius: 14,
}

export const ledgerFieldLabelStyle: CSSProperties = { fontSize: 12.5, color: ledgerColor.textMuted }

export const ledgerInputStyle: CSSProperties = {
  padding: '9px 10px',
  border: `1px solid ${ledgerColor.inputBorder}`,
  borderRadius: 8,
  background: '#FFF',
  fontFamily: ledgerFont.sans,
  fontSize: 14,
  width: '100%',
}

export const ledgerMonoInputStyle: CSSProperties = {
  ...ledgerInputStyle,
  fontFamily: ledgerFont.mono,
  textAlign: 'right',
}

export const ledgerPrimaryButtonStyle: CSSProperties = {
  padding: '11px 26px',
  border: 'none',
  borderRadius: 9,
  background: ledgerColor.darkSurface,
  color: ledgerColor.cardSurface,
  fontSize: 14.5,
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: ledgerFont.sans,
}

export const ledgerPillStyle = (active: boolean): CSSProperties => ({
  padding: '8px 15px',
  borderRadius: 99,
  border: `1px solid ${active ? ledgerColor.darkSurface : ledgerColor.inputBorder}`,
  background: active ? ledgerColor.darkSurface : ledgerColor.cardSurface,
  color: active ? ledgerColor.cardSurface : ledgerColor.textSecondary,
  fontSize: 13.5,
  fontWeight: 500,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  fontFamily: ledgerFont.sans,
})
