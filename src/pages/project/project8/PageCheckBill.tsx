import { Button, Divider, message, Select, SelectProps, Typography } from 'antd'
import { useMemo, useState } from 'react'
import AddFriends, { Friend } from './AddFriends'
import { AddItem, Item } from './AddItem'

const PageCheckBill = () => {
  const [items, setItems] = useState<Item[]>([]) //ที่เก็บข้อมูลรายการ
  const [friends, setFriends] = useState<Friend[]>([]) //ที่เก็บข้อมูล รายชื่อเพื่อน
  const [itemToFriends, setItemToFriends] = useState<Record<string, string[]>>({}) //เป็บข้อมูลว่ารายการไหนที่เพื่อนต้องหาร

  const handleAddItem = (item: Item) => {
    setItems([...items, item]) //เพิ่มไอเทมใหม่ลงในไอเทมเก่า
  }

  const handleAddFriend = (friend: Friend) => {
    setFriends([...friends, friend]) //เพิ่มรายชื่อเพื่อนใหม่
    message.success('เพิ่มเพื่อนเรียบร้อยแล้ว') //ส่งข้อความบอกว่าสำเร็จ แต่ไม่รุ้ส่งไปไหน
  }

  const handleChange = (friendNames: string[], id: string) => {
    setItemToFriends({ ...itemToFriends, [id]: friendNames }) //เก็บข้อมูลว่าเพื่อนอยู่รายการไหน
  }
  const handleDeleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id)) //ลบรายการออก
  }
  const handleDeleteFriend = (id: string) => {
    setFriends(friends.filter((friend) => friend.id !== id)) //ลบชื่อเพื่อนออกจาก state friends
    setItemToFriends(
      Object.entries(itemToFriends).reduce((acc, curr) => {
        const [itemId, friendIds] = curr
        acc[itemId] = friendIds.filter((e) => e !== id)

        return acc
      }, itemToFriends) //ลบรายชื่อเพื่อนตาม id
    )
  }

  const handleReset = () => {
    setItems([])
    setFriends([])
    setItemToFriends({})
  } //รีเซ็ตข้อมูลทั้งหมด

  const options: SelectProps['options'] = friends.map((friend) => ({
    label: friend.name,
    value: friend.id,
  })) // ตัวเลือกของ ดอบดาว <Select> ตามรายชื่อเพื่อน

  const friendBill = useMemo(() => {
    const newFriendBill: Record<string, number> = {} //สร้างตัวแปรมาเก็บข้อมูล
    friends.forEach((friend) => {
      newFriendBill[friend.id] = 0 //กำหนดค่าเริ่มต้นให้เป็น 0
    })

    items.forEach((item) => {
      const shared = itemToFriends[item.id]
      if (!shared || shared.length === 0) return //ไม่มีเพื่อนไม่ทำ
      const pricePerPerson = item.price / shared.length //เอาราคามาหารด้วยจำนวนคน
      shared.forEach((id) => {
        newFriendBill[id] += pricePerPerson //เอาค่าใหม่ + ค่าเก่า
      })
    })

    return newFriendBill
  }, [friends, itemToFriends, items])

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl shadow-2xl space-y-6 transition-all duration-500 hover:shadow-3xl">
      <Typography.Title level={3} className="!text-center text-blue-600 animate-pulse">
        แบ่งบิลเพื่อนแบบกำหนดเอง
      </Typography.Title>
      <div className="flex flex-col gap-4">
        <AddItem onAddItem={handleAddItem} items={items} />
        <AddFriends onAddFriend={handleAddFriend} friends={friends} />
      </div>
      {items.length > 0 && <Divider className="border-blue-300">รายการและผู้ร่วมจ่าย</Divider>}

      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="p-4 bg-gray-100 rounded-xl shadow-lg flex flex-row justify-between items-center transform transition-transform duration-300 hover:scale-105"
          >
            <div className="flex flex-col gap-2 w-7/8">
              <div className="font-medium text-lg flex justify-between text-gray-700">
                <div>
                  รายการที่ {index + 1} : {item.name}
                </div>
                <div> {item.price} บาท</div>
              </div>
              <Select
                mode="multiple"
                allowClear
                style={{ width: '100%' }}
                placeholder="เลือกเพื่อนที่ร่วมจ่าย"
                value={itemToFriends[item.id]}
                onChange={(value) => handleChange(value, item.id)}
                options={options}
                className="transition-all duration-300 hover:border-blue-400"
              />
            </div>

            <Button
              type="link"
              onClick={() => handleDeleteItem(item.id)}
              className="text-red-500 hover:text-red-700"
            >
              ลบ
            </Button>
          </div>
        ))}
      </div>
      {friends.length > 0 && (
        <Divider className="border-green-300 text-lg font-semibold text-center my-4">
          ยอดที่แต่ละคนต้องจ่าย
        </Divider>
      )}

      <div className="space-y-2">
        {friends.map((friend, index) => (
          <div
            key={index}
            className="bg-green-100 text-green-900 rounded-md px-4 py-2 shadow-md flex justify-between transform transition-transform duration-300 hover:scale-105"
          >
            <span className="font-medium">{friend.name}</span>
            <span>{friendBill[friend.id]} บาท</span>
            <Button
              type="link"
              onClick={() => handleDeleteFriend(friend.id)}
              className="text-red-400 !hover:text-red-700"
            >
              ลบ
            </Button>
          </div>
        ))}
      </div>
      {!(friends.length === 0 && items.length === 0) && (
        <div className="pt-4 flex justify-center">
          <Button
            type="primary"
            onClick={handleReset}
            className="bg-blue-500 hover:bg-blue-700 text-white transition-all duration-300"
          >
            ล้างข้อมูล
          </Button>
        </div>
      )}
    </div>
  )
}

export default PageCheckBill
