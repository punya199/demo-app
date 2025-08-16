import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { App as AntdApp, ConfigProvider } from 'antd'
import { lazy } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router'
import './App.css'
import { appConfig } from './config/app-config'
import { appPath } from './config/app-paths'
import { ScreenSizeIndicator } from './layouts/ScreenSizeIndicator'
import PageManageUser from './pages/PageManageUser'
import PageRegister from './pages/PageRegister'

import { Authorize } from './components/Authorize'
import CardGame from './pages/project/random-card/CardGame'
import { EnumFeatureName } from './service'

const Pnotfound = lazy(() => import('./layouts/Pnotfound'))
const RootLayout = lazy(() => import('./layouts/RootLayout'))

const Home = lazy(() => import('./pages/Home'))
const Login = lazy(() => import('./pages/Login'))

const PageOmama = lazy(() => import('./pages/project/omama-game/PageOmama'))
const PageAllBill = lazy(() => import('./pages/project/checkbill/PageAllBill'))
const PageCreateBill = lazy(() => import('./pages/project/checkbill/PageCreateBill'))
const PageEditBill = lazy(() => import('./pages/project/checkbill/PageEditBill'))
const PageSaveBillToImage = lazy(() => import('./pages/project/checkbill/PageSaveBillToImage'))

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
      { path: appPath.omamaGame(), element: <PageOmama /> },
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
        path: appPath.register(),
        element: <PageRegister />,
      },
      {
        path: appPath.checkBillPageSave(),
        element: <PageSaveBillToImage />,
      },
      {
        path: appPath.houseRentCreate(),
        element: (
          <Authorize featureName={EnumFeatureName.HOUSE_RENT} requiredCreate>
            <PageHouseRentCreate />
          </Authorize>
        ),
      },
      {
        path: appPath.houseRentDetailClone(),
        element: (
          <Authorize featureName={EnumFeatureName.HOUSE_RENT} requiredCreate>
            <PageHouseRentDetailClone />
          </Authorize>
        ),
      },
      {
        path: appPath.houseRentDetail(),
        element: (
          <Authorize featureName={EnumFeatureName.HOUSE_RENT} requiredUpdate>
            <PageHouseRentDetail />
          </Authorize>
        ),
      },
      {
        path: appPath.houseRent(),
        element: (
          <Authorize featureName={EnumFeatureName.HOUSE_RENT} requiredRead>
            <PageHouseRent />
          </Authorize>
        ),
      },
      {
        path: appPath.manageUser(),
        element: <PageManageUser />,
      },
    ],
  },
])
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 5,
      retry: 0,
    },
    mutations: {
      retry: 0,
    },
  },
})
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      {appConfig().VITE_IS_DEVELOPMENT && <ScreenSizeIndicator />}
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#2563EB',
          },
        }}
      >
        <AntdApp>
          <RouterProvider router={router} />
        </AntdApp>
      </ConfigProvider>
    </QueryClientProvider>
  )
}

export default App
