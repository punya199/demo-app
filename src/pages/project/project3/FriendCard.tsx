import { useCallback, useState } from 'react'
import { FaCircle } from 'react-icons/fa'
import { SavedFriend } from './PageMyFriends'

interface FriendCardProps {
  name: string
  age: number
  isOnline: boolean
  onEditToSave: (d: SavedFriend) => void
}
const FriendCard = (props: FriendCardProps) => {
  const [editMode, setEditMode] = useState(false)
  const [formName, setFormName] = useState(props.name)
  const [formAge, setFormAge] = useState(props.age)
  const [formOnline, setFormOnline] = useState(props.isOnline)
  const onEditClick = useCallback(() => {
    setEditMode(true)
  }, [])
  const onCancal = useCallback(() => {
    setEditMode(false)
  }, [])
  const onSave = useCallback(() => {
    if (!formName.trim()) return
    if (!formAge || Number(formAge) <= 0) {
      return
    }
    props.onEditToSave({ name: formName, age: Number(formAge), isOnline: formOnline })
    setEditMode(false)
  }, [formAge, formName, formOnline, props])

  return (
    <div>
      <div className="bg-white p-6 rounded-2xl shadow-lg flex items-center justify-between hover:shadow-2xl transition-all">
        <>
          {editMode ? (
            <div className="flex flex-col gap-3 flex-1">
              <input
                value={formName}
                placeholder="กรอกชื่อ"
                type="text"
                className="border px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-300"
                onChange={(e) => {
                  setFormName(e.target.value)
                }}
              />
              <input
                type="number"
                value={formAge}
                placeholder="กรอกอายุ"
                max={100}
                min={1}
                className="border px-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-300"
                onChange={(e) => {
                  let value = Number(e.target.value)
                  if (value > 100) value = 100
                  setFormAge(value)
                }}
              />
              <div className="flex items-center gap-3">
                <p className="text-gray-700 font-medium">สถานะออนไลน์</p>
                <input
                  type="checkbox"
                  checked={formOnline}
                  onChange={(e) => {
                    setFormOnline(e.target.checked)
                  }}
                  className="w-4 h-4 accent-green-300 hover:scale-110 transition-transform"
                />
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-2 flex-1">
                <p className="text-lg font-bold text-gray-800">👤 ชื่อ: {props.name}</p>
                <p className="text-md text-gray-600">🎂 อายุ: {props.age}</p>
                <div className="flex items-center ">
                  {props.isOnline ? (
                    <p className="text-green-600 flex items-baseline gap-1">
                      <FaCircle size={10} /> ออนไลน์
                    </p>
                  ) : (
                    <p className="text-red-500 flex items-baseline gap-1">
                      <FaCircle size={10} /> ออฟไลน์
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </>

        <div className="flex flex-col items-center gap-2 ml-6">
          {editMode ? (
            <div className="flex gap-2">
              <button
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all"
                onClick={onSave}
              >
                Save
              </button>
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-full text-sm font-semibold transition-all"
                onClick={onCancal}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all"
              onClick={onEditClick}
            >
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default FriendCard
