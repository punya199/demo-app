import { chunk, shuffle } from 'lodash'
import { useState } from 'react'
import { cardDeck } from '../project5/cardGame-data'

interface Card {
  name: string
  image: string
}
const spiteCardNumber = 18
const Omama = () => {
  const [cardlist, setCardlist] = useState<Card[][]>([])
  const [currentCard, setCurrentCard] = useState<Card | null>(null)
  const onRandom = () => {
    const a = shuffle(cardDeck)
    const b = chunk(a, spiteCardNumber)
    setCardlist(b)
    setCurrentCard(null)
  }
  const onClickCard = (index: number) => {
    const subDeck = [...cardlist[index]]
    if (subDeck.length === 0) return
    const card = subDeck[0]
    const newCardList = [...cardlist]
    newCardList[index] = subDeck.slice(1)
    setCardlist(newCardList)
    setCurrentCard(card)
  }

  return (
    <div>
      <button
        onClick={onRandom}
        className="bg-blue-500 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow disabled:opacity-50 transition-all duration-200"
      >
        random
      </button>
      <div className="grid grid-cols-3 gap-4 mt-4">
        {cardlist.map((e, index) => {
          return (
            <div
              key={index}
              className="bg-white rounded-lg shadow-lg p-4 cursor-pointer hover:shadow-xl transition-shadow duration-200"
              onClick={() => onClickCard(index)}
            >
              <img
                src={`/images/cards/${e?.[0]?.image || 'back_light.png'}`}
                alt={e?.[0]?.name}
                className="w-32  object-cover rounded-lg"
              />
              <p className="mt-4 text-sm text-gray-600">เหลือ {e.length} ใบ</p>
            </div>
          )
        })}
      </div>
      {currentCard && (
        <div className="mt-6 text-center">
          <p className="text-xl font-semibold text-gray-800 mb-4">ไพ่ที่ได้</p>
          <img
            src={`/images/cards/${currentCard.image}`}
            alt={currentCard.name}
            className="w-56 mx-auto drop-shadow-lg"
          />
          <p className="mt-4 text-sm text-gray-600">เหลือ {cardlist.flat().length} ใบ</p>
        </div>
      )}
    </div>
  )
}

export default Omama
