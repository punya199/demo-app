import { DatePicker } from 'antd'
import dayjs from 'dayjs'
import 'dayjs/locale/th'

interface LedgerDatePickerProps {
  value?: string // ISO "YYYY-MM-DD"
  onChange?: (value: string) => void
}

// Calendar-only date field (typing is disabled - inputReadOnly) shared by the add-entry form and
// the edit modal, so a date can only ever come from picking a real day on the calendar. Thai
// locale + the light theme (regardless of the site's dark/light toggle) come from the
// ConfigProvider PaojiaoLedgerShell wraps every ledger page in.
export const LedgerDatePicker = ({ value, onChange }: LedgerDatePickerProps) => (
  <DatePicker
    className="ledger-date-picker"
    value={value ? dayjs(value) : null}
    onChange={(date) => onChange?.(date ? date.format('YYYY-MM-DD') : '')}
    format="DD/MM/YYYY"
    inputReadOnly
    allowClear={false}
    style={{ width: '100%' }}
  />
)
