import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './App.css'
import Allprojects from './layouts/Allprojects'
import Home from './layouts/Home'
import Pnotfound from './layouts/Pnotfound'
import RootLayout from './layouts/RootLayout'
import About from './pages/PageAbout'
import Contract from './pages/PageContract'
import PageMeowList from './pages/project1/PageMeowList'
import TodoList from './pages/project2/PageTodoList'
import PageMyFriends from './pages/project3/PageMyFriends'

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
        element: <PageMeowList />,
      },
      {
        path: '/p2',
        element: <TodoList />,
      },
      {
        path: '/p3',
        element: <PageMyFriends />,
      },
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
