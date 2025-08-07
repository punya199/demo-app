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
type List = {
  name: string
  card: string
  image: string
}

const Omama = (props: OmamaProps) => {
  const [cardlist, setCardlist] = useState<ICardData[][]>([])
  const [isInitial, setIsInitial] = useState(false)
  const [listOfDraw, setListOfDraw] = useState<List[]>([])
  const [specialCardOwner, setSpecialCardOwner] = useState<SpecialCardOwner>({
    K: null,
    Q: null,
    J: null,
  })
  //จำนวนไฟ่ต่อกอง
  const spiteCardNumber = 18

  const onRandom = useCallback(() => {
    const a = shuffle(cardDeck)
    const b = chunk(a, spiteCardNumber)
    setCardlist(b)
    setSpecialCardOwner({ K: null, Q: null, J: null })
    props.setNameIndex(0)
    const randomIndex = Math.floor(Math.random() * props.userNameList.length)
    props.setNameIndex(randomIndex)
    setListOfDraw([])
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
      const typeMap: Record<string, string> = {
        spades: 'โพดำ',
        hearts: 'โพแดง',
        clubs: 'ดอกจิก',
        diamonds: 'ข้าวหลามตัด',
      }

      // ดึงชื่อภาษาไทยก่อนเก็บ
      const cardNameThai = ` ${typeMap[card.type] || card.type}`

      const newList = {
        name: props.userNameList[props.nameIndex],
        card: `${card.name} ${cardNameThai}`,
        image: card.image,
      }

      setListOfDraw((prev) => [...prev, newList])
    },
    [cardlist, nextName, props.cardTitle, props.nameIndex, props.userNameList]
  )

  return (
    <div className="space-y-6 p-4">
      {/* ส่วนบน */}
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <Button onClick={onRandom} className="w-full sm:w-auto">
          สุ่มไพ่ใหม่
        </Button>
        <div className="flex items-center gap-4 text-lg font-semibold text-gray-700 sm:flex-row sm:gap-2">
          <span>ผู้เล่นที่ต้องจั่ว</span>
          <span className="text-blue-700">{props.userNameList[props.nameIndex]}</span>
        </div>
      </div>

      {/* กล่องไพ่ */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
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
              className="w-24 rounded-lg object-cover drop-shadow-lg sm:w-28"
            />
            <div className="mt-3 text-sm text-gray-600">เหลือ {e.length} ใบ</div>
          </div>
        ))}

        {/* กล่องแสดงไพ่พิเศษ */}
        <div className="rounded-xl bg-white p-4 shadow-md">
          <div className="mb-2 text-lg font-semibold">คนที่ได้ไพ่พิเศษ</div>
          <ul className="mb-2 list-inside space-y-1 text-sm text-gray-700">
            {Object.entries(specialCardOwner).map(([cardType, ownerIndex]) => (
              <li key={cardType}>
                {cardType} : {props.userNameList[ownerIndex] || 'ยังไม่มีคนได้'}
              </li>
            ))}
          </ul>
          <div className="text-sm text-gray-600">ไพ่ทั้งหมดเหลือ {cardlist.flat().length} ใบ</div>
        </div>
      </div>

      {/* รายการไพ่ล่าสุด */}
      <div className="space-y-2 rounded-xl bg-white p-4 shadow-md">
        <h3 className="mb-2 text-lg font-semibold text-gray-800">รายการไพ่ล่าสุด</h3>
        {listOfDraw
          .slice()
          .reverse()
          .slice(0, 5)
          .map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-md border p-2 text-sm sm:text-base"
            >
              <span className="font-semibold">{item.name}</span>
              <span>ได้ไพ่ {item.card}</span>
              <img src={item.image} alt={item.name} className="h-16 w-12 object-contain" />
            </div>
          ))}
      </div>
    </div>
  )
}

export default Omama
