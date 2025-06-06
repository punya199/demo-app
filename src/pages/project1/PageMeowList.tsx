import { useState } from 'react'
import MeowForm, { FormValues } from './MeowFrom'
import MeowItems from './MeowItem'

const PageListItem = () => {
  const [food, setFood] = useState<FormValues[]>([])
  const handleClick = (foods: FormValues) => {
    setFood([foods, ...food])
  }
  const handleRemove = (index: number) => {
    const updatedFood = food.filter((_, i) => i !== index)
    setFood(updatedFood)
  }
  return (
    <div>
      <MeowForm child={handleClick}></MeowForm>
      <MeowItems prices={food} onRemove={handleRemove}></MeowItems>
    </div>
  )
}

export default PageListItem
