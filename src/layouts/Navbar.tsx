import { MenuOutlined } from '@ant-design/icons'
import { useQueryClient } from '@tanstack/react-query'
import { Button, Drawer, Dropdown, Menu, Space, Typography } from 'antd'
import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { appPath } from '../config/app-paths'
import { useGetMe, UserRole } from '../service'
import { checkRole } from '../utils/helper'
const { Title } = Typography

interface IMenuItemData {
  name: string
  path: string
}

const menuItemsMap: Record<string, IMenuItemData> = {
  randomCard: {
    name: 'RandomCard',
    path: appPath.randomCard(),
  },
  omamaGame: {
    name: 'Game Omama',
    path: appPath.omamaGame(),
  },
  checkBill: {
    name: 'Check Bill',
    path: appPath.checkBillPage(),
  },
  houseRent: {
    name: 'House Rent',
    path: appPath.houseRent(),
  },
  manageUser: {
    name: 'Manage User',
    path: appPath.manageUser(),
  },
}

const Navbar = () => {
  const navigate = useNavigate()
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

  // const menuItemsDesktop = useMemo((): IMenuItemData[] => {
  //   const defaultItems = [menuItemsMap.randomCard, menuItemsMap.omamaGame, menuItemsMap.checkBill]

  //   if (user?.user.role === UserRole.ADMIN) {
  //     defaultItems.push(menuItemsMap.houseRent)
  //     defaultItems.push(menuItemsMap.manageUser)
  //   }

  //   return defaultItems
  // }, [user?.user.role])

  const menuItemsMobile: IMenuItemData[] = useMemo((): IMenuItemData[] => {
    const defaultItems = [menuItemsMap.randomCard, menuItemsMap.omamaGame, menuItemsMap.checkBill]

    if (checkRole(UserRole.ADMIN, user?.user.role)) {
      defaultItems.push(menuItemsMap.houseRent)
      defaultItems.push(menuItemsMap.manageUser)
    }

    return defaultItems
  }, [user?.user.role])

  return (
    <nav className="bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 shadow-lg">
      <div className="grid grid-cols-2 md:grid-cols-3">
        {/* Left: Logo */}
        <Link to={appPath.home()}>
          <motion.div whileHover={{ scale: 1.1 }}>
            <Title level={3} className="!m-0 !text-white">
              YAYA
            </Title>
          </motion.div>
        </Link>
        <div className="hidden items-center justify-center md:flex">
          <Dropdown
            menu={{
              items: [
                {
                  label: 'RandomCard',
                  key: 'randomCard',
                  onClick: () => navigate(appPath.randomCard()),
                },
                {
                  label: 'Game Omama',
                  key: 'omamaGame',
                  onClick: () => navigate(appPath.omamaGame()),
                },
              ],
            }}
          >
            <a onClick={(e) => e.preventDefault()}>
              <Button className="text-blue-500 hover:text-blue-700">Game</Button>
            </a>
          </Dropdown>
          <Button onClick={() => navigate(appPath.checkBillPage())}>Check Bill</Button>
        </div>

        <div className="flex items-center justify-end gap-4">
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
        // className="!hidden md:block" // Hide on md screens
      >
        <Menu mode="vertical" selectable={false}>
          {menuItemsMobile.map((item) => (
            <Menu.Item key={item.name} onClick={onClose}>
              <Link to={item.path}>{item.name}</Link>
            </Menu.Item>
          ))}
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
