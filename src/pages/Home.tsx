import { Button } from 'antd'
const Home = () => {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-100">
      <Button type="primary" className="!border-cyan-500 !bg-cyan-500 hover:!bg-cyan-600">
        Hello
      </Button>
    </div>
  )
}

export default Home
