import { Button } from 'antd'
import { chunk, shuffle } from 'lodash'
import { useCallback, useEffect, useState } from 'react'

import { cardDeck, ICardData } from '../random-card/cardGame-data'
import AddPlayerOmama from './AddPlayerOmama'
import Omama from './Omama'

export interface SpecialCardOwner {
  K: number | null
  Q: number | null
  J: number | null
}

const spiteCardNumber = 18
const PageOmama = () => {
  const [isAddingPlayer, setIsAddingPlayer] = useState(true)
  const [cardlist, setCardlist] = useState<ICardData[][]>([])
  const [currentCard, setCurrentCard] = useState<ICardData | null>(null)
  const [userNameList, setUserNameList] = useState<string[]>([])
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
  // const randomIndex = useCallback(() => {
  //   const randomIndex = Math.floor(Math.random() * userNameList.length)
  //   setNameIndex(randomIndex)
  // }, [userNameList.length])

  return (
    <div className="flex max-w-5xl flex-col gap-2 p-4">
      {/* Input + Add Name */}
      <div className="rounded-2xl bg-blue-400 px-4 py-2 text-2xl font-bold">Game Omama</div>
      <div className="flex items-center justify-center gap-4 md:flex-row">
        <Button type="primary" className="!h-9" onClick={() => setIsAddingPlayer((prev) => !prev)}>
          {isAddingPlayer ? 'เริ่มเกม' : 'เพิ่มชื่อหรือแก้ไขชื่อผู้เล่น'}
        </Button>
      </div>

      {isAddingPlayer ? (
        <AddPlayerOmama
          userNameList={userNameList}
          addUserName={addUserName}
          removeUserName={removeUserName}
        />
      ) : (
        <Omama
          cardlist={cardlist}
          nameIndex={nameIndex}
          onClickCard={onClickCard}
          onRandom={onRandom}
          currentCard={currentCard}
          specialCardOwner={specialCardOwner}
          userNameList={userNameList}
        />
      )}
    </div>
  )
}

export default PageOmama
