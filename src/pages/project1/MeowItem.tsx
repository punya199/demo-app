type Meow = {
  id: number
  text: string
  done: boolean
}

type Props = {
  meows: Meow[]
  onDelete: (id: number) => void
  onToggle: (id: number) => void
}

const MeowItems = ({ meows, onDelete, onToggle }: Props) => {
  if (meows.length === 0) return <p className="text-center text-gray-400">ยังไม่มีเลยเมี๊ยว</p>

  return (
    <ul className="space-y-2">
      {meows.map((meow) => (
        <li
          key={meow.id}
          className="flex justify-between items-center bg-white p-3 rounded-xl shadow"
        >
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={meow.done} onChange={() => onToggle(meow.id)} />
            <span className={meow.done ? 'line-through text-gray-400' : ''}>{meow.text}</span>
          </div>
          <button
            onClick={() => onDelete(meow.id)}
            className="text-red-500 hover:text-red-700 text-sm"
          >
            ลบ
          </button>
        </li>
      ))}
    </ul>
  )
}

export default MeowItems
