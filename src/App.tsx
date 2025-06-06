import { lazy } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './App.css'
import Allprojects from './layouts/Allprojects'
import Home from './layouts/Home'
import Pnotfound from './layouts/Pnotfound'
import RootLayout from './layouts/RootLayout'
import About from './pages/PageAbout'
import Contract from './pages/PageContract'
import PageListItem from './pages/project1/PageMeowList'
import TodoList from './pages/project2/PageTodoList'
import PageMyFriends from './pages/project3/PageMyFriends'
import PageQuiz from './pages/project4/PageQuiz'
import PageGame9Gea from './pages/project7/PageGame9Gea'

const Omama = lazy(() => import('./pages/project6/Omama'))
const CardGame = lazy(() => import('./pages/project5/CardGame'))

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <Pnotfound />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/about',
        element: <About />,
      },
      {
        path: '/allprojects',
        element: <Allprojects />,
      },
      {
        path: '/contract',
        element: <Contract />,
      },
      {
        path: '/p1',
        element: <PageListItem />,
      },
      {
        path: '/p2',
        element: <TodoList />,
      },
      {
        path: '/p3',
        element: <PageMyFriends />,
      },
      {
        path: '/p4',
        element: <PageQuiz />,
      },
      {
        path: '/p5',
        element: <CardGame />,
      },
      { path: '/p6', element: <Omama /> }, // Omama project
      { path: '/p7', element: <PageGame9Gea /> }, // 9 gea project
    ],
  },
])

function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App
