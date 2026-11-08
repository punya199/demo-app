import { useEffect, useRef } from 'react'
import { useSprites } from './sprite-loader'

interface IMonsterSpriteProps {
  // The pixel-art sprite id from the server; without one (or before the art loads) the emoji shows.
  sprite?: string | null
  emoji: string
  // The square it fills, in CSS px.
  size: number
  // Loop the idle animation (home screen); otherwise one still frame (lists, avatars).
  animate?: boolean
  // Undiscovered Dex entries: a dark silhouette.
  silhouette?: boolean
  className?: string
  label?: string
}

// A monster drawn from its pixel-art sprite, facing right, with its aura and glows.
export const MonsterSprite = (props: IMonsterSpriteProps) => {
  const { sprite, emoji, size, animate = false, silhouette = false, className, label } = props
  const sprites = useSprites()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const def = sprites && sprite && sprites.hasSprite(sprite) ? sprites.SPRITES[sprite] : null

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!sprites || !def || !sprite || !canvas || !ctx) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    canvas.width = Math.round(size * dpr)
    canvas.height = Math.round(size * dpr)
    const k = (size * dpr) / def.size
    const still =
      !animate || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
    let raf = 0
    const draw = (time: number) => {
      const t = time / 1000
      const frame = still ? 0 : Math.floor(t * 0.75 * 12) % 12
      const img = sprites.getSpriteFrame(sprite, 'idle', frame)
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      if (!img) return
      ctx.imageSmoothingEnabled = false
      if (def.aura && !silhouette) {
        ctx.save()
        ctx.scale(k, k)
        sprites.drawAura(ctx, def.aura, 0, 0, t, false, def.size)
        ctx.restore()
      }
      // a silhouette is the white flash image, darkened by the element's CSS filter
      ctx.drawImage(silhouette ? img.white : img.cv, 0, 0, def.size * k, def.size * k)
      if (!silhouette) sprites.drawGlows(ctx, def, 0, 0, k, k, false, t, 1, img)
      if (!still) raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [sprites, def, sprite, size, animate, silhouette])

  if (!def)
    return (
      <span
        role="img"
        aria-label={label ?? emoji}
        className={className}
        style={{
          fontSize: size * 0.7,
          lineHeight: `${size}px`,
          width: size,
          height: size,
          display: 'inline-block',
          textAlign: 'center',
        }}
      >
        {emoji}
      </span>
    )
  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={label ?? emoji}
      className={className}
      style={{
        width: size,
        height: size,
        imageRendering: 'pixelated',
        display: 'block',
        ...(silhouette && { filter: 'brightness(0.2)', opacity: 0.55 }),
      }}
    />
  )
}
