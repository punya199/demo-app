import { Form, Input } from "antd"

import { Button } from "antd"

export interface Friend {
  name: string
  bill: number
}

interface AddFriendsProps {
  onAddFriend: (friend: Friend) => void
}

export const AddFriends = ({ onAddFriend }: AddFriendsProps) => {
  const [form] = Form.useForm()
  const onFinish = (values: Friend) => {
    onAddFriend(values)
    form.resetFields()
    form.setFieldsValue({
      name: "",
      bill: 0
    })
  }
  return (
    <Form onFinish={onFinish} form={form} layout="inline" >
      <Form.Item name="name" label="Name" rules={[{ required: true, message: "Please input name" }]}>
        <Input placeholder="Name" />
      </Form.Item>
      
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Add Friend
        </Button>
      </Form.Item>
    </Form>
  )
}

export default AddFriends 