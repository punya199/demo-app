import { Form, Input, Modal } from 'antd'
import { useEffect } from 'react'
import { Friend } from './AddFriends'

interface EditFriendModalProps {
  open: boolean
  friend: Friend | null
  friends: Friend[]
  onSave: (friendId: string, updates: { name: string }) => void
  onClose: () => void
}

interface FormValues {
  name: string
}

export const EditFriendModal = ({
  open,
  friend,
  friends,
  onSave,
  onClose,
}: EditFriendModalProps) => {
  const [form] = Form.useForm<FormValues>()

  useEffect(() => {
    if (open && friend) {
      form.setFieldsValue({ name: friend.name })
    }
  }, [form, friend, open])

  const onFinish = (values: FormValues) => {
    if (!friend) return
    onSave(friend.id, values)
    onClose()
  }

  return (
    <Modal
      title="แก้ไขชื่อเพื่อน"
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
          label="ชื่อเพื่อน"
          validateTrigger="onChange"
          rules={[
            { required: true, message: 'กรุณาใส่ชื่อ' },
            {
              validator(_rule, value) {
                if (friend && friends.some((n) => n.id !== friend.id && n.name === value)) {
                  return Promise.reject('ชื่อนี้ถูกใช้ไปแล้ว')
                }
                if (value && value.length > 12) {
                  return Promise.reject('ชื่อต้องไม่เกิน 12 ตัวอักษร')
                }
                return Promise.resolve()
              },
            },
          ]}
        >
          <Input placeholder="คนที่ต้องจ่าย" />
        </Form.Item>
      </Form>
    </Modal>
  )
}
