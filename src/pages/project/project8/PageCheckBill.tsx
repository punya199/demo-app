import { Button, Divider, message, Select, SelectProps, Typography } from 'antd'
import { round } from 'lodash'
import { useMemo, useState } from 'react'
import { MdDelete } from 'react-icons/md'
import { useGetMe } from '../../../service'
import AddFriends, { Friend } from './AddFriends'
import { AddItem, Item } from './AddItem'

const PageCheckBill = () => {
  const [items, setItems] = useState<Item[]>([])
  const [friends, setFriends] = useState<Friend[]>([])
  const [itemToFriends, setItemToFriends] = useState<Record<string, string[]>>({})
  const [friendPayByItem, setFriendPayByItem] = useState<Record<string, string>>({})
  const { data: user } = useGetMe()
  const isLoggedIn = !!user?.user.id
  const handleAddItem = (item: Item) => {
    setItems([...items, item])
  }

  const handleAddFriend = (friend: Friend) => {
    setFriends([...friends, { ...friend }])
    message.success('เพิ่มเพื่อนเรียบร้อยแล้ว')
  }

  const handleDeleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
    const updated = { ...friendPayByItem }
    delete updated[id]
    setFriendPayByItem(updated)

    const updatedSplit = { ...itemToFriends }
    delete updatedSplit[id]
    setItemToFriends(updatedSplit)
  }

  const handleDeleteFriend = (id: string) => {
    setFriends(friends.filter((friend) => friend.id !== id))
    setItemToFriends(
      Object.entries(itemToFriends).reduce(
        (acc, [itemId, friendIds]) => {
          acc[itemId] = friendIds.filter((fid) => fid !== id)
          return acc
        },
        {} as Record<string, string[]>
      )
    )

    setFriendPayByItem(
      Object.entries(friendPayByItem).reduce(
        (acc, [itemId, payerId]) => {
          if (payerId !== id) acc[itemId] = payerId
          return acc
        },
        {} as Record<string, string>
      )
    )
  }

  const handleChange = (friendNames: string[], id: string) => {
    setItemToFriends({ ...itemToFriends, [id]: friendNames })
  }

  const handleAddPay = (payerId: string, itemId: string) => {
    setFriendPayByItem({ ...friendPayByItem, [itemId]: payerId })
  }

  const handleReset = () => {
    setItems([])
    setFriends([])
    setItemToFriends({})
    setFriendPayByItem({})
  }
  // const handleJ = () => {
  //   setItems([
  //     { name: 'รี', price: 500, id: '1' },
  //     { name: 'ข้าว', price: 500, id: '2' },
  //     { name: 'โซดา', price: 250, id: '3' },
  //   ])
  //   setFriends([
  //     { name: 'ton', id: '1' },
  //     { name: 'boom', id: '2' },
  //     { name: 'gon', id: '3' },
  //   ])
  // }
  const friendBill = useMemo(() => {
    const newFriendBill: Record<string, number> = {}
    friends.forEach((f) => (newFriendBill[f.id] = 0))

    items.forEach((item) => {
      const split = itemToFriends[item.id]
      if (!split || split.length === 0) return

      const pricePerPerson = round(item.price / split.length)
      split.forEach((fid) => {
        newFriendBill[fid] += pricePerPerson
      })
    })

    return newFriendBill
  }, [friends, itemToFriends, items])

  const friendPaid = useMemo(() => {
    const newFriendPaid: Record<string, number> = {}

    friends.forEach((friend) => {
      newFriendPaid[friend.id] = 0
    })

    items.forEach((item) => {
      const payerId = friendPayByItem[item.id]
      if (payerId) {
        newFriendPaid[payerId] += item.price
      }
    })

    return newFriendPaid
  }, [friends, items, friendPayByItem])

  const transactions = useMemo(() => {
    const result: { from: string; to: string; amount: number }[] = []

    const payers: Record<string, number> = {}
    const receivers: Record<string, number> = {}

    friends.forEach((friend) => {
      const paid = friendPaid[friend.id] || 0
      const bill = friendBill[friend.id] || 0
      const diff = Math.round(paid - bill)

      if (diff > 0) {
        receivers[friend.id] = diff // ได้เงินคืน
      } else if (diff < 0) {
        payers[friend.id] = -diff // ต้องจ่าย
      }
    })

    const receiverIds = Object.keys(receivers)
    const payerIds = Object.keys(payers)

    for (const payerId of payerIds) {
      for (const receiverId of receiverIds) {
        const payAmount = payers[payerId]
        const receiveAmount = receivers[receiverId]

        if (payAmount === 0 || receiveAmount === 0) continue

        const amount = Math.min(payAmount, receiveAmount)

        result.push({ from: payerId, to: receiverId, amount })

        payers[payerId] -= amount
        receivers[receiverId] -= amount
      }
    }

    return result
  }, [friendPaid, friendBill, friends])

  const options: SelectProps['options'] = friends.map((f) => ({
    label: f.name,
    value: f.id,
  }))

  return (
    <div className="hover:shadow-3xl mx-auto max-w-full space-y-6 rounded-3xl bg-gradient-to-br from-blue-100 via-white to-blue-200 p-4 shadow-2xl transition-all duration-500 md:max-w-3xl md:p-6">
      <Typography.Title
        level={3}
        className="animate-pulse !text-center text-blue-600 drop-shadow-md"
      >
        แบ่งบิลเพื่อนแบบกำหนดเอง
      </Typography.Title>

      <div className="flex flex-col gap-6">
        <AddItem onAddItem={handleAddItem} items={items} />
        <AddFriends onAddFriend={handleAddFriend} friends={friends} />
      </div>

      {items.length > 0 && <Divider className="border-blue-300">รายการและผู้ร่วมจ่าย</Divider>}

      <div className="space-y-6">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex flex-col items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-md ring-1 ring-blue-200 transition-transform duration-300 hover:scale-[1.02] md:flex-row"
          >
            <div className="flex w-full flex-col gap-4 md:w-11/12">
              <div className="flex flex-col justify-between gap-1 text-base font-medium text-gray-700 md:flex-row md:items-center">
                <div className="font-semibold">
                  <span>รายการที่ {index + 1}</span> {item.name}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-gray-500">คนที่ออกเงิน:</span>
                  <Select
                    showSearch
                    placeholder="เลือกผู้จ่าย"
                    optionFilterProp="label"
                    value={friendPayByItem[item.id]}
                    onChange={(value) => handleAddPay(value, item.id)}
                    options={options}
                    className="min-w-[140px]"
                  />
                </div>
                <div className="text-blue-600">
                  จำนวนเงิน {new Intl.NumberFormat().format(item.price)} บาท
                </div>
              </div>

              <Select
                mode="multiple"
                allowClear
                placeholder="เลือกเพื่อนที่ร่วมจ่าย"
                value={itemToFriends[item.id]}
                onChange={(value) => handleChange(value, item.id)}
                options={options}
                className="w-full transition-all duration-300 hover:border-blue-400"
              />
            </div>

            <Button
              type="link"
              onClick={() => handleDeleteItem(item.id)}
              className="!text-red-500 hover:scale-110"
            >
              <MdDelete size={26} />
            </Button>
          </div>
        ))}
      </div>

      {friends.length > 0 && (
        <Divider className="my-4 border-green-300 text-center text-lg font-semibold">
          ยอดที่แต่ละคนต้องจ่าย
        </Divider>
      )}

      <div className="space-y-4">
        {friends.map((friend) => (
          <div
            key={friend.id}
            className="rounded-2xl bg-green-50 px-5 py-4 shadow ring-1 ring-green-200 transition-all duration-300 hover:scale-[1.01]"
          >
            <div className="flex flex-row items-center justify-between">
              {/* Left section */}
              <div className="w-1/2 space-y-1">
                <div className="text-lg font-bold text-green-700">{friend.name}</div>
                {friendPaid[friend.id] > 0 && (
                  <div className="text-sm text-gray-600">
                    ชำระไปแล้ว {Math.floor(friendPaid[friend.id]).toLocaleString()} บาท
                  </div>
                )}
                <div className="text-sm text-gray-600">
                  ยอดที่ต้องชำระ {Math.floor(friendBill[friend.id]).toLocaleString()} บาท
                </div>

                {friendPaid[friend.id] > friendBill[friend.id] && (
                  <div className="text-sm font-medium text-blue-700">
                    ต้องได้เงินคืน{' '}
                    {(friendPaid[friend.id] - friendBill[friend.id]).toLocaleString()} บาท
                  </div>
                )}
                {friendPaid[friend.id] < friendBill[friend.id] && (
                  <div className="text-sm font-medium text-red-500">
                    ยอดค้างชำระ {(friendBill[friend.id] - friendPaid[friend.id]).toLocaleString()}{' '}
                    บาท
                  </div>
                )}
              </div>

              {/* Delete button */}
              <div className="mt-2 md:mt-0 md:ml-auto">
                <Button
                  type="link"
                  onClick={() => handleDeleteFriend(friend.id)}
                  className="!text-red-400 hover:scale-110"
                >
                  <MdDelete size={22} />
                </Button>
              </div>
            </div>

            {/* Transactions */}
            <div className="mt-3 border-t border-dashed border-green-300 pt-2 text-sm text-gray-600">
              {transactions
                .filter((t) => t.from === friend.id || t.to === friend.id)
                .map((t, i) => {
                  const from = friends.find((f) => f.id === t.from)?.name
                  const to = friends.find((f) => f.id === t.to)?.name
                  const isPayer = t.from === friend.id

                  return (
                    <div key={i}>
                      {isPayer ? (
                        <span>
                          ต้องจ่าย <b>{to}</b> จำนวน <b>{t.amount.toLocaleString()}</b> บาท
                        </span>
                      ) : (
                        <span>
                          จะได้รับจาก <b>{from}</b> จำนวน <b>{t.amount.toLocaleString()}</b> บาท
                        </span>
                      )}
                    </div>
                  )
                })}
            </div>
          </div>
        ))}
      </div>

      {/* <div>
        <Button onClick={handleJ}>สร้างข้อมูล</Button>
      </div> */}
      {(friends.length > 0 || items.length > 0) && (
        <div className="flex justify-center pt-6">
          <Button
            type="primary"
            onClick={handleReset}
            className="rounded-full bg-blue-500 px-6 py-2 text-lg text-white shadow-lg transition-all duration-300 hover:bg-blue-600"
          >
            ล้างข้อมูลทั้งหมด
          </Button>
        </div>
      )}
      {isLoggedIn && <div>save</div>}
    </div>
  )
}
export default PageCheckBill
