import { Button, Divider, Input, message, Modal, Select, SelectProps } from 'antd'
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { MdDelete } from 'react-icons/md'
import { Link, useNavigate } from 'react-router-dom'
import { appPath } from '../../../config/app-paths'
import { useGetMe } from '../../../service'
import AddFriends, { Friend } from './AddFriends'
import { AddItem, Item } from './AddItem'
import { useCheckBillStore } from './check-bill-store'
import { mockBill } from './mock-bill-data'
import { Bill } from './PageAllBill'

export interface SaveBody {
  items: Item[]
  friends: Friend[]
  title: string
}
interface CheckBillPorps {
  bill?: Bill
  onSave: (data: SaveBody) => void
}

const CheckBill = (props: CheckBillPorps) => {
  // const [items, setItems] = useState<Item[]>([])
  // const [friends, setFriends] = useState<Friend[]>([])

  const navigate = useNavigate()
  const selectRefs = useRef<Record<string, { blur: () => void } | null>>({})
  const { items, friends, title, setFriends, setItems, setTitle } = useCheckBillStore()
  useEffect(() => {
    if (props.bill) {
      setItems(props.bill.items)
      setFriends(props.bill.friends)
      setTitle(props.bill.title)
    }
  }, [props.bill, setFriends, setItems, setTitle])

  const { data: user } = useGetMe()
  // ข้อมูลตัวอย่างให้แก้ไข/บันทึกได้โดยไม่ต้อง login - บิลอื่นยังเช็คสิทธิ์เหมือนเดิม
  const isMockBill = props.bill?.id === mockBill.id
  const isLoggedIn = useMemo(() => {
    return !!user?.user?.id || isMockBill
  }, [user?.user?.id, isMockBill])

  const handleAddItem = useCallback(
    (item: Item) => {
      setItems([...items, item])
      message.success('เพิ่มรายการเรียบร้อยแล้ว')
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
        content: 'คุณต้องการลบรายการนี้หรือไม่?',
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
        content: 'คุณต้องการลบหรือไม่?',
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
      content: 'คุณแน่ใจหรือไม่ว่าต้องการรีเซ็ตทั้งหมด ?',
      cancelText: 'ไม่',
      okText: 'ใช่',
      okType: 'danger',
      icon: null,
      onOk: () => {
        setItems([])
        setFriends([])
      },
    })
  }, [setFriends, setItems])

  const handleSave = useCallback(() => {
    if (!title.trim()) return
    Modal.confirm({
      title: 'ยืนยันการบันทึก',
      content: `บันทึกบิล "${title}" ใช่หรือไม่?`,
      okText: 'บันทึก',
      okType: 'primary',
      cancelText: 'ยกเลิก',
      icon: null,
      onOk: async () => {
        try {
          await props.onSave({ friends, items, title })
          message.success('บันทึกบิลเรียบร้อยแล้ว')
          navigate(appPath.checkBillPage())
        } catch {
          message.error('บันทึกบิลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง')
        }
      },
    })
  }, [friends, items, title, props, navigate])

  const friendBill = useMemo(() => {
    const newFriendBill: Record<string, number> = {}
    friends.forEach((f) => (newFriendBill[f.id] = 0))

    items.forEach((item) => {
      const split = item.friendIds
      if (!split || split.length === 0) return

      // แบ่งเศษที่หารไม่ลงตัวให้คนแรกๆ ทีละ 1 บาท เพื่อให้ยอดรวมตรงกับราคาสินค้าเป๊ะ
      const baseShare = Math.floor(item.price / split.length)
      const remainder = item.price - baseShare * split.length

      split.forEach((fid, index) => {
        newFriendBill[fid] += baseShare + (index < remainder ? 1 : 0)
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
    <div className="hover:shadow-3xl mx-auto max-w-full space-y-6 rounded-3xl bg-gradient-to-br from-blue-100 via-white to-blue-200 p-3 shadow-2xl transition-all duration-500 md:max-w-3xl md:p-6 dark:from-slate-800 dark:via-slate-900 dark:to-slate-950">
      <div className="flex flex-col gap-2 md:gap-4">
        <div className="rounded-lg bg-gray-50 p-4 shadow-sm md:px-8 md:py-4 dark:bg-slate-800">
          <h3 className="mb-2 text-lg font-semibold text-slate-800 dark:text-slate-100">ชื่อบิล</h3>
          <Input
            placeholder="กรุณากรอกชื่อบิล"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <AddItem onAddItem={handleAddItem} items={items} />
        <AddFriends onAddFriend={handleAddFriend} friends={friends} />
      </div>

      {items.length === 0 && friends.length === 0 && (
        <div className="py-4 text-center text-sm text-gray-400 dark:text-slate-500">
          เริ่มต้นโดยการเพิ่มรายการและเพื่อนด้านบน
        </div>
      )}

      {items.length > 0 && <Divider className="border-blue-400">รายการและผู้ร่วมจ่าย</Divider>}

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
            className="my-2 flex flex-col items-center justify-between rounded-2xl bg-white p-4 shadow-md ring-1 ring-blue-300 transition-shadow duration-300 hover:shadow-lg md:px-8 md:py-4 dark:bg-slate-800 dark:ring-slate-700"
          >
            <div className="flex w-full flex-col gap-2">
              <div className="flex flex-col gap-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-1 flex-col md:flex-row">
                    <div className="flex min-w-0 flex-1 items-center text-xl font-semibold text-gray-700 dark:text-slate-100">
                      <span className="word-wrap w-full break-words">
                        รายการที่ {index + 1} {item.name}
                      </span>
                    </div>
                    <div className="flex items-center whitespace-nowrap text-blue-700 dark:text-blue-300">
                      {new Intl.NumberFormat().format(item.price)} บาท
                    </div>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-shrink-0 rounded-2xl bg-red-100 shadow-xl transition-all duration-300 dark:bg-red-900/40"
                  >
                    <Button
                      type="link"
                      onClick={() => handleDeleteItem(item.id)}
                      className="h-auto p-0 leading-none !text-red-600 dark:!text-red-400"
                    >
                      <MdDelete size={24} />
                    </Button>
                  </motion.div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <span className="w-20 flex-shrink-0 text-sm text-gray-600 dark:text-slate-300">
                  คนที่ออกเงิน
                </span>
                <div className="min-w-0 flex-1">
                  <Select
                    placeholder="เลือกผู้จ่าย"
                    value={item.payerId}
                    onChange={(value) => handleAddPay(value, item.id)}
                    options={options}
                    suffixIcon={false}
                    className="w-full"
                    status={item.payerId ? undefined : 'warning'}
                  />
                </div>
              </div>

              <div className="flex items-center gap-1">
                <span className="w-20 flex-shrink-0 text-sm text-gray-600 dark:text-slate-300">
                  คนที่ต้องหาร
                </span>
                <div className="min-w-0 flex-1">
                  <Select
                    ref={(el) => {
                      selectRefs.current[item.id] = el
                    }}
                    mode="multiple"
                    placeholder="เลือกคนที่ร่วมหาร"
                    value={item.friendIds?.length ? item.friendIds : undefined}
                    onChange={(value) => handleChange(value, item.id)}
                    options={options}
                    suffixIcon={false}
                    showSearch={false}
                    className="w-full"
                    status={item.friendIds?.length ? undefined : 'warning'}
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
                              onClick={() => {
                                handleChange(allSelected ? [] : friends.map((f) => f.id), item.id)
                                selectRefs.current[item.id]?.blur()
                              }}
                            >
                              {allSelected ? 'ยกเลิกการเลือกทั้งหมด' : 'เลือกทั้งหมด'}
                            </Button>
                          </div>
                        </>
                      )
                    }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        {items.length > 0 && (
          <div className="flex items-center justify-center gap-2 rounded-2xl bg-gray-100 p-2 text-slate-800 shadow-md ring-1 ring-blue-300 transition-shadow duration-300 hover:shadow-lg md:px-8 md:py-4 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-700">
            ยอดที่จ่ายทั้งหมด
            <span className="font-bold">
              {items
                .reduce((acc, curr) => {
                  acc += curr.price
                  return acc
                }, 0)
                .toLocaleString()}{' '}
            </span>
            บาท
          </div>
        )}
      </AnimatePresence>

      {friends.length > 0 && (
        <Divider className="my-4 border-green-200 text-center text-lg font-semibold dark:border-emerald-700">
          ยอดที่แต่ละคนต้องจ่าย
        </Divider>
      )}

      <AnimatePresence mode="popLayout">
        <div className="space-y-4">
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
              <div className="w-full rounded-2xl bg-green-50 p-4 shadow-2xl ring-1 ring-green-300 transition-all duration-300 hover:shadow-xl md:px-8 md:py-4 dark:bg-slate-800 dark:ring-emerald-800">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-2xl font-bold text-slate-800 dark:text-slate-100">
                    {friend.name}
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDeleteFriend(friend.id)}
                      className="cursor-pointer rounded-2xl bg-red-100 shadow-xl transition-all duration-300 dark:bg-red-900/40"
                    >
                      <Button type="link" className="!text-red-600 dark:!text-red-400">
                        <MdDelete size={22} />
                      </Button>
                    </motion.div>
                  </div>

                  <div>
                    {friendPaid[friend.id] > 0 && (
                      <div className="text-sm text-gray-700 dark:text-slate-300">
                        ชำระไปแล้ว {Math.floor(friendPaid[friend.id]).toLocaleString()} บาท
                      </div>
                    )}
                    {friendBill[friend.id] !== 0 && (
                      <div className="text-sm text-gray-700 dark:text-slate-300">
                        ยอดที่ต้องชำระทั้งหมด {Math.floor(friendBill[friend.id]).toLocaleString()}{' '}
                        บาท
                      </div>
                    )}
                    {friendPaid[friend.id] > friendBill[friend.id] && (
                      <div className="text-sm font-medium text-blue-800 dark:text-blue-300">
                        ต้องได้เงินคืน{' '}
                        {(friendPaid[friend.id] - friendBill[friend.id]).toLocaleString()} บาท
                      </div>
                    )}
                    {friendPaid[friend.id] < friendBill[friend.id] && (
                      <div className="text-sm font-medium text-red-600 dark:text-red-400">
                        ยอดค้างชำระ{' '}
                        {(friendBill[friend.id] - friendPaid[friend.id]).toLocaleString()} บาท
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 border-t border-dashed border-green-400 dark:border-emerald-700">
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
                            className="pt-2 text-sm text-gray-700 dark:text-slate-300"
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
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
      <div className="sticky bottom-0 -mx-3 flex justify-center gap-2 border-t border-blue-200 bg-white/90 p-3 backdrop-blur md:-mx-6 md:px-6 dark:border-slate-700 dark:bg-slate-900/90">
        <Link to={appPath.checkBillPage()}>
          <Button className="transition-all duration-200">กลับ</Button>
        </Link>
        {(friends.length > 0 || items.length > 0) && (
          <div className="flex items-center justify-center gap-2">
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
            {isLoggedIn && (
              <div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button type="primary" onClick={handleSave} disabled={!title.trim()}>
                    Save
                  </Button>
                </motion.div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
export default CheckBill
