// Design tokens straight from design_handoff_paojiao_ledger/README.md — colors, type, and
// spacing are final per the handoff, so these are used as literal values rather than mapped
// onto the app's Tailwind/AntD theme.
export const ledgerColor = {
  pageBg: '#F4F1EA',
  cardSurface: '#FFFDF8',
  cardSurfaceAlt: '#FDFAF3',
  tableHeader: '#F0EBDF',
  tableFooter: '#FAF6EC',
  cardBorder: '#E3DDD0',
  rowDivider: '#F2EDE2',
  inputBorder: '#DAD3C4',
  hairline: '#D6D0C4',
  textPrimary: '#1A1917',
  textSecondary: '#4A4A42',
  textMuted: '#6B6B62',
  textFaint: '#8A8A7E',
  disabledNumber: '#B5B0A4',
  darkSurface: '#1F2420',
  darkText: '#EDE9E0',
  darkTextMuted: '#8E9A90',
  darkTextMuted2: '#6F7A71',
  darkNavInactive: '#C9D0C9',
  darkDivider: '#343B35',
  accent: '#C2410C',
  accentHover: '#9A3412',
  moneyIn: '#0E7C5A',
  moneyOut: '#B3261E',
  profitHighlightOnDark: '#86D6AE',
} as const

export const ledgerFont = {
  sans: '"IBM Plex Sans Thai", sans-serif',
  mono: '"IBM Plex Mono", monospace',
} as const

export const LEDGER_FONT_STYLESHEET_HREF =
  'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap'
