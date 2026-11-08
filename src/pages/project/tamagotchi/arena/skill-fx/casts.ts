import { ARENA_TICK } from '../arena-helper'
import { IArenaReplay, IArenaSkill } from '../arena-interface'
import { ACT, BASIC_NAME } from '../replay-anim'
import type { ICast } from './runtime'

// Every skill cast in a replay: who, which skill, and when it wound up, released and landed. The
// server logs a `skill` event at the release; the wind-up before it is the stretch of frames where
// the caster's `act` is 1 with that skill's slot as `kind`; its hits are the `hit` events carrying
// the skill's name until the caster's next cast (at most CAST_SPAN seconds).

const CAST_SPAN = 4

const sec = (t: number) => t / ARENA_TICK

export const castsOf = (replay: IArenaReplay, skills: Record<string, IArenaSkill>): ICast[] => {
  const { events, fighters, frames, step } = replay
  const idOf = (who: number, name: string) => {
    const f = fighters[who]
    const own = [...(f?.skills ?? []), ...(f?.allSlots ?? [])].find(
      (id) => skills[id]?.name === name
    )
    return own ?? Object.values(skills).find((s) => s.name === name)?.id ?? null
  }
  const casts: ICast[] = []
  events.forEach((e, i) => {
    if (e.kind !== 'skill' || e.who === undefined || !e.skill || e.skill === BASIC_NAME) return
    const who = e.who
    const id = idOf(who, e.skill)
    if (!id) return
    // the next cast by the same fighter ends this one
    const next = events.slice(i + 1).find((n) => n.kind === 'skill' && n.who === who)
    const until = Math.min(next ? next.t : Infinity, e.t + CAST_SPAN * ARENA_TICK)
    const hits = events
      .filter(
        (h) =>
          h.kind === 'hit' &&
          h.who === who &&
          h.skill === e.skill &&
          h.t >= e.t &&
          h.t < until &&
          h.target !== undefined
      )
      .map((h) => ({ t: sec(h.t), target: h.target as number, crit: !!h.crit }))
    const zone = events.find(
      (z) => z.kind === 'zoneHit' && z.who === who && z.t >= e.t && z.t < until
    )
    const aim = events.find((z) => z.kind === 'zone' && z.who === who && z.t >= e.t && z.t < until)
    const beam = events.find((b) => b.kind === 'beam' && b.who === who && b.t >= e.t && b.t < until)
    // wind-up start: walk back over the frames winding up this slot
    const slot = fighters[who]?.skills.indexOf(id) ?? -1
    let fi = Math.min(frames.length - 1, Math.floor(e.t / step))
    while (fi > 0 && frames[fi - 1].f[who][3] === ACT.WIND && frames[fi - 1].f[who][4] === slot)
      fi--
    const wound = frames[fi]?.f[who][3] === ACT.WIND && slot >= 0
    const startTick = wound ? fi * step : e.t - (skills[id]?.wind ?? 8)
    // the target: whoever it hit first, else the nearest enemy still standing
    let target = hits[0]?.target ?? -1
    if (target < 0) {
      const row = frames[Math.min(frames.length - 1, Math.floor(e.t / step))].f
      let best = Infinity
      fighters.forEach((f, idx) => {
        if (f.team === fighters[who].team || row[idx][2] === 0) return
        const d = Math.hypot(row[idx][0] - row[who][0], row[idx][1] - row[who][1])
        if (d < best) {
          best = d
          target = idx
        }
      })
    }
    if (target < 0) target = who
    casts.push({
      skill: id,
      who,
      target,
      startT: sec(Math.min(startTick, e.t)),
      releaseT: sec(e.t),
      zoneT: zone ? sec(zone.t) : null,
      hits,
      ...(aim?.x !== undefined && aim.y !== undefined && { zone: { x: aim.x, y: aim.y } }),
      ...(beam?.x !== undefined &&
        beam.y !== undefined && {
          beam: { x: beam.x, y: beam.y, x2: beam.x2 ?? beam.x, y2: beam.y2 ?? beam.y },
        }),
    })
  })
  return casts.sort((a, b) => a.startT - b.startT)
}
