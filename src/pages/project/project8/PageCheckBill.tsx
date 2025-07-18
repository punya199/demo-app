import { Button, Divider, message, Modal, Select, SelectProps, Typography } from 'antd'
import { AnimatePresence, motion } from 'framer-motion'
import { round } from 'lodash'
import { useCallback, useMemo, useState } from 'react'
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
  const [openDelete, setOpenDelete] = useState(false)

  const { data: user } = useGetMe()
  const isLoggedIn = useMemo(() => {
    return !!user?.user.id
  }, [user?.user.id])

  const handleAddItem = useCallback(
    (item: Item) => {
      setItems([...items, item])
      message.success('เพิ่มรายการเรียบร้อยแล้ว')
      setOpenDelete(false)
    },
    [items, setItems]
  )

  const handleAddFriend = useCallback(
    (friend: Friend) => {
      setFriends([...friends, { ...friend }])
      message.success('เพิ่มเพื่อนเรียบร้อยแล้ว')
      setOpenDelete(false)
    },
    [friends, setFriends]
  )

  const handleOpenButtonDelete = useCallback(() => {
    setOpenDelete(!openDelete)
  }, [openDelete])

  const handleDeleteItem = useCallback(
    (id: string) => {
      Modal.confirm({
        title: 'ยืนยันการลบ',
        content: 'คุณต้องการลบรายการนี้จริงหรือไม่?',
        okText: 'ลบเลย',
        okType: 'danger',
        cancelText: 'ยกเลิก',
        icon: null,
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
        icon: null,
        onOk: async () => {
          await new Promise((resolve) => setTimeout(resolve, 300)) // mock delay
          setFriends(friends.filter((friend) => friend.id !== removeFriendId))
          setItems(
            items.map((item) => {
              const itemFriend = item.friendIds || []
              const newFriendIds = itemFriend.filter((e) => e !== removeFriendId)

              return {
                ...item,
                friendIds: newFriendIds,

                payerId: item.payerId === removeFriendId ? '' : item.payerId,
              }
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
    Modal.confirm({
      title: 'ยืนยันการรีเซ็ต',
      content: 'คุณแน่ใจหรือไม่ว่าต้องการรีเซ็ตสินค้าทั้งหมดและเพื่อนทั้งหมด?',
      cancelText: 'ไม่',
      okText: 'ใช่',
      okType: 'danger',
      icon: null,
      onOk: () => {
        setItems([])
        setFriends([])
        setOpenDelete(false)
      },
    })
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
    <div className="hover:shadow-3xl mx-auto max-w-full space-y-6 rounded-3xl bg-gradient-to-br from-blue-100 via-white to-blue-200 p-3 shadow-2xl transition-all duration-500 md:max-w-3xl md:p-6">
      <Typography.Title
        level={3}
        className="animate-in fade-in-0 slide-in-from-top-2 !text-center text-blue-700 drop-shadow-md duration-700"
      >
        แบ่งบิลเพื่อนแบบกำหนดเอง
      </Typography.Title>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex flex-col gap-6"
      >
        <AddItem onAddItem={handleAddItem} items={items} />
        <AddFriends onAddFriend={handleAddFriend} friends={friends} />
      </motion.div>

      {items.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Divider className="border-blue-400">รายการและผู้ร่วมจ่าย</Divider>
        </motion.div>
      )}

      <AnimatePresence mode="popLayout">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, y: -30, scale: 0.9 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              transition: {
                duration: 0.5,
                delay: index * 0.1,
                type: 'spring',
                stiffness: 200,
                damping: 20,
              },
            }}
            exit={{
              opacity: 0,
              y: 30,
              scale: 0.8,
              transition: {
                duration: 0.3,
                type: 'spring',
                stiffness: 300,
                damping: 30,
              },
            }}
            whileHover={{
              scale: 1.02,
              y: -2,
              transition: { duration: 0.2 },
            }}
            className="flex flex-col items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-md ring-1 ring-blue-300 transition-shadow duration-300 hover:shadow-lg md:px-8 md:py-4"
          >
            <div className="flex w-full flex-col gap-2">
              <div className="flex flex-col gap-1">
                {openDelete ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-start justify-between gap-2"
                  >
                    <div className="flex flex-1 flex-col md:flex-row">
                      <div className="flex min-w-0 flex-1 items-center text-xl font-semibold text-gray-700">
                        <span className="word-wrap w-full break-words">
                          รายการที่ {index + 1} {item.name}
                        </span>
                      </div>
                      <div className="flex items-center whitespace-nowrap text-blue-700">
                        {new Intl.NumberFormat().format(item.price)} บาท
                      </div>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-shrink-0 rounded-2xl bg-red-100 shadow-xl transition-all duration-300"
                    >
                      <Button
                        type="link"
                        onClick={() => handleDeleteItem(item.id)}
                        className="h-auto p-0 leading-none !text-red-600"
                      >
                        <MdDelete size={24} />
                      </Button>
                    </motion.div>
                  </motion.div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 flex-1 items-center text-xl font-semibold text-gray-700">
                      <span className="word-wrap overflow-wrap-anywhere w-full break-words">
                        รายการที่ {index + 1} {item.name}
                      </span>
                    </div>
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                      className="flex flex-shrink-0 items-center whitespace-nowrap text-blue-700"
                    >
                      {new Intl.NumberFormat().format(item.price)} บาท
                    </motion.div>
                  </div>
                )}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="flex items-center gap-1"
              >
                <span className="w-20 flex-shrink-0 text-sm text-gray-600">คนที่ออกเงิน</span>
                <div className="min-w-0 flex-1">
                  <Select
                    placeholder="เลือกผู้จ่าย"
                    value={item.payerId}
                    onChange={(value) => handleAddPay(value, item.id)}
                    options={options}
                    suffixIcon={false}
                    className="w-full"
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="flex items-center gap-1"
              >
                <span className="w-20 flex-shrink-0 text-sm text-gray-600">คนที่ต้องหาร</span>
                <div className="min-w-0 flex-1">
                  <Select
                    mode="multiple"
                    placeholder="เลือกคนที่ร่วมหาร"
                    value={item.friendIds?.length ? item.friendIds : undefined}
                    onChange={(value) => handleChange(value, item.id)}
                    options={options}
                    suffixIcon={false}
                    showSearch={false}
                    className="w-full"
                    popupRender={(menu) => {
                      if (friends.length === 0) return menu
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
              </motion.div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {friends.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Divider className="my-4 border-green-400 text-center text-lg font-semibold">
            ยอดที่แต่ละคนต้องจ่าย
          </Divider>
        </motion.div>
      )}

      <AnimatePresence mode="popLayout">
        <motion.div layout className="space-y-4">
          {friends.map((friend, index) => (
            <motion.div
              key={friend.id}
              layout
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                transition: {
                  duration: 0.6,
                  delay: index * 0.1,
                  type: 'spring',
                  stiffness: 200,
                  damping: 25,
                },
              }}
              exit={{
                opacity: 0,
                scale: 0.9,
                y: -20,
                transition: {
                  duration: 0.3,
                  type: 'spring',
                  stiffness: 300,
                  damping: 30,
                },
              }}
              whileHover={{
                scale: 1.02,
                y: -3,
                transition: { duration: 0.2 },
              }}
              className="flex"
            >
              <div className="w-full rounded-2xl bg-green-100 p-4 shadow-2xl ring-1 ring-green-300 transition-all duration-300 hover:shadow-xl md:px-8 md:py-4">
                <div className="space-y-1">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="flex items-center justify-between text-2xl font-bold"
                  >
                    {friend.name}
                    {openDelete && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeleteFriend(friend.id)}
                        className="cursor-pointer rounded-2xl bg-red-100 shadow-xl transition-all duration-300"
                      >
                        <Button type="link" className="!text-red-600">
                          <MdDelete size={22} />
                        </Button>
                      </motion.div>
                    )}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  >
                    {friendPaid[friend.id] > 0 && (
                      <div className="text-sm text-gray-700">
                        ชำระไปแล้ว {Math.floor(friendPaid[friend.id]).toLocaleString()} บาท
                      </div>
                    )}
                    {friendBill[friend.id] !== 0 && (
                      <div className="text-sm text-gray-700">
                        ยอดที่ต้องชำระทั้งหมด {Math.floor(friendBill[friend.id]).toLocaleString()}{' '}
                        บาท
                      </div>
                    )}
                    {friendPaid[friend.id] > friendBill[friend.id] && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.4 }}
                        className="text-sm font-medium text-blue-800"
                      >
                        ต้องได้เงินคืน{' '}
                        {(friendPaid[friend.id] - friendBill[friend.id]).toLocaleString()} บาท
                      </motion.div>
                    )}
                    {friendPaid[friend.id] < friendBill[friend.id] && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.4 }}
                        className="text-sm font-medium text-red-600"
                      >
                        ยอดค้างชำระ{' '}
                        {(friendBill[friend.id] - friendPaid[friend.id]).toLocaleString()} บาท
                      </motion.div>
                    )}
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                  className="mt-3 border-t border-dashed border-green-400"
                >
                  <AnimatePresence>
                    {transactions
                      .filter((t) => t.from === friend.id || t.to === friend.id)
                      .map((t, i) => {
                        const from = friends.find((f) => f.id === t.from)?.name
                        const to = friends.find((f) => f.id === t.to)?.name
                        const isPayer = t.from === friend.id

                        return (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3, delay: i * 0.1 }}
                            className="pt-2 text-sm text-gray-700"
                          >
                            {isPayer ? (
                              <span>
                                ต้องจ่าย <b>{to}</b> จำนวน <b>{t.amount.toLocaleString()}</b> บาท
                              </span>
                            ) : (
                              <span>
                                จะได้รับจาก <b>{from}</b> จำนวน <b>{t.amount.toLocaleString()}</b>{' '}
                                บาท
                              </span>
                            )}
                          </motion.div>
                        )
                      })}
                  </AnimatePresence>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {(friends.length > 0 || items.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex items-center justify-center gap-4"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              type="primary"
              onClick={handleOpenButtonDelete}
              className="transition-all duration-200"
            >
              ลบบางรายการ
            </Button>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex justify-center"
          >
            <Button
              type="primary"
              onClick={handleReset}
              className="rounded-full bg-blue-500 px-6 py-2 text-lg text-white shadow-lg transition-all duration-300 hover:bg-blue-600"
            >
              ล้างข้อมูลทั้งหมด
            </Button>
          </motion.div>
        </motion.div>
      )}

      {isLoggedIn && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex gap-2"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={initializeSampleData}>สร้างข้อมูล</Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={onSave}>Save</Button>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
export default PageCheckBill
