import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, Form, Input } from 'antd'
import { useCallback, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { TypingAnimation } from '../components/magicui/typing-animation'
import { appPath } from '../config/app-paths'
import { useGetMe } from '../service'
import { apiClient } from '../utils/api-client'
import { sleep } from '../utils/helper'
import { useAuthStore } from '../utils/store'
type Data = {
  accessToken: string
  user: { id: number; username: string; password: string }
}

const Login = () => {
  const { data: user } = useGetMe()
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const { setAccessToken } = useAuthStore()
  const { mutate: login, isPending } = useMutation({
    mutationFn: async (values: { username: string; password: string }) => {
      const [{ data }] = await Promise.all([
        apiClient.post<Data>(`/users/login`, {
          username: values.username,
          password: values.password,
        }),
        sleep(350),
      ])
      return data
    },
    onSuccess: (data) => {
      setAccessToken(data.accessToken)
      queryClient.refetchQueries()
      const redirect = location.state?.redirect
      if (redirect) {
        navigate(redirect)
      } else {
        navigate(appPath.home())
      }
    },
  })

  useEffect(() => {
    if (user?.user?.id) {
      navigate(appPath.home())
    }
  }, [navigate, user?.user?.id])

  const onFinish = useCallback(
    async (values: { username: string; password: string }) => {
      login(values)
    },
    [login]
  )

  return (
    <div className="login-container flex min-h-screen items-center justify-center bg-gradient-to-r from-cyan-500 to-blue-500">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h2 className="mb-6 text-center text-3xl font-bold text-gray-800">
          <TypingAnimation className="text-3xl">Welcome Back!</TypingAnimation>
        </h2>
        <Form name="login" onFinish={onFinish} layout="vertical">
          <Form.Item
            label={
              <span className="text-lg font-semibold text-gray-700">
                <TypingAnimation className="text-lg" delay={200}>
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
                <TypingAnimation className="text-lg" delay={400}>
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
              loading={isPending}
              className="w-full rounded-md bg-blue-500 py-2 font-semibold text-white transition duration-300 hover:bg-blue-600"
            >
              <TypingAnimation className="text-base" delay={600}>
                Login
              </TypingAnimation>
            </Button>
          </Form.Item>
        </Form>
        <Button
          onClick={() => navigate(appPath.register())}
          className="w-full rounded-md bg-blue-500 py-2 font-semibold text-white transition duration-300 hover:bg-blue-600"
        >
          <TypingAnimation className="text-base" delay={1000}>
            Register
          </TypingAnimation>
        </Button>
      </div>
    </div>
  )
}

export default Login
