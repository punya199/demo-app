import { useCallback, useState } from 'react'
import FriendCard from './FriendCard'

export interface SavedFriend {
  name: string
  age: number
  isOnline: boolean
}
const defaultData: SavedFriend[] = [
  {
    name: 'มุก',
    age: 22,
    isOnline: false,
  },
  {
    name: 'แพร',
    age: 25,
    isOnline: true,
  },
  {
    name: 'แบง',
    age: 30,
    isOnline: true,
  },
]
const PageMyFriends = () => {
  const [savedFriend, setSavedFriend] = useState<SavedFriend[]>(defaultData)
  const [formName, setFormName] = useState('')
  const [formAge, setFormAge] = useState('')
  const [formOnline, setFormOnline] = useState(false)
  const handleAddFriend = useCallback(() => {
    if (!formName.trim()) return
    if (!formAge.trim() || Number(formAge) <= 0) {
      return
    }
    setSavedFriend([{ name: formName, age: Number(formAge), isOnline: formOnline }, ...savedFriend])
    setFormName('')
    setFormAge('')
    setFormOnline(false)
  }, [formAge, formName, formOnline, savedFriend])
  const handleEditFriend = useCallback(
    (index: number, newdata: SavedFriend) => {
      const editFriend = savedFriend.map((friend, i) => {
        if (i === index) {
          return newdata
        }
        return friend
      })
      setSavedFriend(editFriend)
    },
    [savedFriend],
  )

  return (
    <div className="p-2 flex flex-col gap-2">
      <div className="items-center text-center my-2">
        <p className="text-4xl">MYFRIEND</p>
      </div>
      <div className="bg-gray-300 flex items-center justify-between gap-2 p-4 rounded-xl flex-wrap">
        <input
          value={formName}
          placeholder="กรอกชื่อ"
          type="text"
          className="border px-3 py-2 rounded flex-1/3 truncate"
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
          className="border px-3 py-2 rounded w-40"
          onChange={(e) => {
            let value = Number(e.target.value)
            if (value > 100) value = 100
            setFormAge(value.toString())
          }}
        />
        <div className="flex items-center gap-x-3">
          <p className=" text-lg font-medium">สถานะออนไลน์</p>
          <input
            type="checkbox"
            checked={formOnline}
            onChange={(e) => {
              setFormOnline(e.target.checked)
            }}
            className="w-4 h-4 accent-green-300 hover:scale-110 transition-all"
          />
        </div>
        <button
          onClick={handleAddFriend}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-full shadow-lg  transition-all hover:scale-105 "
        >
          เพิ่มเพื่อน
        </button>
      </div>
      <ul className="flex flex-col gap-2">
        {savedFriend.map((dataFriend, index) => (
          <FriendCard
            key={index}
            name={dataFriend.name}
            age={dataFriend.age}
            isOnline={dataFriend.isOnline}
            onEditToSave={(d) => {
              handleEditFriend(index, d)
            }}
            // onEditClick={handleEditFriend.bind(null, index)}
          />
        ))}
      </ul>
    </div>
  )
}

export default PageMyFriends
