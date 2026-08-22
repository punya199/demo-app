import { message } from 'antd'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'
import { computeShares } from './ledger-calculations'
import { useLedgerContext } from './ledger-context'
import { LedgerDatePicker } from './LedgerDatePicker'
import { THB, thbSigned } from './ledger-format'
import { useAddLedgerWithdrawal } from './ledger-query'
import { ledgerColor, ledgerFont } from './ledger-tokens'
import { useLedgerStore } from './ledger-store'
import { LedgerCard, LedgerField, LedgerH1 } from './ledger-ui'
import {
  ledgerCardStyle,
  ledgerFieldLabelStyle,
  ledgerInputStyle,
  ledgerMonoInputStyle,
  ledgerPillStyle,
  ledgerPrimaryButtonStyle,
} from './ledger-ui-styles'
import { LedgerPerson } from './ledger-types'

// This page shows large baht totals where cents aren't meaningful to the user - round to whole
// baht for every figure here (same convention as PageLedgerSummary).
const THB0 = (n: number) => THB(Math.round(n))
const thbSigned0 = (n: number) => thbSigned(Math.round(n))

const PEOPLE: LedgerPerson[] = ['น้าปุ้ม', 'ปัญญา']
// "บัญชี" not "โอน/บัญชี" - the longer label didn't fit its half of the 150px "รูปแบบเงิน" column
// alongside "เงินสด" at nowrap, and pushed the pill past the column into "จำนวนเงิน"'s space.
const PAYMENT_OPTIONS: { key: 'cash' | 'bank'; label: string }[] = [
  { key: 'cash', label: 'เงินสด' },
  { key: 'bank', label: 'บัญชี' },
]

const PageLedgerShare = () => {
  const { data, base } = useLedgerContext()
  const ratio = useLedgerStore((s) => s.ratio)
  const setRatio = useLedgerStore((s) => s.setRatio)
  const addWithdrawal = useAddLedgerWithdrawal()

  const [fWho, setFWho] = useState<LedgerPerson>(PEOPLE[0])
  const [fDate, setFDate] = useState(dayjs().format('YYYY-MM-DD'))
  const [fType, setFType] = useState<'cash' | 'bank'>('bank')
  const [fAmount, setFAmount] = useState('')
  const [fNote, setFNote] = useState('')

  const people = useMemo(
    () => computeShares(data, base.profitAll, ratio),
    [data, base.profitAll, ratio]
  )
  const perDayAll = base.profitAll / base.daysRun
  const takenAll = people.reduce((a, p) => a + p.taken, 0)
  const leftAll = base.profitAll - takenAll

  const handleSubmit = () => {
    const amount = parseFloat(fAmount)
    if (!amount || !fDate) {
      message.warning('ใส่วันที่และจำนวนเงินก่อน')
      return
    }
    addWithdrawal.mutate(
      {
        who: fWho,
        date: fDate,
        cash: fType === 'cash' ? amount : 0,
        bank: fType === 'bank' ? amount : 0,
        note: fNote,
      },
      {
        onSuccess: () => {
          setFAmount('')
          setFNote('')
          message.success(`บันทึกการถอนแล้ว · ${THB(amount)} บาท`)
        },
        onError: () => message.error('บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง'),
      }
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
      <LedgerH1>กำไร &amp; ยอดถอน</LedgerH1>

      <section
        style={{
          background: ledgerColor.darkSurface,
          color: ledgerColor.cardSurface,
          borderRadius: 14,
          padding: '26px 28px',
          display: 'flex',
          gap: 46,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 12.5, color: ledgerColor.darkTextMuted }}>กำไรทั้งหมด</span>
          <span
            style={{ fontFamily: ledgerFont.mono, fontSize: 42, fontWeight: 600, lineHeight: 1 }}
          >
            {THB(base.profitAll)}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 12.5, color: ledgerColor.darkTextMuted }}>ต่อวัน</span>
          <span
            style={{ fontFamily: ledgerFont.mono, fontSize: 42, fontWeight: 600, lineHeight: 1 }}
          >
            {THB(perDayAll)}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 12.5, color: ledgerColor.darkTextMuted }}>ถอนไปแล้วทั้งหมด</span>
          <span
            style={{ fontFamily: ledgerFont.mono, fontSize: 42, fontWeight: 600, lineHeight: 1 }}
          >
            {THB(takenAll)}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 12.5, color: ledgerColor.darkTextMuted }}>ยังไม่ถอน</span>
          <span
            style={{
              fontFamily: ledgerFont.mono,
              fontSize: 42,
              fontWeight: 600,
              lineHeight: 1,
              color: ledgerColor.profitHighlightOnDark,
            }}
          >
            {THB(leftAll)}
          </span>
        </div>
      </section>

      <section
        style={{
          ...ledgerCardStyle,
          padding: '13px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <span style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap' }}>
          สัดส่วนแบ่งกำไร
        </span>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={ratio}
          onChange={(e) => setRatio(+e.target.value)}
          style={{ flex: 1, accentColor: ledgerColor.accent }}
        />
        <span
          style={{
            fontFamily: ledgerFont.mono,
            fontSize: 12.5,
            color: ledgerColor.textMuted,
            whiteSpace: 'nowrap',
          }}
        >
          {ratio} : {100 - ratio}
        </span>
      </section>

      <LedgerCard>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: 20, fontWeight: 700 }}>เพิ่มรายการถอน</span>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={addWithdrawal.isPending}
            style={ledgerPrimaryButtonStyle}
          >
            บันทึกการถอน
          </button>
        </div>
        <div
          className="paojiao-ledger-withdraw-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '150px 130px 150px 140px minmax(0, 1fr)',
            gap: 14,
          }}
        >
          {/* Plain div+span, not LedgerField - LedgerField wraps its child in a <label>, and a
              <label> around multiple <button>s risks the same implicit click-forwarding gotcha
              documented on LedgerItemSelect (clicking one descendant can silently re-click the
              label's first labelable child). PageLedgerEntries' direction-picker pills use this
              same plain-div pattern for the same reason. */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={ledgerFieldLabelStyle}>ใครเป็นคนถอน</span>
            <div style={{ display: 'flex', gap: 8 }}>
              {PEOPLE.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setFWho(p)}
                  style={{ ...ledgerPillStyle(fWho === p), flex: 1 }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <LedgerField label="วันที่ถอน">
            <LedgerDatePicker value={fDate} onChange={setFDate} />
          </LedgerField>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={ledgerFieldLabelStyle}>รูปแบบเงิน</span>
            <div style={{ display: 'flex', gap: 8 }}>
              {PAYMENT_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setFType(opt.key)}
                  style={{ ...ledgerPillStyle(fType === opt.key), flex: 1 }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <LedgerField label="จำนวนเงิน">
            <input
              type="number"
              value={fAmount}
              onChange={(e) => setFAmount(e.target.value)}
              placeholder="0"
              style={ledgerMonoInputStyle}
            />
          </LedgerField>
          <LedgerField label="หมายเหตุ" style={{ minWidth: 0 }}>
            <input
              type="text"
              value={fNote}
              onChange={(e) => setFNote(e.target.value)}
              placeholder="ไม่ใส่ก็ได้"
              style={ledgerInputStyle}
            />
          </LedgerField>
        </div>
      </LedgerCard>

      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        {people.map((p) => (
          <div key={p.name} style={{ ...ledgerCardStyle, overflow: 'hidden' }}>
            <div
              style={{
                padding: '22px 24px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                borderBottom: '1px solid #EDE7DA',
              }}
            >
              <div
                style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}
              >
                <span style={{ fontSize: 19, fontWeight: 700 }}>{p.name}</span>
                <span style={{ fontSize: 12.5, color: ledgerColor.textFaint }}>{p.ratioPct}%</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <span style={{ fontSize: 12, color: ledgerColor.textMuted }}>ส่วนแบ่ง</span>
                  <span style={{ fontFamily: ledgerFont.mono, fontSize: 24, fontWeight: 600 }}>
                    {THB0(p.share)}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <span style={{ fontSize: 12, color: ledgerColor.textMuted, textAlign: 'right' }}>
                    ถอนไปแล้ว
                  </span>
                  <span
                    style={{
                      fontFamily: ledgerFont.mono,
                      fontSize: 24,
                      fontWeight: 600,
                      color: ledgerColor.moneyOut,
                      textAlign: 'right',
                    }}
                  >
                    {THB0(p.taken)}
                  </span>
                </div>
              </div>
              <div
                style={{
                  height: 20,
                  background: '#EDE7DA',
                  borderRadius: 99,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${p.progressPct}%`,
                    background: ledgerColor.accent,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    // Keeps the number from getting clipped by the fill's own rounded end when
                    // the fill is short - past that point it just rides along at the fill's edge.
                    minWidth: 30,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: ledgerColor.cardSurface,
                      padding: '0 8px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {Math.round(p.progressPct)}%
                  </span>
                </div>
              </div>
              {/* Promoted to the same visual weight as ส่วนแบ่ง/ถอนไปแล้ว above (was a small
                  12.5px label + 14px value tucked under the progress bar) - it's the number that
                  actually answers "can I withdraw more right now", so it shouldn't read as an
                  afterthought next to the other two. */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: p.left < 0 ? '#FBEAEA' : '#EAF5EE',
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, color: ledgerColor.textSecondary }}>
                  ถอนได้อีก
                </span>
                <span
                  style={{
                    fontFamily: ledgerFont.mono,
                    fontSize: 26,
                    fontWeight: 700,
                    color: p.left < 0 ? ledgerColor.moneyOut : ledgerColor.moneyIn,
                  }}
                >
                  {thbSigned0(p.left)}
                </span>
              </div>
            </div>
            <div
              style={{
                padding: '14px 24px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <div style={{ fontSize: 12, color: ledgerColor.textFaint, paddingBottom: 6 }}>
                ประวัติการถอน
              </div>
              {p.rows.length === 0 ? (
                <div style={{ fontSize: 12.5, color: ledgerColor.textFaint, padding: '7px 0' }}>
                  ยังไม่มีรายการถอน
                </div>
              ) : (
                p.rows.map((w, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '72px 1fr auto',
                      gap: 10,
                      padding: '7px 0',
                      borderBottom: `1px solid ${ledgerColor.rowDivider}`,
                      alignItems: 'center',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: ledgerFont.mono,
                        fontSize: 13,
                        color: ledgerColor.textMuted,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {w.dateText}
                    </span>
                    <span style={{ fontSize: 12.5, color: ledgerColor.textFaint }}>{w.label}</span>
                    <span style={{ fontFamily: ledgerFont.mono, fontSize: 14, fontWeight: 500 }}>
                      {THB(w.amount)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </section>

      <style>{`
        /* This grid's 4 fixed columns (150+130+150+140=570px) plus gaps need ~626px before the
           note field gets anything - with the 232px sidebar and this page's padding subtracted
           from the window, that doesn't fit anywhere below ~990px wide (measured empirically,
           same class of bug as PageLedgerEntries' add-entry grid - see that file's comment). The
           submit button moved back out of this grid (now beside the "เพิ่มรายการถอน" heading
           instead), so this only needs to fit the 5 fields, not a 6th button column too. */
        @media (max-width: 1020px) {
          .paojiao-ledger-withdraw-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}

export default PageLedgerShare
