import { AnimatePresence, motion } from 'motion/react'
import { Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { FlickeringGrid } from '../components/magicui/flickering-grid'
import { ThemeToggle } from '../components/ThemeToggle'
import { appPath } from '../config/app-paths'
import { useThemeStore } from '../utils/theme-store'
import { LoadingSpin } from './LoadingSpin'
import Navbar from './Navbar'

const RootLayout = () => {
  const location = useLocation()
  const isHome = location.pathname === appPath.home()
  // The ledger has its own full-page sidebar shell (own branding, own nav) - the site's
  // Navbar would just duplicate it.
  const isPaojiaoLedger = location.pathname.startsWith('/paojiao-ledger')
  const mode = useThemeStore((state) => state.mode)

  return (
    <div className="relative isolate flex h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <FlickeringGrid
        className="fixed inset-0 -z-10"
        squareSize={4}
        gridGap={6}
        flickerChance={0.15}
        maxOpacity={mode === 'dark' ? 0.25 : 0.12}
        color={mode === 'dark' ? 'rgb(96, 165, 250)' : 'rgb(37, 99, 235)'}
      />

      {!isHome && !isPaojiaoLedger && <Navbar />}
      <div className="flex-1 overflow-y-auto">
        <Suspense fallback={<LoadingSpin />}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </div>
      <ThemeToggle />
    </div>
  )
}

export default RootLayout
