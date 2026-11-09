import { describe, expect, it } from 'vitest'
import { IArenaEvent, IArenaFighterSummary, IArenaReplay } from './arena-interface'
import { BASIC_NAME } from './replay-anim'
import {
  BOSS_FIGHT_BOSS_K,
  BOSS_FIGHT_MONSTER_K,
  coversOf,
  fightPxOf,
  pxOf,
} from './replay-sprites'

const replay = (events: Partial<IArenaEvent>[]): IArenaReplay =>
  ({
    seed: 1,
    winner: 0,
    ticks: 200,
    step: 1,
    frames: [],
    events: events as IArenaEvent[],
    fighters: [{ idx: 0 }, { idx: 1 }] as unknown as IArenaFighterSummary[],
    checksum: '',
  }) as IArenaReplay

// fighter 0's "ลาวาทับ" has its own animation, fighter 1's "ตะปบ" does not
const animates = (who: number, name: string) => who === 0 && name === 'ลาวาทับ'

describe('coversOf', () => {
  it('covers the zone, burst and beam that follow an animated cast, so no plain circle is drawn', () => {
    const covers = coversOf(
      replay([
        { t: 10, kind: 'skill', who: 0, skill: 'ลาวาทับ' },
        { t: 10, kind: 'zone', who: 0, x: 1, y: 2 },
        { t: 30, kind: 'zoneHit', who: 0, x: 1, y: 2 },
      ]),
      animates
    )
    expect(covers({ t: 10, kind: 'zone', who: 0 } as IArenaEvent)).toBe(true)
    expect(covers({ t: 30, kind: 'zoneHit', who: 0 } as IArenaEvent)).toBe(true)
    expect(covers({ t: 12, kind: 'burst', who: 0 } as IArenaEvent)).toBe(true)
    expect(covers({ t: 12, kind: 'beam', who: 0 } as IArenaEvent)).toBe(true)
    // long after the cast, a burst is someone else's business
    expect(covers({ t: 200, kind: 'burst', who: 0 } as IArenaEvent)).toBe(false)
  })

  it('leaves casts without an animation to the plain drawing', () => {
    const covers = coversOf(
      replay([
        { t: 10, kind: 'skill', who: 1, skill: 'ตะปบ' },
        { t: 10, kind: 'zone', who: 1, x: 1, y: 2 },
      ]),
      animates
    )
    expect(covers({ t: 10, kind: 'skill', who: 1, skill: 'ตะปบ' } as IArenaEvent)).toBe(false)
    expect(covers({ t: 10, kind: 'zone', who: 1 } as IArenaEvent)).toBe(false)
  })

  it('covers basic hits (they have their own impact) and skips events without a fighter', () => {
    const covers = coversOf(replay([]), animates)
    expect(covers({ t: 5, kind: 'hit', who: 1, skill: BASIC_NAME } as IArenaEvent)).toBe(true)
    expect(covers({ t: 5, kind: 'burst' } as IArenaEvent)).toBe(false)
  })
})

describe('fightPxOf', () => {
  it('keeps the usual scale outside a boss fight', () => {
    expect(fightPxOf(64, false, false)).toBe(pxOf(64))
    expect(fightPxOf(96, true, false)).toBe(pxOf(96))
  })

  it('draws monsters smaller and the boss bigger in a boss fight', () => {
    expect(fightPxOf(64, false, true)).toBeCloseTo(pxOf(64) * BOSS_FIGHT_MONSTER_K)
    expect(fightPxOf(96, true, true)).toBeCloseTo(pxOf(96) * BOSS_FIGHT_BOSS_K)
    // a boss ends up well over twice a monster's size per sprite pixel
    expect(fightPxOf(96, true, true) / fightPxOf(64, false, true)).toBeGreaterThan(1.4)
  })

  it('caps a very long boss so it still fits the arena, never below its usual scale', () => {
    const k = fightPxOf(168, true, true)
    expect(168 * k).toBeLessThanOrEqual(230)
    expect(k).toBeGreaterThanOrEqual(pxOf(168))
  })
})
