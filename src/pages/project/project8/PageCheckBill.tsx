import { Button, Divider, message, Modal, Select, SelectProps, Typography } from 'antd'
import { round } from 'lodash'
import { useCallback, useMemo } from 'react'
import { MdDelete } from 'react-icons/md'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useGetMe } from '../../../service'
import { apiClient } from '../../../utils/api-client'
import AddFriends, { Friend } from './AddFriends'
import { AddItem, Item } from './AddItem'
type PositionStoreState = { items: Item[]; friends: Friend[] }

type PositionStoreActions = {
  setItems: (nextPosition: PositionStoreState['items']) => void
  setFriends: (nextPosition: PositionStoreState['friends']) => void
}

type PositionStore = PositionStoreState & PositionStoreActions

const useCheckBillStore = create<PositionStore>()(
  persist(
    (set) => ({
      items: [],
      friends: [],
      setItems: (items) => set({ items }),
      setFriends: (friends) => set({ friends }),
    }),
    { name: 'position-storage' }
  )
)

const PageCheckBill = () => {
  // const [items, setItems] = useState<Item[]>([])
  // const [friends, setFriends] = useState<Friend[]>([])
  const { items, friends, setFriends, setItems } = useCheckBillStore()

  const { data: user } = useGetMe()
  const isLoggedIn = useMemo(() => {
    return !!user?.user.id
  }, [user?.user.id])

  const handleAddItem = useCallback(
    (item: Item) => {
      setItems([...items, item])
    },
    [items, setItems]
  )

  const handleAddFriend = useCallback(
    (friend: Friend) => {
      setFriends([...friends, { ...friend }])
      message.success('เพิ่มเพื่อนเรียบร้อยแล้ว')
    },
    [friends, setFriends]
  )

  const handleDeleteItem = useCallback(
    (id: string) => {
      Modal.confirm({
        title: 'ยืนยันการลบ',
        content: 'คุณต้องการลบรายการนี้จริงหรือไม่?',
        okText: 'ลบเลย',
        okType: 'danger',
        cancelText: 'ยกเลิก',
        onOk: async () => {
          await new Promise((resolve) => setTimeout(resolve, 300)) // mock delay
          setItems(items.filter((item) => item.id !== id))
        },
      })
    },
    [items, setItems]
  )

  const handleDeleteFriend = useCallback(
    (removeFriendId: string) => {
      Modal.confirm({
        title: 'ยืนยันการลบ',
        content: 'คุณต้องการลบเพื่อนคนนี้จริงหรือไม่?',
        okText: 'ลบเลย',
        okType: 'danger',
        cancelText: 'ยกเลิก',
        onOk: async () => {
          await new Promise((resolve) => setTimeout(resolve, 300)) // mock delay
          setFriends(friends.filter((friend) => friend.id !== removeFriendId))
          setItems(
            items.map((item) => {
              const itemFriend = item.friendIds || []
              const friendPay = item.payerId
              item.friendIds = itemFriend.filter((e) => e !== removeFriendId)
              if (item.payerId === friendPay) {
                item.payerId = ''
              }
              return item
            })
          )
        },
      })
    },
    [friends, items, setFriends, setItems]
  )

  const handleAddPay = useCallback(
    (payerId: string, itemId: string) => {
      setItems(
        items.map((item) => {
          if (item.id === itemId) {
            item.payerId = payerId
          }
          return item
        })
      )
    },
    [items, setItems]
  )

  const handleChange = useCallback(
    (friendIds: string[], itemId: string) => {
      setItems(
        items.map((item) => {
          if (item.id === itemId) {
            item.friendIds = friendIds
          }
          return item
        })
      )
    },
    [items, setItems]
  )

  const handleReset = useCallback(() => {
    setItems([])
    setFriends([])
  }, [setFriends, setItems])

  const initializeSampleData = useCallback(() => {
    setItems([
      { name: 'รี', price: 500, id: '1' },
      { name: 'ข้าว', price: 500, id: '2' },
      { name: 'โซดา', price: 250, id: '3' },
    ])
    setFriends([
      { name: 'ton', id: '1' },
      { name: 'boom', id: '2' },
      { name: 'gon', id: '3' },
    ])
  }, [setFriends, setItems])

  const onSave = async () => {
    interface SaveBody {
      items: Item[]
      friends: Friend[]
    }
    const body: SaveBody = { items, friends }
    await apiClient.post(`/bill`, body)
  }

  const friendBill = useMemo(() => {
    const newFriendBill: Record<string, number> = {}
    friends.forEach((f) => (newFriendBill[f.id] = 0))

    items.forEach((item) => {
      const split = item.friendIds
      if (!split || split.length === 0) return

      const pricePerPerson = round(item.price / split.length)
      split.forEach((fid) => {
        newFriendBill[fid] += pricePerPerson
      })
    })

    return newFriendBill
  }, [friends, items])

  const friendPaid = useMemo(() => {
    const newFriendPaid: Record<string, number> = {}

    friends.forEach((friend) => {
      newFriendPaid[friend.id] = 0
    })

    items.forEach((item) => {
      const payerId = item.payerId
      if (payerId) {
        newFriendPaid[payerId] += item.price
      }
    })

    return newFriendPaid
  }, [friends, items])

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

  const options: SelectProps['options'] = useMemo(() => {
    return friends.map((f) => ({
      label: f.name,
      value: f.id,
    }))
  }, [friends])

  return (
    <div className="hover:shadow-3xl mx-auto max-w-full space-y-6 rounded-3xl bg-gradient-to-br from-blue-100 via-white to-blue-200 p-4 shadow-2xl transition-all duration-500 md:max-w-3xl md:p-6">
      <Typography.Title
        level={3}
        className="animate-pulse !text-center text-blue-700 drop-shadow-md"
      >
        แบ่งบิลเพื่อนแบบกำหนดเอง
      </Typography.Title>

      <div className="flex flex-col gap-6">
        <AddItem onAddItem={handleAddItem} items={items} />
        <AddFriends onAddFriend={handleAddFriend} friends={friends} />
      </div>

      {items.length > 0 && <Divider className="border-blue-400">รายการและผู้ร่วมจ่าย</Divider>}

      <div className="space-y-6">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex flex-col items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-md ring-1 ring-blue-300 transition-transform duration-300 hover:scale-[1.02] md:flex-row"
          >
            <div className="flex w-full flex-col gap-2 md:w-11/12">
              <div className="flex flex-row justify-between py-2">
                <div className="font-semibold text-gray-700">
                  รายการที่ {index + 1} {item.name}
                </div>
                <div className="text-blue-700">
                  จำนวนเงิน {new Intl.NumberFormat().format(item.price)} บาท
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-600">คนที่ออกเงิน</span>
                <Select
                  showSearch
                  placeholder="เลือกผู้จ่าย"
                  optionFilterProp="label"
                  value={item.payerId}
                  onChange={(value) => handleAddPay(value, item.id)}
                  options={options}
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm text-gray-600">คนที่ต้องหาร</span>
                <Select
                  mode="multiple"
                  allowClear
                  placeholder="เลือกเพื่อนที่ร่วมจ่าย"
                  value={item.friendIds}
                  onChange={(value) => handleChange(value, item.id)}
                  options={options}
                  className="w-full transition-all duration-300 hover:border-blue-500"
                  popupRender={(menu) => {
                    const allSelected = (item.friendIds ?? []).length === friends.length

                    return (
                      <>
                        {menu}
                        <Divider style={{ margin: '8px 0' }} />
                        <div className="flex justify-center p-2">
                          <Button
                            size="small"
                            type="link"
                            onClick={() =>
                              handleChange(allSelected ? [] : friends.map((f) => f.id), item.id)
                            }
                          >
                            {allSelected ? 'ยกเลิกการเลือกทั้งหมด' : 'เลือกเพื่อนทั้งหมด'}
                          </Button>
                        </div>
                      </>
                    )
                  }}
                />
              </div>
            </div>

            <Button
              type="link"
              onClick={() => handleDeleteItem(item.id)}
              className="!text-red-600 hover:scale-110"
            >
              <MdDelete size={26} />
            </Button>
          </div>
        ))}
      </div>

      {friends.length > 0 && (
        <Divider className="my-4 border-green-400 text-center text-lg font-semibold">
          ยอดที่แต่ละคนต้องจ่าย
        </Divider>
      )}

      <div className="space-y-4">
        {friends.map((friend) => (
          <div
            key={friend.id}
            className="rounded-2xl bg-green-100 px-5 py-4 shadow ring-1 ring-green-300 transition-all duration-300 hover:scale-[1.01]"
          >
            <div className="flex flex-row items-center justify-between">
              {/* Left section */}
              <div className="space-y-1">
                <div className="text-lg font-bold text-green-800">{friend.name}</div>
                {friendPaid[friend.id] > 0 && (
                  <div className="text-sm text-gray-700">
                    ชำระไปแล้ว {Math.floor(friendPaid[friend.id]).toLocaleString()} บาท
                  </div>
                )}
                {friendBill[friend.id] !== 0 && (
                  <div className="text-sm text-gray-700">
                    ยอดที่ต้องชำระทั้งหมด {Math.floor(friendBill[friend.id]).toLocaleString()} บาท
                  </div>
                )}

                {friendPaid[friend.id] > friendBill[friend.id] && (
                  <div className="text-sm font-medium text-blue-800">
                    ต้องได้เงินคืน{' '}
                    {(friendPaid[friend.id] - friendBill[friend.id]).toLocaleString()} บาท
                  </div>
                )}
                {friendPaid[friend.id] < friendBill[friend.id] && (
                  <div className="text-sm font-medium text-red-600">
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
                  className="!text-red-600 hover:scale-110"
                >
                  <MdDelete size={22} />
                </Button>
              </div>
            </div>

            {/* Transactions */}
            <div className="mt-3 border-t border-dashed border-green-400 pt-2 text-sm text-gray-700">
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

      {isLoggedIn && (
        <div>
          <Button onClick={initializeSampleData}>สร้างข้อมูล</Button>
          <Button onClick={onSave}>Save</Button>
        </div>
      )}
    </div>
  )
}
export default PageCheckBill
