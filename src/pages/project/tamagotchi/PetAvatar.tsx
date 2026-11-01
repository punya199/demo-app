import { CSSProperties, ReactNode } from 'react'
import { resolveLoadout } from './tamagotchi-helper'
import { ILoadout } from './tamagotchi-interface'
import { useGetCostumes } from './tamagotchi-service'

const BASE_SIZE = 128

// The pet with its costume drawn as layers: backdrop, aura glow, back item, the pet itself (the
// children), face item, hat. `scale` 1 is 128px; everything inside scales with it. The server only
// sends costume ids, so this looks each one up in the catalog and ignores any it does not know.
export const PetCostumeFrame = (props: {
  costume?: ILoadout | null
  scale?: number
  children: ReactNode
}) => {
  const { costume, scale = 1, children } = props
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
            top: '56%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: size * 0.22,
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
            top: size * 0.06,
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: size * 0.3,
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
  costume?: ILoadout | null
  scale?: number
  label?: string
}) => {
  const { emoji, costume, scale = 1, label } = props
  return (
    <div role="img" aria-label={label ?? emoji}>
      <PetCostumeFrame costume={costume} scale={scale}>
        <span style={{ fontSize: BASE_SIZE * scale * 0.56, lineHeight: 1 }}>{emoji}</span>
      </PetCostumeFrame>
    </div>
  )
}
