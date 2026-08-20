import { useMemo, useState } from 'react'
import { computeWageTotals } from './ledger-calculations'
import { useLedgerContext } from './ledger-context'
import { fmtFull, THB } from './ledger-format'
import { useAddLedgerWage } from './ledger-query'
import { ledgerColor, ledgerFont } from './ledger-tokens'
import { useLedgerStore } from './ledger-store'
import { LedgerCard, LedgerField, LedgerH1 } from './ledger-ui'
import {
  ledgerCardStyle,
  ledgerInputStyle,
  ledgerMonoInputStyle,
  ledgerPrimaryButtonStyle,
} from './ledger-ui-styles'

const PageLedgerWages = () => {
  const { data, base } = useLedgerContext()
  const extraWages = useLedgerStore((s) => s.extraWages)
  const addWage = useLedgerStore((s) => s.addWage)
  const addLedgerWage = useAddLedgerWage()

  const lastEntry = base.entries[base.entries.length - 1]
  const [wDate, setWDate] = useState(lastEntry?.date ?? '')
  const [wAmount, setWAmount] = useState('')

  const allWages = useMemo(() => [...data.wages, ...extraWages], [data.wages, extraWages])
  const { wagePaid, wageTotal } = useMemo(
    () => computeWageTotals(base.entries, allWages),
    [base.entries, allWages]
  )
  // Sort by date, not just insertion order - a backdated wage entry still gets appended at the
  // next sheet row, so a plain reverse() would put it in the wrong place in the list.
  const wageRows = useMemo(
    () => [...allWages].sort((a, b) => b.date.localeCompare(a.date)),
    [allWages]
  )

  const handleAddWage = () => {
    const amount = parseFloat(wAmount)
    if (!wDate || Number.isNaN(amount)) return
    addWage({ date: wDate, amount })
    setWAmount('')
    // Persist to the sheet in the background - until Google Sheets is configured (Phase B) this
    // rejects and the wage only lives in this session, same as it did before this endpoint existed.
    // useMutation's mutate() (as opposed to mutateAsync) already swallows/tracks the rejection.
    addLedgerWage.mutate({ date: wDate, amount })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 26, maxWidth: 720 }}>
      <LedgerH1>ค่าแรง</LedgerH1>

      <LedgerCard style={{ flexDirection: 'row', alignItems: 'end', gap: 14 }}>
        <LedgerField label="วันที่ทำงาน" style={{ width: 170 }}>
          <input
            type="date"
            value={wDate}
            onChange={(e) => setWDate(e.target.value)}
            style={ledgerInputStyle}
          />
        </LedgerField>
        <LedgerField label="จำนวนเงิน" style={{ width: 150 }}>
          <input
            type="number"
            value={wAmount}
            onChange={(e) => setWAmount(e.target.value)}
            placeholder="0"
            style={ledgerMonoInputStyle}
          />
        </LedgerField>
        <button
          type="button"
          onClick={handleAddWage}
          className="paojiao-ledger-primary-btn"
          style={{ ...ledgerPrimaryButtonStyle, padding: '11px 24px' }}
        >
          บันทึก
        </button>
      </LedgerCard>

      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {[
          { label: 'รวมค่าแรงที่ยังไม่จ่าย', value: THB(wageTotal) },
          { label: 'จ่ายค่าแรงยายปิ่นไปแล้ว', value: THB(wagePaid) },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              ...ledgerCardStyle,
              padding: '20px 22px',
              display: 'flex',
              flexDirection: 'column',
              gap: 5,
            }}
          >
            <span style={{ fontSize: 12.5, color: ledgerColor.textMuted }}>{s.label}</span>
            <span style={{ fontFamily: ledgerFont.mono, fontSize: 34, fontWeight: 600 }}>
              {s.value}
            </span>
          </div>
        ))}
      </section>

      <section style={{ ...ledgerCardStyle, overflow: 'hidden' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 140px',
            gap: 12,
            padding: '13px 22px',
            background: ledgerColor.tableHeader,
            fontSize: 12,
            fontWeight: 600,
            color: ledgerColor.textMuted,
            letterSpacing: '0.03em',
          }}
        >
          <span>วันที่</span>
          <span style={{ textAlign: 'right' }}>จำนวนเงิน</span>
        </div>
        {wageRows.map((w, i) => (
          <div
            key={i}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 140px',
              gap: 12,
              padding: '12px 22px',
              borderBottom: `1px solid ${ledgerColor.rowDivider}`,
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: 14.5 }}>{fmtFull(w.date)}</span>
            <span
              style={{
                fontFamily: ledgerFont.mono,
                fontSize: 15,
                textAlign: 'right',
                color: w.amount ? ledgerColor.textPrimary : ledgerColor.disabledNumber,
              }}
            >
              {THB(w.amount)}
            </span>
          </div>
        ))}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 140px',
            gap: 12,
            padding: '15px 22px',
            background: ledgerColor.tableFooter,
            borderTop: `2px solid ${ledgerColor.cardBorder}`,
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600, color: ledgerColor.textMuted }}>รวม</span>
          <span
            style={{
              fontFamily: ledgerFont.mono,
              fontSize: 16,
              fontWeight: 600,
              textAlign: 'right',
            }}
          >
            {THB(wageTotal)}
          </span>
        </div>
      </section>
    </div>
  )
}

export default PageLedgerWages
