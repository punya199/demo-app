import { Button, Input } from 'antd'
import { useState } from 'react'

interface AddPlayerProps {
  userNameList?: string[]
  addUserName: (name: string) => void
  removeUserName: (name: string) => void
}
const AddPlayerOmama = (props: AddPlayerProps) => {
  const [playerOmama, setPlayerOmama] = useState('')

  return (
    <div className="flex max-w-5xl flex-col gap-2 p-4">
      <div>
        <Input onChange={(e) => setPlayerOmama(e.target.value)}></Input>
        <Button onClick={() => props.addUserName(playerOmama)}>เพิ่มชื่อ</Button>
      </div>
      {props.userNameList?.map((name) => (
        <div>
          {name}
          <Button onClick={() => props.removeUserName(name)}>ลบ</Button>
        </div>
      ))}
    </div>
  )
}

export default AddPlayerOmama
