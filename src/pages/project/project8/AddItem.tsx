import { Button, Form, Input } from 'antd'
import { v4 } from 'uuid'
import { AppInputNumber } from '../../../components/AppInputNumber'

export interface Item {
  name: string
  price: number
  id: string
  payerId?: string
  friendIds?: string[]
}

interface AddItemProps {
  onAddItem: (item: Item) => void
  items: Item[]
}

export const AddItem = ({ onAddItem, items }: AddItemProps) => {
  const [form] = Form.useForm()
  const name = Form.useWatch('name', form)

  const onFinish = (values: Item) => {
    const item: Item = {
      id: v4(),
      name: values.name,
      price: values.price,
    }
    onAddItem(item)
    form.resetFields()
  }

  const disabledButton = () => {
    return items.some((n) => n.name === name)
  }

  return (
    <div className="rounded-lg bg-gray-50 p-4 shadow-sm">
      <h3 className="mb-2 text-lg font-semibold">เพิ่มรายการ</h3>
      <Form
        onFinish={onFinish}
        form={form}
        layout="inline"
        className="flex flex-wrap justify-between gap-2"
      >
        <Form.Item
          name="name"
          label="ชื่อ"
          validateTrigger="onChange"
          className="w-full"
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
          <Input placeholder="เช่น รีเจนซี่" />
        </Form.Item>

        <Form.Item
          name="price"
          label="ราคา"
          rules={[{ required: true, message: 'กรุณาใส่ราคา' }]}
          className="w-full"
        >
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

        <Form.Item className="w-full text-center">
          <Button type="primary" htmlType="submit" disabled={disabledButton()} className="!w-35">
            เพิ่มรายการ
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}
