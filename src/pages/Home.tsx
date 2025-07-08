import { Button } from 'antd'
import { Link } from 'react-router-dom'
const Home = () => {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-100">
      <Link to="Allprojects">
        <Button type="primary" className="!border-cyan-500 !bg-cyan-500 hover:!bg-cyan-600">
          Go to project
        </Button>
      </Link>
    </div>
  )
}

export default Home
