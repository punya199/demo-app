import { Button, Form, Input } from 'antd'

interface AboutProps {
  child: (mag: FormValues) => void
}
export interface FormValues {
  product: string
  price: number
  Category: string
}

const MeowForm = ({ child }: AboutProps) => {
  return (
    <div>
      <Form<FormValues>
        onFinish={values => {
          child(values)
        }}
      >
        <Form.Item name={'product'}>
          <Input placeholder="ชื่อสินค้า"></Input>
        </Form.Item>
        <Form.Item name={'price'}>
          <Input placeholder="ราคา" type="number"></Input>
        </Form.Item>
        <Form.Item name={'Category'} rules={[{ required: true }]}>
          <Input placeholder="หมวดหมู่"></Input>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            ส่งข้อความ
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default MeowForm
