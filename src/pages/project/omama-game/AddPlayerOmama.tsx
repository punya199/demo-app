import {
  CaretDownOutlined,
  CaretUpOutlined,
  DeleteOutlined,
  UserAddOutlined,
} from '@ant-design/icons'
import { Avatar, Button, Form, Input, Tooltip } from 'antd'
import { motion } from 'motion/react'

interface AddPlayerProps {
  userNameList?: string[]
  addUserName: (name: string) => void
  removeUserName: (name: string) => void
  upperIndexName: (index: number) => void
  downIndexName: (index: number) => void
}
const AddPlayerOmama = (props: AddPlayerProps) => {
  const [form] = Form.useForm()

  const onFinish = (values: { playerName: string }) => {
    props.addUserName(values.playerName)
    form.resetFields()
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <Form form={form} onFinish={onFinish} layout="inline" className="flex gap-2">
        <Form.Item
          name="playerName"
          rules={[
            { required: true, message: 'Please enter a player name' },
            {
              validator: (_rule, value) => {
                if (props.userNameList?.includes(value)) {
                  return Promise.reject('This name is already taken')
                }
                return Promise.resolve()
              },
            },
          ]}
          className="!mr-0 flex-1"
        >
          <Input
            placeholder="ชื่อผู้เล่น"
            prefix={<UserAddOutlined className="text-slate-400" />}
          />
        </Form.Item>
        <Form.Item className="!mr-0">
          <Button type="primary" htmlType="submit">
            เพิ่มชื่อ
          </Button>
        </Form.Item>
      </Form>

      <div className="mt-3 space-y-2">
        {props.userNameList?.map((name, index) => (
          <motion.div
            key={name}
            layout
            className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-800/50"
          >
            <Avatar size="small" style={{ backgroundColor: '#2563eb' }}>
              {index + 1}
            </Avatar>
            <div className="flex-1 font-medium text-slate-700 dark:text-slate-200">{name}</div>
            <Tooltip title="เลื่อนขึ้น">
              <Button
                size="small"
                icon={<CaretUpOutlined />}
                disabled={index === 0}
                onClick={() => {
                  props.upperIndexName(index)
                }}
              />
            </Tooltip>
            <Tooltip title="เลื่อนลง">
              <Button
                size="small"
                icon={<CaretDownOutlined />}
                disabled={index + 1 === props.userNameList?.length}
                onClick={() => {
                  props.downIndexName(index)
                }}
              />
            </Tooltip>
            <Tooltip title="ลบผู้เล่น">
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => props.removeUserName(name)}
              />
            </Tooltip>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default AddPlayerOmama
