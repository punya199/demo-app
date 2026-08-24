import { message } from 'antd'
import { useMemo, useState } from 'react'
import { computeWageTotals } from './ledger-calculations'
import { useLedgerContext } from './ledger-context'
import { EditWageFormValues, EditWageModal } from './EditWageModal'
import { fmtFull, THB, thbSigned } from './ledger-format'
import { LedgerDatePicker } from './LedgerDatePicker'
import { useAddLedgerWage, useDeleteLedgerWage, useEditLedgerWage } from './ledger-query'
import { ledgerColor, ledgerFont } from './ledger-tokens'
import { useLedgerStore } from './ledger-store'
import { LedgerWage } from './ledger-types'
import { LedgerCard, LedgerField, LedgerH1 } from './ledger-ui'
import { ledgerCardStyle, ledgerMonoInputStyle, ledgerPrimaryButtonStyle } from './ledger-ui-styles'

const rowActionStyle = {
  border: `1px solid ${ledgerColor.inputBorder}`,
  background: ledgerColor.cardSurface,
  borderRadius: 99,
  padding: '4px 12px',
  fontSize: 12,
  fontWeight: 500,
  fontFamily: ledgerFont.sans,
  color: ledgerColor.textSecondary,
  cursor: 'pointer',
}

const PageLedgerWages = () => {
  const { data, base } = useLedgerContext()
  const extraWages = useLedgerStore((s) => s.extraWages)
  const addWage = useLedgerStore((s) => s.addWage)
  const removeExtraWage = useLedgerStore((s) => s.removeExtraWage)
  const addLedgerWage = useAddLedgerWage()
  const editLedgerWage = useEditLedgerWage()
  const deleteLedgerWage = useDeleteLedgerWage()

  const lastEntry = base.entries[base.entries.length - 1]
  const [wDate, setWDate] = useState(lastEntry?.date ?? '')
  const [wAmount, setWAmount] = useState('')
  const [editingWage, setEditingWage] = useState<LedgerWage | null>(null)

  const allWages = useMemo(() => [...data.wages, ...extraWages], [data.wages, extraWages])
  const { wagePaid, wageTotal, wageUnpaid } = useMemo(
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
    const tempId = 9000 + extraWages.length
    addWage({ tempId, date: wDate, amount })
    setWAmount('')
    // Persist to the sheet in the background - until Google Sheets is configured (Phase B) this
    // rejects and the wage only lives in this session, same as it did before this endpoint existed.
    // On success, clear the optimistic copy so it doesn't show twice once the refetched real
    // sheet data (triggered by the mutation's own invalidation) includes it too.
    addLedgerWage.mutate({ date: wDate, amount }, { onSuccess: () => removeExtraWage(tempId) })
  }

  const handleEditSave = (row: number, values: EditWageFormValues) => {
    editLedgerWage.mutate(
      { row, wage: values },
      {
        onSuccess: () => message.success(`แก้ไขแล้ว · ${THB(values.amount)} บาท`),
        onError: () => message.error('แก้ไขไม่สำเร็จ ลองใหม่อีกครั้ง'),
      }
    )
  }

  const handleDeleteWage = (row: number) => {
    deleteLedgerWage.mutate(row, {
      onSuccess: () => message.success('ลบรายการแล้ว'),
      onError: () => message.error('ลบไม่สำเร็จ ลองใหม่อีกครั้ง'),
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 26, maxWidth: 720 }}>
      <LedgerH1>ค่าแรง</LedgerH1>

      <LedgerCard style={{ flexDirection: 'row', alignItems: 'end', gap: 14 }}>
        <LedgerField label="วันที่ทำงาน" style={{ width: 150 }}>
          <LedgerDatePicker value={wDate} onChange={setWDate} />
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
          // thbSigned, not THB - wageUnpaid can go negative (paid out more than what's logged as
          // earned, e.g. payment posted before that day's wage row), so it needs the typographic
          // minus every other signed figure in the ledger uses, not a bare digit string.
          { label: 'รวมค่าแรงที่ยังไม่จ่าย', value: thbSigned(wageUnpaid) },
          { label: 'จ่ายค่าแรงไปแล้ว', value: THB(wagePaid) },
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
            gridTemplateColumns: '1fr 140px 70px',
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
          <span />
        </div>
        {wageRows.map((w, i) => (
          <div
            key={w.row > 0 ? w.row : `local-${i}`}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 140px 70px',
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
            {w.row > 0 ? (
              <div style={{ textAlign: 'center' }}>
                <button type="button" onClick={() => setEditingWage(w)} style={rowActionStyle}>
                  แก้ไข
                </button>
              </div>
            ) : (
              <span style={{ fontSize: 11, color: ledgerColor.textFaint, textAlign: 'center' }}>
                กำลังบันทึก...
              </span>
            )}
          </div>
        ))}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 140px 70px',
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
          <span />
        </div>
      </section>

      <EditWageModal
        open={editingWage !== null}
        wage={editingWage}
        onSave={handleEditSave}
        onClose={() => setEditingWage(null)}
        onDelete={handleDeleteWage}
      />
    </div>
  )
}

export default PageLedgerWages
