import { Button, Form, Input } from 'antd'
import { v4 } from 'uuid'

export interface Item {
  name: string
  price: number
  id: string
}

interface AddItemProps {
  onAddItem: (item: Item) => void
  items: Item[]
}

export const AddItem = ({ onAddItem, items }: AddItemProps) => {
  const [form] = Form.useForm()
  const name = Form.useWatch('name', form)

  const onFinish = (values: Item) => {
    onAddItem({ ...values, id: v4() })
    form.resetFields()
    form.setFieldsValue({ name: '' })
  }

  const disabledButton = () => {
    return items.some((n) => n.name === name)
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-2">เพิ่มรายการ</h3>
      <Form onFinish={onFinish} form={form} layout="inline" className="flex flex-wrap gap-4">
        <Form.Item
          name="name"
          label="ชื่อ"
          rules={[
            { required: true, message: 'กรุณาใส่ชื่อสินค้า' },
            {
              validator(_rule, value) {
                if (items.some((n) => n.name === value)) {
                  return Promise.reject('ชื่อนี้ถูกใช้ไปแล้ว')
                }
                return Promise.resolve()
              },
            },
          ]}
        >
          <Input placeholder="เช่น ข้าวมันไก่" />
        </Form.Item>

        <Form.Item name="price" label="ราคา" rules={[{ required: true, message: 'กรุณาใส่ราคา' }]}>
          <Input type="number" placeholder="ราคา (บาท)" min={0} max={1000000} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" disabled={disabledButton()}>
            เพิ่มรายการ
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}
