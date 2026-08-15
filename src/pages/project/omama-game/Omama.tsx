import { CrownOutlined, RedoOutlined, UserOutlined } from '@ant-design/icons'
import { Avatar, Button, Modal } from 'antd'
import { chunk, shuffle } from 'lodash'
import { motion } from 'motion/react'
import { useCallback, useEffect, useState } from 'react'
import back_dark from '../../../assets/images/cards/back_dark.webp'
import back_light from '../../../assets/images/cards/back_light.webp'
import { useThemeStore } from '../../../utils/theme-store'
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

const specialCardMeta: Record<keyof SpecialCardOwner, { label: string; color: string }> = {
  K: { label: 'King', color: '#eab308' },
  Q: { label: 'Queen', color: '#ec4899' },
  J: { label: 'Jack', color: '#3b82f6' },
}

const Omama = (props: OmamaProps) => {
  const mode = useThemeStore((state) => state.mode)
  const backImage = mode === 'dark' ? back_dark : back_light
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
            <img
              src={card.image}
              alt={card.name}
              className="mx-auto w-40 rounded-lg drop-shadow-lg"
            />
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
    <div className="space-y-6">
      {/* ส่วนบน */}
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }}>
          <Button icon={<RedoOutlined />} onClick={onRandom}>
            สุ่มไพ่ใหม่
          </Button>
        </motion.div>

        <div className="flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 dark:bg-blue-950/40">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-blue-500" />
          </span>
          <span className="text-slate-600 dark:text-slate-300">ผู้เล่นที่ต้องจั่ว</span>
          <span className="font-bold text-blue-700 dark:text-blue-300">
            {props.userNameList[props.nameIndex]}
          </span>
        </div>
      </div>

      {/* กล่องไพ่ */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {cardlist.map((e, index) => {
          const isEmpty = e.length === 0
          const isPlayable = !isEmpty && props.userNameList.length > 0
          return (
            <motion.div
              key={index}
              whileHover={isPlayable ? { scale: 1.05 } : {}}
              whileTap={isPlayable ? { scale: 0.96 } : {}}
              className={`flex flex-col items-center rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition dark:border-slate-800 dark:bg-slate-900 ${
                isPlayable ? 'cursor-pointer hover:shadow-lg' : 'opacity-50'
              }`}
              onClick={() => {
                if (props.userNameList.length === 0) return
                onClickCard(index)
              }}
            >
              <img
                src={backImage}
                alt="back"
                className={`w-24 rounded-lg object-cover drop-shadow-lg sm:w-28 ${
                  isEmpty ? 'grayscale' : ''
                }`}
              />
              <div className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                {isEmpty ? 'หมดกอง' : `เหลือ ${e.length} ใบ`}
              </div>
            </motion.div>
          )
        })}

        {/* กล่องแสดงไพ่พิเศษ */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-3 font-semibold text-slate-800 dark:text-slate-100">
            คนที่ได้ไพ่พิเศษ
          </div>
          <div className="space-y-2">
            {(Object.keys(specialCardOwner) as (keyof SpecialCardOwner)[]).map((cardType) => {
              const ownerIndex = specialCardOwner[cardType]
              const meta = specialCardMeta[cardType]
              return (
                <div key={cardType} className="flex items-center gap-2 text-sm">
                  <CrownOutlined style={{ color: meta.color }} />
                  <span className="text-slate-500 dark:text-slate-400">{meta.label}</span>
                  <span className="ml-auto font-medium text-slate-700 dark:text-slate-200">
                    {ownerIndex !== null ? props.userNameList[ownerIndex] : '-'}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="mt-3 text-xs text-slate-400 dark:text-slate-500">
            ไพ่ทั้งหมดเหลือ {cardlist.flat().length} ใบ
          </div>
        </div>
      </div>

      {/* รายการไพ่ล่าสุด */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="mb-3 font-semibold text-slate-800 dark:text-slate-100">รายการไพ่ล่าสุด</h3>
        {listOfDraw.length === 0 && (
          <div className="text-sm text-slate-400 dark:text-slate-500">ยังไม่มีใครจั่วไพ่</div>
        )}
        <div className="space-y-2">
          {listOfDraw
            .slice()
            .reverse()
            .slice(0, 5)
            .map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 rounded-lg bg-slate-50 p-2 dark:bg-slate-800/50"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-14 w-10 rounded object-cover drop-shadow sm:h-16 sm:w-12"
                />
                <Avatar size="small" icon={<UserOutlined />} />
                <span className="font-medium text-slate-700 dark:text-slate-200">{item.name}</span>
                <span className="ml-auto text-sm text-slate-500 dark:text-slate-400">
                  ได้ไพ่ {item.card}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

export default Omama
