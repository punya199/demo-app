import { chunk, shuffle } from 'lodash'
import { useCallback, useEffect, useState } from 'react'
import black_dark from '../../../assets/images/cards/back_dark.webp'
import black_light from '../../../assets/images/cards/back_light.webp'
import { cardDeck, ICardData } from '../project5/cardGame-data'

interface SpecialCardOwner {
  K: number | null
  Q: number | null
  J: number | null
}

const spiteCardNumber = 18
const Omama = () => {
  const [cardlist, setCardlist] = useState<ICardData[][]>([])
  const [currentCard, setCurrentCard] = useState<ICardData | null>(null)
  const [userNameList, setUserNameList] = useState<string[]>([])
  const [inputName, setInputName] = useState('')
  const [nameIndex, setNameIndex] = useState(0)
  const [specialCardOwner, setSpecialCardOwner] = useState<SpecialCardOwner>({
    K: null,
    Q: null,
    J: null,
  })
  const nextName = useCallback(() => {
    if (userNameList.length === 0) return
    const nextIndex = (nameIndex + 1) % userNameList.length
    setNameIndex(nextIndex)
  }, [nameIndex, userNameList.length])
  const addUserName = useCallback(
    (name: string) => {
      if (!name.trim()) return
      if (userNameList.includes(name)) return
      setUserNameList([...userNameList, name])
      setInputName('')
    },
    [userNameList]
  )
  const removeUserName = (name: string) => {
    setUserNameList((prev) => {
      const newList = prev.filter((e) => e !== name)
      if (newList.length === 0) {
        setNameIndex(0)
      } else if (nameIndex >= newList.length) {
        setNameIndex(newList.length - 1)
      }
      return newList
    })
  }
  const onRandom = useCallback(() => {
    const a = shuffle(cardDeck)
    const b = chunk(a, spiteCardNumber)
    setCardlist(b)
    setCurrentCard(null)
    setSpecialCardOwner({ K: null, Q: null, J: null })
    setNameIndex(0)
    const randomIndex = Math.floor(Math.random() * userNameList.length)
    setNameIndex(randomIndex)
  }, [userNameList.length])

  useEffect(() => {
    onRandom()
  }, [onRandom])

  const onClickCard = useCallback(
    (index: number) => {
      const subDeck = [...cardlist[index]]
      if (subDeck.length === 0) return
      const card = subDeck[0]
      const newCardList = [...cardlist]
      newCardList[index] = subDeck.slice(1)
      setCardlist(newCardList)
      setCurrentCard(card)
      nextName()
      if (card.name.startsWith('K')) {
        setSpecialCardOwner((prev) => ({ ...prev, K: nameIndex }))
      }
      if (card.name.startsWith('Q')) {
        setSpecialCardOwner((prev) => ({ ...prev, Q: nameIndex }))
      }
      if (card.name.startsWith('J')) {
        setSpecialCardOwner((prev) => ({ ...prev, J: nameIndex }))
      }
    },
    [cardlist, nameIndex, nextName]
  )
  const randomIndex = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * userNameList.length)
    setNameIndex(randomIndex)
  }, [userNameList.length])
  const classNameButton =
    'bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-xl shadow transition-all duration-200'

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4">
      {/* Input + Add Name */}
      <div className="flex flex-col items-center justify-center gap-4 md:flex-row">
        <p className="rounded-2xl bg-blue-400 px-4 py-2 text-2xl font-bold">Game Omama</p>
        <input
          type="text"
          placeholder="กรอกชื่อผู้เล่น"
          className="w-full rounded-xl border-2 px-4 py-2 text-gray-700 focus:ring-2 focus:ring-blue-400 focus:outline-none md:w-1/2"
          autoFocus
          value={inputName}
          onChange={(e) => setInputName(e.target.value)}
        />
        <button onClick={() => addUserName(inputName)} className={classNameButton}>
          เพิ่มชื่อ
        </button>
      </div>

      {/* Random Button */}
      <div className="flex items-center justify-center gap-4">
        <button onClick={onRandom} className={classNameButton}>
          สุ่มไพ่ใหม่
        </button>
        <p className="w-80 text-center text-lg font-semibold text-gray-700">
          ผู้เล่นที่ต้องจั่ว : <span className="text-blue-700">{userNameList[nameIndex]}</span>
        </p>
      </div>

      {/* Card Stack */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {cardlist.map((e, index) => (
          <div
            key={index}
            className={`flex flex-col items-center rounded-xl bg-white p-4 shadow-md transition hover:shadow-xl ${
              userNameList.length > 0 ? 'cursor-pointer hover:scale-105' : ''
            }`}
            onClick={() => {
              if (userNameList.length === 0) return
              onClickCard(index)
            }}
          >
            <img
              src={e.length === 0 ? black_light : black_dark}
              alt="back"
              className="w-28 rounded-lg object-cover drop-shadow-lg"
            />
            <p className="mt-3 text-sm text-gray-600">เหลือ {e.length} ใบ</p>
          </div>
        ))}
      </div>

      {/* Current Card + Info */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl bg-white p-6 text-center shadow">
          <p className="mb-4 text-xl font-semibold text-gray-800">ไพ่ที่ได้</p>
          <img
            src={currentCard ? currentCard.image : black_light}
            alt={currentCard?.name || 'back'}
            className="mx-auto w-40 drop-shadow-lg"
          />
          <p className="mt-4 text-sm text-gray-600">เหลือ {cardlist.flat().length} ใบ</p>
        </div>

        {/* Player Info */}
        <div className="space-y-4 rounded-xl bg-white p-6 shadow">
          <div>
            <p className="mb-2 text-lg font-semibold">คนที่ได้ไพ่พิเศษ </p>
            <ul className="list-inside list-disc space-y-1 text-gray-700">
              {Object.entries(specialCardOwner).map(([cardType, ownerIndex]) => (
                <li key={cardType}>
                  {cardType} : {userNameList[ownerIndex] || 'ยังไม่มีคนได้'}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="mb-4 flex items-center justify-between">
              <p className="mb-2 text-lg font-semibold">รายชื่อผู้เล่น </p>
              <button onClick={randomIndex} className={classNameButton}>
                สุ่มคนเริ่ม
              </button>
            </div>
            <ul className="space-y-2">
              {userNameList.map((name, index) => (
                <li key={index} className="flex items-center justify-between text-gray-700">
                  <span className={`${index === nameIndex ? 'font-bold text-amber-700' : ''}`}>
                    {index + 1} . {name}
                  </span>
                  <button
                    onClick={() => removeUserName(name)}
                    className="rounded-lg border border-red-500 px-3 text-sm text-red-500 transition duration-200 hover:bg-red-500 hover:text-white"
                  >
                    ลบ
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Omama
