import { useQuery } from '@tanstack/react-query'
import { Button } from 'antd'
import { toPng } from 'html-to-image'
import { keyBy, round } from 'lodash'
import { useMemo, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { apiClient } from '../../../utils/api-client'
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
  const { data } = useQuery({
    queryKey: ['BillList', billId],
    queryFn: async () => {
      const { data } = await apiClient.get<GetBillResponse>(`/bills/${billId}`)
      return data
    },
  })
  const friendHash = keyBy(data?.bill.friends || [], (e) => e.id)
  const friendBill = useMemo(() => {
    const newFriendBill: Record<string, number> = {}
    data?.bill.friends.forEach((f) => (newFriendBill[f.id] = 0))

    data?.bill.items.forEach((item) => {
      const split = item.friendIds
      if (!split || split.length === 0) return

      const pricePerPerson = round(item.price / split.length)
      split.forEach((fid) => {
        newFriendBill[fid] += pricePerPerson
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
    <div className="mx-auto max-w-2xl rounded-xl bg-white p-4 text-gray-800 shadow-md">
      {/* Header */}
      <div ref={(el) => (containerRefs.current['billList'] = el)} className="mb-6 bg-white">
        <div className="mb-1 border-b pb-3 text-center">
          <h1 className="text-2xl !font-extrabold break-words text-blue-700">{data?.bill.title}</h1>
          <div className="mt-1 text-sm text-gray-600">
            ยอดที่จ่ายทั้งหมด{' '}
            <span className="font-bold text-black">
              {data?.bill.items.reduce((acc, curr) => acc + curr.price, 0).toLocaleString()} บาท
            </span>
          </div>
        </div>
        {/* Section: ผู้จ่ายเงินล่วงหน้า */}
        <div className="mb-8 space-y-4">
          {data?.bill.friends.map((friend) => {
            const paidItems = data.bill.items.filter((item) => item.payerId === friend.id)
            if (paidItems.length === 0) return null

            return (
              <div
                key={friend.id}
                className="bg-green-30 rounded-xl border border-green-300 p-4 shadow-sm"
              >
                <div className="mb-2 font-semibold text-green-800">
                  {friend.name} จ่าย {paidItems.length} รายการ
                </div>
                <ul className="space-y-1 text-sm text-gray-700">
                  {paidItems.map((item, idx) => (
                    <li key={item.id} className="border-b pb-1">
                      <div className="flex justify-between">
                        <span>
                          {idx + 1}. {item.name}
                        </span>
                        <span className="font-medium">{item.price.toLocaleString()} บาท</span>
                      </div>
                      <div className="ml-4 text-xs text-gray-500">
                        คนที่หารด้วย:{' '}
                        {(item.friendIds ?? [])
                          .map((fid) => friendHash[fid]?.name || '-')
                          .join(' | ')}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>

      {/* Summary per person */}
      <div className="mb-6">
        <h2 className="mb-3 text-center text-xl font-bold text-indigo-800">สรุปของแต่ละคน</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {data?.bill.friends.map((friend) => (
            <div
              ref={(el) => (containerRefs.current[friend.id] = el)}
              key={friend.id}
              className="rounded-xl bg-gradient-to-br from-white via-indigo-50 to-indigo-100 p-4 shadow-sm"
            >
              <div className="mb-2 text-center text-lg font-bold text-indigo-700">
                {friend.name}
              </div>
              <div className="space-y-2 text-sm">
                <b className="text-gray-800">รายการ</b>
                <ul className="list-disc pl-5">
                  {data?.bill.items
                    .filter((item) => item.friendIds?.includes(friend.id))
                    .map((item) => (
                      <li key={item.id} className="flex justify-between text-gray-700">
                        <span>{item.name}</span>
                        <span className="text-right">
                          {Math.floor(item.price / item.friendIds!.length).toLocaleString()} บาท
                        </span>
                      </li>
                    ))}
                </ul>
                {friendBill[friend.id] !== 0 && (
                  <div className="flex justify-between font-semibold text-gray-800">
                    <span>ยอดรวม</span>
                    <span>{Math.floor(friendBill[friend.id]).toLocaleString()} บาท</span>
                  </div>
                )}
                {friendPaid[friend.id] > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>ชำระแล้ว</span>
                    <span>{Math.floor(friendPaid[friend.id]).toLocaleString()} บาท</span>
                  </div>
                )}
                {/* ผลต่าง */}
                {friendPaid[friend.id] > friendBill[friend.id] && (
                  <div className="flex justify-between font-semibold text-blue-700">
                    <span>ต้องได้รับคืน</span>
                    <span>
                      {(friendPaid[friend.id] - friendBill[friend.id]).toLocaleString()} บาท
                    </span>
                  </div>
                )}
                {friendPaid[friend.id] < friendBill[friend.id] && (
                  <div className="flex justify-between font-semibold text-red-600">
                    <span>ค้างชำระ</span>
                    <span>
                      {(friendBill[friend.id] - friendPaid[friend.id]).toLocaleString()} บาท
                    </span>
                  </div>
                )}

                {/* Transactions */}
                {transactions
                  .filter((t) => t.from === friend.id || t.to === friend.id)
                  .map((t, i) => {
                    const from = data.bill.friends.find((f) => f.id === t.from)?.name
                    const to = data.bill.friends.find((f) => f.id === t.to)?.name
                    const isPayer = t.from === friend.id

                    return (
                      <div key={i} className="ml-1 text-xs text-gray-600">
                        {isPayer ? (
                          <span className="flex justify-between">
                            <span>
                              จ่ายให้ <b>{to}</b>
                            </span>
                            <span>{t.amount.toLocaleString()} บาท</span>
                          </span>
                        ) : (
                          <span className="flex justify-between">
                            <span>
                              ได้รับจาก <b>{from}</b>
                            </span>
                            <span>{t.amount.toLocaleString()} บาท</span>
                          </span>
                        )}
                      </div>
                    )
                  })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-5 flex justify-center gap-2 text-center">
        <Button
          type="primary"
          size="large"
          onClick={() => {
            navigate(-1)
          }}
        >
          กลับ
        </Button>
        <Button type="primary" size="large" onClick={handleDownloadAll}>
          💾 บันทึกเป็นรูปภาพ
        </Button>
      </div>
    </div>
  )
}

export default PageSaveBillToImage
