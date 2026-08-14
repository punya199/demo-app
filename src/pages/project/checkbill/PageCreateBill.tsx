import { useEffect } from 'react'
import { apiClient } from '../../../utils/api-client'
import { useCheckBillStore } from './check-bill-store'
import CheckBill, { SaveBody } from './CheckBill'

const PageCreateBill = () => {
  const setItems = useCheckBillStore((state) => state.setItems)
  const setFriends = useCheckBillStore((state) => state.setFriends)
  const setTitle = useCheckBillStore((state) => state.setTitle)

  useEffect(() => {
    setItems([])
    setFriends([])
    setTitle('')
  }, [setItems, setFriends, setTitle])

  const onSave = async (body: SaveBody) => {
    await apiClient.post(`/bills`, body)
  }
  return (
    <div>
      <CheckBill onSave={onSave} />
    </div>
  )
}

export default PageCreateBill
