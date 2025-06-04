import { chunk, shuffle } from 'lodash'
import { useCallback, useEffect, useState } from 'react'
import black_dark from '../../assets/images/cards/back_dark.webp'
import black_light from '../../assets/images/cards/back_light.webp'
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
    setUserNameList(prev => {
      const newList = prev.filter(e => e !== name)
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
        setSpecialCardOwner(prev => ({ ...prev, K: nameIndex }))
      }
      if (card.name.startsWith('Q')) {
        setSpecialCardOwner(prev => ({ ...prev, Q: nameIndex }))
      }
      if (card.name.startsWith('J')) {
        setSpecialCardOwner(prev => ({ ...prev, J: nameIndex }))
      }
    },
    [cardlist, nameIndex, nextName]
  )
  const randomIndex = () => {
    const randomIndex = Math.floor(Math.random() * userNameList.length)
    setNameIndex(randomIndex)
  }
  const classNameButton =
    'bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-xl shadow transition-all duration-200'

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      {/* Input + Add Name */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
        <p className=" rounded-2xl py-2 px-4 bg-blue-400 font-bold text-2xl">Game Omama</p>
        <input
          type="text"
          placeholder="กรอกชื่อผู้เล่น"
          className="border-2 rounded-xl px-4 py-2 w-full md:w-1/2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          autoFocus
          value={inputName}
          onChange={e => setInputName(e.target.value)}
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
        <p className="text-lg font-semibold text-gray-700 w-80 text-center">
          ผู้เล่นที่ต้องจั่ว : <span className="text-blue-700">{userNameList[nameIndex]}</span>
        </p>
      </div>

      {/* Card Stack */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {cardlist.map((e, index) => (
          <div
            key={index}
            className={`bg-white rounded-xl shadow-md p-4 transition hover:shadow-xl flex flex-col items-center ${
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
              className="w-28 object-cover rounded-lg drop-shadow-lg"
            />
            <p className="mt-3 text-sm text-gray-600">เหลือ {e.length} ใบ</p>
          </div>
        ))}
      </div>

      {/* Current Card + Info */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <p className="text-xl font-semibold text-gray-800 mb-4">ไพ่ที่ได้</p>
          <img
            src={currentCard ? currentCard.image : black_light}
            alt={currentCard?.name || 'back'}
            className="w-40 mx-auto drop-shadow-lg"
          />
          <p className="mt-4 text-sm text-gray-600">เหลือ {cardlist.flat().length} ใบ</p>
        </div>

        {/* Player Info */}
        <div className="bg-white rounded-xl shadow p-6 space-y-4">
          <div>
            <p className="text-lg font-semibold mb-2">คนที่ได้ไพ่พิเศษ </p>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              {Object.entries(specialCardOwner).map(([cardType, ownerIndex]) => (
                <li key={cardType}>
                  {cardType} : {userNameList[ownerIndex] || 'ยังไม่มีคนได้'}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-lg font-semibold mb-2">รายชื่อผู้เล่น </p>
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
                    className="border border-red-500 text-red-500 px-3  rounded-lg hover:bg-red-500 hover:text-white transition duration-200 text-sm"
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
