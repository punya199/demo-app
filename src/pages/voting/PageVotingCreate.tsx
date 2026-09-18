import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import {
  Button,
  DatePicker,
  Flex,
  Form,
  Input,
  InputNumber,
  message,
  Select,
  Typography,
} from 'antd'
import dayjs, { Dayjs } from 'dayjs'
import { useNavigate } from 'react-router-dom'
import { appPath } from '../../config/app-paths'
import { EnumPollType, ICreatePollParams } from './voting-interface'
import { useCreatePoll } from './voting-service'

interface IPollFormValues {
  title: string
  description?: string
  pollType: EnumPollType
  options: string[]
  maxSelections?: number
  closesAt?: Dayjs
}

const pollTypeOptions = [
  { value: EnumPollType.SINGLE, label: 'Single choice' },
  { value: EnumPollType.MULTIPLE, label: 'Multiple choice' },
  { value: EnumPollType.RANKING, label: 'Ranking' },
]

export const PageVotingCreate = () => {
  const navigate = useNavigate()
  const { mutate: createPoll, isPending } = useCreatePoll()
  const [form] = Form.useForm<IPollFormValues>()
  const pollType = Form.useWatch('pollType', form)

  const handleSubmit = (values: IPollFormValues) => {
    const params: ICreatePollParams = {
      title: values.title,
      description: values.description,
      pollType: values.pollType,
      options: values.options,
      maxSelections: values.pollType === EnumPollType.MULTIPLE ? values.maxSelections : undefined,
      closesAt: values.closesAt?.toISOString(),
    }

    createPoll(params, {
      onSuccess: (data) => {
        message.success('Poll created')
        navigate(appPath.voting(), { replace: true, state: { newPollSlug: data.poll.slug } })
      },
    })
  }

  return (
    <div className="space-y-4 py-6 md:p-4">
      <Typography.Title level={4}>Create a poll</Typography.Title>
      <Form<IPollFormValues>
        form={form}
        layout="vertical"
        initialValues={{ pollType: EnumPollType.SINGLE, options: ['', ''] }}
        onFinish={handleSubmit}
      >
        <Form.Item name="title" label="Title" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={2} />
        </Form.Item>
        <Form.Item name="pollType" label="Poll type" rules={[{ required: true }]}>
          <Select options={pollTypeOptions} />
        </Form.Item>
        <Form.List
          name="options"
          rules={[
            {
              validator: async (_, options: string[]) => {
                if (!options || options.length < 2) {
                  throw new Error('At least 2 options are required')
                }
              },
            },
          ]}
        >
          {(fields, { add, remove }, { errors }) => (
            <Form.Item label="Options">
              <Flex vertical gap={8}>
                {fields.map((field) => (
                  <Flex key={field.key} gap={8}>
                    <Form.Item
                      {...field}
                      noStyle
                      rules={[{ required: true, message: 'Option cannot be empty' }]}
                    >
                      <Input placeholder={`Option ${field.name + 1}`} />
                    </Form.Item>
                    {fields.length > 2 && (
                      <MinusCircleOutlined onClick={() => remove(field.name)} />
                    )}
                  </Flex>
                ))}
                <Button type="dashed" onClick={() => add('')} icon={<PlusOutlined />}>
                  Add option
                </Button>
                <Form.ErrorList errors={errors} />
              </Flex>
            </Form.Item>
          )}
        </Form.List>
        {pollType === EnumPollType.MULTIPLE && (
          <Form.Item
            name="maxSelections"
            label="Max selections (leave blank for unlimited)"
            rules={[{ type: 'number', min: 1 }]}
          >
            <InputNumber min={1} className="w-full" />
          </Form.Item>
        )}
        <Form.Item name="closesAt" label="Closes at (optional)">
          <DatePicker
            showTime
            className="w-full"
            disabledDate={(current) => current && current < dayjs().startOf('day')}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isPending}>
            Create poll
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}
