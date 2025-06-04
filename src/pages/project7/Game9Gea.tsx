import { Button } from 'antd'
import { shuffle } from 'lodash'
import { useState } from 'react'
import { cardDeck } from '../project5/cardGame-data'
export interface Player {
  id: string
  name: string
  cardInHand?: string[]
}
interface Game9GeaProps {
  players: Player[]
}

const Game9Gea = (props: Game9GeaProps) => {
  const [cardList, setCardList] = useState(cardDeck)

  const onRandom = () => {
    const a = shuffle(cardDeck)
    setCardList(a)
  }
  return (
    <div>
      <Button onClick={onRandom}>สุ่ม</Button>
      <div className="grid grid-cols-3 gap-2 mt-4">
        {cardList.map((card, index) => (
          <div key={index} className="border p-2 rounded bg-gray-100 text-center">
            {card.name}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Game9Gea
