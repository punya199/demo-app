import { RedoOutlined } from '@ant-design/icons'
import { Button, Progress, Typography } from 'antd'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import back_dark from '../../../assets/images/cards/back_dark.webp'
import back_light from '../../../assets/images/cards/back_light.webp'
import { useThemeStore } from '../../../utils/theme-store'
import { cardDeck, cardTitleData, ICardData } from './cardGame-data'

const TOTAL_CARDS = cardDeck.length

const suitLabel: Record<ICardData['type'], string> = {
  hearts: '♥ Hearts',
  diamonds: '♦ Diamonds',
  clubs: '♣ Clubs',
  spades: '♠ Spades',
}

const suitColor: Record<ICardData['type'], string> = {
  hearts: 'text-red-500',
  diamonds: 'text-red-500',
  clubs: 'text-slate-700 dark:text-slate-200',
  spades: 'text-slate-700 dark:text-slate-200',
}

const CardGame = () => {
  const mode = useThemeStore((state) => state.mode)
  const [deck, setDeck] = useState<ICardData[]>(cardDeck)
  const [currentCard, setCurrentCard] = useState<ICardData | null>(null)

  const drawnCount = TOTAL_CARDS - deck.length
  const isEmpty = deck.length === 0

  const drawCard = () => {
    if (deck.length === 0) return
    const randomIndex = Math.floor(Math.random() * deck.length)
    const card = deck[randomIndex]
    const newDeck = [...deck]
    newDeck.splice(randomIndex, 1)
    setCurrentCard(card)
    setDeck(newDeck)
  }

  const resetDeck = () => {
    setDeck(cardDeck)
    setCurrentCard(null)
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-6 px-4 py-10">
      <div className="w-full max-w-sm rounded-3xl bg-gradient-to-br from-blue-100 via-white to-blue-200 p-8 text-center shadow-2xl dark:from-slate-800 dark:via-slate-900 dark:to-slate-950">
        <Typography.Title level={3} className="!mb-1 !text-blue-700 dark:!text-blue-300">
          สุ่มไพ่ปาร์ตี้
        </Typography.Title>
        <Typography.Text type="secondary">จั่วไพ่แล้วทำตามกติกา!</Typography.Text>

        <div className="my-6 flex justify-center" style={{ perspective: 800 }}>
          <AnimatePresence mode="wait">
            {currentCard ? (
              <motion.img
                key={`${currentCard.type}-${currentCard.name}`}
                src={currentCard.image}
                alt={`${currentCard.name} of ${currentCard.type}`}
                className="mx-auto w-48 drop-shadow-xl"
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: -90, opacity: 0 }}
                transition={{ duration: 0.35 }}
              />
            ) : (
              <motion.img
                key="back"
                src={mode === 'dark' ? back_dark : back_light}
                alt="card back"
                className="mx-auto w-48 opacity-90 drop-shadow-xl"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
          </AnimatePresence>
        </div>

        {currentCard ? (
          <div className="space-y-2">
            <div className={`text-lg font-bold ${suitColor[currentCard.type]}`}>
              {currentCard.name} · {suitLabel[currentCard.type]}
            </div>
            <div className="rounded-xl bg-blue-50 px-4 py-3 text-sm font-medium text-blue-800 dark:bg-blue-950/40 dark:text-blue-200">
              {cardTitleData[currentCard.name]}
            </div>
          </div>
        ) : (
          <Typography.Text type="secondary">กดปุ่มด้านล่างเพื่อเริ่มจั่วไพ่</Typography.Text>
        )}

        <div className="mt-6">
          <Progress
            percent={Math.round((drawnCount / TOTAL_CARDS) * 100)}
            showInfo={false}
            strokeColor="#3b82f6"
          />
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            จั่วไปแล้ว {drawnCount}/{TOTAL_CARDS} ใบ
          </div>
        </div>

        <div className="mt-6 flex justify-center gap-2">
          <motion.div whileHover={{ scale: isEmpty ? 1 : 1.03 }} whileTap={{ scale: 0.95 }}>
            <Button
              type="primary"
              size="large"
              onClick={drawCard}
              disabled={isEmpty}
              className="!px-8"
            >
              {isEmpty ? 'ไพ่หมดกอง' : 'จั่วไพ่'}
            </Button>
          </motion.div>
          {(currentCard || isEmpty) && (
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }}>
              <Button size="large" icon={<RedoOutlined />} onClick={resetDeck}>
                เริ่มใหม่
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CardGame
