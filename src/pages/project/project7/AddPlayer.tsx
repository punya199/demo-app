import { Button, Form, Input } from 'antd'
import { useState } from 'react'

interface Player {
  id: string
  name: string
}
interface AddPlayerProps {
  onChange: (players: Player[]) => void
}
const AddPlayer = ({ onChange }: AddPlayerProps) => {
  const [form] = Form.useForm()
  const [players, setPlayers] = useState<Player[]>([])
  const onFinish = (values: { playerName: string }) => {
    const newPlayer: Player = {
      id: crypto.randomUUID(),
      name: values.playerName,
    }
    if (!newPlayer.name.trim()) return
    if (players.some(p => p.name === newPlayer.name)) {
      alert('ผู้เล่นนี้มีอยู่แล้ว')
      return
    }
    const updatedPlayers = [...players, newPlayer]
    setPlayers(updatedPlayers)
    onChange(updatedPlayers)
    form.resetFields()
  }
  // const removePlayer = (id: string) => {
  //   const updatedPlayers = players.filter(p => p.id !== id)
  //   setPlayers(updatedPlayers)
  //   onChange(updatedPlayers)
  // }

  return (
    <div>
      <Form layout="vertical" form={form} onFinish={onFinish}>
        <Form.Item
          label="Player Name"
          name="playerName"
          rules={[{ required: true, message: 'Please input player name!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            ส่งข้อมูล
          </Button>
        </Form.Item>
      </Form>
      {/* <ul className="mt-4 space-y-1 text-gray-700  ">
        {players.map(p => (
          <li
            key={p.id}
            className="border p-2 rounded bg-gray-100 flex items-center justify-between"
          >
            🧍 {p.name}{' '}
            <Button
              onClick={() => {
                removePlayer(p.id)
              }}
            >
              ลบ
            </Button>
          </li>
        ))}
      </ul> */}
    </div>
  )
}

export default AddPlayer
