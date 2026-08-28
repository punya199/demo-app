import { Button, Form, Input, message, Modal, Popconfirm } from 'antd'
import { useEffect } from 'react'
import { AppInputNumber } from '../../../components/AppInputNumber'
import { LedgerDatePicker } from './LedgerDatePicker'
import { LedgerItemSelect } from './LedgerItemSelect'
import { LedgerEntry } from './ledger-types'

export interface EditEntryFormValues {
  date: string
  item: string
  inCash?: number
  inBank?: number
  outCash?: number
  outBank?: number
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

const amountInputProps = {
  thousandSeparator: ',',
  allowNegative: false,
  decimalScale: 2,
  allowLeadingZeros: false,
  placeholder: '0',
  isAllowed: ({ floatValue }: { floatValue?: number }) =>
    floatValue === undefined || floatValue >= 0,
}

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
      form.setFieldsValue({
        date: entry.date,
        item: entry.item,
        inCash: entry.inCash || undefined,
        inBank: entry.inBank || undefined,
        outCash: entry.outCash || undefined,
        outBank: entry.outBank || undefined,
        note: entry.note,
      })
    }
  }, [form, entry, open])

  const onFinish = (values: EditEntryFormValues) => {
    if (!entry) return
    // No single amount field is `required` - a currency-exchange entry needs two at once (e.g.
    // outCash + inBank) and a split cash/bank sale needs two on the same side (inCash + inBank),
    // so this checks "at least one of the four" instead, same as the add form.
    const hasAmount = [values.inCash, values.inBank, values.outCash, values.outBank].some((v) => v)
    if (!hasAmount) {
      message.warning('ใส่จำนวนเงินอย่างน้อย 1 ช่อง')
      return
    }
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
            styles={{ root: { width: 280 } }}
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

        {/* Four independent optional fields, not one amount+direction picker - a currency
            exchange (แลกเงิน) needs both an in and an out at once, and an oil sale paid partly
            cash/partly bank needs both cash and bank on the in side at once. Forcing those into
            two separate rows used to risk splitting one settlement into two rounds if the rows
            ever landed non-adjacent (see deriveRounds' same-item-run handling). */}
        <Form.Item name="inCash" label="เข้า · เงินสด">
          <AppInputNumber {...amountInputProps} />
        </Form.Item>
        <Form.Item name="inBank" label="เข้า · บัญชี">
          <AppInputNumber {...amountInputProps} />
        </Form.Item>
        <Form.Item name="outCash" label="ออก · เงินสด">
          <AppInputNumber {...amountInputProps} />
        </Form.Item>
        <Form.Item name="outBank" label="ออก · บัญชี">
          <AppInputNumber {...amountInputProps} />
        </Form.Item>

        <Form.Item name="note" label="หมายเหตุ">
          <Input placeholder="ไม่ใส่ก็ได้" />
        </Form.Item>
      </Form>
    </Modal>
  )
}
