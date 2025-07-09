import { Typography } from 'antd'

const { Title, Paragraph } = Typography

const PageAbout = () => {
  return (
    <div className="mx-auto max-w-2xl rounded-lg bg-gradient-to-r from-purple-100 to-blue-100 p-6 shadow-lg">
      <Title level={2} className="mb-4 text-center text-blue-700">
        เกี่ยวกับเว็บไซต์นี้
      </Title>
      <Paragraph className="mb-4 leading-relaxed text-gray-700">
        เว็บไซต์นี้ถูกสร้างขึ้นเพื่อแสดงผลงานและความสามารถของเรา
        โดยมีเป้าหมายเพื่อใช้เป็นส่วนหนึ่งของการสมัครงาน
      </Paragraph>
      <Paragraph className="mb-4 leading-relaxed text-gray-700">
        เรามุ่งมั่นที่จะพัฒนาทักษะและความรู้ในด้านต่าง ๆ
        และนำเสนอผลงานที่มีคุณภาพสูงเพื่อสร้างความประทับใจให้กับผู้ว่าจ้าง
      </Paragraph>
      <Paragraph className="leading-relaxed text-gray-700">
        ขอบคุณที่เข้ามาเยี่ยมชมเว็บไซต์ของเรา
        เราหวังว่าคุณจะได้รับข้อมูลที่เป็นประโยชน์และเห็นถึงศักยภาพของเรา
      </Paragraph>
    </div>
  )
}

export default PageAbout
