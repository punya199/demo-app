import { Outlet } from 'react-router-dom'
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
        <Outlet />
      </div>
    </div>
  )
}

export default RootLayout
