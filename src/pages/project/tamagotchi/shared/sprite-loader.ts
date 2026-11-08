import { useEffect, useState } from 'react'

// The pixel-art sprites are a large chunk, so screens load it on demand and show the emoji until
// it arrives (or for a form that has no art yet). One load is shared by every caller.

type SpriteModule = typeof import('../sprites/sprite-registry') &
  typeof import('../sprites/fx/auras')

let loaded: SpriteModule | null = null
let loading: Promise<SpriteModule> | null = null

export const loadSprites = () =>
  (loading ??= Promise.all([
    import('../sprites/sprite-registry'),
    import('../sprites/fx/auras'),
  ]).then(([registry, auras]) => (loaded = { ...registry, ...auras })))

// The sprite module once loaded, else null (and it starts loading).
export const useSprites = (): SpriteModule | null => {
  const [mod, setMod] = useState(loaded)
  useEffect(() => {
    if (mod) return
    let alive = true
    loadSprites()
      .then((m) => alive && setMod(m))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [mod])
  return mod
}
