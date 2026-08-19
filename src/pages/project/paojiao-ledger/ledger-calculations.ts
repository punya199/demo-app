// Business logic ported 1:1 from design_handoff_paojiao_ledger/design/ledger-app.dc.html
// (Component.renderVals). See the README's "Calculations" section for the spec these
// implement - rounds are row blocks, not date ranges; always slice by `row`.
import { fmtDay, fmtFull, monthKey, monthLabel, THB } from './ledger-format'
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
  period: LedgerSummaryPeriod
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
      bars: rounds.map((r) => ({ v: r.profit, label: fmtDay(r.date) })),
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
      bars: rounds.map((r) => ({ v: r.profit, label: fmtDay(r.date) })),
    }
  }

  if (period === 'month') {
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
      bars: keys.map((k) => ({ v: sum(byMonth[k], (r) => r.profit), label: monthLabel(k) })),
    }
  }

  // period === 'day'
  const dates = [...new Set(entries.map((e) => e.date))].sort()
  const lastD = dates[dates.length - 1] ?? ''
  const win = entries.filter((e) => e.date === lastD)
  const periodIn = sum(win, (e) => e.inCash + e.inBank)
  const periodOut = sum(win, (e) => e.outCash + e.outBank)
  return {
    periodProfit: periodIn - periodOut,
    periodIn,
    periodOut,
    periodLabel: `วันที่ ${lastD ? fmtFull(lastD) : ''}`,
    chartTitle: 'เข้า−ออก 14 วันล่าสุด',
    perDayDiv: 1,
    periodNote: '',
    carry: 0,
    bars: dates.slice(-14).map((d) => {
      const w = entries.filter((e) => e.date === d)
      return {
        v: sum(w, (e) => e.inCash + e.inBank) - sum(w, (e) => e.outCash + e.outBank),
        label: fmtDay(d),
      }
    }),
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

export interface WithdrawalRow {
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
      rows: [
        { dateText: 'ยกมา', label: 'ยอดเดิม', amount: opening },
        ...rows.map((w) => ({
          dateText: fmtFull(w.date),
          label: w.note || (w.bank ? 'โอน' : 'เงินสด'),
          amount: w.cash + w.bank,
        })),
      ],
    }
  })
}

export const computeWageTotals = (entries: LedgerEntry[], allWages: { amount: number }[]) => {
  const wagePaid = sum(entries, (e) => (e.item === 'ค่าแรงยายปิ่น' ? e.outCash + e.outBank : 0))
  const wageTotal = sum(allWages, (w) => w.amount)
  return { wagePaid, wageTotal }
}
