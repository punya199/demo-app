import {
  CalculatorOutlined,
  HomeOutlined,
  PlaySquareOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { Card } from 'antd'
import { motion, Variants } from 'motion/react'
import { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { TypingAnimation } from '../components/magicui/typing-animation'
import { appPath } from '../config/app-paths'
import { useGetMe, usePermissionRouteAllow, UserRole } from '../service'
import { EnumPermissionFeatureName } from '../services/permission/permission.params'
import { checkRole } from '../utils/helper'

interface ModuleCard {
  title: string
  icon: ReactNode
  path: string
  visible: boolean
}

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 200, damping: 20 },
  },
}

const Home = () => {
  const { data: user } = useGetMe()
  const isSuperAdmin = checkRole(UserRole.SUPER_ADMIN, user?.user?.role)
  const houseRentAllowed = usePermissionRouteAllow(EnumPermissionFeatureName.HOUSE_RENT, {
    requiredRead: true,
  })

  const modules: ModuleCard[] = [
    {
      title: 'Game',
      icon: <PlaySquareOutlined />,
      path: appPath.randomCard(),
      visible: true,
    },
    {
      title: 'Check Bill',
      icon: <CalculatorOutlined />,
      path: appPath.checkBillPage(),
      visible: true,
    },
    {
      title: 'House Rent',
      icon: <HomeOutlined />,
      path: appPath.houseRent(),
      visible: isSuperAdmin && houseRentAllowed,
    },
    {
      title: 'Manage User',
      icon: <TeamOutlined />,
      path: appPath.manageUser(),
      visible: isSuperAdmin,
    },
  ]

  const visibleModules = modules.filter((module) => module.visible)

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-6 px-6 py-16">
      <TypingAnimation className="text-4xl font-bold text-slate-900 dark:text-white">
        YaYa
      </TypingAnimation>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid w-full max-w-md grid-cols-2 gap-4"
      >
        {visibleModules.map((module) => (
          <motion.div key={module.path} variants={cardVariants}>
            <Link to={module.path}>
              <motion.div whileHover={{ scale: 1.05, y: -4 }} whileTap={{ scale: 0.97 }}>
                <Card
                  hoverable
                  className="text-center shadow-sm transition-shadow duration-300 hover:shadow-xl dark:border-slate-700 dark:bg-slate-900"
                >
                  <div className="text-3xl text-blue-600 dark:text-blue-400">{module.icon}</div>
                  <div className="mt-2 font-semibold text-slate-900 dark:text-slate-100">
                    {module.title}
                  </div>
                </Card>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

export default Home
