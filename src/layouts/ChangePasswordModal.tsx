import { LockOutlined } from '@ant-design/icons'
import { Button, Form, Input, message, Modal } from 'antd'
import { AxiosError } from 'axios'
import { useCallback } from 'react'
import { useChangePassword } from '../services/user/user.query'

interface IChangePasswordModalProps {
  open: boolean
  onClose: () => void
}

interface IFormValues {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export const ChangePasswordModal = (props: IChangePasswordModalProps) => {
  const { open, onClose } = props
  const [form] = Form.useForm<IFormValues>()
  const { mutate: changePassword, isPending } = useChangePassword()

  const handleClose = useCallback(() => {
    form.resetFields()
    onClose()
  }, [form, onClose])

  const onFinish = useCallback(
    (values: IFormValues) => {
      changePassword(
        { currentPassword: values.currentPassword, newPassword: values.newPassword },
        {
          onSuccess: () => {
            message.success('เปลี่ยนรหัสผ่านสำเร็จ')
            handleClose()
          },
          onError: (error) => {
            const responseMessage =
              error instanceof AxiosError ? error.response?.data?.message : undefined
            form.setFields([
              { name: 'currentPassword', errors: [responseMessage || 'เปลี่ยนรหัสผ่านไม่สำเร็จ'] },
            ])
          },
        }
      )
    },
    [changePassword, form, handleClose]
  )

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <LockOutlined className="text-blue-600 dark:text-blue-400" />
          เปลี่ยนรหัสผ่าน
        </div>
      }
      open={open}
      onCancel={handleClose}
      footer={null}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={onFinish} className="mt-4">
        <Form.Item
          label="รหัสผ่านปัจจุบัน"
          name="currentPassword"
          rules={[{ required: true, message: 'กรุณากรอกรหัสผ่านปัจจุบัน' }]}
        >
          <Input.Password autoFocus />
        </Form.Item>

        <Form.Item
          label="รหัสผ่านใหม่"
          name="newPassword"
          rules={[
            { required: true, message: 'กรุณากรอกรหัสผ่านใหม่' },
            { min: 6, message: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร' },
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          label="ยืนยันรหัสผ่านใหม่"
          name="confirmPassword"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: 'กรุณายืนยันรหัสผ่านใหม่' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve()
                }
                return Promise.reject(new Error('รหัสผ่านยืนยันไม่ตรงกัน'))
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item className="!mb-0 flex justify-end gap-2">
          <div className="flex justify-end gap-2">
            <Button onClick={handleClose}>ยกเลิก</Button>
            <Button type="primary" htmlType="submit" loading={isPending}>
              บันทึก
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  )
}
