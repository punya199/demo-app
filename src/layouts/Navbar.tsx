import { MenuOutlined } from '@ant-design/icons'
import { useQueryClient } from '@tanstack/react-query'
import { Button, Drawer, Menu, MenuProps, Space } from 'antd'
import { motion } from 'framer-motion'
import { compact } from 'lodash'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { TypingAnimation } from '../components/magicui/typing-animation'
import { appPath } from '../config/app-paths'
import { EnumFeatureName, useGetMe, usePermissionRouteAllow, UserRole } from '../service'
import { checkRole } from '../utils/helper'

// // interface IMenuItemData {
// //   name: string
// //   path: string
// }
type MenuItem = Required<MenuProps>['items'][number]

// const menuItemsMap: Record<string, IMenuItemData> = {
//   randomCard: {
//     name: 'RandomCard',
//     path: appPath.randomCard(),
//   },
//   omamaGame: {
//     name: 'Game Omama',
//     path: appPath.omamaGame(),
//   },
//   checkBill: {
//     name: 'Check Bill',
//     path: appPath.checkBillPage(),
//   },
//   houseRent: {
//     name: 'House Rent',
//     path: appPath.houseRent(),
//   },
//   manageUser: {
//     name: 'Manage User',
//     path: appPath.manageUser(),
//   },
// }

const Navbar = () => {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const { data: user } = useGetMe()
  const isLoggedIn = !!user?.user?.id
  const queryClient = useQueryClient()
  const showDrawer = () => setOpen(true)
  const onClose = () => setOpen(false)

  const menuHouseRentAllowed = usePermissionRouteAllow(EnumFeatureName.HOUSE_RENT, {
    requiredRead: true,
  })
  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    queryClient.resetQueries()
  }

  const items = useMemo(
    (): MenuItem[] =>
      compact([
        {
          key: 'sub1',
          label: 'Game',
          children: [
            {
              key: 'g1',
              label: 'random Card',
              onClick: () => {
                navigate(appPath.randomCard())
                onClose()
              },
            },
            {
              key: 'g2',
              label: 'Omama',
              onClick: () => {
                navigate(appPath.omamaGame())
                onClose()
              },
            },
          ],
        },
        {
          key: 'sub2',
          label: 'Check Bill',
          onClick: () => {
            navigate(appPath.checkBillPage())
            onClose()
          },
        },
        ...(checkRole(UserRole.SUPER_ADMIN, user?.user?.role)
          ? [
              menuHouseRentAllowed && {
                key: 'sub3',
                label: 'House Rent',
                onClick: () => {
                  navigate(appPath.houseRent())
                  onClose()
                },
              },
              {
                key: 'sub4',
                label: 'Manage User',
                onClick: () => {
                  navigate(appPath.manageUser())
                  onClose()
                },
              },
            ]
          : []),
      ]),
    [menuHouseRentAllowed, navigate, user?.user?.role]
  )

  return (
    <nav className="bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-2 shadow-lg">
      <div className="grid grid-cols-2">
        {/* Left: Logo */}
        <Link to={appPath.home()}>
          <TypingAnimation className="text-xl text-amber-50">YaYa</TypingAnimation>
        </Link>

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
              <Link to={appPath.login()} state={{ redirect: location.pathname }}>
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
            <div>
              <Button
                type="text"
                icon={<MenuOutlined className="text-xl text-white" />}
                onClick={showDrawer}
              />
            </div>
          </motion.div>
        </div>
      </div>

      <Drawer title="Menu" placement="right" onClose={onClose} open={open} width={300}>
        <Menu mode="inline" items={items} selectable={false}></Menu>

        <div className="p-3">
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
              <Link to={appPath.login()} state={{ redirect: location.pathname }}>
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
