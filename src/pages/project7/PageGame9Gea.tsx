import { useState } from 'react'
import AddPlayer from './AddPlayer'
import Game9Gea, { Player } from './Game9Gea'

const PageGame9Gea = () => {
  const [players, setPlayers] = useState<Player[]>([])
  const onChangePlayers = (newPlayers: Player[]) => {
    setPlayers(newPlayers)
  }
  return (
    <div>
      <AddPlayer onChange={onChangePlayers} />
      <Game9Gea players={players} />
    </div>
  )
}

export default PageGame9Gea
