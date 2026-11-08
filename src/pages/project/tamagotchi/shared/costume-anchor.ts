import { useSprites } from './sprite-loader'

// With `anchor` (a pixel-art pet), the hat and face item sit on that sprite's head instead of the
// frame's fixed spots; `spriteFrac` is how much of the frame the sprite's grid fills.
export interface ICostumeAnchor {
  hat: [number, number]
  face: [number, number]
  spriteFrac: number
}

// How much of the costume frame the pixel-art pet fills.
export const SPRITE_FRAC = 0.8

// The costume anchors of a pixel-art pet, once the sprites have loaded (null for an emoji pet).
export const useCostumeAnchor = (sprite?: string | null): ICostumeAnchor | null => {
  const sprites = useSprites()
  const a = sprites && sprite ? sprites.spriteAnchors(sprite) : null
  return a ? { ...a, spriteFrac: SPRITE_FRAC } : null
}
