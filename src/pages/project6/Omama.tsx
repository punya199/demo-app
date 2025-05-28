import { chunk, shuffle } from 'lodash'
import { useEffect, useState } from 'react'
import { cardDeck } from '../project5/cardGame-data'

interface Card {
  name: string
  image: string
}
interface SpecialCardOwner {
  K: number | null
  Q: number | null
  J: number | null
}

const spiteCardNumber = 18
const Omama = () => {
  const [cardlist, setCardlist] = useState<Card[][]>([])
  const [currentCard, setCurrentCard] = useState<Card | null>(null)
  const [userNameList, setUserNameList] = useState<string[]>([])
  const [inputName, setInputName] = useState('')
  const [nameIndex, setNameIndex] = useState(0)
  const [specialCardOwner, setSpecialCardOwner] = useState<SpecialCardOwner>({
    K: null,
    Q: null,
    J: null,
  })
  const nextName = () => {
    if (userNameList.length === 0) return
    const nextIndex = (nameIndex + 1) % userNameList.length
    setNameIndex(nextIndex)
  }
  const addUserName = (name: string) => {
    if (!name.trim()) return
    if (userNameList.includes(name)) return
    setUserNameList([...userNameList, name])
    setInputName('')
  }
  const removeUserName = (name: string) => {
    setUserNameList(userNameList.filter((e) => e !== name))
  }
  const onRandom = () => {
    const a = shuffle(cardDeck)
    const b = chunk(a, spiteCardNumber)
    setCardlist(b)
    setCurrentCard(null)
    setSpecialCardOwner({ K: null, Q: null, J: null })
  }
  useEffect(() => {
    onRandom()
  }, [])
  const onClickCard = (index: number) => {
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
  }
  console.log(specialCardOwner)

  return (
    <div>
      <div>
        <input
          type="text"
          placeholder="กรอกชื่อ"
          className="border-2"
          value={inputName}
          onChange={(e) => {
            setInputName(e.target.value)
          }}
        />
        <button
          onClick={() => addUserName(inputName)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow disabled:opacity-50 transition-all duration-200"
        >
          เพิ่มชื่อ
        </button>
      </div>

      <button
        onClick={onRandom}
        disabled={userNameList.length === 0}
        className="bg-blue-500 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow disabled:opacity-50 transition-all duration-200"
      >
        {userNameList.length > 0 ? 'สุ่มไพ่' : 'กรุณาเพิ่มชื่อก่อน'}
      </button>
      <div className="grid grid-cols-3 gap-2  mt-4">
        {cardlist.map((e, index) => {
          return (
            <div
              key={index}
              className={`bg-white rounded-lg shadow-lg p-4 ${userNameList.length === 0 ? '' : 'cursor-pointer'} hover:shadow-xl transition-shadow duration-200 flex flex-col items-center justify-center`}
              onClick={() => {
                if (userNameList.length === 0) return
                onClickCard(index)
              }}
            >
              <img
                src={`${e.length === 0 ? '/images/cards/back_light.png' : `/images/cards/back_dark.png`}`}
                alt="back"
                className="w-32  object-cover rounded-lg"
              />
              <p className="mt-4 text-sm text-gray-600">เหลือ {e.length} ใบ</p>
            </div>
          )
        })}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {/* {currentCard && (
          <div className="mt-6 text-center">
            <p className="text-xl font-semibold text-gray-800 mb-4">ไพ่ที่ได้</p>
            <img
              src={`/images/cards/${currentCard.image}`}
              alt={currentCard.name}
              className="w-40 mx-auto drop-shadow-lg"
            />
            <p className="mt-4 text-sm text-gray-600">เหลือ {cardlist.flat().length} ใบ</p>
          </div>
        )} */}
        {currentCard ? (
          <div className="mt-6 text-center">
            <p className="text-xl font-semibold text-gray-800 mb-4">ไพ่ที่ได้</p>
            <img
              src={`/images/cards/${currentCard.image}`}
              alt={currentCard.name}
              className="w-40 mx-auto drop-shadow-lg"
            />
            <p className="mt-4 text-sm text-gray-600">เหลือ {cardlist.flat().length} ใบ</p>
          </div>
        ) : (
          <div className="mt-6 text-center">
            <p className="text-xl font-semibold text-gray-800 mb-4">ไพ่ที่ได้</p>
            <img
              src={`/images/cards/back_dark.png`}
              alt={'dark'}
              className="w-40 mx-auto drop-shadow-lg"
            />
            <p className="mt-4 text-sm text-gray-600">เหลือ 52 ใบ</p>
          </div>
        )}
        <div>
          <p className="text-lg font-semibold mt-6">เจ้าของไพ่พิเศษ:</p>
          <ul className="pl-5">
            {Object.entries(specialCardOwner).map(([cardType, ownerIndex]) => (
              <li key={cardType} className="text-gray-700">
                {cardType} : {userNameList[ownerIndex] || 'ยังไม่มีคนได้'}
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <p className="text-lg font-semibold">รายชื่อผู้เล่น:</p>
            <ul className="pl-5">
              {userNameList.map((name, index) => (
                <li key={index} className="text-gray-700 flex items-center justify-between">
                  <div
                    className={`inline-block ${index === nameIndex ? 'font-bold text-amber-800' : ''}`}
                  >
                    {name}
                  </div>
                  <button onClick={() => removeUserName(name)}>remove</button>
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
