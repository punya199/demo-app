import { motion } from 'motion/react'
import { MonsterSprite } from './MonsterSprite'
import { SPRITE_FRAC, useCostumeAnchor } from './costume-anchor'
import { PetCostumeFrame } from './PetAvatar'
import { ILoadout } from '../core/tamagotchi-interface'

interface IPetSpriteProps {
  emoji: string
  // The pixel-art sprite (it animates on its own: idle breathing instead of the emoji's hop).
  sprite?: string | null
  isSick: boolean
  isEgg: boolean
  costume?: ILoadout | null
}

export const PetSprite = (props: IPetSpriteProps) => {
  const { emoji, sprite, isSick, isEgg, costume } = props
  const anchor = useCostumeAnchor(sprite)
  const scale = 1.25

  const animate = isEgg
    ? { rotate: [0, -8, 8, -8, 0] }
    : isSick
      ? { x: [0, -3, 3, -3, 0] }
      : sprite
        ? {}
        : { y: [0, -14, 0] }

  return (
    <div className="relative flex items-center justify-center">
      <PetCostumeFrame costume={costume} scale={scale} anchor={anchor}>
        <motion.div
          key={sprite ?? emoji}
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 14 }}
        >
          <motion.div
            className={sprite ? 'select-none' : 'text-7xl select-none'}
            animate={animate}
            transition={{
              duration: isEgg ? 1.6 : 1.1,
              repeat: Infinity,
              repeatDelay: isEgg ? 1.2 : 0,
              ease: 'easeInOut',
            }}
          >
            {sprite ? (
              <MonsterSprite
                sprite={sprite}
                emoji={emoji}
                size={128 * scale * SPRITE_FRAC}
                animate={!isEgg}
              />
            ) : (
              emoji
            )}
          </motion.div>
        </motion.div>
      </PetCostumeFrame>
      {isSick && <span className="absolute top-0 right-6 z-10 text-2xl">🤒</span>}
    </div>
  )
}
