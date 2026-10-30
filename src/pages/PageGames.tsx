import { ArrowLeftOutlined } from '@ant-design/icons'
import { Card } from 'antd'
import { motion, Variants } from 'motion/react'
import { Link } from 'react-router-dom'
import { appPath } from '../config/app-paths'

interface IGameCard {
  title: string
  description: string
  emoji: string
  path: string
}

const games: IGameCard[] = [
  {
    title: 'Random Card',
    description: 'สุ่มไพ่แล้วทำตามคำสั่งบนการ์ด',
    emoji: '🃏',
    path: appPath.randomCard(),
  },
  {
    title: 'Omama',
    description: 'เกมไพ่สำหรับเล่นกับเพื่อนหลายคน',
    emoji: '🎴',
    path: appPath.omamaGame(),
  },
  {
    title: 'นักขุดอัญมณี',
    description: 'เกมพัซเซิลขุดอัญมณีหลายด่าน',
    emoji: '💎',
    path: appPath.gemDiggers(),
  },
  {
    title: 'มอนสเตอร์',
    description: 'เลี้ยงมอนสเตอร์ให้วิวัฒนาการ',
    emoji: '🥚',
    path: appPath.tamagotchi(),
  },
]

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

const PageGames = () => {
  return (
    <div className="flex min-h-full flex-col items-center gap-6 px-6 py-16">
      <div className="relative flex w-full max-w-md items-center justify-center">
        <Link
          to={appPath.home()}
          className="absolute left-0 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
          aria-label="กลับหน้าแรก"
        >
          <ArrowLeftOutlined className="text-lg" />
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Game</h1>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid w-full max-w-md grid-cols-2 gap-4"
      >
        {games.map((game) => (
          <motion.div key={game.path} variants={cardVariants}>
            <Link to={game.path}>
              <motion.div whileHover={{ scale: 1.05, y: -4 }} whileTap={{ scale: 0.97 }}>
                <Card
                  hoverable
                  className="h-full text-center shadow-sm transition-shadow duration-300 hover:shadow-xl dark:border-slate-700 dark:bg-slate-900"
                >
                  <div className="text-4xl">{game.emoji}</div>
                  <div className="mt-2 font-semibold text-slate-900 dark:text-slate-100">
                    {game.title}
                  </div>
                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {game.description}
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

export default PageGames
