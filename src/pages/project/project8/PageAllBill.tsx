import { useQuery } from '@tanstack/react-query'
import { Button } from 'antd'
import { Link } from 'react-router-dom'
import { appPath } from '../../../config/app-paths'
import { apiClient } from '../../../utils/api-client'
import { Friend } from './AddFriends'
import { Item } from './AddItem'

export type Bill = {
  id: number
  title: string
  items: Item[]
  friends: Friend[]
  createdAt: Date
  updatedAt: Date
  deletedAt: Date
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

  return (
    <div className="">
      <div>
        <Link to={appPath.checkBillPageCreate()}>
          <Button>สร้างบิล</Button>
        </Link>
      </div>
      {data?.bills.map((bill) => (
        <div>
          <div>
            {bill.title}
            <Link to={appPath.checkBillPageEdit({ param: { billId: bill.id } })}>
              <Button>ดูรายการ</Button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}

export default PageAllBill
