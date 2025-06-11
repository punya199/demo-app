import { MenuOutlined } from '@ant-design/icons'
import { Button, Drawer, Dropdown, Menu, Space, Typography } from 'antd'
import { useState } from 'react'
import { Link } from 'react-router-dom'

const { Title } = Typography

const Navbar = () => {
  const [open, setOpen] = useState(false)

  const showDrawer = () => setOpen(true)
  const onClose = () => setOpen(false)

  const projectMenu = {
    items: [
      { key: 'p1', label: <Link to="/p1">MeowList</Link> },
      { key: 'p2', label: <Link to="/p2">Todo</Link> },
      { key: 'p3', label: <Link to="/p3">MyFriends</Link> },
      { key: 'p4', label: <Link to="/p4">Quiz Meaow</Link> },
      { key: 'p5', label: <Link to="/p5">Random Card</Link> },
      { key: 'p6', label: <Link to="/p6">Game Omama</Link> },
      { key: 'p7', label: <Link to="/p7">9 gea</Link> },
    ],
  }

  return (
    <nav className="bg-cyan-800 px-6 py-3">
      <div className="flex justify-between items-center">
        {/* ซ้าย: โลโก้ */}
        <Link to="/">
          <Title level={3} className="!m-0 !text-white">
            LOGO
          </Title>
        </Link>

        {/* กลาง: เมนู Desktop */}
        <div className="hidden lg:flex items-center gap-8">
          <Menu mode="horizontal" selectable={false} className="!bg-transparent">
            <Menu.Item key="about">
              <Link className="text-white hover:text-cyan-300" to="about">
                About
              </Link>
            </Menu.Item>
            <Menu.Item key="projects">
              <Dropdown menu={projectMenu} trigger={['click']} placement="bottom">
                <Button type="text" className="text-white hover:!bg-cyan-700">
                  Project
                </Button>
              </Dropdown>
            </Menu.Item>
            <Menu.Item key="contract">
              <Link className="text-white hover:text-cyan-300" to="contract">
                Contract
              </Link>
            </Menu.Item>
          </Menu>
        </div>

        {/* ขวา: ปุ่ม Register/Login + ไอคอนมือถือ */}
        <div className="flex items-center gap-4">
          {/* Desktop ปุ่ม */}
          <div className="hidden lg:flex items-center gap-2">
            <Button type="link" className="!text-white hover:!text-cyan-300">
              Register
            </Button>
            <Button type="link" className="!text-white hover:!text-cyan-300">
              Login
            </Button>
            <div className="text-xs bg-black text-white px-2 py-1 rounded">
              Version: {import.meta.env.VITE_APP_VERSION || 'unknown'}
            </div>
          </div>

          {/* ไอคอนเมนูมือถือ */}
          <Button
            className="lg:hidden"
            type="text"
            icon={<MenuOutlined className="text-white text-xl" />}
            onClick={showDrawer}
          />
        </div>
      </div>

      {/* Drawer มือถือ */}
      <Drawer
        title="Menu"
        placement="left"
        onClose={onClose}
        open={open}
        classNames={{ body: 'p-0' }}
      >
        <Menu mode="vertical" selectable={false}>
          <Menu.Item key="about" onClick={onClose}>
            <Link to="about">About</Link>
          </Menu.Item>
          <Menu.Item key="projects" onClick={onClose}>
            <Link to="allprojects">Project</Link>
          </Menu.Item>
          <Menu.Item key="contract" onClick={onClose}>
            <Link to="contract">Contract</Link>
          </Menu.Item>
        </Menu>

        <div className="p-4">
          <Space direction="vertical" size="middle" className="w-full">
            <Button type="link" block>
              Register
            </Button>
            <Button type="link" block>
              Login
            </Button>
            <div className="text-xs bg-black text-white px-2 py-1 rounded">
              Version: {import.meta.env.VITE_APP_VERSION || 'unknown'}
            </div>
          </Space>
        </div>
      </Drawer>
    </nav>
  )
}

export default Navbar
