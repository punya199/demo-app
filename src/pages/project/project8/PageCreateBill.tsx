import { apiClient } from '../../../utils/api-client'
import CheckBill, { SaveBody } from './CheckBill'

const PageCreateBill = () => {
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
