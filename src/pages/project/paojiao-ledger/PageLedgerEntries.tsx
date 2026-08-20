import { message } from 'antd'
import dayjs from 'dayjs'
import { CSSProperties, useMemo, useState } from 'react'
import { filterEntriesByMonth, getMonthChips } from './ledger-calculations'
import { useLedgerContext } from './ledger-context'
import { EditEntryFormValues, EditEntryModal } from './EditEntryModal'
import { fmtFull, THB } from './ledger-format'
import { LedgerDatePicker } from './LedgerDatePicker'
import { useAddLedgerEntry, useEditLedgerEntry } from './ledger-query'
import { ledgerColor, ledgerFont } from './ledger-tokens'
import { LedgerEntry, LedgerEntryDirection } from './ledger-types'
import { useLedgerStore } from './ledger-store'
import { LedgerCard, LedgerField, LedgerH1 } from './ledger-ui'
import {
  ledgerInputStyle,
  ledgerMonoInputStyle,
  ledgerPillStyle,
  ledgerPrimaryButtonStyle,
} from './ledger-ui-styles'

const DIR_OPTIONS: { dir: LedgerEntryDirection; label: string }[] = [
  { dir: 'inCash', label: 'เข้า · เงินสด' },
  { dir: 'inBank', label: 'เข้า · บัญชี' },
  { dir: 'outCash', label: 'ออก · เงินสด' },
  { dir: 'outBank', label: 'ออก · บัญชี' },
]

const numCellStyle = { fontFamily: ledgerFont.mono, fontSize: 15, textAlign: 'right' as const }
// วันที่ 100 / รายการ 150 (fixed, ellipsis-truncated if longer) / เงินเข้า+เงินออก 75 each /
// หมายเหตุ flexible (minmax(0,1fr) - a plain 1fr won't shrink below its content's width, which
// is what let the item/note cells wrap ugly one-word-per-line at in-between widths) / จัดการ 50.
const ROW_TEMPLATE = '100px 150px 75px 75px 70px minmax(0, 1fr) 50px'
const truncateStyle: CSSProperties = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}

const rowActionStyle: CSSProperties = {
  border: 'none',
  background: 'none',
  padding: 0,
  fontSize: 12.5,
  fontWeight: 500,
  fontFamily: ledgerFont.sans,
  color: ledgerColor.accent,
  cursor: 'pointer',
  textDecoration: 'underline',
}

const PageLedgerEntries = () => {
  const { data, base } = useLedgerContext()
  const extraEntries = useLedgerStore((s) => s.extraEntries)
  const addEntry = useLedgerStore((s) => s.addEntry)
  const removeExtraEntry = useLedgerStore((s) => s.removeExtraEntry)
  const addLedgerEntry = useAddLedgerEntry()
  const editLedgerEntry = useEditLedgerEntry()

  const [fDate, setFDate] = useState(dayjs().format('YYYY-MM-DD'))
  const [fItem, setFItem] = useState(data.items[0])
  const [fAmount, setFAmount] = useState('')
  const [fNote, setFNote] = useState('')
  const [fDir, setFDir] = useState<LedgerEntryDirection>('outBank')
  const [month, setMonth] = useState('all')
  const [editingEntry, setEditingEntry] = useState<LedgerEntry | null>(null)

  const monthChips = useMemo(() => getMonthChips(base.entries), [base.entries])
  const filtered = useMemo(() => filterEntriesByMonth(base.entries, month), [base.entries, month])
  // Sort by date, not just row order - an entry logged for an earlier date still gets appended
  // at the next sheet row (rows track when it was entered, not what date it's for), so a plain
  // reverse() puts it in the wrong place whenever an entry is backdated.
  const visible = useMemo(
    () => [...filtered].sort((a, b) => b.date.localeCompare(a.date) || b.row - a.row),
    [filtered]
  )
  const visibleIn = filtered.reduce((a, e) => a + e.inCash + e.inBank, 0)
  const visibleOut = filtered.reduce((a, e) => a + e.outCash + e.outBank, 0)

  const handleSubmit = () => {
    const amount = parseFloat(fAmount)
    if (!amount || !fDate) {
      message.warning('ใส่วันที่และจำนวนเงินก่อน')
      return
    }
    const entry = {
      date: fDate,
      item: fItem,
      inCash: 0,
      inBank: 0,
      outCash: 0,
      outBank: 0,
      note: fNote,
      [fDir]: amount,
    }
    const tempId = 9000 + extraEntries.length
    addEntry({ id: tempId, row: 0, ...entry })
    setFAmount('')
    setFNote('')
    message.success(`บันทึกแล้ว · ${THB(amount)} บาท`)
    // Persist to the sheet in the background - until Google Sheets is configured (Phase B) this
    // rejects and the entry only lives in this session, same as it did before this endpoint existed.
    addLedgerEntry.mutate(entry, { onSuccess: () => removeExtraEntry(tempId) })
  }

  const handleEditSave = (row: number, values: EditEntryFormValues) => {
    const entry = {
      date: values.date,
      item: values.item,
      inCash: 0,
      inBank: 0,
      outCash: 0,
      outBank: 0,
      note: values.note,
      [values.dir]: values.amount,
    }
    editLedgerEntry.mutate(
      { row, entry },
      {
        onSuccess: () => message.success(`แก้ไขแล้ว · ${THB(values.amount)} บาท`),
        onError: () => message.error('แก้ไขไม่สำเร็จ ลองใหม่อีกครั้ง'),
      }
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 26,
        maxWidth: 800,
        margin: '0 auto',
        width: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 20,
        }}
      >
        <LedgerH1>รายการ</LedgerH1>
        <div style={{ fontSize: 13.5, color: ledgerColor.textMuted }}>เรียงจากใหม่ไปเก่า</div>
      </div>

      <LedgerCard>
        <div style={{ fontSize: 15, fontWeight: 600 }}>เพิ่มรายการ</div>
        <div
          className="paojiao-ledger-add-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '130px 150px 140px 1fr',
            gap: 14,
          }}
        >
          <LedgerField label="วันที่">
            <LedgerDatePicker value={fDate} onChange={setFDate} />
          </LedgerField>
          <LedgerField label="รายการ">
            <select
              value={fItem}
              onChange={(e) => setFItem(e.target.value)}
              style={ledgerInputStyle}
            >
              {data.items.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </LedgerField>
          <LedgerField label="จำนวนเงิน">
            <input
              type="number"
              value={fAmount}
              onChange={(e) => setFAmount(e.target.value)}
              placeholder="0"
              style={ledgerMonoInputStyle}
            />
          </LedgerField>
          <LedgerField label="หมายเหตุ">
            <input
              type="text"
              value={fNote}
              onChange={(e) => setFNote(e.target.value)}
              placeholder="ไม่ใส่ก็ได้"
              style={ledgerInputStyle}
            />
          </LedgerField>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 12.5, color: ledgerColor.textMuted }}>เข้า / ออก</span>
          <div
            className="paojiao-ledger-dir-row"
            style={{ display: 'flex', alignItems: 'stretch', gap: 14 }}
          >
            <div
              className="paojiao-ledger-pills-grid"
              style={{ display: 'flex', gap: 8, flexShrink: 0 }}
            >
              {DIR_OPTIONS.map((opt) => (
                <button
                  key={opt.dir}
                  type="button"
                  onClick={() => setFDir(opt.dir)}
                  style={ledgerPillStyle(fDir === opt.dir)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              className="paojiao-ledger-primary-btn paojiao-ledger-submit-btn"
              style={{ ...ledgerPrimaryButtonStyle, marginLeft: 'auto', flexShrink: 0 }}
            >
              บันทึกรายการ
            </button>
          </div>
        </div>
      </LedgerCard>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        {monthChips.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => setMonth(m.key)}
            style={ledgerPillStyle(month === m.key)}
          >
            {m.label}
          </button>
        ))}
      </div>

      <section style={{ ...LedgerCardOverflowStyle }}>
        <div className="paojiao-ledger-table-desktop">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: ROW_TEMPLATE,
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
            <span>รายการ</span>
            <span style={{ textAlign: 'right' }}>เงินเข้า</span>
            <span style={{ textAlign: 'right' }}>เงินออก</span>
            <span style={{ textAlign: 'center' }}>รูปแบบ</span>
            <span>หมายเหตุ</span>
            <span style={{ textAlign: 'center' }}>จัดการ</span>
          </div>
          {visible.map((e, i) => {
            const vIn = e.inCash + e.inBank
            const vOut = e.outCash + e.outBank
            const isSynced = e.row > 0
            // Usually just one, but a cash<->bank transfer entry has both sides at once.
            const formats = [
              e.inCash > 0 || e.outCash > 0 ? 'เงินสด' : null,
              e.inBank > 0 || e.outBank > 0 ? 'บัญชี' : null,
            ].filter((f): f is string => f !== null)
            return (
              <div
                key={e.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: ROW_TEMPLATE,
                  gap: 12,
                  padding: '11px 22px',
                  borderBottom: `1px solid ${ledgerColor.rowDivider}`,
                  background: i % 2 ? ledgerColor.cardSurface : ledgerColor.cardSurfaceAlt,
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    fontFamily: ledgerFont.mono,
                    fontSize: 13.5,
                    color: ledgerColor.textMuted,
                  }}
                >
                  {fmtFull(e.date)}
                </span>
                <span style={{ fontSize: 14.5, fontWeight: 500, ...truncateStyle }} title={e.item}>
                  {e.item}
                </span>
                <span
                  style={{
                    ...numCellStyle,
                    color: ledgerColor.moneyIn,
                    fontWeight: vIn ? 500 : 400,
                  }}
                >
                  {vIn ? THB(vIn) : ''}
                </span>
                <span
                  style={{
                    ...numCellStyle,
                    color: ledgerColor.moneyOut,
                    fontWeight: vOut ? 500 : 400,
                  }}
                >
                  {vOut ? THB(vOut) : ''}
                </span>
                <span style={{ fontSize: 13, color: ledgerColor.textFaint, textAlign: 'center' }}>
                  {formats.join(' / ')}
                </span>
                <span
                  style={{ fontSize: 13, color: ledgerColor.textFaint, ...truncateStyle }}
                  title={e.note}
                >
                  {e.note}
                </span>
                {isSynced ? (
                  <div style={{ textAlign: 'center' }}>
                    <button type="button" onClick={() => setEditingEntry(e)} style={rowActionStyle}>
                      แก้ไข
                    </button>
                  </div>
                ) : (
                  <span style={{ fontSize: 12, color: ledgerColor.textFaint, textAlign: 'center' }}>
                    กำลังบันทึก...
                  </span>
                )}
              </div>
            )
          })}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: ROW_TEMPLATE,
              gap: 12,
              padding: '15px 22px',
              borderTop: `2px solid ${ledgerColor.cardBorder}`,
              background: ledgerColor.tableFooter,
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: ledgerColor.textMuted }}>รวม</span>
            <span style={{ fontSize: 13, color: ledgerColor.textFaint }}>
              {visible.length} รายการ
            </span>
            <span
              style={{
                fontFamily: ledgerFont.mono,
                fontSize: 15,
                fontWeight: 600,
                textAlign: 'right',
                color: ledgerColor.moneyIn,
              }}
            >
              {THB(visibleIn)}
            </span>
            <span
              style={{
                fontFamily: ledgerFont.mono,
                fontSize: 15,
                fontWeight: 600,
                textAlign: 'right',
                color: ledgerColor.moneyOut,
              }}
            >
              {THB(visibleOut)}
            </span>
            <span />
            <span />
            <span />
          </div>
        </div>

        <div className="paojiao-ledger-table-mobile" style={{ display: 'none' }}>
          {visible.map((e, i) => {
            // Usually exactly one of these four is non-zero, but a cash<->bank transfer entry
            // (e.g. "ถอนเงิน") can have both an in and an out side at once - show every side
            // that's actually non-zero rather than picking just one and silently dropping the
            // other.
            const moneyLines = [
              { amount: e.inCash, label: 'เงินสดเข้า', color: ledgerColor.moneyIn },
              { amount: e.inBank, label: 'เงินเข้าบัญชี', color: ledgerColor.moneyIn },
              { amount: e.outCash, label: 'เงินสดจ่าย', color: ledgerColor.moneyOut },
              { amount: e.outBank, label: 'เงินออกบัญชี', color: ledgerColor.moneyOut },
            ].filter((line) => line.amount > 0)
            const isSynced = e.row > 0
            return (
              <div
                key={e.id}
                style={{
                  padding: '10px 16px',
                  borderBottom: `1px solid ${ledgerColor.rowDivider}`,
                  background: i % 2 ? ledgerColor.cardSurface : ledgerColor.cardSurfaceAlt,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    gap: 10,
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 500, minWidth: 0 }}>
                    <span
                      style={{
                        fontFamily: ledgerFont.mono,
                        fontSize: 12.5,
                        color: ledgerColor.textMuted,
                        marginRight: 8,
                      }}
                    >
                      {fmtFull(e.date)}
                    </span>
                    {e.item}
                  </span>
                  {isSynced ? (
                    <button
                      type="button"
                      onClick={() => setEditingEntry(e)}
                      style={{ ...rowActionStyle, flexShrink: 0 }}
                    >
                      แก้ไข
                    </button>
                  ) : (
                    <span style={{ fontSize: 11, color: ledgerColor.textFaint, flexShrink: 0 }}>
                      กำลังบันทึก...
                    </span>
                  )}
                </div>
                {moneyLines.map((line, idx) => (
                  <div
                    key={line.label}
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      justifyContent: 'space-between',
                      gap: 10,
                    }}
                  >
                    <span
                      style={{ fontFamily: ledgerFont.mono, fontSize: 14.5, color: line.color }}
                    >
                      {line.label} {THB(line.amount)} บาท
                    </span>
                    {idx === 0 && e.note && (
                      <span style={{ fontSize: 12, color: ledgerColor.textFaint }}>{e.note}</span>
                    )}
                  </div>
                ))}
              </div>
            )
          })}
          <div
            style={{
              padding: '12px 16px',
              borderTop: `2px solid ${ledgerColor.cardBorder}`,
              background: ledgerColor.tableFooter,
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 13,
            }}
          >
            <span style={{ fontWeight: 600, color: ledgerColor.textMuted }}>
              รวม {visible.length} รายการ
            </span>
            <span style={{ fontFamily: ledgerFont.mono, fontWeight: 600 }}>
              <span style={{ color: ledgerColor.moneyIn }}>{THB(visibleIn)}</span>
              {' / '}
              <span style={{ color: ledgerColor.moneyOut }}>{THB(visibleOut)}</span>
            </span>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .paojiao-ledger-add-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .paojiao-ledger-table-desktop {
            display: none !important;
          }
          .paojiao-ledger-table-mobile {
            display: block !important;
          }
          /* Not enough room for a single row of 4 pills plus the button on a narrow phone -
             below this width the pills fold into a 2x2 grid and the button drops to its own
             full-width row. iPad and up (>= this breakpoint) keeps everything on one row. */
          .paojiao-ledger-dir-row {
            flex-direction: column !important;
          }
          .paojiao-ledger-pills-grid {
            display: grid !important;
            grid-template-columns: repeat(2, max-content) !important;
          }
          .paojiao-ledger-submit-btn {
            width: 100% !important;
            margin-left: 0 !important;
          }
        }
      `}</style>

      <EditEntryModal
        open={editingEntry !== null}
        entry={editingEntry}
        items={data.items}
        onSave={handleEditSave}
        onClose={() => setEditingEntry(null)}
      />
    </div>
  )
}

const LedgerCardOverflowStyle = {
  background: ledgerColor.cardSurface,
  border: `1px solid ${ledgerColor.cardBorder}`,
  borderRadius: 14,
  overflow: 'hidden' as const,
}

export default PageLedgerEntries
