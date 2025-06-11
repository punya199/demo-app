import { Button } from 'antd'
import { Link } from 'react-router-dom'
const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <Link to="about">
        <Button type="primary" className="!bg-cyan-500 !border-cyan-500 hover:!bg-cyan-600">
          ภาษาไทย
        </Button>
      </Link>
    </div>
  )
}

export default Home
