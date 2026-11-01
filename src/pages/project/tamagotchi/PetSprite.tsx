import { motion } from 'motion/react'

interface IPetSpriteProps {
  emoji: string
  isSick: boolean
  isEgg: boolean
}

export const PetSprite = (props: IPetSpriteProps) => {
  const { emoji, isSick, isEgg } = props

  const animate = isEgg
    ? { rotate: [0, -8, 8, -8, 0] }
    : isSick
      ? { x: [0, -3, 3, -3, 0] }
      : { y: [0, -14, 0] }

  return (
    <div className="relative flex h-32 items-center justify-center">
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
      {isSick && <span className="absolute top-0 right-6 text-2xl">🤒</span>}
    </div>
  )
}
