import { useEffect, useRef } from 'react'
import { farmActivity, farmActivityLabel, petLabel } from '../core/tamagotchi-helper'
import { IMonsterData } from '../core/tamagotchi-interface'
import { useSprites } from '../shared/sprite-loader'
import { drawCaption, drawPile, drawRoom } from './farm-room-draw'
import { FarmTiers, IRoomPet, newRoomPet, ROOM_H, ROOM_W, stepRoomPet } from './farm-room-sim'

const SCALE = 2

interface IFarmRoomProps {
  monsters: IMonsterData[]
  tiers: FarmTiers
}

// The Farm room: every living pet doing what its server state calls for. It only draws; the care
// numbers are the server's (docs/adr/0001-farm-effects-are-server-side.md).
export const FarmRoom = (props: IFarmRoomProps) => {
  const { monsters, tiers } = props
  const sprites = useSprites()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const latest = useRef({ monsters, tiers })
  latest.current = { monsters, tiers }
  const pets = useRef(new Map<string, IRoomPet>())

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
    let raf = 0
    let last = performance.now()
    const draw = (now: number) => {
      // Reduced motion: pets jump to where they belong instead of walking there.
      const dt = reduced ? 100 : Math.min(0.1, (now - last) / 1000)
      last = now
      const { monsters: list, tiers: owned } = latest.current
      const t = now / 1000
      ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0)
      ctx.imageSmoothingEnabled = false
      drawRoom(ctx, owned)

      const alive = new Set(list.map((monster) => monster.id))
      for (const id of [...pets.current.keys()]) if (!alive.has(id)) pets.current.delete(id)

      list.forEach((monster, index) => {
        const before = pets.current.get(monster.id) ?? newRoomPet(index, Math.random)
        const pet = stepRoomPet(before, farmActivity(monster), owned, index, dt, Math.random)
        pets.current.set(monster.id, pet)
        for (let pile = 0; pile < monster.poops; pile++) {
          drawPile(ctx, 36 + index * 70 + pile * 16, 262 - (pile % 2) * 4)
        }
      })

      const drawn = list
        .map((monster, index) => ({ monster, index, pet: pets.current.get(monster.id)! }))
        .filter(({ pet }) => pet.mode !== 'away')
        .sort((a, b) => a.pet.y - b.pet.y)
      for (const { monster, index, pet } of drawn) {
        const def = sprites && monster.sprite ? sprites.SPRITES[monster.sprite] : null
        const x = Math.round(pet.x)
        const y = Math.round(pet.y)
        if (def && sprites && monster.sprite) {
          const size = def.size
          const walking = pet.mode === 'walk'
          const img = walking
            ? sprites.getSpriteFrame(monster.sprite, 'walk', Math.floor(pet.walkPhase) % 12)
            : pet.mode === 'sick'
              ? sprites.getSpriteFrame(monster.sprite, 'hurt', 2)
              : sprites.getSpriteFrame(
                  monster.sprite,
                  'idle',
                  Math.floor((t * 0.75 + index * 0.37) * 12) % 12
                )
          const bob = pet.mode === 'eat' ? Math.round(Math.sin(t * 14)) : 0
          const fit = size > 64 ? 64 / size : 1
          const w = size * fit
          ctx.globalAlpha = 0.25
          ctx.fillStyle = '#000000'
          ctx.fillRect(x - w * 0.3, y - 2, w * 0.6, 4)
          ctx.globalAlpha = pet.mode === 'sleep' ? 0.8 : 1
          if (img) {
            ctx.save()
            ctx.translate(x, 0)
            if (pet.face < 0) ctx.scale(-1, 1)
            ctx.drawImage(img.cv, -w / 2, y - w + 4 + bob, w, w)
            ctx.restore()
          }
          ctx.globalAlpha = 1
          if (pet.mode === 'sleep') {
            ctx.font = '600 9px Prompt, system-ui, sans-serif'
            ctx.fillStyle = '#3b6fa8'
            ctx.textAlign = 'left'
            ctx.fillText('Z', x + 14, y - w + 2 - ((t * 8) % 10))
          }
          const label =
            pet.mode === 'sleep'
              ? 'นอนหลับ'
              : pet.mode === 'toilet'
                ? 'เข้าห้องน้ำ'
                : farmActivityLabel[farmActivity(monster)]
          if (pet.mode !== 'idle' && pet.mode !== 'walk') drawCaption(ctx, x, y - w - 2, label)
        } else {
          ctx.font = '28px system-ui, sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText(monster.emoji, x, y)
          drawCaption(ctx, x, y - 34, petLabel(monster.name, monster.nickname))
        }
      }
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [sprites])

  return (
    <canvas
      ref={canvasRef}
      width={ROOM_W * SCALE}
      height={ROOM_H * SCALE}
      role="img"
      aria-label={`ห้องฟาร์ม มีสัตว์เลี้ยง ${monsters.length} ตัว`}
      className="block w-full rounded-xl [image-rendering:pixelated]"
    />
  )
}
