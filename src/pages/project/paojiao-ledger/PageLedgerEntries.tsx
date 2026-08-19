import { useMemo, useState } from 'react'
import { filterEntriesByMonth, getMonthChips } from './ledger-calculations'
import { useLedgerContext } from './ledger-context'
import { fmtFull, THB } from './ledger-format'
import { useAddLedgerEntry } from './ledger-query'
import { ledgerColor, ledgerFont } from './ledger-tokens'
import { LedgerEntryDirection } from './ledger-types'
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

const PageLedgerEntries = () => {
  const { data, base } = useLedgerContext()
  const extraEntries = useLedgerStore((s) => s.extraEntries)
  const addEntry = useLedgerStore((s) => s.addEntry)
  const addLedgerEntry = useAddLedgerEntry()

  const lastEntry = base.entries[base.entries.length - 1]
  const [fDate, setFDate] = useState(lastEntry?.date ?? '')
  const [fItem, setFItem] = useState(data.items[0])
  const [fAmount, setFAmount] = useState('')
  const [fNote, setFNote] = useState('')
  const [fDir, setFDir] = useState<LedgerEntryDirection>('outBank')
  const [flash, setFlash] = useState('')
  const [month, setMonth] = useState('all')

  const monthChips = useMemo(() => getMonthChips(base.entries), [base.entries])
  const filtered = useMemo(() => filterEntriesByMonth(base.entries, month), [base.entries, month])
  const visible = useMemo(() => [...filtered].reverse(), [filtered])
  const visibleIn = filtered.reduce((a, e) => a + e.inCash + e.inBank, 0)
  const visibleOut = filtered.reduce((a, e) => a + e.outCash + e.outBank, 0)

  const handleAddEntry = () => {
    const amount = parseFloat(fAmount)
    if (!amount || !fDate) {
      setFlash('ใส่วันที่และจำนวนเงินก่อน')
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
    addEntry({ id: 9000 + extraEntries.length, row: 0, ...entry })
    setFAmount('')
    setFNote('')
    setFlash(`บันทึกแล้ว · ${THB(amount)} บาท`)
    // Persist to the sheet in the background - until Google Sheets is configured (Phase B) this
    // rejects and the entry only lives in this session, same as it did before this endpoint existed.
    // useMutation's mutate() (as opposed to mutateAsync) already swallows/tracks the rejection.
    addLedgerEntry.mutate(entry)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
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
        <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr 160px', gap: 14 }}>
          <LedgerField label="วันที่">
            <input
              type="date"
              value={fDate}
              onChange={(e) => setFDate(e.target.value)}
              style={ledgerInputStyle}
            />
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
        </div>
        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignItems: 'end' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 12.5, color: ledgerColor.textMuted }}>เข้า / ออก</span>
            <div style={{ display: 'flex', gap: 8 }}>
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
          </div>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            type="button"
            onClick={handleAddEntry}
            className="paojiao-ledger-primary-btn"
            style={ledgerPrimaryButtonStyle}
          >
            บันทึกรายการ
          </button>
          <span style={{ fontSize: 13, color: ledgerColor.textFaint }}>{flash}</span>
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
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '118px 1fr 150px 150px 1fr',
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
          <span>หมายเหตุ</span>
        </div>
        {visible.map((e, i) => {
          const vIn = e.inCash + e.inBank
          const vOut = e.outCash + e.outBank
          return (
            <div
              key={e.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '118px 1fr 150px 150px 1fr',
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
              <span style={{ fontSize: 14.5, fontWeight: 500 }}>{e.item}</span>
              <span
                style={{ ...numCellStyle, color: ledgerColor.moneyIn, fontWeight: vIn ? 500 : 400 }}
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
              <span style={{ fontSize: 13, color: ledgerColor.textFaint }}>{e.note}</span>
            </div>
          )
        })}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '118px 1fr 150px 150px 1fr',
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
        </div>
      </section>
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
