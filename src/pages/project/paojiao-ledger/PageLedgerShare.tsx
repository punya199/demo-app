import { useMemo } from 'react'
import { computeShares } from './ledger-calculations'
import { useLedgerContext } from './ledger-context'
import { THB, thbSigned } from './ledger-format'
import { ledgerColor, ledgerFont } from './ledger-tokens'
import { useLedgerStore } from './ledger-store'
import { LedgerH1 } from './ledger-ui'
import { ledgerCardStyle } from './ledger-ui-styles'

const PageLedgerShare = () => {
  const { data, base } = useLedgerContext()
  const ratio = useLedgerStore((s) => s.ratio)
  const setRatio = useLedgerStore((s) => s.setRatio)

  const people = useMemo(
    () => computeShares(data, base.profitAll, ratio),
    [data, base.profitAll, ratio]
  )
  const perDayAll = base.profitAll / base.daysRun
  const leftAll = base.profitAll - people.reduce((a, p) => a + p.taken, 0)

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
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 20,
        }}
      >
        <span style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap' }}>
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
            fontSize: 14,
            color: ledgerColor.textMuted,
            whiteSpace: 'nowrap',
          }}
        >
          {ratio} : {100 - ratio}
        </span>
      </section>

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
                    {THB(p.share)}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <span style={{ fontSize: 12, color: ledgerColor.textMuted }}>ถอนไปแล้ว</span>
                  <span
                    style={{
                      fontFamily: ledgerFont.mono,
                      fontSize: 24,
                      fontWeight: 600,
                      color: ledgerColor.moneyOut,
                    }}
                  >
                    {THB(p.taken)}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                <div
                  style={{
                    height: 8,
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
                    }}
                  />
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 12.5,
                    color: ledgerColor.textMuted,
                  }}
                >
                  <span>ถอนได้อีก</span>
                  <span
                    style={{
                      fontFamily: ledgerFont.mono,
                      fontSize: 14,
                      fontWeight: 600,
                      color: p.left < 0 ? ledgerColor.moneyOut : ledgerColor.moneyIn,
                    }}
                  >
                    {thbSigned(p.left)}
                  </span>
                </div>
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
              {p.rows.map((w, i) => (
                <div
                  key={i}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '92px 1fr auto',
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
                    }}
                  >
                    {w.dateText}
                  </span>
                  <span style={{ fontSize: 12.5, color: ledgerColor.textFaint }}>{w.label}</span>
                  <span style={{ fontFamily: ledgerFont.mono, fontSize: 14, fontWeight: 500 }}>
                    {THB(w.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}

export default PageLedgerShare
