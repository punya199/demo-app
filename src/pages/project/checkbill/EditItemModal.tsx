import { Form, Input, Modal } from 'antd'
import { useEffect } from 'react'
import { AppInputNumber } from '../../../components/AppInputNumber'
import { Item } from './AddItem'

interface EditItemModalProps {
  open: boolean
  item: Item | null
  items: Item[]
  onSave: (itemId: string, updates: { name: string; price: number }) => void
  onClose: () => void
}

interface FormValues {
  name: string
  price: number
}

export const EditItemModal = ({ open, item, items, onSave, onClose }: EditItemModalProps) => {
  const [form] = Form.useForm<FormValues>()

  useEffect(() => {
    if (open && item) {
      form.setFieldsValue({ name: item.name, price: item.price })
    }
  }, [form, item, open])

  const onFinish = (values: FormValues) => {
    if (!item) return
    onSave(item.id, values)
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
          name="name"
          label="ชื่อ"
          validateTrigger="onChange"
          rules={[
            { required: true, message: 'กรุณาใส่ชื่อสินค้า' },
            {
              validator(_rule, value) {
                if (item && items.some((n) => n.id !== item.id && n.name === value)) {
                  return Promise.reject('ชื่อนี้ถูกใช้ไปแล้ว')
                }
                if (value && value.length > 20) {
                  return Promise.reject('ชื่อต้องไม่เกิน 20 ตัวอักษร')
                }
                return Promise.resolve()
              },
            },
          ]}
        >
          <Input placeholder="เช่น รีเจนซี่" />
        </Form.Item>

        <Form.Item name="price" label="ราคา" rules={[{ required: true, message: 'กรุณาใส่ราคา' }]}>
          <AppInputNumber
            thousandSeparator=","
            allowNegative={false}
            decimalScale={0}
            allowLeadingZeros={false}
            placeholder="(บาท)"
            valueIsNumericString
            isAllowed={({ floatValue }) =>
              floatValue === undefined || (floatValue >= 0 && floatValue <= 1000000)
            }
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}
