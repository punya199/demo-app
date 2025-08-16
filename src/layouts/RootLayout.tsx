import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { LoadingSpin } from './LoadingSpin'
import Navbar from './Navbar'

const RootLayout = () => {
  return (
    <div className="flex h-screen flex-col">
      <Navbar />
      <div
        style={{
          flex: 1,
        }}
      >
        <Suspense fallback={<LoadingSpin />}>
          <Outlet />
        </Suspense>
      </div>
    </div>
  )
}

export default RootLayout
