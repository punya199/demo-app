import { useState } from 'react'
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
  const onEditClick = () => {
    setEditMode(true)
  }
  const onCancal = () => {
    setEditMode(false)
  }
  const onSave = () => {
    if (!formName.trim()) return
    if (!formAge || Number(formAge) <= 0) {
      return
    }
    props.onEditToSave({ name: formName, age: Number(formAge), isOnline: formOnline })
    setEditMode(false)
  }

  return (
    <div>
      <div className="p-4 border rounded shadow m-4 flex items-center justify-between">
        <>
          {editMode ? (
            <>
              <input
                value={formName}
                placeholder="กรอกชื่อ"
                type="text"
                className="border px-3 py-2 rounded w-40 truncate"
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
                className="border px-3 py-2 rounded w-28"
                onChange={(e) => {
                  let value = Number(e.target.value)
                  if (value > 100) value = 100
                  setFormAge(value)
                }}
              />
              <div className="flex items-center gap-x-3">
                <p className="text-black text-lg font-medium">สถานะออนไลน์</p>
                <input
                  type="checkbox"
                  checked={formOnline}
                  onChange={(e) => {
                    setFormOnline(e.target.checked)
                  }}
                  className="w-4 h-4 accent-green-300 hover:scale-110 transition-all"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <p>👤 ชื่อ: {props.name}</p>
                <p>🎂 อายุ: {props.age}</p>
              </div>
              <div>
                {props.isOnline ? (
                  <p className="text-green-600 flex items-center gap-1">
                    <FaCircle /> ออนไลน์
                  </p>
                ) : (
                  <p className="text-red-500 flex items-center gap-1">
                    <FaCircle /> ออฟไลน์
                  </p>
                )}
              </div>
            </>
          )}
        </>

        <div>
          {editMode ? (
            <div className="flex gap-2">
              <button
                className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-full shadow-lg transform transition-all hover:scale-105"
                onClick={onSave}
              >
                Save
              </button>
              <button
                className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-full shadow-lg transform transition-all hover:scale-105"
                onClick={onCancal}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-full shadow-lg transform transition-all hover:scale-105"
              onClick={onEditClick}
            >
              edit
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default FriendCard
