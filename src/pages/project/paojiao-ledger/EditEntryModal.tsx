import { Button, Form, Input, Modal, Popconfirm } from 'antd'
import { useEffect } from 'react'
import { AppInputNumber } from '../../../components/AppInputNumber'
import { LedgerDatePicker } from './LedgerDatePicker'
import { LedgerItemSelect } from './LedgerItemSelect'
import { ledgerPillStyle } from './ledger-ui-styles'
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
  onManageItems: () => void
  // Only rows after the last closed round can be deleted (see deleteEntry in
  // paojiao-ledger.service.ts) - the delete button only appears when this entry qualifies.
  canDelete: boolean
  onDelete: (row: number) => void
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

export const EditEntryModal = ({
  open,
  entry,
  items,
  onSave,
  onClose,
  onManageItems,
  canDelete,
  onDelete,
}: EditEntryModalProps) => {
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

  const handleDelete = () => {
    if (!entry) return
    onDelete(entry.row)
    onClose()
  }

  return (
    <Modal
      title="แก้ไขรายการ"
      open={open}
      onCancel={onClose}
      destroyOnHidden
      // Narrower than AntD's 520px default - fit-content lets the direction-picker pill row (the
      // widest thing in this form) set the dialog's width instead of leaving empty side margins.
      width="fit-content"
      footer={[
        canDelete && (
          <Popconfirm
            key="delete"
            title="ลบรายการนี้?"
            description="ลบแล้วกู้คืนไม่ได้"
            okText="ลบ"
            cancelText="ยกเลิก"
            okButtonProps={{ danger: true }}
            onConfirm={handleDelete}
          >
            <Button danger>ลบ</Button>
          </Popconfirm>
        ),
        <Button key="cancel" onClick={onClose}>
          ยกเลิก
        </Button>,
        <Button key="ok" type="primary" onClick={() => form.submit()}>
          บันทึก
        </Button>,
      ]}
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
          <LedgerItemSelect items={items} onManageClick={onManageItems} />
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
