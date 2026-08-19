import { describe, expect, it } from 'vitest'
import {
  computeBase,
  computeChartLayout,
  computeShares,
  computeSummaryPeriod,
  computeWageTotals,
  filterEntriesByMonth,
  getMonthChips,
} from './ledger-calculations'
import { LedgerData } from './ledger-types'

// Small hand-verified fixture (not the real ledger) - two closed rounds plus one entry past
// the last closed round, so both the "round" and "all" period notes get exercised.
const fixture: LedgerData = {
  opening: {
    cash: 1000,
    bank: 2000,
    priorProfit: 500,
    priorWithdraw: { น้าปุ้ม: 100, ปัญญา: 50 },
  },
  startDate: '2026-01-01',
  lastRoundRow: 4,
  entries: [
    {
      id: 1,
      row: 1,
      date: '2026-01-05',
      item: 'ขาย',
      inCash: 0,
      inBank: 1000,
      outCash: 0,
      outBank: 0,
      note: '',
    },
    {
      id: 2,
      row: 2,
      date: '2026-01-05',
      item: 'ซื้อ',
      inCash: 0,
      inBank: 0,
      outCash: 0,
      outBank: 300,
      note: '',
    },
    {
      id: 3,
      row: 3,
      date: '2026-01-10',
      item: 'ขาย',
      inCash: 0,
      inBank: 2000,
      outCash: 0,
      outBank: 0,
      note: '',
    },
    {
      id: 4,
      row: 4,
      date: '2026-01-10',
      item: 'ซื้อ',
      inCash: 0,
      inBank: 0,
      outCash: 0,
      outBank: 500,
      note: '',
    },
    {
      id: 5,
      row: 5,
      date: '2026-01-15',
      item: 'ค่าแรงยายปิ่น',
      inCash: 0,
      inBank: 0,
      outCash: 200,
      outBank: 0,
      note: '',
    },
  ],
  rounds: [
    { date: '2026-01-05', fromRow: 1, toRow: 2, profit: 700 },
    { date: '2026-01-10', fromRow: 3, toRow: 4, profit: 1500 },
  ],
  withdrawals: [{ who: 'น้าปุ้ม', date: '2026-01-12', bank: 200, cash: 0, note: '' }],
  wages: [{ date: '2026-01-01', amount: 100 }],
  items: ['ขาย', 'ซื้อ', 'ค่าแรงยายปิ่น'],
}

describe('computeBase', () => {
  it('derives cash, bank, days run, and total profit', () => {
    const base = computeBase(fixture, [])

    expect(base.cash).toBe(800) // 1000 + (0 - 200) - 0
    expect(base.bank).toBe(4000) // 2000 + (3000 - 800) - 200
    expect(base.daysRun).toBe(14) // 2026-01-15 - 2026-01-01
    expect(base.profitAll).toBe(2700) // 500 + 700 + 1500
  })

  it('folds in locally-added extra entries', () => {
    const base = computeBase(fixture, [
      {
        id: 9000,
        row: 0,
        date: '2026-01-20',
        item: 'ขาย',
        inCash: 500,
        inBank: 0,
        outCash: 0,
        outBank: 0,
        note: '',
      },
    ])

    expect(base.cash).toBe(1300) // 800 + 500
    expect(base.daysRun).toBe(19) // last entry now 2026-01-20
  })
})

describe('computeSummaryPeriod', () => {
  it('round mode matches the last round profit exactly and flags the open entry', () => {
    const base = computeBase(fixture, [])
    const view = computeSummaryPeriod(fixture, base.entries, base.rounds, 'round')

    expect(view.periodIn).toBe(2000)
    expect(view.periodOut).toBe(500)
    expect(view.periodProfit).toBe(1500)
    expect(view.periodProfit).toBe(fixture.rounds[fixture.rounds.length - 1].profit)
    expect(view.perDayDiv).toBe(5) // 2026-01-10 - 2026-01-05
    expect(view.periodNote).toContain('มีอีก 1 รายการ')
  })

  it('all mode sums every closed round plus the carried-forward profit', () => {
    const base = computeBase(fixture, [])
    const view = computeSummaryPeriod(fixture, base.entries, base.rounds, 'all')

    expect(view.periodIn).toBe(3000)
    expect(view.periodOut).toBe(800)
    expect(view.carry).toBe(500)
    expect(view.periodProfit).toBe(2700)
    expect(view.periodProfit).toBe(base.profitAll)
    expect(view.periodNote).toContain('อีก 1 รายการ')
  })

  it('day mode uses only the latest date present', () => {
    const base = computeBase(fixture, [])
    const view = computeSummaryPeriod(fixture, base.entries, base.rounds, 'day')

    expect(view.periodLabel).toContain('15 ม.ค. 69')
    expect(view.periodProfit).toBe(-200) // entry 5: 0 in - 200 out
  })
})

describe('computeChartLayout', () => {
  it('gives every bar the full height range when nothing is negative', () => {
    const { upH, dnH, bars } = computeChartLayout([
      { v: 700, label: 'a' },
      { v: 1500, label: 'b' },
    ])

    expect(upH).toBe(210)
    expect(dnH).toBe(0)
    expect(bars.every((b) => b.positive)).toBe(true)
  })

  it('splits the chart into up/down halves when a value is negative', () => {
    const { upH, dnH, bars } = computeChartLayout([
      { v: 700, label: 'a' },
      { v: -300, label: 'b' },
    ])

    expect(upH).toBe(148)
    expect(dnH).toBe(62)
    expect(bars[1].positive).toBe(false)
    expect(bars[1].negText).toBe('−0.3k')
  })
})

describe('getMonthChips / filterEntriesByMonth', () => {
  it('lists months newest-first with an "all" option first', () => {
    const chips = getMonthChips(fixture.entries)
    expect(chips.map((c) => c.key)).toEqual(['all', '2026-01'])
  })

  it('filters entries down to the selected month', () => {
    expect(filterEntriesByMonth(fixture.entries, '2026-01')).toHaveLength(5)
    expect(filterEntriesByMonth(fixture.entries, '2026-02')).toHaveLength(0)
    expect(filterEntriesByMonth(fixture.entries, 'all')).toHaveLength(5)
  })
})

describe('computeShares', () => {
  it('splits profit by ratio and tracks what each person has taken', () => {
    const [naPum, panya] = computeShares(fixture, 2700, 50)

    expect(naPum.share).toBe(1350)
    expect(naPum.taken).toBe(300) // 100 opening + 200 withdrawal
    expect(naPum.left).toBe(1050)
    expect(naPum.progressPct).toBeCloseTo(22.222, 2)

    expect(panya.share).toBe(1350)
    expect(panya.taken).toBe(50) // opening only, no withdrawals
    expect(panya.left).toBe(1300)
  })

  it('gives an uneven split when the ratio is not 50:50', () => {
    const [naPum, panya] = computeShares(fixture, 2700, 70)

    expect(naPum.share).toBeCloseTo(1890, 5)
    expect(panya.share).toBeCloseTo(810, 5)
  })
})

describe('computeWageTotals', () => {
  it('sums unpaid wage entries and what has actually been paid out', () => {
    const { wagePaid, wageTotal } = computeWageTotals(fixture.entries, fixture.wages)

    expect(wagePaid).toBe(200) // entry 5's out amounts
    expect(wageTotal).toBe(100)
  })
})
