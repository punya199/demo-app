import { Button, Form, Input, Modal, Popconfirm } from 'antd'
import { useEffect } from 'react'
import { AppInputNumber } from '../../../components/AppInputNumber'
import { LedgerDatePicker } from './LedgerDatePicker'
import { LedgerWithdrawal } from './ledger-types'

export interface EditWithdrawalFormValues {
  date: string
  cash: number
  bank: number
  note: string
}

interface EditWithdrawalModalProps {
  open: boolean
  withdrawal: LedgerWithdrawal | null
  onSave: (who: string, row: number, values: EditWithdrawalFormValues) => void
  onClose: () => void
  onDelete: (who: string, row: number) => void
}

export const EditWithdrawalModal = ({
  open,
  withdrawal,
  onSave,
  onClose,
  onDelete,
}: EditWithdrawalModalProps) => {
  const [form] = Form.useForm<EditWithdrawalFormValues>()

  useEffect(() => {
    if (open && withdrawal) {
      form.setFieldsValue({
        date: withdrawal.date,
        cash: withdrawal.cash,
        bank: withdrawal.bank,
        note: withdrawal.note,
      })
    }
  }, [form, withdrawal, open])

  const onFinish = (values: EditWithdrawalFormValues) => {
    if (!withdrawal) return
    onSave(withdrawal.who, withdrawal.row, values)
    onClose()
  }

  const handleDelete = () => {
    if (!withdrawal) return
    onDelete(withdrawal.who, withdrawal.row)
    onClose()
  }

  return (
    <Modal
      title="แก้ไขรายการถอน"
      open={open}
      onCancel={onClose}
      destroyOnHidden
      width="fit-content"
      footer={[
        <Popconfirm
          key="delete"
          title="ลบรายการถอนนี้?"
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
          label="วันที่ถอน"
          rules={[{ required: true, message: 'กรุณาใส่วันที่' }]}
        >
          <LedgerDatePicker />
        </Form.Item>

        {/* Separate เงินสด/บัญชี fields, not a single type+amount - a withdrawal row can carry
            both at once (e.g. a "รวมยอด" carried-forward summary row has non-zero cash AND bank
            together), so collapsing to one field would silently drop whichever side wasn't
            selected the moment this modal saved. */}
        <Form.Item
          name="cash"
          label="เงินสด"
          rules={[{ required: true, message: 'ใส่ 0 ถ้าไม่มี' }]}
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

        <Form.Item
          name="bank"
          label="บัญชี"
          rules={[{ required: true, message: 'ใส่ 0 ถ้าไม่มี' }]}
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

        <Form.Item name="note" label="หมายเหตุ">
          <Input placeholder="ไม่ใส่ก็ได้" />
        </Form.Item>
      </Form>
    </Modal>
  )
}
