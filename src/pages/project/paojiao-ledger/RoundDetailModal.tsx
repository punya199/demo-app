import { Modal } from 'antd'
import { useMemo } from 'react'
import { fmtFull, THB } from './ledger-format'
import { ledgerColor, ledgerFont } from './ledger-tokens'
import { LedgerEntry, LedgerRound } from './ledger-types'

interface RoundDetailModalProps {
  round: LedgerRound | null
  entries: LedgerEntry[]
  onClose: () => void
}

// Read-only, no Form - the round-closing bar charts open this to show what's inside one round's
// row block (see the README's "rounds are row blocks, not date ranges" spec), which the bar
// itself only summarizes as a single profit number.
export const RoundDetailModal = ({ round, entries, onClose }: RoundDetailModalProps) => {
  const rows = useMemo(
    () => (round ? entries.filter((e) => e.row >= round.fromRow && e.row <= round.toRow) : []),
    [round, entries]
  )
  const periodIn = rows.reduce((a, e) => a + e.inCash + e.inBank, 0)
  const periodOut = rows.reduce((a, e) => a + e.outCash + e.outBank, 0)
  const isLoss = (round?.profit ?? 0) < 0

  return (
    <Modal
      title={round ? `รอบปิด ${fmtFull(round.date)}` : ''}
      open={!!round}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
    >
      {round && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', gap: 30, flexWrap: 'wrap' }}>
            {[
              {
                label: 'กำไร',
                value: THB(round.profit),
                color: isLoss ? ledgerColor.moneyOut : ledgerColor.moneyIn,
              },
              { label: 'เงินได้', value: THB(periodIn), color: ledgerColor.moneyIn },
              { label: 'เงินจ่าย', value: THB(periodOut), color: ledgerColor.moneyOut },
            ].map((f) => (
              <div key={f.label} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 12, color: ledgerColor.textMuted }}>{f.label}</span>
                <span
                  style={{
                    fontFamily: ledgerFont.mono,
                    fontSize: 22,
                    fontWeight: 600,
                    color: f.color,
                  }}
                >
                  {f.value}
                </span>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 12, color: ledgerColor.textFaint }}>
            {rows.length} รายการ · แถว {round.fromRow}-{round.toRow}
          </div>

          <div
            style={{
              maxHeight: 340,
              overflowY: 'auto',
              border: `1px solid ${ledgerColor.rowDivider}`,
              borderRadius: 10,
            }}
          >
            {rows.map((e) => {
              const inAmount = e.inCash + e.inBank
              const outAmount = e.outCash + e.outBank
              return (
                <div
                  key={e.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '70px 1fr 90px',
                    gap: 10,
                    alignItems: 'center',
                    padding: '9px 14px',
                    borderBottom: `1px solid ${ledgerColor.rowDivider}`,
                  }}
                >
                  <span
                    style={{
                      fontFamily: ledgerFont.mono,
                      fontSize: 12.5,
                      color: ledgerColor.textMuted,
                    }}
                  >
                    {fmtFull(e.date)}
                  </span>
                  <span style={{ fontSize: 13.5, minWidth: 0, overflow: 'hidden' }}>
                    <div style={{ fontWeight: 500 }}>{e.item}</div>
                    {e.note && (
                      <div style={{ fontSize: 11.5, color: ledgerColor.textFaint }}>{e.note}</div>
                    )}
                  </span>
                  <span
                    style={{
                      fontFamily: ledgerFont.mono,
                      fontSize: 13.5,
                      fontWeight: 500,
                      textAlign: 'right',
                      color: inAmount ? ledgerColor.moneyIn : ledgerColor.moneyOut,
                    }}
                  >
                    {inAmount ? `+${THB(inAmount)}` : `−${THB(outAmount)}`}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </Modal>
  )
}
