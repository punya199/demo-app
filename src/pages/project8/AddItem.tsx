import { Button, Form, Input } from "antd"

export interface Item {
  name: string
  price: number
}

interface AddItemProps {
  onAddItem: (item: Item) => void
  items: Item[]
}

export const AddItem = ({ onAddItem }: AddItemProps) => {
  const [form] = Form.useForm()
  const onFinish = (values: Item) => {
    onAddItem(values)
    form.resetFields()
    form.setFieldsValue({
      name: ""

    })

  }
  return (
    <div>
      <Form onFinish={onFinish} form={form} layout="inline" className="!flex justify-between !p-4">
        <Form.Item name="name" label="Name" rules={[{ required: true, message: "Please input name" }]}>
          <Input placeholder="Name" />
        </Form.Item>
        <Form.Item name="price" label="Price" rules={[{ required: true, message: "Please input price" }]}>
          <Input placeholder="Price" type="number" max={1000000} min={0} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Add Item
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}
