import { CSSProperties, ReactNode } from 'react'
import { resolveLoadout } from '../core/tamagotchi-helper'
import { ILoadout } from '../core/tamagotchi-interface'
import { useGetCostumes } from '../core/tamagotchi-service'
import { MonsterSprite } from './MonsterSprite'
import { ICostumeAnchor, SPRITE_FRAC, useCostumeAnchor } from './costume-anchor'

const BASE_SIZE = 128

// The pet with its costume drawn as layers: backdrop, aura glow, back item, the pet itself (the
// children), face item, hat. `scale` 1 is 128px; everything inside scales with it. The server only
// sends costume ids, so this looks each one up in the catalog and ignores any it does not know.
const onFrame = (v: number, frac: number) => `${(50 + (v - 0.5) * frac * 100).toFixed(1)}%`

export const PetCostumeFrame = (props: {
  costume?: ILoadout | null
  scale?: number
  anchor?: ICostumeAnchor | null
  children: ReactNode
}) => {
  const { costume, scale = 1, anchor, children } = props
  const { data } = useGetCostumes()
  const layers = resolveLoadout(costume, data?.catalog)
  const size = BASE_SIZE * scale
  const layer = (z: number, extra: CSSProperties): CSSProperties => ({
    position: 'absolute',
    zIndex: z,
    ...extra,
  })

  return (
    <div
      className="relative grid shrink-0 place-items-center overflow-hidden rounded-xl select-none"
      style={{ width: size, height: size, background: layers.backdrop?.gradient }}
    >
      {layers.aura && (
        <div
          aria-hidden
          className="motion-safe:animate-pulse"
          style={layer(0, {
            inset: 0,
            background: `radial-gradient(circle at 50% 55%, ${layers.aura.color} 0%, transparent 62%)`,
          })}
        />
      )}
      {layers.back && (
        <span
          aria-hidden
          style={layer(1, {
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -52%)',
            fontSize: size * 0.85,
            lineHeight: 1,
            opacity: 0.9,
          })}
        >
          {layers.back.emoji}
        </span>
      )}
      <div className="relative" style={{ zIndex: 2 }}>
        {children}
      </div>
      {layers.face && (
        <span
          aria-hidden
          style={layer(3, {
            top: anchor ? onFrame(anchor.face[1], anchor.spriteFrac) : '56%',
            left: anchor ? onFrame(anchor.face[0], anchor.spriteFrac) : '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: size * (anchor ? 0.18 : 0.22),
            lineHeight: 1,
          })}
        >
          {layers.face.emoji}
        </span>
      )}
      {layers.hat && (
        <span
          aria-hidden
          style={layer(3, {
            top: anchor ? onFrame(anchor.hat[1], anchor.spriteFrac) : size * 0.06,
            left: anchor ? onFrame(anchor.hat[0], anchor.spriteFrac) : '50%',
            transform: anchor ? 'translate(-50%, -80%)' : 'translateX(-50%)',
            fontSize: size * (anchor ? 0.24 : 0.3),
            lineHeight: 1,
          })}
        >
          {layers.hat.emoji}
        </span>
      )}
    </div>
  )
}

// A still pet with its costume, for other players' screens (friends, arena, rankings, rentals).
export const PetAvatar = (props: {
  emoji: string
  sprite?: string | null
  costume?: ILoadout | null
  scale?: number
  label?: string
}) => {
  const { emoji, sprite, costume, scale = 1, label } = props
  const anchor = useCostumeAnchor(sprite)
  return (
    <div role="img" aria-label={label ?? emoji}>
      <PetCostumeFrame costume={costume} scale={scale} anchor={anchor}>
        {sprite ? (
          <MonsterSprite sprite={sprite} emoji={emoji} size={BASE_SIZE * scale * SPRITE_FRAC} />
        ) : (
          <span style={{ fontSize: BASE_SIZE * scale * 0.56, lineHeight: 1 }}>{emoji}</span>
        )}
      </PetCostumeFrame>
    </div>
  )
}
