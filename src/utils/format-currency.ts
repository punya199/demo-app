export const formatCurrency = (
  value: number,
  options?: {
    locale?: string
    decimal?: number
  }
) => {
  const { locale = 'th-TH', decimal = 2 } = options || {}
  return new Intl.NumberFormat(locale, {
    style: 'decimal',
    minimumFractionDigits: decimal,
    maximumFractionDigits: decimal,
  }).format(value)
}
