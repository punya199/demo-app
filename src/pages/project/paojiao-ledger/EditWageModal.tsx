import { Button, Form, Modal, Popconfirm } from 'antd'
import { useEffect } from 'react'
import { AppInputNumber } from '../../../components/AppInputNumber'
import { LedgerDatePicker } from './LedgerDatePicker'
import { LedgerWage } from './ledger-types'

export interface EditWageFormValues {
  date: string
  amount: number
}

interface EditWageModalProps {
  open: boolean
  wage: LedgerWage | null
  onSave: (row: number, values: EditWageFormValues) => void
  onClose: () => void
  onDelete: (row: number) => void
}

export const EditWageModal = ({ open, wage, onSave, onClose, onDelete }: EditWageModalProps) => {
  const [form] = Form.useForm<EditWageFormValues>()

  useEffect(() => {
    if (open && wage) {
      form.setFieldsValue({ date: wage.date, amount: wage.amount })
    }
  }, [form, wage, open])

  const onFinish = (values: EditWageFormValues) => {
    if (!wage) return
    onSave(wage.row, values)
    onClose()
  }

  const handleDelete = () => {
    if (!wage) return
    onDelete(wage.row)
    onClose()
  }

  return (
    <Modal
      title="แก้ไขค่าแรง"
      open={open}
      onCancel={onClose}
      destroyOnHidden
      width="fit-content"
      footer={[
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
        </Popconfirm>,
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
          label="วันที่ทำงาน"
          rules={[{ required: true, message: 'กรุณาใส่วันที่' }]}
        >
          <LedgerDatePicker />
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
      </Form>
    </Modal>
  )
}
