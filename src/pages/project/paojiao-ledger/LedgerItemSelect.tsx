import { useEffect, useRef, useState } from 'react'
import { ledgerColor, ledgerFont } from './ledger-tokens'
import { ledgerInputStyle } from './ledger-ui-styles'

// Custom dropdown instead of a native <select> - a native select's own popup can't be animated
// or carry a trailing "จัดการหมวดหมู่" action row, so this rebuilds just enough of one by hand.
const DROP_KEYFRAMES = `
@keyframes ledgerItemSelectDrop {
  from { opacity: 0; transform: translateY(-6px) scaleY(0.97); }
  to { opacity: 1; transform: translateY(0) scaleY(1); }
}
.ledger-item-option:hover, .ledger-item-manage:hover {
  background: ${ledgerColor.tableHeader} !important;
}
`

interface LedgerItemSelectProps {
  // Optional, like DirectionPicker in EditEntryModal.tsx - AntD's Form.Item injects its own
  // value/onChange when this is used as a Form child, overriding whatever's passed here.
  value?: string
  items: string[]
  onChange?: (value: string) => void
  onManageClick: () => void
}

export const LedgerItemSelect = ({
  value,
  items,
  onChange,
  onManageClick,
}: LedgerItemSelectProps) => {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  return (
    <div ref={rootRef} style={{ position: 'relative' }}>
      <style>{DROP_KEYFRAMES}</style>
      {/* Not a <button> - LedgerField wraps this in a <label>, and a browser implicitly re-fires
          a click on the first button/input nested in a clicked label. That silently re-toggled
          this open right back after an item's own onClick had just closed it. A div with
          role="button" isn't a labelable element, so it's exempt from that forwarding. */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setOpen((o) => !o)
          }
        }}
        style={{
          ...ledgerInputStyle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          textAlign: 'left',
          borderColor: open ? ledgerColor.accent : ledgerColor.inputBorder,
          transition: 'border-color 0.15s ease',
        }}
      >
        <span
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            minWidth: 0,
          }}
        >
          {value || 'เลือกรายการ'}
        </span>
        <span
          style={{
            marginLeft: 8,
            flexShrink: 0,
            color: ledgerColor.textFaint,
            display: 'inline-block',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.18s ease',
            fontSize: 11,
          }}
        >
          ▾
        </span>
      </div>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            zIndex: 20,
            background: ledgerColor.cardSurface,
            border: `1px solid ${ledgerColor.cardBorder}`,
            borderRadius: 10,
            boxShadow: '0 10px 28px rgba(26, 25, 23, 0.14)',
            maxHeight: 440, // ~10 item rows plus the "จัดการหมวดหมู่" row before it needs to scroll
            overflowY: 'auto',
            animation: 'ledgerItemSelectDrop 0.16s ease',
            transformOrigin: 'top',
          }}
        >
          {items.map((it) => (
            <div
              key={it}
              className="ledger-item-option"
              onClick={() => {
                onChange?.(it)
                setOpen(false)
              }}
              style={{
                padding: '9px 14px',
                fontSize: 14,
                fontFamily: ledgerFont.sans,
                cursor: 'pointer',
                background: it === value ? ledgerColor.tableHeader : 'transparent',
                fontWeight: it === value ? 600 : 400,
                transition: 'background-color 0.1s ease',
              }}
            >
              {it}
            </div>
          ))}
          <div
            className="ledger-item-manage"
            onClick={() => {
              onManageClick()
              setOpen(false)
            }}
            style={{
              padding: '10px 14px',
              fontSize: 13,
              fontWeight: 600,
              color: ledgerColor.accent,
              cursor: 'pointer',
              borderTop: `1px solid ${ledgerColor.rowDivider}`,
              position: 'sticky',
              bottom: 0,
              background: ledgerColor.cardSurface,
              transition: 'background-color 0.1s ease',
            }}
          >
            จัดการหมวดหมู่
          </div>
        </div>
      )}
    </div>
  )
}
