import { Form, Input, Modal } from 'antd'
import { useEffect } from 'react'
import { AppInputNumber } from '../../../components/AppInputNumber'
import { LedgerDatePicker } from './LedgerDatePicker'
import { ledgerInputStyle, ledgerPillStyle } from './ledger-ui-styles'
import { LedgerEntry, LedgerEntryDirection } from './ledger-types'

const DIR_OPTIONS: { dir: LedgerEntryDirection; label: string }[] = [
  { dir: 'inCash', label: 'เข้า · เงินสด' },
  { dir: 'inBank', label: 'เข้า · บัญชี' },
  { dir: 'outCash', label: 'ออก · เงินสด' },
  { dir: 'outBank', label: 'ออก · บัญชี' },
]

export interface EditEntryFormValues {
  date: string
  item: string
  amount: number
  dir: LedgerEntryDirection
  note: string
}

interface EditEntryModalProps {
  open: boolean
  entry: LedgerEntry | null
  items: string[]
  onSave: (row: number, values: EditEntryFormValues) => void
  onClose: () => void
}

const DirectionPicker = ({
  value,
  onChange,
}: {
  value?: LedgerEntryDirection
  onChange?: (v: LedgerEntryDirection) => void
}) => (
  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
    {DIR_OPTIONS.map((opt) => (
      <button
        key={opt.dir}
        type="button"
        onClick={() => onChange?.(opt.dir)}
        style={ledgerPillStyle(value === opt.dir)}
      >
        {opt.label}
      </button>
    ))}
  </div>
)

export const EditEntryModal = ({ open, entry, items, onSave, onClose }: EditEntryModalProps) => {
  const [form] = Form.useForm<EditEntryFormValues>()

  useEffect(() => {
    if (open && entry) {
      const dir = DIR_OPTIONS.map((o) => o.dir).find((d) => entry[d] > 0) ?? 'outBank'
      form.setFieldsValue({
        date: entry.date,
        item: entry.item,
        amount: entry[dir] || undefined,
        dir,
        note: entry.note,
      })
    }
  }, [form, entry, open])

  const onFinish = (values: EditEntryFormValues) => {
    if (!entry) return
    onSave(entry.row, values)
    onClose()
  }

  return (
    <Modal
      title="แก้ไขรายการ"
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText="บันทึก"
      cancelText="ยกเลิก"
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={onFinish} className="mt-4">
        <Form.Item
          name="date"
          label="วันที่"
          rules={[{ required: true, message: 'กรุณาใส่วันที่' }]}
        >
          <LedgerDatePicker />
        </Form.Item>

        <Form.Item
          name="item"
          label="รายการ"
          rules={[{ required: true, message: 'กรุณาเลือกรายการ' }]}
        >
          <select style={ledgerInputStyle}>
            {items.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </Form.Item>

        <Form.Item
          name="amount"
          label="จำนวนเงิน"
          rules={[{ required: true, message: 'กรุณาใส่จำนวนเงิน' }]}
        >
          <AppInputNumber
            thousandSeparator=","
            allowNegative={false}
            decimalScale={2}
            allowLeadingZeros={false}
            placeholder="0"
            isAllowed={({ floatValue }) => floatValue === undefined || floatValue >= 0}
          />
        </Form.Item>

        <Form.Item name="dir" label="เข้า / ออก">
          <DirectionPicker />
        </Form.Item>

        <Form.Item name="note" label="หมายเหตุ">
          <Input placeholder="ไม่ใส่ก็ได้" />
        </Form.Item>
      </Form>
    </Modal>
  )
}
