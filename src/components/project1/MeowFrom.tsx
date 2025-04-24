import { useState } from 'react'

type Props = {
  onAddMeow: (text: string) => void
}

const MeowForm = ({ onAddMeow }: Props) => {
  const [text, setText] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (text.trim() === '') return

    onAddMeow(text.trim()) // ส่งข้อความไปยัง MeowList
    setText('') // ล้างช่อง input
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
      <input
        type="text"
        className="flex-1 px-4 py-2 border rounded-xl"
        placeholder="พิมพ์สิ่งที่แมวต้องทำ..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button type="submit" className="bg-orange-400 text-white px-4 py-2 rounded-xl">
        Add Meow
      </button>
    </form>
  )
}

export default MeowForm
