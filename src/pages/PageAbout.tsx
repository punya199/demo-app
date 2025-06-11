import { Button } from 'antd'

const About = () => {
  return (
    <div>
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100 gap-4">
        <Button type="primary" className="!bg-cyan-500 !border-cyan-500 hover:!bg-cyan-600">
          อายุ 20-30 ปี
        </Button>
        <Button type="primary" className="!bg-cyan-500 !border-cyan-500 hover:!bg-cyan-600">
          อายุ 30-40 ปี
        </Button>
        <Button type="primary" className="!bg-cyan-500 !border-cyan-500 hover:!bg-cyan-600">
          อายุ 40-50 ปี
        </Button>
        <Button type="primary" className="!bg-cyan-500 !border-cyan-500 hover:!bg-cyan-600">
          อายุ 50-60 ปี
        </Button>
      </div>
    </div>
  )
}

export default About
