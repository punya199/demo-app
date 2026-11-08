import { motion } from 'motion/react'
import { PetCostumeFrame } from './PetAvatar'
import { ILoadout } from '../core/tamagotchi-interface'

interface IPetSpriteProps {
  emoji: string
  isSick: boolean
  isEgg: boolean
  costume?: ILoadout | null
}

export const PetSprite = (props: IPetSpriteProps) => {
  const { emoji, isSick, isEgg, costume } = props

  const animate = isEgg
    ? { rotate: [0, -8, 8, -8, 0] }
    : isSick
      ? { x: [0, -3, 3, -3, 0] }
      : { y: [0, -14, 0] }

  return (
    <div className="relative flex items-center justify-center">
      <PetCostumeFrame costume={costume} scale={1.25}>
        <motion.div
          key={emoji}
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 14 }}
        >
          <motion.div
            className="text-7xl select-none"
            animate={animate}
            transition={{
              duration: isEgg ? 1.6 : 1.1,
              repeat: Infinity,
              repeatDelay: isEgg ? 1.2 : 0,
              ease: 'easeInOut',
            }}
          >
            {emoji}
          </motion.div>
        </motion.div>
      </PetCostumeFrame>
      {isSick && <span className="absolute top-0 right-6 z-10 text-2xl">🤒</span>}
    </div>
  )
}
