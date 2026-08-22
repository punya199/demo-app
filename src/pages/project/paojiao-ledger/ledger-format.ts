const TH_MONTH = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
]

// Formats a number as Thai baht text: thousands separators, up to 2 decimals.
// Negative amounts must be prefixed with the typographic minus (−) by the caller when needed -
// this only formats the magnitude.
export const THB = (n: number) =>
  (Math.round(n * 100) / 100).toLocaleString('en-US', { maximumFractionDigits: 2 })

export const thbSigned = (n: number) => (n < 0 ? '−' : '') + THB(Math.abs(n))

const parseIsoDate = (iso: string) => new Date(iso + 'T00:00:00')

// "14/08" - numeric day/month, no year. Used on chart x-axis labels, where every extra px per
// label counts (see BAR_MIN_WIDTH/BarChartCard) and a Thai month name (with or without periods)
// read as visually busy at that size. Sliced straight from the iso string, already zero-padded -
// no Date object needed for this one.
export const fmtDay = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`

// "14 ก.ค. 69" - Thai short month + Buddhist 2-digit year.
export const fmtFull = (iso: string) => {
  const d = parseIsoDate(iso)
  const buddhistYear = String((d.getFullYear() + 543) % 100).padStart(2, '0')
  return `${d.getDate()} ${TH_MONTH[d.getMonth()]} ${buddhistYear}`
}

// "15/08/69" - numeric day/month/2-digit Buddhist year, all-numeric like fmtDay but with the year
// included. Used in tight list rows (e.g. withdrawal history) where fmtFull's Thai month name
// takes more horizontal room than the row can spare.
export const fmtShort = (iso: string) => {
  const buddhistYear = String((parseIsoDate(iso).getFullYear() + 543) % 100).padStart(2, '0')
  return `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${buddhistYear}`
}

export const monthKey = (iso: string) => iso.slice(0, 7)

export const monthLabel = (key: string) => {
  const [y, m] = key.split('-')
  const buddhistYear = String((+y + 543) % 100).padStart(2, '0')
  return `${TH_MONTH[+m - 1]} ${buddhistYear}`
}

// "08/69" - numeric month/year, same convention as fmtDay's "14/08" for the day charts. Used only
// on the "รายเดือน" bar chart's x-axis - monthLabel's full "ส.ค. 69" is wider than BAR_MIN_WIDTH
// was sized for and risks the same label-overlap bug fmtDay was introduced to fix. monthLabel
// itself stays as-is for the period heading and month-filter pills, where the extra width is fine.
export const monthLabelShort = (key: string) => {
  const [y, m] = key.split('-')
  const buddhistYear = String((+y + 543) % 100).padStart(2, '0')
  return `${m}/${buddhistYear}`
}
