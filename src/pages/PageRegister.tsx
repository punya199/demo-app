import { useMutation } from '@tanstack/react-query'
import { Button, Form, Input } from 'antd'
import { AxiosError } from 'axios'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { TypingAnimation } from '../components/magicui/typing-animation'
import { appPath } from '../config/app-paths'
import { apiClient } from '../utils/api-client'
type Data = {
  accessToken: string
  user: { id: number; username: string; password: string }
}
const PageRegister = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const { mutate: register } = useMutation({
    mutationFn: async (values: { username: string; password: string }) => {
      const [{ data }] = await Promise.all([
        apiClient.post<Data>(`/users/register`, {
          username: values.username,
          password: values.password,
        }),
      ])
      return data
    },
    onSuccess: () => {
      navigate(appPath.login())
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        const message = error.response?.data.message

        form.setFields([{ name: 'username', errors: [message] }])
      }
    },
  })

  const onFinish = useCallback(
    async (values: { username: string; password: string }) => {
      register(values)
    },
    [register]
  )
  return (
    <div className="login-container flex min-h-screen items-center justify-center bg-gradient-to-r from-blue-300 to-purple-400">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h2 className="mb-6 text-center text-3xl font-bold text-gray-800">
          <TypingAnimation className="text-3xl" delay={200}>
            Register
          </TypingAnimation>
        </h2>
        <Form
          form={form}
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            label={
              <span className="text-lg font-semibold text-gray-700">
                <TypingAnimation className="text-lg" delay={400}>
                  Username
                </TypingAnimation>
              </span>
            }
            name="username"
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <Input className="focus:ring-opacity-50 rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200" />
          </Form.Item>

          <Form.Item
            label={
              <span className="text-lg font-semibold text-gray-700">
                <TypingAnimation className="text-lg" delay={600}>
                  Password
                </TypingAnimation>
              </span>
            }
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password className="focus:ring-opacity-50 rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full rounded-md bg-blue-500 py-2 font-semibold text-white transition duration-300 hover:bg-blue-600"
            >
              <TypingAnimation className="text-base" delay={800}>
                Confirm
              </TypingAnimation>
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

export default PageRegister
