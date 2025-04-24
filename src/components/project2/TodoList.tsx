import { useState } from 'react'
import { MdDelete } from 'react-icons/md'

type SavedText = {
  text: string
  timestamp: string
  done: boolean
}
const TodoList = () => {
  const [text, setText] = useState('')
  const [savedTexts, setSavedTexts] = useState<SavedText[]>([])

  const handleSave = () => {
    if (text.trim() !== '') {
      const newItem: SavedText = {
        text,
        timestamp: new Date().toLocaleString('th-TH', {
          dateStyle: 'short',
          timeStyle: 'short',
        }),
        done: false,
      }
      setSavedTexts([newItem, ...savedTexts])
      setText('')
    }
  }
  const handleDelete = (toDelete: number) => {
    setSavedTexts(savedTexts.filter((_, index) => index !== toDelete))
  }
  const MAX_LENGTH = 50
  const toggleDone = (index: number) => {
    const updated = [...savedTexts]
    updated[index].done = !updated[index].done
    setSavedTexts(updated)
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-4 text-center bg-amber-300 shadow rounded-xl">
      <h1 className="mb-4 text-2xl font-bold">Text area</h1>
      <input
        className="border px-4 py-2 rounded w-full mb-2 truncate"
        type="text"
        placeholder="พิมข้อความตรงนี้"
        value={text}
        onChange={(e) => {
          if (e.target.value.length <= MAX_LENGTH) {
            setText(e.target.value)
          }
        }}
      />
      <p className="text-lg px-4 py-2 rounded w-full mb-4 bg-blue-50  font-semibold text-blue-500">
        {text || 'ข้อความแสดงเพิ่มเฉยๆ'}{' '}
      </p>
      <div className="my-4">
        <button
          className="rounded border p-2 shadow-xl hover:bg-amber-200 mx-2"
          onClick={handleSave}
        >
          บันทึกข้อมูล
        </button>
        <button
          className="rounded border p-2 shadow-xl hover:bg-amber-200"
          onClick={() => setText('')}
        >
          ล้างข้อความ
        </button>
      </div>
      <ul className="text-xl rounded w-full mb-4 bg-blue-50  font-semibold text-blue-500 ">
        {savedTexts.length === 0 ? (
          <li className="italic text-gray-600">ไม่มีข้อความที่บันทึก</li>
        ) : (
          savedTexts.map((item, index) => (
            <li key={index} className="bg-amber-100 px-4 py-2 my-1rounded shadow ">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() => toggleDone(index)}
                    className="mr-2 w-5 h-5"
                  />
                  <div className="text-left w-full ">
                    <p className={`truncate ${item.done ? 'line-through text-gray-500' : ''}`}>
                      {item.text}
                    </p>
                    <p className="text-sm text-gray-600">{item.timestamp}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(index)}
                  className="text-red-500 hover:text-red-700 text-2xl"
                >
                  <MdDelete />
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
      <button
        className="rounded border p-2 shadow-xl hover:bg-amber-200"
        onClick={() => setSavedTexts([])}
      >
        ล้างข้อมูล
      </button>
    </div>
  )
}

export default TodoList
