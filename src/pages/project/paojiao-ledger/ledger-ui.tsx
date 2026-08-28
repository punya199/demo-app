import { CSSProperties, PropsWithChildren } from 'react'
import { IconType } from 'react-icons'
import { ledgerColor } from './ledger-tokens'
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
  labelStyle,
  className,
}: PropsWithChildren<{
  label: string
  style?: CSSProperties
  labelStyle?: CSSProperties
  className?: string
}>) => (
  <label
    className={className}
    style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}
  >
    <span style={{ ...ledgerFieldLabelStyle, ...labelStyle }}>{label}</span>
    {children}
  </label>
)

export const LedgerH1 = ({ children }: PropsWithChildren) => (
  <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em' }}>{children}</h1>
)

// Shared "nothing here yet" panel - icon + a friendlier line than a bare "ยังไม่มีข้อมูล" string,
// used wherever a table/list/chart can legitimately have zero rows (an empty filter result isn't
// an error state, so this stays calm rather than alarming). `compact` shrinks the padding/icon for
// tight spots (e.g. inside a card that already has a max-height, like the withdrawal history list).
export const LedgerEmptyState = ({
  icon: Icon,
  title,
  subtitle,
  compact,
}: {
  icon: IconType
  title: string
  subtitle?: string
  compact?: boolean
}) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: compact ? 4 : 8,
      padding: compact ? '18px 12px' : '44px 20px',
      textAlign: 'center',
    }}
  >
    <Icon size={compact ? 22 : 32} color={ledgerColor.disabledNumber} />
    <span
      style={{ fontSize: compact ? 13 : 14.5, fontWeight: 600, color: ledgerColor.textSecondary }}
    >
      {title}
    </span>
    {subtitle && (
      <span style={{ fontSize: compact ? 11.5 : 12.5, color: ledgerColor.textFaint }}>
        {subtitle}
      </span>
    )}
  </div>
)
