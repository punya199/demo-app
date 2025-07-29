import { useQuery } from '@tanstack/react-query'
import { Divider } from 'antd'
import { keyBy, round } from 'lodash'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
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

  // const friendPay = useMemo(() => {
  //   const result: Record<string, { [key: string]: number }[]> = {}

  //   data?.bill.items.forEach((item) => {
  //     const payerId = item.payerId
  //     if (payerId) {
  //       if (!result[payerId]) {
  //         result[payerId] = []
  //       }
  //       result[payerId].push({ [item.name]: item.price })
  //     }
  //   })

  //   return result
  // }, [data?.bill.items])

  return (
    <div className="mx-auto max-w-2xl bg-white p-4 text-gray-800">
      {/* Header */}
      <div className="mb-6 border-b pb-2">
        <h1 className="mb-2 flex justify-center text-xl font-bold break-words text-blue-800">
          {data?.bill.title}
        </h1>
        <div className="flex justify-center text-sm text-gray-700">
          ยอดที่จ่ายทั้งหมด:{' '}
          <span className="font-semibold text-black">
            {data?.bill.items.reduce((acc, curr) => acc + curr.price, 0).toLocaleString()} บาท
          </span>
        </div>
      </div>

      {/* Section 1: ผู้ที่จ่ายเงินล่วงหน้า */}
      <div className="mb-8">
        <h2 className="mb-3 text-lg font-bold text-green-700">รายการที่จ่ายล่วงหน้า</h2>
        {data?.bill.friends.map((friend) => {
          const paidItems = data.bill.items.filter((item) => item.payerId === friend.id)
          if (paidItems.length === 0) return null

          return (
            <div
              key={friend.id}
              className="mb-4 rounded-xl border border-green-300 bg-green-50 p-4 shadow-sm"
            >
              <div className="mb-2 font-medium text-green-900">
                {friend.name} จ่าย {paidItems.length} รายการ
              </div>
              {paidItems.map((item, idx) => (
                <div key={item.id} className="mb-2 ml-2 text-sm">
                  <div>
                    {idx + 1}. {item.name} -{' '}
                    <span className="font-medium">{item.price.toLocaleString()} บาท</span>
                  </div>
                  <div className="ml-4 text-xs text-gray-600">
                    หารกับ:{' '}
                    {(item.friendIds ?? []).map((fid) => friendHash[fid]?.name || '-').join(', ')}
                  </div>
                </div>
              ))}
            </div>
          )
        })}
      </div>

      {/* Divider - เตรียมแยกรูปในอนาคต */}
      <Divider className="my-6 border-gray-400" />

      {/* Section 2: สรุปผลแต่ละคน */}
      <div>
        <h2 className="mb-3 text-lg font-bold text-indigo-700">สรุปของแต่ละคน</h2>
        {data?.bill.friends.map((friend) => (
          <div
            key={friend.id}
            className="mb-6 rounded-xl border border-indigo-300 bg-indigo-50 p-4 shadow-sm"
          >
            <div className="mb-3 flex flex-col gap-1 text-sm">
              <div className="font-semibold text-indigo-800">{friend.name}</div>
              {friendBill[friend.id] !== 0 && (
                <div>ยอดที่ต้องชำระ: {Math.floor(friendBill[friend.id]).toLocaleString()} บาท</div>
              )}
              {friendPaid[friend.id] > 0 && (
                <div>ชำระไปแล้ว: {Math.floor(friendPaid[friend.id]).toLocaleString()} บาท</div>
              )}
              {friendPaid[friend.id] > friendBill[friend.id] && (
                <div className="text-sm font-medium text-blue-700">
                  ต้องได้รับคืน: {(friendPaid[friend.id] - friendBill[friend.id]).toLocaleString()}{' '}
                  บาท
                </div>
              )}
              {friendPaid[friend.id] < friendBill[friend.id] && (
                <div className="text-sm font-medium text-red-600">
                  ต้องชำระ: {(friendBill[friend.id] - friendPaid[friend.id]).toLocaleString()} บาท
                </div>
              )}
            </div>
            <div className="mb-2 text-sm text-gray-800">
              <b>รายการที่ร่วมจ่าย</b>
              <ul className="ml-4 list-disc">
                {data?.bill.items
                  .filter((item) => item.friendIds?.includes(friend.id))
                  .map((item) => (
                    <div className="flex items-center justify-between py-1">
                      <span>{item.name}</span>
                      <span className="text-right">
                        {Math.floor(item.price / item.friendIds!.length).toLocaleString()} บาท
                      </span>
                    </div>
                  ))}
              </ul>
            </div>

            <div className="text-sm text-gray-800">
              <b>สรุปการชำระเงิน:</b>
              {transactions
                .filter((t) => t.from === friend.id || t.to === friend.id)
                .map((t, i) => {
                  const from = data.bill.friends.find((f) => f.id === t.from)?.name
                  const to = data.bill.friends.find((f) => f.id === t.to)?.name
                  const isPayer = t.from === friend.id

                  return (
                    <div key={i} className="ml-2">
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
    </div>
  )
}

export default PageSaveBillToImage
