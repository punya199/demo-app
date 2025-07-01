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
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [player, setPlayer] = useState<Player[]>([])
  const onRandom = () => {
    const a = shuffle(cardDeck)
    setCardList(a)
    setPlayer(props.players)
  }
  const dealCards = () => {
    const cardOnDeal = cardList[0]
    const updatedPlayers = player[currentPlayerIndex]

    const newCardInHand = [...(updatedPlayers.cardInHand || []), cardOnDeal.name]
    const newPlayer = [...player]
    newPlayer[currentPlayerIndex] = {
      ...updatedPlayers,
      cardInHand: newCardInHand,
    }

    setCardList(cardList.slice(1))
    setCurrentPlayerIndex((prev) => (prev + 1) % player.length)
    setPlayer(newPlayer)
  }

  if (props.players.length === 0) {
    return <div>กรุณาเพิ่มผู้เล่นก่อน</div>
  }
  if (cardList.length === 0) {
    return <div>กรุณากดปุ่มสุ่มการ์ดก่อน</div>
  }

  return (
    <div>
      <Button onClick={onRandom}>สุ่ม</Button>
      <Button onClick={dealCards}>แจก</Button>
      <div className="mt-4 space-y-1 text-gray-700">
        {player.map((p, index) => (
          <div
            key={p.id}
            className="border p-2 rounded bg-gray-100 flex items-center justify-between"
          >
            <h3>
              {index + 1}. {p.name}
            </h3>
            <ul className="list-disc pl-5">
              {p.cardInHand?.map((card, cardIndex) => (
                <li key={cardIndex}>{card}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Game9Gea
