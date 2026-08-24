import { message } from 'antd'
import { useMemo, useRef, useState } from 'react'
import { MdDownload, MdShowChart, MdStorefront } from 'react-icons/md'
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
import { fmtFull, thbSigned, THB } from './ledger-format'
import { saveElementAsImage } from './ledger-save-image'
import { ledgerColor, ledgerFont } from './ledger-tokens'
import { LedgerData, LedgerEntry, LedgerRound, LedgerSummaryPeriod } from './ledger-types'
import { LedgerEmptyState, LedgerH1 } from './ledger-ui'
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

// Three widths for the profit/figures row in SummaryPeriodContent: wide enough to push the
// figures to the far edge and grow the profit number, medium enough to keep them on one row
// without the forced gap, and narrow enough that they need to stack (the original layout).
//
// The two breakpoints below (900px / 1060px) are NOT guesses - the row sits behind a 232px fixed
// sidebar plus ~136px of main/card padding, so the viewport needed to fit both blocks side by
// side is far higher than it looks from the card alone. Measured empirically with an isolated
// repro of this exact markup at the real font sizes: the row needs ~904px of viewport before it
// stops wrapping at the base (medium-tier) font sizes, and ~1044px once the wide-tier fonts below
// are applied (bigger text needs more room). Both got a ~15px safety margin against font-metric
// variance across browsers. Earlier guesses (860px/560px) were well inside the range where
// flex-wrap was still silently collapsing the row to a stack regardless of what these rules said.
const ROUND_SUMMARY_RESPONSIVE_STYLES = `
.paojiao-ledger-round-summary-row {
  display: flex;
  flex-wrap: wrap;
  /* flex-start, not center - centering against the profit block's full height (including its
     much taller number) pushed the figures block lower than intended. Top-aligning puts it level
     with the top of the profit number instead, matching the reference layout. */
  align-items: flex-start;
  justify-content: flex-start;
  gap: 20px 34px;
}
.paojiao-ledger-round-profit-value {
  font-size: 56px;
}
.paojiao-ledger-round-figure-label {
  font-size: 12.5px;
}
.paojiao-ledger-round-figure-value {
  font-size: 20px;
}
/* Wide is the only tier where the figures column sits beside the profit column instead of
   below it - there's room to grow there that the stacked (medium/narrow) tiers don't have. */
@media (min-width: 1060px) {
  .paojiao-ledger-round-summary-row {
    justify-content: space-between;
  }
  .paojiao-ledger-round-profit-value {
    font-size: 68px;
  }
  .paojiao-ledger-round-figure-label {
    font-size: 14px;
  }
  .paojiao-ledger-round-figure-value {
    font-size: 24px;
  }
}
@media (max-width: 899px) {
  .paojiao-ledger-round-summary-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
/* Same breakpoint the shell already uses to switch the sidebar for a bottom nav - below it, 3
   equal grid columns leave each stat card too narrow for its own label, cutting text off. */
@media (max-width: 768px) {
  .paojiao-ledger-stats-grid {
    grid-template-columns: 1fr !important;
  }
}
`

// Every rule above keys off the browser's actual viewport width, not this card's own width - so
// saving an image gets a different look depending on whatever screen the button happened to be
// pressed on (see handleSaveImage's toggling of this class). This locks the export to always look
// like the narrow/stacked tier, which is a deliberate choice - it fits the export width chosen
// below and, unlike the wide (>=1060px) tier, never needs the two columns sitting side by side.
// !important on every property here: the >=1060px tier isn't @media-gated by width once this
// class is on (only by the real viewport, which the export capture can't control), so it can still
// be "active" underneath and would otherwise win on the specificity tie against the mobile-only
// !important grid rule above.
const EXPORT_MODE_WIDTH = 560
const EXPORT_MODE_STYLES = `
.paojiao-ledger-export-mode {
  width: ${EXPORT_MODE_WIDTH}px !important;
}
.paojiao-ledger-export-mode .paojiao-ledger-round-summary-row {
  flex-direction: column !important;
  align-items: flex-start !important;
  gap: 12px !important;
}
.paojiao-ledger-export-mode .paojiao-ledger-round-profit-value {
  font-size: 56px !important;
}
.paojiao-ledger-export-mode .paojiao-ledger-round-figure-label {
  font-size: 12.5px !important;
}
.paojiao-ledger-export-mode .paojiao-ledger-round-figure-value {
  font-size: 20px !important;
}
.paojiao-ledger-export-mode .paojiao-ledger-stats-grid {
  grid-template-columns: 1fr !important;
}
/* The real bug behind a figure (e.g. "เฉลี่ยต่อวัน") rendering outside its own card: when it wraps
   to a second line during capture, the capture library mis-places the wrapped part outside its
   flex parent instead of stacking it below the first line - a capture-only rendering bug, not a
   real overflow (it fits fine unwrapped on screen at this width). Forcing a single line sidesteps
   it. EXPORT_MODE_WIDTH has enough margin over what it actually needs so this holds even if
   capture-time font metrics run a bit wider than what the live page measures (an earlier,
   narrower width had no such margin, which is what let this surface in the first place). */
.paojiao-ledger-export-mode .paojiao-ledger-figures-row {
  flex-wrap: nowrap !important;
}
/* Dropped from the export entirely rather than fixed in place - not worth carrying the same
   wrap-related capture bug for a note that's only really useful in-app anyway. */
.paojiao-ledger-export-mode .paojiao-ledger-period-note {
  display: none !important;
}
/* Same "force a single line rather than trust it fits" reasoning as the figures row above - a
   chart title (e.g. "กำไรแต่ละรอบขายน้ำมัน") was wrapping onto a second line during capture even
   with the width this class sets, room to spare on screen. */
.paojiao-ledger-export-mode .paojiao-ledger-chart-title {
  white-space: nowrap !important;
}
/* The round's line-item breakdown only ever needs to exist for the saved image (see
   lastRoundRows in SummaryPeriodContent) - display:none keeps it out of the live page's normal
   flow entirely rather than just visually hiding it, so it costs nothing when not exporting. */
.paojiao-ledger-export-only {
  display: none;
}
.paojiao-ledger-export-mode .paojiao-ledger-export-only {
  display: block !important;
}
/* Opposite of export-only - stays visible on the live page but is dropped from the saved image
   (used on the กำไรทั้งหมด/เงินสด+บัญชี stat cards, which are less relevant once the round's own
   profit figure and line items are already in the image). */
.paojiao-ledger-export-mode .paojiao-ledger-export-hide {
  display: none !important;
}
`

const PageLedgerSummary = () => {
  const { data, base } = useLedgerContext()
  const [period, setPeriod] = useState<LedgerSummaryPeriod>('round')
  const [selectedRound, setSelectedRound] = useState<LedgerRound | null>(null)
  const [savingImage, setSavingImage] = useState(false)
  const captureRef = useRef<HTMLDivElement>(null)

  const handleSaveImage = async () => {
    if (!captureRef.current || savingImage) return
    setSavingImage(true)
    // Locks the export to always look the same regardless of the actual screen it's saved from -
    // see EXPORT_MODE_STYLES above for why a CSS class (not a JS style override) is what does that.
    captureRef.current.classList.add('paojiao-ledger-export-mode')
    // Forces the browser to commit that class's layout changes before the capture reads the DOM -
    // without this, the capture could run against a layout still mid-reflow from the class just
    // being added, which is exactly the kind of stale-geometry read that produced the "เฉลี่ยต่อวัน
    // renders outside the card" bug in the first place.
    void captureRef.current.offsetHeight
    try {
      await saveElementAsImage(captureRef.current, `เจ้ปุ้ม-สรุปเงิน-${period}.png`)
    } catch {
      message.error('บันทึกรูปภาพไม่สำเร็จ ลองใหม่อีกครั้ง')
    } finally {
      captureRef.current.classList.remove('paojiao-ledger-export-mode')
      setSavingImage(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
      <style>{FADE_IN_KEYFRAMES + ROUND_SUMMARY_RESPONSIVE_STYLES + EXPORT_MODE_STYLES}</style>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <LedgerH1>สรุปเงิน</LedgerH1>
        <button
          type="button"
          onClick={handleSaveImage}
          disabled={savingImage}
          style={{
            ...ledgerPillStyle(false),
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            opacity: savingImage ? 0.6 : 1,
          }}
        >
          <MdDownload size={15} />
          {savingImage ? 'กำลังบันทึก...' : 'บันทึกเป็นรูปภาพ'}
        </button>
      </div>
      <PeriodPills period={period} onSelectPeriod={setPeriod} />

      <div
        key={period}
        ref={captureRef}
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

// Fixed width per bar, not flex:1 dividing the card evenly - with enough bars (a full year of
// rounds, say) that squeezed every column down below what an unrotated date label like "14 สค"
// needs at readable size, and the nowrap label text spilled into neighboring columns instead of
// shrinking, reading as garbled overlapping text. Wide bar sets scroll horizontally instead, same
// fix as LineChartCard used for the same class of problem.
const BAR_MIN_WIDTH = 34
// Every bar column shares the exact same upH/dnH/gaps/label height, so this total is identical
// for all of them - computed once here instead of leaving each column's height to flex packing,
// which is what let the baseline appear to wobble between bars (see BAR_LABEL_HEIGHT's comment).
const BAR_GAP = 6
const BAR_LABEL_HEIGHT = 14 // fixed, not auto - auto height made the column's total content
// height (and therefore where flex's justify-content:flex-end packed the baseline) depend on
// font metrics that could differ by a sub-pixel between browsers/renders, which is exactly the
// kind of "off by a hair" gap that reads as a misaligned line across bars.

const BarChartCard = ({
  title,
  legend,
  chart,
  onBarClick,
}: {
  title: string
  legend?: string
  chart: ChartLayout
  onBarClick?: (index: number) => void
}) => {
  // Every column is exactly this tall - deterministic, not left to flex packing to work out (see
  // BAR_LABEL_HEIGHT's comment) - so the zero-baseline overlay below can be positioned at a single
  // top offset that's guaranteed correct for every bar, rather than each bar drawing its own
  // 1px hairline that left a visible gap wherever the row's `gap` fell between two bars.
  const rowHeight = chart.upH + BAR_GAP + 1 + BAR_GAP + chart.dnH + BAR_GAP + BAR_LABEL_HEIGHT

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
        <span className="paojiao-ledger-chart-title" style={{ fontSize: 15, fontWeight: 600 }}>
          {title}
        </span>
        {legend && <span style={{ fontSize: 12.5, color: ledgerColor.textFaint }}>{legend}</span>}
      </div>
      {/* Same direction:rtl/ltr pairing as LineChartCard - scrolls to the newest (rightmost) bars
        by default, with no JS/timing needed. Two things this needs that the first attempt
        missed: the inner row must be display: inline-flex, not flex - a block-level flex
        container's own width:auto still just fills its parent (this scroll box) regardless of
        its flex-shrink:0 children refusing to shrink, so the children silently overflowed the
        row without the row itself ever reporting a wider scrollWidth to this box - nothing was
        ever detected as overflowing, so there was nothing to scroll and nothing for direction:
        rtl to anchor to the right. inline-flex shrinks the row to its content's real width
        instead, like LineChartCard's SVG wrapper already does with inline-block. Second,
        minWidth: 0 on this box itself (not just the section) - as a flex item its own automatic
        min-width otherwise matches its unwrapped content width, which independently defeats
        overflow-x:auto the same way and pushes the overflow onto the page instead (also why
        swiping the chart used to drag the whole page). overscrollBehaviorX keeps a swipe that
        does hit this box's own scroll limit from then bleeding into the page underneath it. */}
      <div
        style={{
          overflowX: 'auto',
          direction: 'rtl',
          minWidth: 0,
          overscrollBehaviorX: 'contain',
        }}
      >
        <div
          style={{
            direction: 'ltr',
            display: 'inline-flex',
            position: 'relative',
            gap: 10,
            height: rowHeight,
          }}
        >
          {/* One continuous line the full width of the row (bars and gaps both), instead of every
            bar drawing its own 1px segment - those left the gap between each pair of bars with
            nothing drawn there at all, which read as the line being broken/misaligned rather
            than genuinely continuous. */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: chart.upH + BAR_GAP,
              height: 1,
              background: ledgerColor.hairline,
            }}
          />
          {chart.bars.map((b, i) => (
            <div
              key={i}
              onClick={onBarClick ? () => onBarClick(i) : undefined}
              style={{
                flex: `0 0 ${BAR_MIN_WIDTH}px`,
                display: 'flex',
                flexDirection: 'column',
                gap: BAR_GAP,
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
              <div style={{ height: 1 }} />
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
                  lineHeight: `${BAR_LABEL_HEIGHT}px`,
                  height: BAR_LABEL_HEIGHT,
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
      </div>
    </section>
  )
}

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
        <span className="paojiao-ledger-chart-title" style={{ fontSize: 15, fontWeight: 600 }}>
          {title}
        </span>
        <span style={{ fontSize: 12.5, color: ledgerColor.textFaint }}>{legend}</span>
      </div>
      {/* Points run oldest-to-newest left-to-right, so the most recent sale is off the right
          edge when the chart is wider than its card. direction:rtl on the scroll container makes
          its native initial scroll position the right edge (CSS-only, no effect/timing needed);
          direction:ltr on the inner wrapper puts the chart's own content back in normal reading
          order so numbers/dates aren't mirrored. minWidth: 0 and overscrollBehaviorX: 'contain'
          are the same fix applied to BarChartCard's identical scroll wrapper - without minWidth:
          0 this flex item's automatic min-width matches its unwrapped content width, silently
          defeating the local overflow-x:auto (nothing overflows *this* box, the page does
          instead) and letting a swipe that reaches the scroll limit bleed into the page. */}
      <div
        style={{ overflowX: 'auto', direction: 'rtl', minWidth: 0, overscrollBehaviorX: 'contain' }}
      >
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
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: ledgerColor.moneyOut,
              whiteSpace: 'nowrap',
            }}
          >
            รายจ่ายรวม
          </span>
          {/* Grouped for the same reason as RevenueContent's equivalent - "บาท" wrapping onto its
              own line, separated from the number, looked worse than the number+unit wrapping
              together as one unit. */}
          <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 8 }}>
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
          </span>
        </div>
        <div
          className="paojiao-ledger-figures-row"
          style={{ display: 'flex', gap: 34, flexWrap: 'wrap', paddingTop: 4 }}
        >
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
          <LedgerEmptyState
            compact
            icon={MdStorefront}
            title="ไม่มีรายจ่ายในช่วงนี้"
            subtitle="ลองดูช่วงเวลาอื่นดูนะ"
          />
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
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: ledgerColor.moneyIn,
              whiteSpace: 'nowrap',
            }}
          >
            {title}
          </span>
          {/* Number and unit grouped into one inline-flex item, not two separate flex children of
              the outer row - otherwise "บาท" could wrap onto its own line by itself whenever the
              row ran short on space, leaving the number without its unit right next to it. */}
          <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 8 }}>
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
          </span>
        </div>
        <div
          className="paojiao-ledger-figures-row"
          style={{ display: 'flex', gap: 34, flexWrap: 'wrap', paddingTop: 4 }}
        >
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
        <section style={{ ...ledgerCardStyle }}>
          <LedgerEmptyState
            icon={MdShowChart}
            title="ยังไม่มีข้อมูล"
            subtitle="ข้อมูลจะขึ้นที่นี่เมื่อมีรายการขาย"
          />
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

  // Only meaningful for 'round' - it's the one tab with a single unambiguous "the round" ('all'/
  // 'month' cover several at once). Hidden on the live page (see .paojiao-ledger-export-only in
  // EXPORT_MODE_STYLES) - shown only in the saved image, appended after everything else, so
  // someone sharing the round's headline profit figure can also hand over its line-item backup
  // without a second export/round-detail step.
  const lastRound = period === 'round' ? rounds[rounds.length - 1] : undefined
  const lastRoundRows = useMemo(
    () =>
      lastRound
        ? entries.filter((e) => e.row >= lastRound.fromRow && e.row <= lastRound.toRow)
        : [],
    [entries, lastRound]
  )

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
        <div className="paojiao-ledger-round-summary-row">
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: verdictColor }}>
              {isLoss ? 'ขาดทุน' : 'กำไร'}
            </span>
            <span
              className="paojiao-ledger-round-profit-value"
              style={{
                fontFamily: ledgerFont.mono,
                fontWeight: 600,
                letterSpacing: '-0.02em',
                lineHeight: 1,
              }}
            >
              {thbSigned0(view.periodProfit)}
            </span>
            <span style={{ fontSize: 18, color: ledgerColor.textMuted }}>บาท</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div
              className="paojiao-ledger-figures-row"
              style={{ display: 'flex', gap: 34, flexWrap: 'wrap' }}
            >
              {figures.map((f) => (
                <div key={f.label} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span
                    className="paojiao-ledger-round-figure-label"
                    style={{ color: ledgerColor.textMuted }}
                  >
                    {f.label}
                  </span>
                  <span
                    className="paojiao-ledger-round-figure-value"
                    style={{
                      fontFamily: ledgerFont.mono,
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
              <div
                className="paojiao-ledger-period-note"
                style={{ fontSize: 12.5, color: ledgerColor.textFaint }}
              >
                {view.periodNote}
              </div>
            )}
          </div>
        </div>
      </section>

      <BarChartCard
        title={view.chartTitle}
        chart={chart}
        // Bars are one-per-round only for 'round'/'all' - 'month' aggregates several rounds into
        // each bar, so there's no single round to open there.
        onBarClick={
          (period === 'round' || period === 'all') && onRoundClick
            ? (i) => rounds[i] && onRoundClick(rounds[i])
            : undefined
        }
      />

      <section
        className="paojiao-ledger-stats-grid"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}
      >
        {[
          { label: 'กำไรทั้งหมด (รวมยอดยกมา)', value: THB0(profitAll), hideInExport: true },
          { label: 'เงินสด + บัญชี วันนี้', value: THB0(onHand), hideInExport: true },
          { label: 'รอบขายน้ำมัน', value: String(rounds.length), hideInExport: true },
        ].map((s) => (
          <div
            key={s.label}
            className={s.hideInExport ? 'paojiao-ledger-export-hide' : undefined}
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

      {lastRound && (
        <section className="paojiao-ledger-export-only" style={{ ...ledgerCardStyle }}>
          <div
            style={{
              padding: '20px 22px 8px',
              fontSize: 13,
              fontWeight: 600,
              color: ledgerColor.textMuted,
            }}
          >
            {`รายการในรอบ · ${lastRoundRows.length} รายการ · แถว ${lastRound.fromRow}-${lastRound.toRow}`}
          </div>
          {lastRoundRows.map((e) => {
            const inAmount = e.inCash + e.inBank
            const outAmount = e.outCash + e.outBank
            return (
              <div
                key={e.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '84px 1fr 90px',
                  gap: 10,
                  alignItems: 'center',
                  padding: '9px 22px',
                  borderBottom: `1px solid ${ledgerColor.rowDivider}`,
                }}
              >
                <span
                  style={{
                    fontFamily: ledgerFont.mono,
                    fontSize: 12.5,
                    color: ledgerColor.textMuted,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {fmtFull(e.date)}
                </span>
                <span style={{ fontSize: 13.5, minWidth: 0, overflow: 'hidden' }}>
                  <div style={{ fontWeight: 500 }}>{e.item}</div>
                  {e.note && (
                    <div style={{ fontSize: 12.5, color: ledgerColor.textFaint }}>{e.note}</div>
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
        </section>
      )}
    </>
  )
}

export default PageLedgerSummary
