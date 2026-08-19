import { useMemo, useState } from 'react'
import { computeChartLayout, computeSummaryPeriod } from './ledger-calculations'
import { useLedgerContext } from './ledger-context'
import { thbSigned, THB } from './ledger-format'
import { ledgerColor, ledgerFont } from './ledger-tokens'
import { LedgerSummaryPeriod } from './ledger-types'
import { LedgerH1 } from './ledger-ui'
import { ledgerCardStyle, ledgerPillStyle } from './ledger-ui-styles'

const PERIOD_OPTIONS: { key: LedgerSummaryPeriod; label: string }[] = [
  { key: 'round', label: 'รายรอบขายน้ำมัน' },
  { key: 'day', label: 'รายวัน' },
  { key: 'month', label: 'รายเดือน' },
  { key: 'all', label: 'ทั้งหมดรวม' },
]

const PageLedgerSummary = () => {
  const { data, base } = useLedgerContext()
  const [period, setPeriod] = useState<LedgerSummaryPeriod>('round')

  const view = useMemo(
    () => computeSummaryPeriod(data, base.entries, base.rounds, period),
    [data, base.entries, base.rounds, period]
  )
  const chart = useMemo(() => computeChartLayout(view.bars), [view.bars])

  const isLoss = view.periodProfit < 0
  const verdictColor = isLoss ? ledgerColor.moneyOut : ledgerColor.moneyIn

  const onHand = base.cash + base.bank

  const figures: { label: string; value: string; color: string }[] = [
    { label: 'เงินได้', value: THB(view.periodIn), color: ledgerColor.moneyIn },
    { label: 'เงินจ่าย', value: THB(view.periodOut), color: ledgerColor.moneyOut },
    ...(view.carry
      ? [{ label: 'กำไรยกมา', value: THB(view.carry), color: ledgerColor.textSecondary }]
      : []),
    {
      label: 'เฉลี่ยต่อวัน',
      value: thbSigned(view.periodProfit / view.perDayDiv),
      color: ledgerColor.textPrimary,
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
      <LedgerH1>สรุปเงิน</LedgerH1>

      <section
        style={{
          ...ledgerCardStyle,
          borderLeft: `6px solid ${verdictColor}`,
          padding: '26px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div style={{ fontSize: 13.5, color: ledgerColor.textMuted, letterSpacing: '0.03em' }}>
          {view.periodLabel}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
          <span style={{ fontSize: 22, fontWeight: 700, color: verdictColor }}>
            {isLoss ? 'ขาดทุน' : 'กำไร'}
          </span>
          <span
            style={{
              fontFamily: ledgerFont.mono,
              fontSize: 56,
              fontWeight: 600,
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}
          >
            {thbSigned(view.periodProfit)}
          </span>
          <span style={{ fontSize: 18, color: ledgerColor.textMuted }}>บาท</span>
        </div>
        <div style={{ display: 'flex', gap: 34, flexWrap: 'wrap', paddingTop: 4 }}>
          {figures.map((f) => (
            <div key={f.label} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 12.5, color: ledgerColor.textMuted }}>{f.label}</span>
              <span
                style={{
                  fontFamily: ledgerFont.mono,
                  fontSize: 20,
                  fontWeight: 500,
                  color: f.color,
                }}
              >
                {f.value}
              </span>
            </div>
          ))}
        </div>
        {view.periodNote && (
          <div style={{ fontSize: 12.5, color: ledgerColor.textFaint }}>{view.periodNote}</div>
        )}
      </section>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {PERIOD_OPTIONS.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => setPeriod(p.key)}
            style={ledgerPillStyle(period === p.key)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <section
        style={{
          ...ledgerCardStyle,
          padding: '24px 26px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 15, fontWeight: 600 }}>{view.chartTitle}</span>
          <span style={{ fontSize: 12.5, color: ledgerColor.textFaint }}>
            เขียว = กำไร · แดง = ขาดทุน
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'stretch', gap: 10, height: 240 }}>
          {chart.bars.map((b, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                gap: 6,
                minWidth: 0,
              }}
            >
              <div
                style={{
                  height: chart.upH,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  gap: 4,
                }}
              >
                <span
                  style={{
                    fontFamily: ledgerFont.mono,
                    fontSize: 10.5,
                    textAlign: 'center',
                    color: ledgerColor.moneyIn,
                    visibility: b.positive ? 'visible' : 'hidden',
                  }}
                >
                  {b.valueText}
                </span>
                <div
                  style={{
                    height: b.upHeightPx,
                    background: ledgerColor.moneyIn,
                    borderRadius: '4px 4px 0 0',
                  }}
                />
              </div>
              <div style={{ height: 1, background: ledgerColor.hairline }} />
              <div style={{ height: chart.dnH, display: 'flex', flexDirection: 'column', gap: 3 }}>
                <div
                  style={{
                    height: b.downHeightPx,
                    background: ledgerColor.moneyOut,
                    borderRadius: '0 0 4px 4px',
                  }}
                />
                <span
                  style={{
                    fontFamily: ledgerFont.mono,
                    fontSize: 10.5,
                    textAlign: 'center',
                    color: ledgerColor.moneyOut,
                    visibility: b.positive ? 'hidden' : 'visible',
                  }}
                >
                  {b.negText}
                </span>
              </div>
              <div
                style={{
                  fontFamily: ledgerFont.mono,
                  fontSize: 11,
                  color: ledgerColor.textFaint,
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                {b.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[
          { label: 'กำไรทั้งหมด (รวมยอดยกมา)', value: THB(base.profitAll) },
          { label: 'เงินสด + บัญชี วันนี้', value: THB(onHand) },
          { label: 'รอบขายน้ำมัน', value: String(base.rounds.length) },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              ...ledgerCardStyle,
              padding: '20px 22px',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            <span style={{ fontSize: 12.5, color: ledgerColor.textMuted }}>{s.label}</span>
            <span style={{ fontFamily: ledgerFont.mono, fontSize: 30, fontWeight: 600 }}>
              {s.value}
            </span>
          </div>
        ))}
      </section>
    </div>
  )
}

export default PageLedgerSummary
