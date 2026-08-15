import { Form, message, Modal, Select } from 'antd'
import { useEffect } from 'react'
import { EnumUserStatus, IUser, UserRole } from '../../service'
import { useEditUser } from '../../services/user/user.query'

interface IEditUserModalProps {
  open: boolean
  user: IUser | null
  onClose: () => void
}

interface IFormValues {
  role: UserRole
  status: EnumUserStatus
}

const roleOptions = [
  { value: UserRole.USER, label: 'User' },
  { value: UserRole.ADMIN, label: 'Admin' },
]

const statusOptions = [
  { value: EnumUserStatus.ACTIVE, label: 'Active' },
  { value: EnumUserStatus.INACTIVE, label: 'Inactive' },
  { value: EnumUserStatus.BLOCKED, label: 'Blocked' },
]

export const EditUserModal = (props: IEditUserModalProps) => {
  const { open, user, onClose } = props
  const [form] = Form.useForm<IFormValues>()
  const { mutate: editUser, isPending } = useEditUser(user?.id || '')

  useEffect(() => {
    if (open && user) {
      form.setFieldsValue({ role: user.role, status: user.status })
    }
  }, [form, user, open])

  const onFinish = (values: IFormValues) => {
    editUser(values, {
      onSuccess: () => {
        message.success('บันทึกข้อมูลผู้ใช้สำเร็จ')
        onClose()
      },
      onError: () => {
        message.error('บันทึกข้อมูลผู้ใช้ไม่สำเร็จ')
      },
    })
  }

  return (
    <Modal
      title={`แก้ไขผู้ใช้ "${user?.username}"`}
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText="บันทึก"
      cancelText="ยกเลิก"
      confirmLoading={isPending}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={onFinish} className="mt-4">
        <Form.Item label="Role" name="role" rules={[{ required: true }]}>
          <Select options={roleOptions} />
        </Form.Item>
        <Form.Item label="Status" name="status" rules={[{ required: true }]}>
          <Select options={statusOptions} />
        </Form.Item>
      </Form>
    </Modal>
  )
}
