import { useState } from 'react'
import { cardDeck } from './cardGame-data'
type Card = {
  name: string
  image: string
}

const CardGame = () => {
  const [deck, setDeck] = useState<Card[]>(cardDeck)
  const [currentCard, setCurrentCard] = useState<Card | null>(null)

  const drawCard = () => {
    if (deck.length === 0) return
    const randomIndex = Math.floor(Math.random() * deck.length)
    const card = deck[randomIndex]
    const newDeck = [...deck]
    newDeck.splice(randomIndex, 1)
    setCurrentCard(card)
    setDeck(newDeck)
  }
  return (
    <div className="  bg-gray-100 p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm text-center">
        <button
          onClick={drawCard}
          className="bg-blue-500 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow disabled:opacity-50 transition-all duration-200"
          disabled={deck.length === 0}
        >
          Random
        </button>

        {currentCard ? (
          <div className="mt-8">
            <p className="text-xl font-semibold text-gray-800 mb-4">ไพ่ที่ได้</p>
            <img
              src={`/images/cards/${currentCard.image}`}
              alt={currentCard.name}
              className="w-56 mx-auto drop-shadow-lg"
            />

            <p className="mt-4 text-sm text-gray-600">เหลือ {deck.length} ใบ</p>
          </div>
        ) : (
          <div className="mt-8">
            <p className="text-xl font-semibold text-gray-800 mb-4">เริ่มสุ่มไพ่</p>
            <img
              src={`/images/cards/back_dark.png`}
              alt={'zero'}
              className="w-56 mx-auto opacity-70"
            />

            <p className="mt-4 text-sm text-gray-500">ทั้งหมด {deck.length} ใบ</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CardGame
