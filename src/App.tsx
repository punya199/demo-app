import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createBrowserRouter, RouterProvider } from 'react-router'
import './App.css'
import { appPath } from './config/app-paths'
import Pnotfound from './layouts/Pnotfound'
import RootLayout from './layouts/RootLayout'
import Home from './pages/Home'
import Login from './pages/Login'
import CardGame from './pages/project/project5/CardGame'
import Omama from './pages/project/project6/Omama'
import PageAllBill from './pages/project/project8/PageAllBill'
import PageEditBill from './pages/project/project8/PageEditBill'

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

      // {
      //   path: '/allprojects',
      //   element: <Allprojects />,
      // },
      // {
      //   path: '/contract',
      //   element: <Contract />,
      // },
      // {
      //   path: '/p1',
      //   element: <PageListItem />,
      // },
      // {
      //   path: '/p2',
      //   element: <TodoList />,
      // },
      // {
      //   path: '/p3',
      //   element: <PageMyFriends />,
      // },
      // {
      //   path: '/p4',
      //   element: <PageQuiz />,
      // },
      {
        path: appPath.randomCard(),
        element: <CardGame />,
      },
      { path: appPath.omamaGame(), element: <Omama /> },
      // { path: '/p7', element: <PageGame9Gea /> },
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
    ],
  },
])
const queryClient = new QueryClient()
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}

export default App
