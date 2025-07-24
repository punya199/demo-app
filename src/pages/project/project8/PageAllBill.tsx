import { useQuery } from '@tanstack/react-query'
import { Button, Divider, Typography } from 'antd'
import dayjs from 'dayjs'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { appPath } from '../../../config/app-paths'
import { useGetMe } from '../../../service'
import { apiClient } from '../../../utils/api-client'
import { Friend } from './AddFriends'
import { Item } from './AddItem'

export type Bill = {
  id: number
  title: string
  items: Item[]
  friends: Friend[]
  createdAt: string
  updatedAt: string
  deletedAt: string
}

type GetBillsResponse = {
  bills: Bill[]
}

const PageAllBill = () => {
  const { data } = useQuery({
    queryKey: ['BillList'],
    queryFn: async () => {
      const { data } = await apiClient.get<GetBillsResponse>(`/bills`)
      return data
    },
  })

  const { data: user } = useGetMe()
  const isLoggedIn = useMemo(() => {
    return !!user?.user.id
  }, [user?.user.id])

  return (
    <div className="mx-1 mt-4 flex flex-col gap-2">
      <Typography.Title level={3} className="!text-center text-blue-700 drop-shadow-md">
        แบ่งบิลเพื่อนแบบกำหนดเอง
      </Typography.Title>
      <div className="mb-4">
        <Link to={appPath.checkBillPageCreate()} className="flex-1">
          <Button
            type="primary"
            className="w-full rounded-lg bg-blue-300 !py-5 text-white hover:bg-blue-400"
          >
            สร้างบิลใหม่
          </Button>
        </Link>
      </div>
      <Divider className="text-center text-lg font-semibold">รายการที่เคยสร้าง</Divider>
      {data?.bills.map((bill) => (
        <div className="flex items-center gap-1 rounded-lg bg-gray-50 px-3 py-2 shadow-sm md:px-8 md:py-4">
          <div>{dayjs(bill.createdAt).format('DD/MM/YYYY')}</div>
          <div className="flex-1">{bill.title}</div>
          {isLoggedIn && (
            <Link className="" to={appPath.checkBillPageEdit({ param: { billId: bill.id } })}>
              <Button>แก้ไข</Button>
            </Link>
          )}
        </div>
      ))}
    </div>
  )
}

export default PageAllBill
