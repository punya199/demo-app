import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './App.css'
import Pnotfound from './layouts/Pnotfound'
import RootLayout from './layouts/RootLayout'
import Allprojects from './pages/Allprojects'
import Home from './pages/Home'
import Login from './pages/Login'
import About from './pages/PageAbout'
import Contract from './pages/PageContract'
import PageListItem from './pages/project/project1/PageMeowList'
import TodoList from './pages/project/project2/PageTodoList'
import PageMyFriends from './pages/project/project3/PageMyFriends'
import PageQuiz from './pages/project/project4/PageQuiz'
import CardGame from './pages/project/project5/CardGame'
import Omama from './pages/project/project6/Omama'
import PageGame9Gea from './pages/project/project7/PageGame9Gea'
import PageCheckBill from './pages/project/project8/PageCheckBill'

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
      { path: '/p6', element: <Omama /> },
      { path: '/p7', element: <PageGame9Gea /> },
      {
        path: '/p8',
        element: <PageCheckBill />,
      },
      {
        path: '/login',
        element: <Login />,
      },
    ],
  },
])
const queryClient = new QueryClient()
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}

export default App
