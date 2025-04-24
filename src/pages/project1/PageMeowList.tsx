import { useCallback, useState } from 'react'
import MeowForm from './MeowFrom'
import MeowItems from './MeowItem'

type Meow = {
  id: number
  text: string
  done: boolean
}

const PageMeowList = () => {
  const [meows, setMeows] = useState<Meow[]>([])
  const addmeow = (text: string) => {
    const newMeow: Meow = {
      id: Date.now(),
      text,
      done: false,
    }
    setMeows([newMeow, ...meows])
  }

  const deletMeow = useCallback(
    (id: number) => {
      setMeows(meows.filter((meow) => meow.id !== id))
    },
    [meows],
  )
  const toggleMeow = useCallback(
    (id: number) => {
      setMeows(meows.map((meow) => (meow.id === id ? { ...meow, done: !meow.done } : meow)))
    },
    [meows],
  )
  return (
    <div className="min-h-screen bg-orange-50 p-6">
      <h1 className="text-2xl font-bold text-center text-orange-700 mb-6">🐱 MeowList</h1>
      <div className="max-w-xl mx-auto">
        <MeowForm onAddMeow={addmeow} />
        <MeowItems meows={meows} onDelete={deletMeow} onToggle={toggleMeow} />
      </div>
    </div>
  )
}

export default PageMeowList
