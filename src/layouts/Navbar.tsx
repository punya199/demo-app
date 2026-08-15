import {
  DownOutlined,
  LockOutlined,
  LogoutOutlined,
  MenuOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Avatar, Button, Drawer, Dropdown, Menu, MenuProps, Space } from 'antd'
import { motion } from 'motion/react'
import { compact } from 'lodash'
import { startTransition, useCallback, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { TypingAnimation } from '../components/magicui/typing-animation'
import { appPath } from '../config/app-paths'
import { useGetMe, usePermissionRouteAllow, UserRole } from '../service'
import { EnumPermissionFeatureName } from '../services/permission/permission.params'
import { apiClient } from '../utils/api-client'
import { checkRole, sleep } from '../utils/helper'
import { useScreen } from '../utils/responsive-helper'
import { ChangePasswordModal } from './ChangePasswordModal'

type MenuItem = Required<MenuProps>['items'][number]

const appVersion = import.meta.env.VITE_APP_VERSION || 'unknown'

const Navbar = () => {
  const navigate = useNavigate()
  const { lg: isDesktopNav } = useScreen()
  const [open, setOpen] = useState(false)
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)
  const { data: user } = useGetMe()
  const isLoggedIn = !!user?.user?.id
  const queryClient = useQueryClient()
  const showDrawer = () => setOpen(true)
  const onClose = () => setOpen(false)
  const menuHouseRentAllowed = usePermissionRouteAllow(EnumPermissionFeatureName.HOUSE_RENT, {
    requiredRead: true,
  })

  const { mutate: logout } = useMutation({
    mutationFn: async () => {
      const [{ data }] = await Promise.all([apiClient.post(`/auth/logout`), sleep(350)])
      return data
    },
    onSettled: () => {
      startTransition(() => {
        navigate(appPath.login(), {
          replace: true,
        })
        queryClient.resetQueries({
          predicate(query) {
            return !query.queryHash.includes('permissions')
          },
        })
      })
    },
  })

  const handleLogout = useCallback(() => {
    logout()
  }, [logout])

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
          onMouseEnter: () => {
            import('../pages/project/checkbill/PageAllBill')
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
                onMouseEnter: () => {
                  import('../pages/house-rent/PageHouseRent')
                },
              },
              {
                key: 'sub4',
                label: 'Manage User',
                onClick: () => {
                  navigate(appPath.manageUser())
                  onClose()
                },
                onMouseEnter: () => {
                  import('../pages/PageManageUser')
                },
              },
            ]
          : []),
      ]),
    [menuHouseRentAllowed, navigate, user?.user?.role]
  )

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'version',
      label: `Version ${appVersion}`,
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'change-password',
      label: 'Change Password',
      icon: <LockOutlined />,
      onClick: () => setChangePasswordOpen(true),
    },
    {
      key: 'logout',
      label: 'Logout',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ]

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-4 shadow-sm backdrop-blur sm:px-6 dark:border-slate-800 dark:bg-slate-900/90">
      {isDesktopNav ? (
        <div className="flex h-16 items-center justify-between gap-4">
          <Link to={appPath.home()} className="shrink-0">
            <TypingAnimation
              className="text-xl font-bold text-slate-900 dark:text-white"
              duration={80}
            >
              YaYa
            </TypingAnimation>
          </Link>

          <Menu
            mode="horizontal"
            items={items}
            selectable={false}
            className="min-w-0 flex-1 !justify-center !border-none !bg-transparent"
          />

          <div className="flex items-center">
            {isLoggedIn ? (
              <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button type="text" className="flex items-center gap-2 !px-2">
                    <Avatar size="small" icon={<UserOutlined />} />
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      {user.user.username}
                    </span>
                    <DownOutlined className="text-xs text-slate-400 dark:text-slate-500" />
                  </Button>
                </motion.div>
              </Dropdown>
            ) : (
              <Link to={appPath.login()} state={{ redirect: location.pathname }}>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button type="primary">Login</Button>
                </motion.div>
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-4">
          <div />
          <Link to={appPath.home()}>
            <TypingAnimation
              className="text-xl font-bold text-slate-900 dark:text-white"
              duration={80}
            >
              YaYa
            </TypingAnimation>
          </Link>
          <div className="flex justify-end">
            <motion.div whileTap={{ scale: 0.9 }}>
              <Button
                type="text"
                icon={<MenuOutlined className="text-lg text-slate-700 dark:text-slate-200" />}
                onClick={showDrawer}
              />
            </motion.div>
          </div>
        </div>
      )}

      <Drawer title="Menu" placement="right" onClose={onClose} open={open} width={300}>
        <Menu mode="inline" items={items} selectable={false} />

        <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
          <Space direction="vertical" size="middle" className="w-full">
            {isLoggedIn ? (
              <>
                <div className="flex items-center gap-2 px-1 text-slate-600 dark:text-slate-300">
                  <Avatar size="small" icon={<UserOutlined />} />
                  <span className="font-medium">{user.user.username}</span>
                </div>
                <Button
                  block
                  icon={<LockOutlined />}
                  onClick={() => {
                    setChangePasswordOpen(true)
                    onClose()
                  }}
                >
                  Change Password
                </Button>
                <Button
                  block
                  icon={<LogoutOutlined />}
                  onClick={() => {
                    handleLogout()
                    onClose()
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <Link to={appPath.login()} state={{ redirect: location.pathname }}>
                <Button type="primary" block onClick={onClose}>
                  Login
                </Button>
              </Link>
            )}
            <div className="text-center text-xs text-slate-400 dark:text-slate-500">
              Version {appVersion}
            </div>
          </Space>
        </div>
      </Drawer>

      <ChangePasswordModal open={changePasswordOpen} onClose={() => setChangePasswordOpen(false)} />
    </header>
  )
}

export default Navbar
