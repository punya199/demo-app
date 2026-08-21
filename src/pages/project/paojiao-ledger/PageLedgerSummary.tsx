import { useMemo, useState } from 'react'
import {
  ChartLayout,
  computeChartLayout,
  computeDraffSales,
  computeOilSalesPerRound,
  computeSummaryPeriod,
  computeVendorSpend,
  PeriodBar,
  RevenueBreakdownView,
} from './ledger-calculations'
import { useLedgerContext } from './ledger-context'
import { thbSigned, THB } from './ledger-format'
import { ledgerColor, ledgerFont } from './ledger-tokens'
import { LedgerData, LedgerEntry, LedgerRound, LedgerSummaryPeriod } from './ledger-types'
import { LedgerH1 } from './ledger-ui'
import { ledgerCardStyle, ledgerPillStyle } from './ledger-ui-styles'
import { RoundDetailModal } from './RoundDetailModal'

// This page shows large baht totals where cents aren't meaningful to the user - round to whole
// baht for every figure here (chart bar k-labels are already abbreviated separately and untouched).
const THB0 = (n: number) => THB(Math.round(n))
const thbSigned0 = (n: number) => thbSigned(Math.round(n))

const PERIOD_OPTIONS: { key: LedgerSummaryPeriod; label: string }[] = [
  { key: 'round', label: 'รายรอบขายน้ำมัน' },
  { key: 'oilSales', label: 'ขายน้ำมันแต่ละรอบ' },
  { key: 'draffSales', label: 'ขายกาก' },
  { key: 'day', label: 'รายจ่ายต่อ 30 วัน' },
  { key: 'expenses', label: 'รายจ่ายทั้งหมด' },
  { key: 'month', label: 'รายเดือน' },
  { key: 'all', label: 'ทั้งหมดรวม' },
]

// Swapping tabs remounts the content below (key={period}) so this small fade+rise plays every time.
const FADE_IN_KEYFRAMES = `
@keyframes ledgerSummaryFadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
`

const PageLedgerSummary = () => {
  const { data, base } = useLedgerContext()
  const [period, setPeriod] = useState<LedgerSummaryPeriod>('round')
  const [selectedRound, setSelectedRound] = useState<LedgerRound | null>(null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
      <style>{FADE_IN_KEYFRAMES}</style>
      <LedgerH1>สรุปเงิน</LedgerH1>
      <PeriodPills period={period} onSelectPeriod={setPeriod} />

      <div
        key={period}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 26,
          animation: 'ledgerSummaryFadeIn 0.22s ease',
        }}
      >
        {period === 'day' || period === 'expenses' ? (
          <VendorSpendContent
            data={data}
            entries={base.entries}
            windowDays={period === 'day' ? 30 : undefined}
            perDayDivisor={period === 'day' ? 30 : base.daysRun}
          />
        ) : period === 'oilSales' || period === 'draffSales' ? (
          <RevenueContent
            title={period === 'oilSales' ? 'ยอดขายน้ำมัน' : 'ยอดขายกาก'}
            chartTitle={period === 'oilSales' ? 'ขายน้ำมันแต่ละรอบ' : 'ขายกากแต่ละครั้ง'}
            countLabel={period === 'oilSales' ? 'จำนวนรอบ' : 'จำนวนครั้งที่ขาย'}
            perLabel={period === 'oilSales' ? 'เฉลี่ยต่อรอบ' : 'เฉลี่ยต่อครั้ง'}
            chartType={period === 'oilSales' ? 'bar' : 'line'}
            view={
              period === 'oilSales'
                ? computeOilSalesPerRound(base.rounds, base.entries)
                : computeDraffSales(base.entries)
            }
            // Bars are one-per-round only for oilSales, same order as base.rounds - draffSales
            // isn't tied to rounds at all, so there's nothing to click through to there.
            rounds={period === 'oilSales' ? base.rounds : undefined}
            onRoundClick={setSelectedRound}
          />
        ) : (
          <SummaryPeriodContent
            data={data}
            entries={base.entries}
            rounds={base.rounds}
            profitAll={base.profitAll}
            onHand={base.cash + base.bank}
            period={period}
            onRoundClick={setSelectedRound}
          />
        )}
      </div>

      <RoundDetailModal
        round={selectedRound}
        entries={base.entries}
        onClose={() => setSelectedRound(null)}
      />
    </div>
  )
}

const PeriodPills = ({
  period,
  onSelectPeriod,
}: {
  period: LedgerSummaryPeriod
  onSelectPeriod: (p: LedgerSummaryPeriod) => void
}) => (
  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
    {PERIOD_OPTIONS.map((p) => (
      <button
        key={p.key}
        type="button"
        onClick={() => onSelectPeriod(p.key)}
        style={ledgerPillStyle(period === p.key)}
      >
        {p.label}
      </button>
    ))}
  </div>
)

const BarChartCard = ({
  title,
  legend,
  chart,
  onBarClick,
}: {
  title: string
  legend: string
  chart: ChartLayout
  onBarClick?: (index: number) => void
}) => (
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
      <span style={{ fontSize: 15, fontWeight: 600 }}>{title}</span>
      <span style={{ fontSize: 12.5, color: ledgerColor.textFaint }}>{legend}</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'stretch', gap: 10, height: 240 }}>
      {chart.bars.map((b, i) => (
        <div
          key={i}
          onClick={onBarClick ? () => onBarClick(i) : undefined}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            gap: 6,
            minWidth: 0,
            cursor: onBarClick ? 'pointer' : undefined,
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
)

// Fixed pixel coordinates (not viewBox stretching) so the line/dots/text never distort - wide
// data sets just scroll horizontally instead, same as any other wide content on this page.
const LINE_PX_PER_DAY = 20 // horizontal spacing is proportional to real elapsed days between points
const LINE_MIN_POINT_GAP = 46 // floor so same-day/adjacent-day points don't overlap their labels
const LINE_LEFT_PAD = 30
const LINE_RIGHT_PAD = 30
const LINE_HEIGHT = 240
const LINE_PLOT_TOP = 28
const LINE_PLOT_BOTTOM = 196
const LINE_LABEL_Y = 224
const DAY_MS = 86400000

const LineChartCard = ({
  title,
  legend,
  bars,
}: {
  title: string
  legend: string
  bars: PeriodBar[]
}) => {
  const maxV = Math.max(1, ...bars.map((b) => b.v))
  const firstDayMs = bars.length ? new Date(bars[0].date).getTime() : 0

  const xs: number[] = []
  bars.forEach((b, i) => {
    const naturalX =
      LINE_LEFT_PAD + ((new Date(b.date).getTime() - firstDayMs) / DAY_MS) * LINE_PX_PER_DAY
    xs.push(i === 0 ? naturalX : Math.max(naturalX, xs[i - 1] + LINE_MIN_POINT_GAP))
  })
  const svgWidth = Math.max(240, (xs[xs.length - 1] ?? LINE_LEFT_PAD) + LINE_RIGHT_PAD)

  const points = bars.map((b, i) => ({
    x: xs[i],
    y: LINE_PLOT_BOTTOM - (b.v / maxV) * (LINE_PLOT_BOTTOM - LINE_PLOT_TOP),
    v: b.v,
    label: b.label,
  }))

  return (
    <section
      style={{
        ...ledgerCardStyle,
        padding: '24px 26px',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        minWidth: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 15, fontWeight: 600 }}>{title}</span>
        <span style={{ fontSize: 12.5, color: ledgerColor.textFaint }}>{legend}</span>
      </div>
      {/* Points run oldest-to-newest left-to-right, so the most recent sale is off the right
          edge when the chart is wider than its card. direction:rtl on the scroll container makes
          its native initial scroll position the right edge (CSS-only, no effect/timing needed);
          direction:ltr on the inner wrapper puts the chart's own content back in normal reading
          order so numbers/dates aren't mirrored. */}
      <div style={{ overflowX: 'auto', direction: 'rtl' }}>
        <div style={{ direction: 'ltr', display: 'inline-block' }}>
          <svg width={svgWidth} height={LINE_HEIGHT} style={{ display: 'block' }}>
            <polyline
              points={points.map((p) => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke={ledgerColor.moneyIn}
              strokeWidth={2}
            />
            {points.map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r={4} fill={ledgerColor.moneyIn} />
                <text
                  x={p.x}
                  y={p.y - 10}
                  textAnchor="middle"
                  fontFamily={ledgerFont.mono}
                  fontSize={10.5}
                  fill={ledgerColor.moneyIn}
                >
                  {THB0(p.v)}
                </text>
                <text
                  x={p.x}
                  y={LINE_LABEL_Y}
                  textAnchor="middle"
                  fontFamily={ledgerFont.mono}
                  fontSize={11}
                  fill={ledgerColor.textFaint}
                >
                  {p.label}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    </section>
  )
}

const VendorSpendContent = ({
  data,
  entries,
  windowDays,
  perDayDivisor,
}: {
  data: LedgerData
  entries: LedgerEntry[]
  windowDays?: number
  perDayDivisor: number
}) => {
  const view = useMemo(
    () => computeVendorSpend(entries, data.startDate, windowDays),
    [entries, data.startDate, windowDays]
  )
  const maxAmount = Math.max(1, ...view.rows.map((r) => r.amount))

  return (
    <>
      <section
        style={{
          ...ledgerCardStyle,
          borderLeft: `6px solid ${ledgerColor.moneyOut}`,
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
          <span style={{ fontSize: 22, fontWeight: 700, color: ledgerColor.moneyOut }}>
            รายจ่ายรวม
          </span>
          <span
            style={{
              fontFamily: ledgerFont.mono,
              fontSize: 56,
              fontWeight: 600,
              letterSpacing: '-0.02em',
              lineHeight: 1,
              color: ledgerColor.moneyOut,
            }}
          >
            {THB0(view.totalOut)}
          </span>
          <span style={{ fontSize: 18, color: ledgerColor.textMuted }}>บาท</span>
        </div>
        <div style={{ display: 'flex', gap: 34, flexWrap: 'wrap', paddingTop: 4 }}>
          {[
            { label: 'จำนวนผู้ขาย', value: String(view.rows.length) },
            { label: 'เฉลี่ยต่อวัน', value: THB0(view.totalOut / perDayDivisor) },
          ].map((f) => (
            <div key={f.label} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 12.5, color: ledgerColor.textMuted }}>{f.label}</span>
              <span
                style={{
                  fontFamily: ledgerFont.mono,
                  fontSize: 20,
                  fontWeight: 500,
                  color: ledgerColor.textPrimary,
                }}
              >
                {f.value}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section
        style={{
          ...ledgerCardStyle,
          padding: '24px 26px',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 15, fontWeight: 600 }}>ซื้อของจากใครมากสุด</span>
          <span style={{ fontSize: 12.5, color: ledgerColor.textFaint }}>เรียงจากมากไปน้อย</span>
        </div>

        {view.rows.length === 0 && (
          <div style={{ fontSize: 13.5, color: ledgerColor.textFaint }}>ไม่มีรายจ่ายในช่วงนี้</div>
        )}

        {view.rows.map((row) => (
          <div key={row.item} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <span style={{ fontSize: 14.5, fontWeight: 500 }}>{row.item}</span>
              <span
                style={{
                  fontFamily: ledgerFont.mono,
                  fontSize: 15,
                  fontWeight: 500,
                  color: ledgerColor.moneyOut,
                  whiteSpace: 'nowrap',
                }}
              >
                {THB0(row.amount)}
              </span>
            </div>
            <div style={{ height: 8, background: ledgerColor.rowDivider, borderRadius: 99 }}>
              <div
                style={{
                  height: 8,
                  width: `${(row.amount / maxAmount) * 100}%`,
                  background: ledgerColor.moneyOut,
                  borderRadius: 99,
                }}
              />
            </div>
          </div>
        ))}
      </section>
    </>
  )
}

const RevenueContent = ({
  title,
  chartTitle,
  countLabel,
  perLabel,
  chartType,
  view,
  rounds,
  onRoundClick,
}: {
  title: string
  chartTitle: string
  countLabel: string
  perLabel: string
  chartType: 'bar' | 'line'
  view: RevenueBreakdownView
  rounds?: LedgerRound[]
  onRoundClick?: (round: LedgerRound) => void
}) => {
  const chart = useMemo(() => computeChartLayout(view.bars), [view.bars])

  return (
    <>
      <section
        style={{
          ...ledgerCardStyle,
          borderLeft: `6px solid ${ledgerColor.moneyIn}`,
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
          <span style={{ fontSize: 22, fontWeight: 700, color: ledgerColor.moneyIn }}>{title}</span>
          <span
            style={{
              fontFamily: ledgerFont.mono,
              fontSize: 56,
              fontWeight: 600,
              letterSpacing: '-0.02em',
              lineHeight: 1,
              color: ledgerColor.moneyIn,
            }}
          >
            {THB0(view.total)}
          </span>
          <span style={{ fontSize: 18, color: ledgerColor.textMuted }}>บาท</span>
        </div>
        <div style={{ display: 'flex', gap: 34, flexWrap: 'wrap', paddingTop: 4 }}>
          {[
            { label: countLabel, value: String(view.count) },
            { label: perLabel, value: THB0(view.perAverage) },
          ].map((f) => (
            <div key={f.label} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 12.5, color: ledgerColor.textMuted }}>{f.label}</span>
              <span
                style={{
                  fontFamily: ledgerFont.mono,
                  fontSize: 20,
                  fontWeight: 500,
                  color: ledgerColor.textPrimary,
                }}
              >
                {f.value}
              </span>
            </div>
          ))}
        </div>
      </section>

      {view.bars.length === 0 ? (
        <section
          style={{
            ...ledgerCardStyle,
            padding: '24px 26px',
            fontSize: 13.5,
            color: ledgerColor.textFaint,
          }}
        >
          ยังไม่มีข้อมูล
        </section>
      ) : chartType === 'line' ? (
        <LineChartCard title={chartTitle} legend="เขียว = ยอดขาย" bars={view.bars} />
      ) : (
        <BarChartCard
          title={chartTitle}
          legend="เขียว = ยอดขาย"
          chart={chart}
          onBarClick={
            rounds && onRoundClick ? (i) => rounds[i] && onRoundClick(rounds[i]) : undefined
          }
        />
      )}
    </>
  )
}

const SummaryPeriodContent = ({
  data,
  entries,
  rounds,
  profitAll,
  onHand,
  period,
  onRoundClick,
}: {
  data: LedgerData
  entries: LedgerEntry[]
  rounds: LedgerRound[]
  profitAll: number
  onHand: number
  period: Exclude<LedgerSummaryPeriod, 'day' | 'expenses' | 'oilSales' | 'draffSales'>
  onRoundClick?: (round: LedgerRound) => void
}) => {
  const view = useMemo(
    () => computeSummaryPeriod(data, entries, rounds, period),
    [data, entries, rounds, period]
  )
  const chart = useMemo(() => computeChartLayout(view.bars), [view.bars])

  const isLoss = view.periodProfit < 0
  const verdictColor = isLoss ? ledgerColor.moneyOut : ledgerColor.moneyIn

  const figures: { label: string; value: string; color: string }[] = [
    { label: 'เงินได้', value: THB0(view.periodIn), color: ledgerColor.moneyIn },
    { label: 'เงินจ่าย', value: THB0(view.periodOut), color: ledgerColor.moneyOut },
    ...(view.carry
      ? [{ label: 'กำไรยกมา', value: THB0(view.carry), color: ledgerColor.textSecondary }]
      : []),
    {
      label: 'เฉลี่ยต่อวัน',
      value: thbSigned0(view.periodProfit / view.perDayDiv),
      color: ledgerColor.textPrimary,
    },
  ]

  return (
    <>
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
            {thbSigned0(view.periodProfit)}
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

      <BarChartCard
        title={view.chartTitle}
        legend="เขียว = กำไร · แดง = ขาดทุน"
        chart={chart}
        // Bars are one-per-round only for 'round'/'all' - 'month' aggregates several rounds into
        // each bar, so there's no single round to open there.
        onBarClick={
          (period === 'round' || period === 'all') && onRoundClick
            ? (i) => rounds[i] && onRoundClick(rounds[i])
            : undefined
        }
      />

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[
          { label: 'กำไรทั้งหมด (รวมยอดยกมา)', value: THB0(profitAll) },
          { label: 'เงินสด + บัญชี วันนี้', value: THB0(onHand) },
          { label: 'รอบขายน้ำมัน', value: String(rounds.length) },
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
    </>
  )
}

export default PageLedgerSummary
