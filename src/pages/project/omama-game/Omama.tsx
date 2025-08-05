import { Button, Modal } from 'antd'
import { chunk, shuffle } from 'lodash'
import { useCallback, useEffect, useState } from 'react'
import {
  default as black_dark,
  default as black_light,
} from '../../../assets/images/cards/back_dark.webp'
import { cardDeck, ICardData, ICardTitleData } from '../random-card/cardGame-data'
import { SpecialCardOwner } from './PageOmama'

interface OmamaProps {
  userNameList: string[]
  nameIndex: number
  cardTitle: ICardTitleData
  setNameIndex: (index: number) => void
}

const Omama = (props: OmamaProps) => {
  const [cardlist, setCardlist] = useState<ICardData[][]>([])
  const [isInitial, setIsInitial] = useState(false)
  const [specialCardOwner, setSpecialCardOwner] = useState<SpecialCardOwner>({
    K: null,
    Q: null,
    J: null,
  })
  const spiteCardNumber = 18

  const onRandom = useCallback(() => {
    const a = shuffle(cardDeck)
    const b = chunk(a, spiteCardNumber)
    setCardlist(b)
    setSpecialCardOwner({ K: null, Q: null, J: null })
    props.setNameIndex(0)
    const randomIndex = Math.floor(Math.random() * props.userNameList.length)
    props.setNameIndex(randomIndex)
  }, [props])

  useEffect(() => {
    if (!isInitial) {
      onRandom()
      setIsInitial(true)
    }
  }, [isInitial, onRandom])

  const nextName = useCallback(() => {
    if (props.userNameList.length === 0) return
    const nextIndex = (props.nameIndex + 1) % props.userNameList.length
    props.setNameIndex(nextIndex)
  }, [props])

  const onClickCard = useCallback(
    (index: number) => {
      const subDeck = [...cardlist[index]]
      if (subDeck.length === 0) return
      const card = subDeck[0]
      const newCardList = [...cardlist]
      newCardList[index] = subDeck.slice(1)
      setCardlist(newCardList)
      nextName()
      if (card.name.startsWith('K')) {
        setSpecialCardOwner((prev) => ({ ...prev, K: props.nameIndex }))
      }
      if (card.name.startsWith('Q')) {
        setSpecialCardOwner((prev) => ({ ...prev, Q: props.nameIndex }))
      }
      if (card.name.startsWith('J')) {
        setSpecialCardOwner((prev) => ({ ...prev, J: props.nameIndex }))
      }
      Modal.info({
        title: (
          <div className="mb-5 text-center text-2xl">
            {props.userNameList[props.nameIndex]} ได้ไพ่
          </div>
        ),

        content: (
          <div className="flex flex-col items-center gap-2">
            <img src={card.image} alt={card.name} className="mx-auto w-40 drop-shadow-lg" />
            <div className="text-xl">{props.cardTitle[card.name]}</div>
          </div>
        ),
        okText: 'ok',
        icon: null,
        maskClosable: true,
      })
    },
    [cardlist, nextName, props.cardTitle, props.nameIndex, props.userNameList]
  )

  return (
    <div>
      <div className="mb-2 flex items-center justify-center">
        <Button type="primary" onClick={onRandom}>
          สุ่มไพ่ใหม่
        </Button>
        <div className="flex w-80 items-center justify-center gap-4 text-lg font-semibold text-gray-700">
          <div>ผู้เล่นที่ต้องจั่ว</div>
          <div className="text-blue-700">{props.userNameList[props.nameIndex]}</div>
        </div>
      </div>

      {/* Card Stack */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {cardlist.map((e, index) => (
          <div
            key={index}
            className={`flex flex-col items-center rounded-xl bg-white p-4 shadow-md transition hover:shadow-xl ${
              props.userNameList.length > 0 ? 'cursor-pointer hover:scale-105' : ''
            }`}
            onClick={() => {
              if (props.userNameList.length === 0) return
              onClickCard(index)
            }}
          >
            <img
              src={e.length === 0 ? black_light : black_dark}
              alt="back"
              className="w-28 rounded-lg object-cover drop-shadow-lg"
            />
            <div className="mt-3 text-sm text-gray-600">เหลือ {e.length} ใบ</div>
          </div>
        ))}
        <div className="rounded-xl bg-white p-4 shadow-md transition hover:shadow-xl">
          <div className="mb-2 text-lg font-semibold">คนที่ได้ไพ่พิเศษ </div>
          <ul className="list-inside space-y-1 text-gray-700">
            {Object.entries(specialCardOwner).map(([cardType, ownerIndex]) => (
              <li key={cardType}>
                {cardType} : {props.userNameList[ownerIndex] || 'ยังไม่มีคนได้'}
              </li>
            ))}
          </ul>
          <div className="mt-4 text-sm text-gray-600">เหลือ {cardlist.flat().length} ใบ</div>
        </div>
      </div>
    </div>
  )
}

export default Omama
