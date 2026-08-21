import { describe, expect, it } from 'vitest'
import {
  computeBase,
  computeChartLayout,
  computeDraffSales,
  computeOilSalesPerRound,
  computeShares,
  computeSummaryPeriod,
  computeVendorSpend,
  computeWageTotals,
  filterEntriesByItems,
  filterEntriesByMonth,
  getItemChips,
  getMonthChips,
} from './ledger-calculations'
import { LedgerData, LedgerEntry } from './ledger-types'

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
})

describe('computeVendorSpend', () => {
  // computeVendorSpend anchors "latest date" on the last array element, matching how
  // parseEntries/computeBase always hand entries over: in ascending row/date order. The window
  // runs exactly 30 days back from there (last entry 2026-02-10 -> cutoff 2026-01-11, inclusive).
  const vendorEntries: LedgerEntry[] = [
    {
      id: 1,
      row: 1,
      date: '2025-12-01', // more than 30 days before the last entry - outside the window
      item: 'มัน ไก่',
      inCash: 0,
      inBank: 0,
      outCash: 0,
      outBank: 9999,
      note: '',
    },
    {
      id: 2,
      row: 2,
      date: '2026-02-01',
      item: 'มัน กุย',
      inCash: 0,
      inBank: 0,
      outCash: 0,
      outBank: 1000.4,
      note: '',
    },
    {
      id: 3,
      row: 3,
      date: '2026-02-05',
      item: 'มัน หมอน',
      inCash: 0,
      inBank: 0,
      outCash: 500,
      outBank: 0,
      note: '',
    },
    {
      id: 4,
      row: 4,
      date: '2026-02-10',
      item: 'มัน กุย',
      inCash: 0,
      inBank: 0,
      outCash: 0,
      outBank: 300.3,
      note: '',
    },
    {
      id: 5,
      row: 5,
      date: '2026-02-10',
      item: 'ค่าแรงยายปิ่น',
      inCash: 0,
      inBank: 0,
      outCash: 200,
      outBank: 0,
      note: '',
    },
    {
      id: 6,
      row: 6,
      date: '2026-02-10',
      item: 'อื่นๆ',
      inCash: 0,
      inBank: 0,
      outCash: 700,
      outBank: 0,
      note: '',
    },
    {
      id: 7,
      row: 7,
      date: '2026-02-10',
      item: 'ขาย น้ำมัน',
      inCash: 0,
      inBank: 5000,
      outCash: 0,
      outBank: 0,
      note: '',
    },
  ]

  it('sums spend by item within a trailing window, excluding wages, misc, income, and old entries', () => {
    const view = computeVendorSpend(vendorEntries, '2025-11-01', 30)

    expect(view.rows).toEqual([
      { item: 'มัน กุย', amount: 1301 }, // 1000.4 + 300.3 = 1300.7, rounded to whole baht
      { item: 'มัน หมอน', amount: 500 },
    ])
    expect(view.totalOut).toBe(1801)
    expect(view.periodLabel).toBe('11 ม.ค. 69 ถึง 10 ก.พ. 69')
  })

  it('with no window, sums over the whole ledger from startDate - the old entry now counts', () => {
    const view = computeVendorSpend(vendorEntries, '2025-11-01')

    expect(view.rows).toEqual([
      { item: 'มัน ไก่', amount: 9999 },
      { item: 'มัน กุย', amount: 1301 },
      { item: 'มัน หมอน', amount: 500 },
    ])
    expect(view.totalOut).toBe(11800)
    expect(view.periodLabel).toBe('1 พ.ย. 68 ถึง 10 ก.พ. 69')
  })

  it('returns an empty view when there are no entries', () => {
    const view = computeVendorSpend([], '2026-01-01')
    expect(view.rows).toEqual([])
    expect(view.totalOut).toBe(0)
  })
})

describe('computeOilSalesPerRound', () => {
  // Round 2's block also contains a "ขาย กาก" entry - must not be counted as oil-sale revenue.
  // Round 2 also has two oil-sale rows (a split settlement) - both must be summed together.
  const entries: LedgerEntry[] = [
    {
      id: 1,
      row: 1,
      date: '2026-01-01',
      item: 'ขาย น้ำมัน',
      inCash: 0,
      inBank: 5000,
      outCash: 0,
      outBank: 0,
      note: '',
    },
    {
      id: 2,
      row: 2,
      date: '2026-01-02',
      item: 'ขาย กาก',
      inCash: 200,
      inBank: 0,
      outCash: 0,
      outBank: 0,
      note: '',
    },
    {
      id: 3,
      row: 3,
      date: '2026-01-05',
      item: 'ซื้อของ',
      inCash: 0,
      inBank: 0,
      outCash: 0,
      outBank: 1000,
      note: '',
    },
    {
      id: 4,
      row: 4,
      date: '2026-01-05',
      item: 'ขาย น้ำมัน',
      inCash: 1000,
      inBank: 0,
      outCash: 0,
      outBank: 0,
      note: '',
    },
    {
      id: 5,
      row: 5,
      date: '2026-01-05',
      item: 'ขาย น้ำมัน',
      inCash: 0,
      inBank: 2000,
      outCash: 0,
      outBank: 0,
      note: '',
    },
  ]
  const rounds = [
    { date: '2026-01-01', fromRow: 1, toRow: 1, profit: 5000 },
    { date: '2026-01-05', fromRow: 2, toRow: 5, profit: 2200 }, // 200+1000+2000-1000
  ]

  it('sums only oil-sale entries within each round block, ignoring other income in the same block', () => {
    const view = computeOilSalesPerRound(rounds, entries)

    expect(view.bars).toEqual([
      { v: 5000, label: '1 ม.ค.', date: '2026-01-01' },
      { v: 3000, label: '5 ม.ค.', date: '2026-01-05' }, // rows 4+5, split settlement - row 2's "ขาย กาก" excluded
    ])
    expect(view.total).toBe(8000)
    expect(view.count).toBe(2)
    expect(view.perAverage).toBe(4000)
    expect(view.periodLabel).toBe('ทุกรอบที่ปิดแล้ว (2 รอบ)')
  })

  it('returns an empty view when there are no closed rounds', () => {
    const view = computeOilSalesPerRound([], entries)
    expect(view.bars).toEqual([])
    expect(view.total).toBe(0)
    expect(view.count).toBe(0)
    expect(view.perAverage).toBe(0)
    expect(view.periodLabel).toBe('')
  })
})

describe('computeDraffSales', () => {
  const entries: LedgerEntry[] = [
    {
      id: 1,
      row: 1,
      date: '2026-01-01',
      item: 'ขาย น้ำมัน',
      inCash: 0,
      inBank: 5000,
      outCash: 0,
      outBank: 0,
      note: '',
    },
    {
      id: 2,
      row: 2,
      date: '2026-01-03',
      item: 'ขาย กาก',
      inCash: 300,
      inBank: 0,
      outCash: 0,
      outBank: 0,
      note: '',
    },
    {
      id: 3,
      row: 3,
      date: '2026-01-10',
      item: 'ขาย กาก',
      inCash: 0,
      inBank: 450,
      outCash: 0,
      outBank: 0,
      note: '',
    },
  ]

  it('lists every draff sale chronologically, ignoring other item types', () => {
    const view = computeDraffSales(entries)

    expect(view.bars).toEqual([
      { v: 300, label: '3 ม.ค.', date: '2026-01-03' },
      { v: 450, label: '10 ม.ค.', date: '2026-01-10' },
    ])
    expect(view.total).toBe(750)
    expect(view.count).toBe(2)
    expect(view.perAverage).toBe(375)
    expect(view.periodLabel).toBe('3 ม.ค. 69 ถึง 10 ม.ค. 69')
  })

  it('returns an empty view when there are no draff sales', () => {
    const view = computeDraffSales([entries[0]])
    expect(view.bars).toEqual([])
    expect(view.total).toBe(0)
    expect(view.periodLabel).toBe('')
  })
})

describe('computeChartLayout', () => {
  it('gives every bar the full height range when nothing is negative', () => {
    const { upH, dnH, bars } = computeChartLayout([
      { v: 700, label: 'a', date: '2026-01-01' },
      { v: 1500, label: 'b', date: '2026-01-02' },
    ])

    expect(upH).toBe(210)
    expect(dnH).toBe(0)
    expect(bars.every((b) => b.positive)).toBe(true)
  })

  it('splits the chart into up/down halves when a value is negative', () => {
    const { upH, dnH, bars } = computeChartLayout([
      { v: 700, label: 'a', date: '2026-01-01' },
      { v: -300, label: 'b', date: '2026-01-02' },
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

describe('getItemChips / filterEntriesByItems', () => {
  it('lists distinct items present, Thai-alphabetical, with no "all" entry of its own', () => {
    expect(getItemChips(fixture.entries)).toEqual(['ขาย', 'ค่าแรงยายปิ่น', 'ซื้อ'])
  })

  it('an empty selection means no filter - every entry passes through', () => {
    expect(filterEntriesByItems(fixture.entries, new Set())).toHaveLength(5)
  })

  it('filters down to entries matching any of the selected items', () => {
    const result = filterEntriesByItems(fixture.entries, new Set(['ขาย']))
    expect(result).toHaveLength(2)
    expect(result.every((e) => e.item === 'ขาย')).toBe(true)
  })

  it('a multi-item selection is a union, not an intersection', () => {
    const result = filterEntriesByItems(fixture.entries, new Set(['ขาย', 'ค่าแรงยายปิ่น']))
    expect(result).toHaveLength(3)
    expect(result.map((e) => e.item).sort()).toEqual(['ขาย', 'ขาย', 'ค่าแรงยายปิ่น'].sort())
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
