import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { appPath } from '../../../config/app-paths'
import { useGetMe } from '../../../service'
import { apiClient } from '../../../utils/api-client'
import CheckBill, { SaveBody } from './CheckBill'
import { Bill } from './PageAllBill'

type GetBillResponse = {
  bill: Bill
}

const PageEditBill = () => {
  const { data: user } = useGetMe()
  const isLoggedIn = useMemo(() => {
    return !!user?.user?.id
  }, [user?.user?.id])
  const navigate = useNavigate()
  useEffect(() => {
    if (!isLoggedIn) {
      navigate(appPath.checkBillPage(), { replace: true })
    }
  }, [isLoggedIn, navigate])
  const params = useParams()
  const billId = params.billId

  const { data } = useQuery({
    queryKey: ['BillList', billId],
    queryFn: async () => {
      const { data } = await apiClient.get<GetBillResponse>(`/bills/${billId}`)
      return data
    },
  })
  const onSave = async (body: SaveBody) => {
    await apiClient.put(`/bills/${billId}`, body)
  }
  return <div>{isLoggedIn && <CheckBill bill={data?.bill} onSave={onSave}></CheckBill>}</div>
}

export default PageEditBill
