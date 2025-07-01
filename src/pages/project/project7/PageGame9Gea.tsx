import { useState } from 'react'
import AddPlayer from './AddPlayer'
import Game9Gea, { Player } from './Game9Gea'

const PageGame9Gea = () => {
  const [players, setPlayers] = useState<Player[]>([])
  const onChangePlayers = (newPlayers: Player[]) => {
    setPlayers(newPlayers)
  }
  return (
    <div className="m-1  p-4 border-2 rounded-2xl shadow-2xl">
      <AddPlayer onChange={onChangePlayers} />
      <Game9Gea players={players} />
    </div>
  )
}

export default PageGame9Gea
