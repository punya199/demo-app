import {
  ArrowLeftOutlined,
  DownloadOutlined,
  TeamOutlined,
  WalletOutlined,
} from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { Button, Card, Divider, Tag, Typography } from 'antd'
import { toPng } from 'html-to-image'
import { keyBy } from 'lodash'
import { useMemo, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { apiClient } from '../../../utils/api-client'
import { mockBill } from './mock-bill-data'
type Bill = {
  id: number
  title: string
  items: Item[]
  friends: Friend[]
  createdAt: string
  updatedAt: string
  deletedAt: string
}

interface Item {
  name: string
  price: number
  id: string
  payerId?: string
  friendIds?: string[]
}

interface Friend {
  name: string
  id: string
}

type GetBillResponse = {
  bill: Bill
}

const PageSaveBillToImage = () => {
  const params = useParams()
  const navigate = useNavigate()
  const billId = params.billId
  // บิลตัวอย่าง id ไม่ใช่ UUID จริง เรียก backend จริงไม่ได้ - ใช้ข้อมูลตัวอย่างตรงๆ ไม่ต้อง fetch
  const isMockBill = billId === String(mockBill.id)
  const { data } = useQuery({
    queryKey: ['BillList', billId],
    queryFn: async () => {
      const { data } = await apiClient.get<GetBillResponse>(`/bills/${billId}`)
      return data
    },
    enabled: !isMockBill,
    placeholderData: isMockBill ? { bill: mockBill } : undefined,
  })
  const friendHash = keyBy(data?.bill.friends || [], (e) => e.id)
  const friendBill = useMemo(() => {
    const newFriendBill: Record<string, number> = {}
    data?.bill.friends.forEach((f) => (newFriendBill[f.id] = 0))

    data?.bill.items.forEach((item) => {
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
  }, [data?.bill.friends, data?.bill.items])

  const friendPaid = useMemo(() => {
    const newFriendPaid: Record<string, number> = {}

    data?.bill.friends.forEach((friend) => {
      newFriendPaid[friend.id] = 0
    })

    data?.bill.items.forEach((item) => {
      const payerId = item.payerId
      if (payerId) {
        newFriendPaid[payerId] += item.price
      }
    })

    return newFriendPaid
  }, [data?.bill.friends, data?.bill.items])

  const transactions = useMemo(() => {
    const result: { from: string; to: string; amount: number }[] = []

    const payers: Record<string, number> = {}
    const receivers: Record<string, number> = {}

    data?.bill.friends.forEach((friend) => {
      const paid = friendPaid[friend.id] || 0
      const bill = friendBill[friend.id] || 0
      const diff = Math.round(paid - bill)

      if (diff > 0) {
        receivers[friend.id] = diff
      } else if (diff < 0) {
        payers[friend.id] = -diff
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
  }, [data?.bill.friends, friendBill, friendPaid])

  const totalSpent = useMemo(
    () => data?.bill.items.reduce((acc, curr) => acc + curr.price, 0) ?? 0,
    [data?.bill.items]
  )

  const containerRefs = useRef<{ [friendId: string]: HTMLDivElement | null }>({})

  const handleDownloadAll = async () => {
    for (const [key, ref] of Object.entries(containerRefs.current)) {
      if (!ref) continue
      const friend = friendHash[key]?.name || 'bill'
      const dataUrl = await toPng(ref, { cacheBust: true })
      const link = document.createElement('a')
      link.download = `${friend}.png`
      link.href = dataUrl
      link.click()
      // ✅ เพิ่ม delay เล็กน้อย เพื่อให้ browser มีเวลา render
      await new Promise((res) => setTimeout(res, 500))
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">
      {/* Header + ผู้จ่ายเงินล่วงหน้า */}
      <div ref={(el) => (containerRefs.current['billList'] = el)} className="space-y-6">
        <div className="text-center">
          <Typography.Title level={3} className="!mb-1 break-words">
            {data?.bill.title}
          </Typography.Title>
          <div>
            <Typography.Text type="secondary">ยอดที่จ่ายทั้งหมด </Typography.Text>
            <Typography.Text strong className="text-lg">
              {totalSpent.toLocaleString()} บาท
            </Typography.Text>
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2">
            <WalletOutlined className="text-xl text-blue-600 dark:text-blue-400" />
            <Typography.Title level={4} className="!mb-0 !text-blue-600 dark:!text-blue-400">
              ผู้จ่ายเงินล่วงหน้า
            </Typography.Title>
          </div>
          <div className="space-y-3">
            {data?.bill.friends.map((friend) => {
              const paidItems = data.bill.items.filter((item) => item.payerId === friend.id)
              if (paidItems.length === 0) return null

              return (
                <Card key={friend.id} size="small">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-semibold">{friend.name}</span>
                    <Tag color="green">{paidItems.length} รายการ</Tag>
                  </div>
                  <ul className="space-y-2">
                    {paidItems.map((item, idx) => (
                      <li key={item.id}>
                        <div className="flex justify-between text-sm">
                          <span>
                            {idx + 1}. {item.name}
                          </span>
                          <span className="font-medium">{item.price.toLocaleString()} บาท</span>
                        </div>
                        <Typography.Text type="secondary" className="text-xs">
                          หารกับ:{' '}
                          {(item.friendIds ?? [])
                            .map((fid) => friendHash[fid]?.name || '-')
                            .join(', ')}
                        </Typography.Text>
                      </li>
                    ))}
                  </ul>
                </Card>
              )
            })}
          </div>
        </div>
      </div>

      {/* สรุปของแต่ละคน */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <TeamOutlined className="text-xl text-blue-600 dark:text-blue-400" />
          <Typography.Title level={4} className="!mb-0 !text-blue-600 dark:!text-blue-400">
            สรุปของแต่ละคน
          </Typography.Title>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {data?.bill.friends.map((friend) => {
            const net = friendPaid[friend.id] - friendBill[friend.id]
            const friendTransactions = transactions.filter(
              (t) => t.from === friend.id || t.to === friend.id
            )

            return (
              <Card
                ref={(el) => {
                  containerRefs.current[friend.id] = el
                }}
                key={friend.id}
                size="small"
              >
                <div className="mb-3 text-center text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {friend.name}
                </div>

                <ul className="space-y-1 text-sm">
                  {data?.bill.items
                    .filter((item) => item.friendIds?.includes(friend.id))
                    .map((item) => (
                      <li key={item.id} className="flex justify-between">
                        <span>{item.name}</span>
                        <span>
                          {Math.floor(item.price / item.friendIds!.length).toLocaleString()} บาท
                        </span>
                      </li>
                    ))}
                </ul>

                <Divider className="my-3" />

                <div className="space-y-1 text-sm">
                  {friendBill[friend.id] !== 0 && (
                    <div className="flex justify-between font-medium">
                      <span>ยอดรวม</span>
                      <span>{Math.floor(friendBill[friend.id]).toLocaleString()} บาท</span>
                    </div>
                  )}
                  {friendPaid[friend.id] > 0 && (
                    <div className="flex justify-between">
                      <Typography.Text type="success">ชำระแล้ว</Typography.Text>
                      <Typography.Text type="success">
                        {Math.floor(friendPaid[friend.id]).toLocaleString()} บาท
                      </Typography.Text>
                    </div>
                  )}
                </div>

                {net !== 0 && (
                  <div
                    className={`mt-3 rounded-lg px-4 py-3 text-center text-base font-semibold ${
                      net > 0
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                        : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                    }`}
                  >
                    {net > 0
                      ? `ต้องได้รับคืน ${net.toLocaleString()} บาท`
                      : `ค้างชำระ ${(-net).toLocaleString()} บาท`}
                  </div>
                )}

                {friendTransactions.length > 0 && (
                  <>
                    <Divider className="my-3" />
                    <div className="space-y-1">
                      {friendTransactions.map((t, i) => {
                        const from = data.bill.friends.find((f) => f.id === t.from)?.name
                        const to = data.bill.friends.find((f) => f.id === t.to)?.name
                        const isPayer = t.from === friend.id

                        return (
                          <div key={i} className="flex justify-between text-xs">
                            <Typography.Text type="secondary">
                              {isPayer ? (
                                <>
                                  จ่ายให้ <b>{to}</b>
                                </>
                              ) : (
                                <>
                                  ได้รับจาก <b>{from}</b>
                                </>
                              )}
                            </Typography.Text>
                            <Typography.Text type="secondary">
                              {t.amount.toLocaleString()} บาท
                            </Typography.Text>
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}
              </Card>
            )
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-2">
        <Button icon={<ArrowLeftOutlined />} size="large" onClick={() => navigate(-1)}>
          กลับ
        </Button>
        <Button type="primary" icon={<DownloadOutlined />} size="large" onClick={handleDownloadAll}>
          บันทึกเป็นรูปภาพ
        </Button>
      </div>
    </div>
  )
}

export default PageSaveBillToImage
