import { Button, Form, Input } from 'antd'
import { v4 } from 'uuid'

export interface Friend {
  name: string
  id: string
}

interface AddFriendsProps {
  onAddFriend: (friend: Friend) => void
  friends: Friend[]
}

export const AddFriends = ({ onAddFriend, friends }: AddFriendsProps) => {
  const [form] = Form.useForm()
  const name = Form.useWatch('name', form)

  const onFinish = (values: Friend) => {
    onAddFriend({ ...values, id: v4() })
    form.resetFields()
    form.setFieldsValue({ name: '' })
  }

  const disabledButton = () => {
    return friends.some((n) => n.name === name)
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-2">เพิ่มเพื่อน</h3>
      <Form onFinish={onFinish} form={form} layout="inline" className="flex flex-wrap gap-4">
        <Form.Item
          name="name"
          label="ชื่อเพื่อน"
          rules={[
            { required: true, message: 'กรุณาใส่ชื่อ' },
            {
              validator(_rule, value) {
                if (friends.some((n) => n.name === value)) {
                  return Promise.reject('ชื่อนี้ถูกใช้ไปแล้ว')
                }
                return Promise.resolve()
              },
            },
          ]}
        >
          <Input placeholder="ชื่อเพื่อน" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" disabled={disabledButton()}>
            เพิ่มเพื่อน
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default AddFriends
