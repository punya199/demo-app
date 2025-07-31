import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConfigProvider } from 'antd'
import { lazy } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router'
import './App.css'
import { appConfig } from './config/app-config'
import { appPath } from './config/app-paths'
import Pnotfound from './layouts/Pnotfound'
import RootLayout from './layouts/RootLayout'
import { ScreenSizeIndicator } from './layouts/ScreenSizeIndicator'
import Home from './pages/Home'
import Login from './pages/Login'
import CardGame from './pages/project/project5/CardGame'
import Omama from './pages/project/project6/Omama'
import PageAllBill from './pages/project/project8/PageAllBill'
import PageCreateBill from './pages/project/project8/PageCreateBill'
import PageEditBill from './pages/project/project8/PageEditBill'
import PageSaveBillToImage from './pages/project/project8/PageSaveBillToImage'

const PageHouseRent = lazy(() =>
  import('./pages/house-rent/PageHouseRent').then((module) => ({ default: module.PageHouseRent }))
)
const PageHouseRentCreate = lazy(() =>
  import('./pages/house-rent/PageHouseRentCreate').then((module) => ({
    default: module.PageHouseRentCreate,
  }))
)
const PageHouseRentDetail = lazy(() =>
  import('./pages/house-rent/PageHouseRentDetail').then((module) => ({
    default: module.PageHouseRentDetail,
  }))
)
const PageHouseRentDetailClone = lazy(() =>
  import('./pages/house-rent/PageHouseRentDetailClone').then((module) => ({
    default: module.PageHouseRentDetailClone,
  }))
)

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <Pnotfound />,
    children: [
      {
        path: appPath.home(),
        element: <Home />,
      },
      {
        path: appPath.randomCard(),
        element: <CardGame />,
      },
      { path: appPath.omamaGame(), element: <Omama /> },
      {
        path: appPath.checkBillPageCreate(),
        element: <PageCreateBill />,
      },
      {
        path: appPath.checkBillPageEdit(),
        element: <PageEditBill />,
      },
      {
        path: appPath.checkBillPage(),
        element: <PageAllBill />,
      },
      {
        path: appPath.login(),
        element: <Login />,
      },
      {
        path: appPath.checkBillPageSave(),
        element: <PageSaveBillToImage />,
      },
      {
        path: appPath.houseRentCreate(),
        element: <PageHouseRentCreate />,
      },
      {
        path: appPath.houseRentDetailClone(),
        element: <PageHouseRentDetailClone />,
      },
      {
        path: appPath.houseRentDetail(),
        element: <PageHouseRentDetail />,
      },
      {
        path: appPath.houseRent(),
        element: <PageHouseRent />,
      },
    ],
  },
])
const queryClient = new QueryClient()
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      {appConfig().VITE_IS_DEVELOPMENT && <ScreenSizeIndicator />}
      <ConfigProvider>
        <RouterProvider router={router} />
      </ConfigProvider>
    </QueryClientProvider>
  )
}

export default App
