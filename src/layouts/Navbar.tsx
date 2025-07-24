import { MenuOutlined } from '@ant-design/icons'
import { useQueryClient } from '@tanstack/react-query'
import { Button, Drawer, Dropdown, Menu, MenuProps, Space, Typography } from 'antd'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { appPath } from '../config/app-paths'
import { useGetMe } from '../service'
const { Title } = Typography

const Navbar = () => {
  const [open, setOpen] = useState(false)
  const { data: user } = useGetMe()
  const isLoggedIn = !!user?.user.id
  const queryClient = useQueryClient()
  const showDrawer = () => setOpen(true)
  const onClose = () => setOpen(false)

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    queryClient.resetQueries()
  }

  const items: MenuProps['items'] = [
    {
      label: <Link to={appPath.randomCard()}>RandomCard</Link>,
      key: '0',
    },
    {
      label: <Link to={appPath.omamaGame()}>Game Omama</Link>,
      key: '1',
    },
    {
      label: <Link to={appPath.checkBillPage()}>Check Bill</Link>,
      key: '2',
    },
  ]

  return (
    <nav className="bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 shadow-lg">
      <div className="flex items-center justify-between">
        {/* Left: Logo */}
        <Link to={appPath.home()}>
          <motion.div whileHover={{ scale: 1.1 }}>
            <Title level={3} className="!m-0 !text-white">
              YAYA
            </Title>
          </motion.div>
        </Link>
        <div className="hidden md:block">
          <Dropdown menu={{ items }}>
            <a onClick={(e) => e.preventDefault()}>
              <Button className="text-blue-500 hover:text-blue-700">Game</Button>
            </a>
          </Dropdown>
        </div>

        <div className="flex items-center gap-4">
          {isLoggedIn && user.user.username}
          <div className="hidden items-center gap-2 lg:flex">
            {isLoggedIn ? (
              <motion.div whileHover={{ scale: 1.1 }}>
                <Button
                  type="link"
                  className="!text-white hover:!text-cyan-300"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </motion.div>
            ) : (
              <Link to={appPath.login()}>
                <motion.div whileHover={{ scale: 1.1 }}>
                  <Button type="link" className="!text-white hover:!text-cyan-300">
                    Login
                  </Button>
                </motion.div>
              </Link>
            )}
            <div className="rounded bg-black px-2 py-1 text-xs text-white">
              Version: {import.meta.env.VITE_APP_VERSION || 'unknown'}
            </div>
          </div>

          <motion.div whileTap={{ scale: 0.9 }}>
            <div className="lg:hidden">
              <Button
                type="text"
                icon={<MenuOutlined className="text-xl text-white" />}
                onClick={showDrawer}
              />
            </div>
          </motion.div>
        </div>
      </div>

      <Drawer
        title="Menu"
        placement="right"
        onClose={onClose}
        open={open}
        width={300} // Reduced width for the Drawer
        classNames={{ body: 'p-0' }}
      >
        <Menu mode="vertical" selectable={false}>
          <Menu.Item onClick={onClose}>
            <Link to={appPath.randomCard()}>RandomCard</Link>
          </Menu.Item>
          <Menu.Item onClick={onClose}>
            <Link to={appPath.omamaGame()}>Game Omama</Link>
          </Menu.Item>

          <Menu.Item onClick={onClose}>
            <Link to={appPath.checkBillPage()}>Check Bill</Link>
          </Menu.Item>
        </Menu>

        <div className="p-4">
          <Space direction="vertical" size="middle" className="w-full">
            {isLoggedIn ? (
              <Button
                type="link"
                block
                onClick={() => {
                  handleLogout()
                  onClose()
                }}
              >
                Logout
              </Button>
            ) : (
              <Link to={appPath.login()}>
                <Button type="link" block onClick={onClose}>
                  Login
                </Button>
              </Link>
            )}
            <div className="rounded bg-black px-2 py-1 text-xs text-white">
              Version: {import.meta.env.VITE_APP_VERSION || 'unknown'}
            </div>
          </Space>
        </div>
      </Drawer>
    </nav>
  )
}

export default Navbar
