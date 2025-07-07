import { useState } from 'react'
import black_dark from '../../../assets/images/cards/back_dark.webp'
import { cardDeck, ICardData } from './cardGame-data'

const CardGame = () => {
  const [deck, setDeck] = useState<ICardData[]>(cardDeck)
  const [currentCard, setCurrentCard] = useState<ICardData | null>(null)

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
    <div className="bg-gray-100 p-6">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-xl">
        <button
          onClick={drawCard}
          className="rounded-lg bg-blue-500 px-6 py-2 font-semibold text-white shadow transition-all duration-200 hover:bg-blue-700 disabled:opacity-50"
          disabled={deck.length === 0}
        >
          Random
        </button>

        {currentCard ? (
          <div className="mt-8">
            <p className="mb-4 text-xl font-semibold text-gray-800">ไพ่ที่ได้</p>
            <img
              // src={`/images/cards/${currentCard.image}`}
              src={currentCard.image}
              alt={currentCard.name}
              className="mx-auto w-56 drop-shadow-lg"
            />

            <p className="mt-4 text-sm text-gray-600">เหลือ {deck.length} ใบ</p>
          </div>
        ) : (
          <div className="mt-8">
            <p className="mb-4 text-xl font-semibold text-gray-800">เริ่มสุ่มไพ่</p>
            <img src={black_dark} alt={'zero'} className="mx-auto w-56 opacity-70" />

            <p className="mt-4 text-sm text-gray-500">ทั้งหมด {deck.length} ใบ</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CardGame
