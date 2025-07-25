import { useQuery } from '@tanstack/react-query'
import { keyBy } from 'lodash'
import { useParams } from 'react-router-dom'
import { apiClient } from '../../../utils/api-client'
import { Bill } from './PageAllBill'

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

  return (
    <div>
      {data?.bill.items.map((item) => (
        <div>
          <div className="flex items-center justify-between gap-1">
            รายการ
            {item.name}
            <div>คนที่จ่ายเงินก่อน{friendHash[item.payerId || '']?.name}</div>
            <div>{item.price} บาท</div>
          </div>

          <div className="flex gap-2">
            <div>รายชื่อคนหารคือ</div>
            {item.friendIds?.map((friendId) => (
              <div>{friendHash[friendId].name}</div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default PageSaveBillToImage
