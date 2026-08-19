import { CSSProperties, PropsWithChildren } from 'react'
import { ledgerCardStyle, ledgerFieldLabelStyle } from './ledger-ui-styles'

export const LedgerCard = ({ children, style }: PropsWithChildren<{ style?: CSSProperties }>) => (
  <section
    style={{
      ...ledgerCardStyle,
      padding: '22px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 18,
      ...style,
    }}
  >
    {children}
  </section>
)

export const LedgerField = ({
  label,
  children,
  style,
}: PropsWithChildren<{ label: string; style?: CSSProperties }>) => (
  <label style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
    <span style={ledgerFieldLabelStyle}>{label}</span>
    {children}
  </label>
)

export const LedgerH1 = ({ children }: PropsWithChildren) => (
  <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em' }}>{children}</h1>
)
