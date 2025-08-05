import { CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons'
import { Button, Form, Input } from 'antd'

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
    <div className="flex max-w-5xl flex-col rounded-lg bg-gray-100 p-4 shadow-md">
      <Form form={form} onFinish={onFinish} className="flex items-center gap-2">
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
          className="flex-1"
        >
          <Input
            placeholder="Enter player name"
            className="rounded-lg border border-gray-300 p-2"
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" className="rounded-lg">
            เพิ่มชื่อ
          </Button>
        </Form.Item>
      </Form>
      <div>
        {props.userNameList?.map((name, index) => (
          <div
            key={name}
            className="mb-2 flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white p-2 shadow-sm"
          >
            <div className="flex-1 text-gray-700">{name}</div>
            <div>
              <Button
                icon={<CaretUpOutlined />}
                disabled={index === 0}
                onClick={() => {
                  props.upperIndexName(index)
                }}
              ></Button>
              <Button
                icon={<CaretDownOutlined />}
                disabled={index + 1 === props.userNameList?.length}
                onClick={() => {
                  props.downIndexName(index)
                }}
              ></Button>
            </div>
            <Button onClick={() => props.removeUserName(name)} className="!text-red-500">
              ลบ
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AddPlayerOmama
