import { Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { ThemeToggle } from '../components/ThemeToggle'
import { appPath } from '../config/app-paths'
import { LoadingSpin } from './LoadingSpin'
import Navbar from './Navbar'

const RootLayout = () => {
  const location = useLocation()
  const isHome = location.pathname === appPath.home()

  return (
    <div className="flex h-screen flex-col bg-slate-50 dark:bg-slate-950">
      {!isHome && <Navbar />}
      <div className="flex-1 overflow-y-auto">
        <Suspense fallback={<LoadingSpin />}>
          <Outlet />
        </Suspense>
      </div>
      <ThemeToggle />
    </div>
  )
}

export default RootLayout
