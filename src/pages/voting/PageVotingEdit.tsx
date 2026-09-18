import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { Alert, Button, Flex, Form, Input, message, Result, Skeleton, Typography } from 'antd'
import { AxiosError } from 'axios'
import { useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { appPath } from '../../config/app-paths'
import { IEditPollParams } from './voting-interface'
import { useEditPoll, useGetPoll } from './voting-service'

interface IEditPollFormValues {
  title: string
  description?: string
  options: string[]
}

export const PageVotingEdit = () => {
  const { pollId } = useParams<{ pollId: string }>()
  const navigate = useNavigate()
  const { data, isLoading, isError, error } = useGetPoll(pollId)
  const { mutate: editPoll, isPending } = useEditPoll(pollId)
  const [form] = Form.useForm<IEditPollFormValues>()

  const poll = data?.poll
  // Seed the form from the server exactly once per poll load, not on every background refetch -
  // otherwise a stale-data refetch (window refocus after 5min+ of editing) would silently
  // discard whatever the admin is mid-edit on. Same fix as PageVotePublic's vote-selection state.
  const initializedForPollId = useRef<string | null>(null)

  useEffect(() => {
    if (!poll || initializedForPollId.current === poll.id) return
    initializedForPollId.current = poll.id
    form.setFieldsValue({
      title: poll.title,
      description: poll.description ?? undefined,
      options: poll.options.map((option) => option.label),
    })
  }, [poll, form])

  const handleSubmit = (values: IEditPollFormValues) => {
    const params: IEditPollParams = {
      title: values.title,
      description: values.description,
      // Options are locked once the poll has a vote - never send a change the backend would
      // reject anyway, and the UI already hides the editor for it.
      options: poll?.hasVotes ? undefined : values.options,
    }

    editPoll(params, {
      onSuccess: () => {
        message.success('Poll updated')
        navigate(appPath.voting(), { replace: true })
      },
      onError: () => message.error('Could not save the poll'),
    })
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-xl space-y-4 py-6">
        <Skeleton active />
      </div>
    )
  }

  if (isError || !poll) {
    const isNotFound = error instanceof AxiosError && error.response?.status === 404
    return (
      <div className="mx-auto max-w-xl py-6">
        <Result
          status={isNotFound ? '404' : 'error'}
          title={isNotFound ? 'Poll not found' : 'Something went wrong'}
          subTitle={isNotFound ? undefined : 'Could not load this poll. Please try again.'}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl space-y-4 py-6">
      <Typography.Title level={4}>Edit poll</Typography.Title>
      <Form<IEditPollFormValues> form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item name="title" label="Title" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={2} />
        </Form.Item>

        {poll.hasVotes ? (
          <Form.Item label="Options">
            <Alert
              type="info"
              showIcon
              message="Options are locked because this poll already has votes."
              className="mb-2"
            />
            <Flex vertical gap={8}>
              {poll.options.map((option) => (
                <Input key={option.id} value={option.label} disabled />
              ))}
            </Flex>
          </Form.Item>
        ) : (
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
        )}

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isPending}>
            Save changes
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}
