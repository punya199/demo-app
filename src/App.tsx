import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { App as AntdApp, ConfigProvider, theme } from 'antd'
import { lazy, useEffect, useMemo } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router'
import './App.css'
import { appPath } from './config/app-paths'

import { Authorize } from './components/Authorize'
import { PaojiaoLedgerGuard } from './pages/project/paojiao-ledger/PaojiaoLedgerGuard'
import { PaojiaoLedgerShell } from './pages/project/paojiao-ledger/PaojiaoLedgerShell'
import { EnumPermissionFeatureName } from './services/permission/permission.params'
import { useThemeStore } from './utils/theme-store'

const Pnotfound = lazy(() => import('./layouts/Pnotfound'))
const RootLayout = lazy(() => import('./layouts/RootLayout'))
const Home = lazy(() => import('./pages/Home'))
const Login = lazy(() => import('./pages/Login'))
const PageManageUserDetail = lazy(() => import('./pages/manage-user/PageManageUserDetail'))
const PageManageUser = lazy(() => import('./pages/PageManageUser'))
const PageRegister = lazy(() => import('./pages/PageRegister'))
const CardGame = lazy(() => import('./pages/project/random-card/CardGame'))
const PageOmama = lazy(() => import('./pages/project/omama-game/PageOmama'))
const PageAllBill = lazy(() => import('./pages/project/checkbill/PageAllBill'))
const PageLedgerEntries = lazy(() => import('./pages/project/paojiao-ledger/PageLedgerEntries'))
const PageLedgerSummary = lazy(() => import('./pages/project/paojiao-ledger/PageLedgerSummary'))
const PageLedgerShare = lazy(() => import('./pages/project/paojiao-ledger/PageLedgerShare'))
const PageLedgerWages = lazy(() => import('./pages/project/paojiao-ledger/PageLedgerWages'))
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
const PageHouseRentSummary = lazy(() =>
  import('./pages/house-rent/PageHouseRentSummary').then((module) => ({
    default: module.PageHouseRentSummary,
  }))
)
const PageHouseRentUserDetail = lazy(() =>
  import('./pages/house-rent/PageHouseRentUserDetail').then((module) => ({
    default: module.PageHouseRentUserDetail,
  }))
)
const PageHouseRentOverview = lazy(() =>
  import('./pages/house-rent/PageHouseRentOverview').then((module) => ({
    default: module.PageHouseRentOverview,
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
        path: appPath.houseRentUserDetail(),
        element: <PageHouseRentUserDetail />,
      },
      {
        path: appPath.houseRentOverview(),
        element: <PageHouseRentOverview />,
      },
      {
        path: appPath.houseRentCreate(),
        element: (
          <Authorize featureName={EnumPermissionFeatureName.HOUSE_RENT} requiredCreate>
            <PageHouseRentCreate />
          </Authorize>
        ),
      },
      {
        path: appPath.houseRentSummary(),
        element: <PageHouseRentSummary />,
      },
      {
        path: appPath.houseRentDetailClone(),
        element: (
          <Authorize featureName={EnumPermissionFeatureName.HOUSE_RENT} requiredCreate>
            <PageHouseRentDetailClone />
          </Authorize>
        ),
      },
      {
        path: appPath.houseRentDetail(),
        element: (
          <Authorize featureName={EnumPermissionFeatureName.HOUSE_RENT} requiredUpdate>
            <PageHouseRentDetail />
          </Authorize>
        ),
      },
      {
        path: appPath.houseRent(),
        element: (
          <Authorize featureName={EnumPermissionFeatureName.HOUSE_RENT} requiredRead>
            <PageHouseRent />
          </Authorize>
        ),
      },
      {
        path: appPath.manageUserDetail(),
        element: <PageManageUserDetail />,
      },
      {
        path: appPath.manageUser(),
        element: <PageManageUser />,
      },
      {
        path: appPath.paojiaoLedgerEntries(),
        element: (
          <PaojiaoLedgerGuard>
            <PaojiaoLedgerShell>
              <PageLedgerEntries />
            </PaojiaoLedgerShell>
          </PaojiaoLedgerGuard>
        ),
      },
      {
        path: appPath.paojiaoLedgerSummary(),
        element: (
          <PaojiaoLedgerGuard>
            <PaojiaoLedgerShell>
              <PageLedgerSummary />
            </PaojiaoLedgerShell>
          </PaojiaoLedgerGuard>
        ),
      },
      {
        path: appPath.paojiaoLedgerShare(),
        element: (
          <PaojiaoLedgerGuard>
            <PaojiaoLedgerShell>
              <PageLedgerShare />
            </PaojiaoLedgerShell>
          </PaojiaoLedgerGuard>
        ),
      },
      {
        path: appPath.paojiaoLedgerWages(),
        element: (
          <PaojiaoLedgerGuard>
            <PaojiaoLedgerShell>
              <PageLedgerWages />
            </PaojiaoLedgerShell>
          </PaojiaoLedgerGuard>
        ),
      },
    ],
  },
])
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: 0,
    },
    mutations: {
      retry: 0,
    },
  },
})
const App = () => {
  const mode = useThemeStore((state) => state.mode)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', mode === 'dark')
  }, [mode])

  const themeConfig = useMemo(
    () => ({
      algorithm: mode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
      token: {
        colorPrimary: '#2563EB',
        colorInfo: '#2563EB',
        borderRadius: 10,
        fontFamily:
          "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
        controlHeight: 38,
      },
    }),
    [mode]
  )

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={themeConfig}>
        <AntdApp>
          <RouterProvider router={router} />
        </AntdApp>
      </ConfigProvider>
    </QueryClientProvider>
  )
}

export default App
