import { message, Select, SelectProps } from "antd"
import { useMemo, useState } from "react"
import AddFriends, { Friend } from "./AddFriends"
import { AddItem, Item } from "./AddItem"

const PageCheckBill = () => {
  const [items, setItems] = useState<Item[]>([])
  const [friends, setFriends] = useState<Friend[]>([])
  const [itemToFriends, setItemToFriends] = useState<Record<number, string[]>>({});


  const handleAddItem = (item: Item) => {
    setItems([...items, item])
  }
  const handleAddFriend = (friend: Friend) => {
    setFriends([...friends, friend])
    const total = items.reduce((acc, item) => acc + item.price, 0)
    const bill = total / friends.length
    setFriends([...friends, { name: friend.name, bill: 0 }])
    message.success("Friend added successfully")

  }

  const options: SelectProps['options'] = friends.map(friend => ({
    label: friend.name,
    value: friend.name,
  }));

  const handleChange = (friendNames: string[], index: number) => {
    setItemToFriends({ ...itemToFriends, [index]: friendNames });
  };

  const friendBill = useMemo(() => {

    const newFriendBill: Record<string, number> = {}
    friends.forEach(friend => {
      newFriendBill[friend.name] = 0
    })

    items.forEach((item, index) => {
      const shared = itemToFriends[index]
      if (!shared || shared.length === 0) return
      const pricePerPerson = item.price / shared.length
      shared.forEach(name => {
        newFriendBill[name] += pricePerPerson
      })
    })

    return newFriendBill

  }, [friends, items, itemToFriends])

  console.log(itemToFriends)
  return (
    <div className="p-4 bg-white rounded-lg shadow-md flex flex-col gap-4">
      <AddItem onAddItem={handleAddItem} />
      <AddFriends onAddFriend={handleAddFriend} />
      <div className="flex flex-col gap-2">
        {items.map((item, index) => (
          <div key={index}>{item.name} - {item.price} บาท

            <Select
              mode="multiple"
              allowClear
              style={{ width: '100%' }}
              placeholder="Please select"
              onChange={(value) => handleChange(value, index)}
              options={options}
            />
          </div>

        ))}
      </div>
      <div className="flex flex-col gap-2">
        {friends.map((friend, index) => (
          <div key={index}>{friend.name} เงินที่ต้องจ่าย {friendBill[friend.name]} บาท</div>
        ))}
      </div>

    </div>
  )
}

export default PageCheckBill
