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

// "14 ก.ค." - no year, used on chart x-axis labels.
export const fmtDay = (iso: string) => {
  const d = parseIsoDate(iso)
  return `${d.getDate()} ${TH_MONTH[d.getMonth()]}`
}

// "14 ก.ค. 69" - Thai short month + Buddhist 2-digit year.
export const fmtFull = (iso: string) => {
  const d = parseIsoDate(iso)
  const buddhistYear = String((d.getFullYear() + 543) % 100).padStart(2, '0')
  return `${d.getDate()} ${TH_MONTH[d.getMonth()]} ${buddhistYear}`
}

export const monthKey = (iso: string) => iso.slice(0, 7)

export const monthLabel = (key: string) => {
  const [y, m] = key.split('-')
  const buddhistYear = String((+y + 543) % 100).padStart(2, '0')
  return `${TH_MONTH[+m - 1]} ${buddhistYear}`
}
