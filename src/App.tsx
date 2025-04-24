import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './App.css'
import About from './components/About'
import Contract from './components/Contract'
import MeowList from './components/project1/MeowList'
import TodoList from './components/project2/TodoList'
import Allprojects from './layouts/Allprojects'
import Home from './layouts/Home'
import Pnotfound from './layouts/Pnotfound'
import RootLayout from './layouts/RootLayout'

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
        element: <MeowList />,
      },
      {
        path: '/p2',
        element: <TodoList />,
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
