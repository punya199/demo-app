// Business logic ported 1:1 from design_handoff_paojiao_ledger/design/ledger-app.dc.html
// (Component.renderVals). See the README's "Calculations" section for the spec these
// implement - rounds are row blocks, not date ranges; always slice by `row`.
import {
  fmtDay,
  fmtFull,
  fmtShort,
  monthKey,
  monthLabel,
  monthLabelShort,
  THB,
} from './ledger-format'
import {
  LedgerData,
  LedgerEntry,
  LedgerPerson,
  LedgerRound,
  LedgerSummaryPeriod,
} from './ledger-types'

const DAY_MS = 86400000
const sum = <T>(arr: T[], f: (x: T) => number) => arr.reduce((a, x) => a + f(x), 0)
const daysBetween = (a: string, b: string) =>
  Math.max(1, Math.round((new Date(a).getTime() - new Date(b).getTime()) / DAY_MS))

export interface LedgerBase {
  entries: LedgerEntry[]
  cash: number
  bank: number
  daysRun: number
  profitAll: number
  rounds: LedgerRound[]
}

export const computeBase = (data: LedgerData, extraEntries: LedgerEntry[]): LedgerBase => {
  const entries = [...data.entries, ...extraEntries]
  const { opening: OP, withdrawals: W, rounds } = data

  const cash = OP.cash + sum(entries, (e) => e.inCash - e.outCash) - sum(W, (w) => w.cash)
  const bank = OP.bank + sum(entries, (e) => e.inBank - e.outBank) - sum(W, (w) => w.bank)
  const daysRun = entries.length ? daysBetween(entries[entries.length - 1].date, data.startDate) : 1
  const profitAll = OP.priorProfit + sum(rounds, (r) => r.profit)

  return { entries, cash, bank, daysRun, profitAll, rounds }
}

export interface PeriodBar {
  v: number
  label: string
  date: string // ISO date this bar represents - lets a chart space points by real elapsed time
}

export interface PeriodView {
  periodProfit: number
  periodIn: number
  periodOut: number
  periodLabel: string
  chartTitle: string
  bars: PeriodBar[]
  perDayDiv: number
  periodNote: string
  carry: number
}

const inRoundBlocks = (entries: LedgerEntry[], rounds: LedgerRound[]) =>
  entries.filter((e) => rounds.some((r) => e.row >= r.fromRow && e.row <= r.toRow))

export const computeSummaryPeriod = (
  data: LedgerData,
  entries: LedgerEntry[],
  rounds: LedgerRound[],
  period: Exclude<LedgerSummaryPeriod, 'day' | 'expenses'>
): PeriodView => {
  const lastRow = data.lastRoundRow
  const openCount = entries.filter((e) => e.row > lastRow || !e.row).length

  if (period === 'all') {
    const win = inRoundBlocks(entries, rounds)
    const periodIn = sum(win, (e) => e.inCash + e.inBank)
    const periodOut = sum(win, (e) => e.outCash + e.outBank)
    const carry = data.opening.priorProfit
    return {
      periodProfit: periodIn - periodOut + carry,
      periodIn,
      periodOut,
      periodLabel: `ทั้งหมด ตั้งแต่ ${fmtFull(data.startDate)}`,
      chartTitle: 'กำไรแต่ละรอบขายน้ำมัน',
      perDayDiv: daysBetween(entries[entries.length - 1]?.date ?? data.startDate, data.startDate),
      periodNote: openCount
        ? `อีก ${openCount} รายการหลังรอบล่าสุดยังไม่ปิดรอบ จึงยังไม่นับเป็นกำไร`
        : '',
      carry,
      bars: rounds.map((r) => ({ v: r.profit, label: fmtDay(r.date), date: r.date })),
    }
  }

  if (period === 'round') {
    const last = rounds[rounds.length - 1] ?? { profit: 0, date: '', fromRow: 0, toRow: 0 }
    const win = inRoundBlocks(entries, [last])
    const periodIn = sum(win, (e) => e.inCash + e.inBank)
    const periodOut = sum(win, (e) => e.outCash + e.outBank)
    const prevDate = rounds.length > 1 ? rounds[rounds.length - 2].date : data.startDate
    return {
      periodProfit: periodIn - periodOut,
      periodIn,
      periodOut,
      periodLabel: `รอบล่าสุด ปิดรอบ ${last.date ? fmtFull(last.date) : ''}`,
      chartTitle: 'กำไรแต่ละรอบขายน้ำมัน',
      perDayDiv: last.date ? daysBetween(last.date, prevDate) : 1,
      periodNote: openCount ? `มีอีก ${openCount} รายการหลังวันปิดรอบ ที่จะไปอยู่ในรอบถัดไป` : '',
      carry: 0,
      bars: rounds.map((r) => ({ v: r.profit, label: fmtDay(r.date), date: r.date })),
    }
  }

  // period === 'month'
  const byMonth: Record<string, LedgerRound[]> = {}
  rounds.forEach((r) => {
    const k = monthKey(r.date)
    ;(byMonth[k] ??= []).push(r)
  })
  const keys = Object.keys(byMonth).sort()
  const lastK = keys[keys.length - 1] ?? ''
  const win = inRoundBlocks(entries, byMonth[lastK] ?? [])
  const periodIn = sum(win, (e) => e.inCash + e.inBank)
  const periodOut = sum(win, (e) => e.outCash + e.outBank)
  return {
    periodProfit: periodIn - periodOut,
    periodIn,
    periodOut,
    periodLabel: `เดือน ${lastK ? monthLabel(lastK) : ''} · ${(byMonth[lastK] ?? []).length} รอบที่ปิดในเดือนนี้`,
    chartTitle: 'กำไรรายเดือน',
    perDayDiv: new Set(win.map((e) => e.date)).size || 1,
    periodNote: '',
    carry: 0,
    bars: keys.map((k) => ({
      v: sum(byMonth[k], (r) => r.profit),
      label: monthLabelShort(k),
      date: `${k}-01`,
    })),
  }
}

// Labor payments and the misc/catch-all bucket aren't "bought from a supplier" - excluded from
// vendor spend so it answers "bought how much from whom", not general cash outflow.
const VENDOR_SPEND_EXCLUDED_ITEMS = new Set(['ค่าแรงยายปิ่น', 'อื่นๆ'])

export interface VendorSpendRow {
  item: string
  amount: number
}

export interface VendorSpendView {
  periodLabel: string
  totalOut: number
  rows: VendorSpendRow[]
}

// "Bought how much from whom" - item text already doubles as the vendor label for purchase
// entries (e.g. "มัน ดิ๊ก" = cassava bought from ดิ๊ก), so grouping by item is grouping by vendor.
// `windowDays`, when given, anchors a trailing window on the latest entry's date (not the system
// clock, since this app is driven entirely by whenever the sheet was last updated) - e.g. latest
// date 21 ส.ค. with windowDays=30 starts the window 22 ก.ค., inclusive. Omit it for the ledger's
// whole lifetime, starting from `startDate`. Amounts are rounded to whole baht for this view only
// (a ranking, not an exact statement).
// The live sheet's own "วันที่เริ่ม" cell (the source of `startDate`) is stale - it still holds
// the date tracking began overall, before older history was split off into a separate archive
// tab that this app never reads entry-level data from. `startDate` still doubles as a safe (if
// too-early) cutoff for the whole-lifetime filter below, but the label shown to the user is
// pinned to the live sheet's actual first entry instead, per explicit decision not to touch the
// sheet cell just to fix display text.
const WHOLE_LIFETIME_LABEL_START = '10 ก.ค. 69'

export const computeVendorSpend = (
  entries: LedgerEntry[],
  startDate: string,
  windowDays?: number
): VendorSpendView => {
  const lastDate = entries[entries.length - 1]?.date ?? ''
  const fromIso =
    windowDays !== undefined && lastDate
      ? new Date(new Date(lastDate).getTime() - windowDays * DAY_MS).toISOString().slice(0, 10)
      : startDate
  const cutoffMs = new Date(fromIso).getTime()

  const win = entries.filter(
    (e) =>
      new Date(e.date).getTime() >= cutoffMs &&
      !VENDOR_SPEND_EXCLUDED_ITEMS.has(e.item) &&
      e.outCash + e.outBank > 0
  )

  const totals = new Map<string, number>()
  for (const e of win) {
    totals.set(e.item, (totals.get(e.item) ?? 0) + e.outCash + e.outBank)
  }
  const rows = [...totals.entries()]
    .map(([item, amount]) => ({ item, amount: Math.round(amount) }))
    .sort((a, b) => b.amount - a.amount)

  const labelFrom = windowDays !== undefined ? fmtFull(fromIso) : WHOLE_LIFETIME_LABEL_START
  return {
    periodLabel: lastDate ? `ข้อมูลจากวันที่ ${labelFrom} ถึง ${fmtFull(lastDate)}` : '',
    totalOut: sum(rows, (r) => r.amount),
    rows,
  }
}

// Matches the item text the backend uses to auto-detect a round's closing row (see
// OIL_SALE_ITEM in ledger-sheet-parser.ts) and the fixed "sell dregs" category.
const OIL_SALE_ITEM = 'ขาย น้ำมัน'
const DRAFF_SALE_ITEM = 'ขาย กาก'

export interface RevenueBreakdownView {
  periodLabel: string
  total: number
  count: number
  perAverage: number
  bars: PeriodBar[]
}

// Revenue only - unlike round.profit, this doesn't net out that round's purchases/expenses, so
// it answers "how much oil did we actually sell for" per round, not "what did the round net".
// A round's oil-sale revenue can span two rows (a split cash/bank settlement, see deriveRounds on
// the backend), so this sums every oil-sale entry inside the round's block, not just the closer.
export const computeOilSalesPerRound = (
  rounds: LedgerRound[],
  entries: LedgerEntry[]
): RevenueBreakdownView => {
  const bars = rounds.map((r) => {
    const win = entries.filter(
      (e) => e.row >= r.fromRow && e.row <= r.toRow && e.item === OIL_SALE_ITEM
    )
    return { v: sum(win, (e) => e.inCash + e.inBank), label: fmtDay(r.date), date: r.date }
  })
  const total = sum(bars, (b) => b.v)
  return {
    periodLabel: rounds.length ? `ทุกรอบที่ปิดแล้ว (${rounds.length} รอบ)` : '',
    total,
    count: rounds.length,
    perAverage: rounds.length ? total / rounds.length : 0,
    bars,
  }
}

// "ขาย กาก" isn't tied to rounds at all - just a regular income item, so this is a flat
// chronological list of every sale, not sliced by round.
export const computeDraffSales = (entries: LedgerEntry[]): RevenueBreakdownView => {
  const sales = entries.filter((e) => e.item === DRAFF_SALE_ITEM)
  const bars = sales.map((e) => ({ v: e.inCash + e.inBank, label: fmtDay(e.date), date: e.date }))
  const total = sum(bars, (b) => b.v)
  return {
    periodLabel: sales.length
      ? `${fmtFull(sales[0].date)} ถึง ${fmtFull(sales[sales.length - 1].date)}`
      : '',
    total,
    count: sales.length,
    perAverage: sales.length ? total / sales.length : 0,
    bars,
  }
}

export interface ChartBarView {
  label: string
  positive: boolean
  upHeightPx: number
  downHeightPx: number
  valueText: string
  negText: string
}

export interface ChartLayout {
  upH: number
  dnH: number
  bars: ChartBarView[]
}

export const computeChartLayout = (bars: PeriodBar[]): ChartLayout => {
  const maxUp = Math.max(1, ...bars.map((b) => Math.max(0, b.v)))
  const maxDn = Math.max(1, ...bars.map((b) => Math.max(0, -b.v)))
  const anyNeg = bars.some((b) => b.v < 0)
  const upH = anyNeg ? 148 : 210
  const dnH = anyNeg ? 62 : 0

  return {
    upH,
    dnH,
    bars: bars.map((b) => {
      const positive = b.v >= 0
      return {
        label: b.label,
        positive,
        upHeightPx: positive ? Math.max(2, (b.v / maxUp) * (upH - 20)) : 0,
        downHeightPx: positive ? 0 : Math.max(2, (-b.v / maxDn) * (dnH - 16)),
        valueText: positive ? `${THB(Math.round(b.v / 100) / 10)}k` : '',
        negText: positive ? '' : `−${THB(Math.round(-b.v / 100) / 10)}k`,
      }
    }),
  }
}

export interface MonthChip {
  key: string
  label: string
}

export const getMonthChips = (entries: LedgerEntry[]): MonthChip[] => {
  const months = [...new Set(entries.map((e) => monthKey(e.date)))].sort().reverse()
  return [
    { key: 'all', label: 'ทุกเดือน' },
    ...months.map((k) => ({ key: k, label: monthLabel(k) })),
  ]
}

export const filterEntriesByMonth = (entries: LedgerEntry[], month: string) =>
  month === 'all' ? entries : entries.filter((e) => monthKey(e.date) === month)

// Distinct item categories actually present in the ledger, Thai-alphabetical - not the full
// dropdown category list (some categories may have zero entries), and not scoped to any month
// filter, so the row of pills stays stable as the user switches months.
export const getItemChips = (entries: LedgerEntry[]): string[] =>
  [...new Set(entries.map((e) => e.item))].sort((a, b) => a.localeCompare(b, 'th'))

// Multi-select: an empty `items` set means "no filter" (show everything), matching how the
// "ทั้งหมด" pill resets selection rather than being one selectable item among the rest.
export const filterEntriesByItems = (entries: LedgerEntry[], items: ReadonlySet<string>) =>
  items.size === 0 ? entries : entries.filter((e) => items.has(e.item))

export interface WithdrawalRow {
  row: number
  dateText: string
  label: string
  amount: number
}

export interface PersonShare {
  name: LedgerPerson
  ratioPct: number
  share: number
  taken: number
  left: number
  progressPct: number
  rows: WithdrawalRow[]
}

const PEOPLE: LedgerPerson[] = ['น้าปุ้ม', 'ปัญญา']

export const computeShares = (
  data: LedgerData,
  profitAll: number,
  ratio: number
): PersonShare[] => {
  const shares = [(profitAll * ratio) / 100, (profitAll * (100 - ratio)) / 100]

  return PEOPLE.map((name, i) => {
    const rows = data.withdrawals.filter((w) => w.who === name)
    const opening = data.opening.priorWithdraw[name] ?? 0
    const taken = opening + sum(rows, (w) => w.cash + w.bank)
    const share = shares[i]
    const left = share - taken
    const progressPct = Math.max(0, Math.min(100, share ? (taken / share) * 100 : 0))

    return {
      name,
      ratioPct: i === 0 ? ratio : 100 - ratio,
      share,
      taken,
      left,
      progressPct,
      // The opening/carried-forward balance is already folded into `taken` above - it isn't a
      // withdrawal that happened on the live sheet, so it doesn't belong in this history list
      // (there's no "ยกมา" row here the way there used to be).
      // Sorted by date (newest first), not sheet row order - a withdrawal logged out of date
      // order (e.g. a backdated entry, or one typed straight into the sheet) would otherwise show
      // up wherever its row happens to sit rather than where it belongs chronologically. Newest
      // first so the most recent entries are the ones visible before the list needs to scroll.
      rows: [...rows]
        .sort((a, b) => b.date.localeCompare(a.date))
        .map((w) => ({
          row: w.row,
          dateText: fmtShort(w.date),
          label: w.note || (w.bank ? 'โอน' : 'เงินสด'),
          amount: w.cash + w.bank,
        })),
    }
  })
}

export const computeWageTotals = (entries: LedgerEntry[], allWages: { amount: number }[]) => {
  const wagePaid = sum(entries, (e) => (e.item === 'ค่าแรงยายปิ่น' ? e.outCash + e.outBank : 0))
  const wageTotal = sum(allWages, (w) => w.amount)
  // What's still owed - the wage table logs what's earned per day worked, separately from
  // wagePaid (actual cash handed over, recorded as its own ledger entry), so the "not yet paid"
  // figure has to net one against the other rather than just showing the raw logged total.
  const wageUnpaid = wageTotal - wagePaid
  return { wagePaid, wageTotal, wageUnpaid }
}
