import { Button, Divider, message, Select, SelectProps, Typography } from 'antd'
import { useMemo, useState } from 'react'
import AddFriends, { Friend } from './AddFriends'
import { AddItem, Item } from './AddItem'

const PageCheckBill = () => {
  const [items, setItems] = useState<Item[]>([])
  const [friends, setFriends] = useState<Friend[]>([])
  const [itemToFriends, setItemToFriends] = useState<Record<number, string[]>>({})

  const handleAddItem = (item: Item) => {
    setItems([...items, item])
  }

  const handleAddFriend = (friend: Friend) => {
    setFriends([...friends, { name: friend.name, bill: 0 }])
    message.success('เพิ่มเพื่อนเรียบร้อยแล้ว')
  }

  const options: SelectProps['options'] = friends.map((friend) => ({
    label: friend.name,
    value: friend.name,
  }))

  const handleChange = (friendNames: string[], index: number) => {
    setItemToFriends({ ...itemToFriends, [index]: friendNames })
  }

  const friendBill = useMemo(() => {
    const newFriendBill: Record<string, number> = {}
    friends.forEach((friend) => {
      newFriendBill[friend.name] = 0
    })

    items.forEach((item, index) => {
      const shared = itemToFriends[index]
      if (!shared || shared.length === 0) return
      const pricePerPerson = item.price / shared.length
      shared.forEach((name) => {
        newFriendBill[name] += pricePerPerson
      })
    })

    return newFriendBill
  }, [friends, itemToFriends, items])

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-xl space-y-6">
      <Typography.Title level={3} className="!text-center">
        แบ่งบิลเพื่อนแบบกำหนดเอง
      </Typography.Title>

      <div className="flex flex-col gap-4">
        <AddItem onAddItem={handleAddItem} items={items} />
        <AddFriends onAddFriend={handleAddFriend} friends={friends} />
      </div>

      <Divider>รายการและผู้ร่วมจ่าย</Divider>
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="p-4 bg-gray-100 rounded-xl shadow flex flex-col gap-2">
            <div className="font-medium text-lg">
              {item.name} - {item.price} บาท
            </div>
            <Select
              mode="multiple"
              allowClear
              style={{ width: '100%' }}
              placeholder="เลือกเพื่อนที่ร่วมจ่าย"
              onChange={(value) => handleChange(value, index)}
              options={options}
            />
          </div>
        ))}
      </div>

      <Divider>ยอดที่แต่ละคนต้องจ่าย</Divider>
      <div className="space-y-2">
        {friends.map((friend, index) => (
          <div
            key={index}
            className="bg-green-100 text-green-900 rounded-md px-4 py-2 shadow flex justify-between"
          >
            <span className="font-medium">{friend.name}</span>
            <span>{friendBill[friend.name].toFixed(2)} บาท</span>
          </div>
        ))}
      </div>

      <div className="pt-4 flex justify-center">
        <Button type="primary" onClick={() => message.success('คำนวณเรียบร้อยแล้ว')}>
          คำนวณอีกครั้ง
        </Button>
      </div>
    </div>
  )
}

export default PageCheckBill
