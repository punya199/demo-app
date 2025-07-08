import { useQueryClient } from '@tanstack/react-query'
import { Button, Form, Input } from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { appConfig } from '../config/app-config'
import { useGetMe } from '../service'
import { apiClient } from '../utils/api-client'
type Data = {
  accessToken: string
  user: { id: number; username: string; password: string }
}

const Login = () => {
  const [loading, setLoading] = useState(false)
  const { data: user } = useGetMe()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  useEffect(() => {
    if (user?.user.id) {
      navigate('/')
    }
  }, [navigate, user?.user.id])
  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true)
    const { data } = await apiClient.post<Data>(`${appConfig().VITE_API_DOMAIN}/users/login`, {
      username: values.username,
      password: values.password,
    })
    setTimeout(() => {
      setLoading(false)
    }, 1000)

    localStorage.setItem('accessToken', data.accessToken)
    queryClient.refetchQueries()
  }

  return (
    <div className="login-container flex min-h-screen items-center justify-center bg-gradient-to-r from-blue-300 to-purple-400">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h2 className="mb-6 text-center text-3xl font-bold text-gray-800">Welcome Back!</h2>
        <Form name="login" initialValues={{ remember: true }} onFinish={onFinish} layout="vertical">
          <Form.Item
            label={<span className="text-lg font-semibold text-gray-700">Username</span>}
            name="username"
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <Input className="focus:ring-opacity-50 rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200" />
          </Form.Item>

          <Form.Item
            label={<span className="text-lg font-semibold text-gray-700">Password</span>}
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password className="focus:ring-opacity-50 rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full rounded-md bg-blue-500 py-2 font-semibold text-white transition duration-300 hover:bg-blue-600"
            >
              Login
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

export default Login
