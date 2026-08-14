import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { appPath } from '../../../config/app-paths'
import { useGetMe, UserRole } from '../../../service'
import { apiClient } from '../../../utils/api-client'
import { checkRole } from '../../../utils/helper'
import CheckBill, { SaveBody } from './CheckBill'
import { mockBill } from './mock-bill-data'
import { Bill } from './PageAllBill'

type GetBillResponse = {
  bill: Bill
}

const PageEditBill = () => {
  const { data: user, isPending: isUserPending } = useGetMe()
  const navigate = useNavigate()
  const params = useParams()
  const billId = params.billId
  // ให้แก้ไขข้อมูลตัวอย่างได้โดยไม่ต้อง login - บิลอื่นยังต้องเช็คสิทธิ์ ADMIN เหมือนปุ่ม Edit ที่หน้ารายการ
  const isMockBill = billId === String(mockBill.id)
  const canEdit = useMemo(
    () => isMockBill || checkRole(UserRole.ADMIN, user?.user?.role),
    [isMockBill, user?.user?.role]
  )

  useEffect(() => {
    if (isUserPending) return // รอโหลดสิทธิ์ผู้ใช้ก่อน ยังไม่ต้องเด้งออก
    if (!canEdit) {
      navigate(appPath.checkBillPage(), { replace: true })
    }
  }, [isUserPending, canEdit, navigate])

  const { data } = useQuery({
    queryKey: ['BillList', billId],
    queryFn: async () => {
      const { data } = await apiClient.get<GetBillResponse>(`/bills/${billId}`)
      return data
    },
    initialData: isMockBill ? { bill: mockBill } : undefined,
  })

  const onSave = async (body: SaveBody) => {
    if (isMockBill) {
      // ข้อมูลตัวอย่างเท่านั้น ไม่ต้องยิง API จริง
      return
    }
    await apiClient.put(`/bills/${billId}`, body)
  }
  return <div>{canEdit && <CheckBill bill={data?.bill} onSave={onSave}></CheckBill>}</div>
}

export default PageEditBill
