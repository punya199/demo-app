import { describe, expect, it } from 'vitest'
import { IArenaEvent, IArenaFighterSummary, IArenaReplay, IArenaSkill } from '../arena-interface'
import { ACT } from '../replay-anim'
import { flourishTierOf, skillTierPct } from './flourish'
import { fxs, scene } from './runtime'
import { createSkillStage, flourishOf, IStagePlace } from './stage'

const skill = (over: Partial<IArenaSkill>) =>
  ({
    id: 'x',
    name: 'x',
    el: 'flame',
    slot: 'active',
    kind: 'shot',
    src: 'flame_adultGood',
    ...over,
  }) as IArenaSkill

describe('skill tiers for the flourish', () => {
  it('matches the backend tiers by the form that carries the skill', () => {
    expect(skillTierPct('flame_baby2')).toBe(75)
    expect(skillTierPct('tide_adultPoor')).toBe(100)
    expect(skillTierPct('leaf_perfectAlt')).toBe(120)
    expect(skillTierPct('lightning_ultimateAlt')).toBe(140)
    expect(skillTierPct('fused_flame_tide')).toBe(160)
    expect(skillTierPct('enemy')).toBe(100)
  })

  it('adds nothing up to Adult, and nothing to passives or dodges', () => {
    expect(flourishTierOf('flame_adultGood', 'active')).toBe(0)
    expect(flourishTierOf('flame_baby2', 'active')).toBe(0)
    expect(flourishTierOf('flame_perfectGood', 'active')).toBe(1)
    expect(flourishTierOf('flame_ultimate', 'active')).toBe(2)
    expect(flourishTierOf('fused_flame_flame', 'active')).toBe(3)
    expect(flourishTierOf('flame_ultimateAlt', 'passive')).toBe(0)
  })

  it('colours a Fused skill with its other line, or gold for an awakened one', () => {
    expect(flourishOf(skill({ src: 'fused_flame_tide', el: 'flame' }))?.els).toEqual([
      'fire',
      'water',
    ])
    expect(flourishOf(skill({ src: 'fused_earth_lightning', el: 'earth' }))?.els).toEqual([
      'earth',
      'bolt',
    ])
    expect(flourishOf(skill({ src: 'fused_holy_holy', el: 'holy' }))?.els).toEqual(['holy', 'gold'])
    expect(flourishOf(skill({ src: 'flame_ultimate' }))?.els).toEqual(['fire'])
    expect(flourishOf(skill({ src: 'flame_adultGood' }))).toBeNull()
    expect(flourishOf(undefined)).toBeNull()
  })
})

// [x, y, hp, act, kind, actT, inv, face, shield, bits]
const row = (x: number, over: Partial<Record<number, number>> = {}) => {
  const r = [x, 15000, 100, ACT.MOVE, -1, 0, 0, 1, 0, 0]
  for (const [k, v] of Object.entries(over)) r[+k] = v as number
  return r
}
const replayOf = (id: string, name: string): IArenaReplay => ({
  seed: 1,
  winner: 0,
  ticks: 80,
  step: 1,
  frames: Array.from({ length: 80 }, (_, i) => ({
    f: [row(20000, i < 10 ? { 3: ACT.WIND, 4: 0, 5: 10 - i } : {}), row(30000)],
    p: [],
    z: [],
  })),
  events: [
    { t: 10, kind: 'skill', who: 0, skill: name },
    { t: 12, kind: 'hit', who: 0, target: 1, skill: name, dmg: 5 },
  ] as IArenaEvent[],
  fighters: [
    { idx: 0, team: 0, skills: [id], allSlots: [id], maxHp: 100, sprite: null },
    { idx: 1, team: 1, skills: [], allSlots: [], maxHp: 100 },
  ] as unknown as IArenaFighterSummary[],
  checksum: '',
})
const place = (x: number): IStagePlace => ({
  x,
  y: 120,
  flip: false,
  grow: 1,
  size: 48,
  foot: 44,
  mouth: [36, 20],
  hover: 0,
  hp: 100,
  hpMax: 100,
  dead: false,
})

// Plays a cast of a skill with no animation of its own and returns the most effects seen at once,
// and the strongest shake and flash (the release runs after a step, so a flash has mostly faded by
// the next read; shake lasts longer).
const play = async (s: IArenaSkill) => {
  const errors: unknown[] = []
  const stage = createSkillStage(
    replayOf(s.id, s.name),
    { [s.id]: s },
    400,
    300,
    (x, y) => ({ x: x / 100, y: y / 100 }),
    (err) => errors.push(err)
  )
  let most = 0,
    shake = 0,
    flash = 0
  for (let tick = 0; tick < 80; tick++) {
    stage.step(tick, [place(130), place(200)])
    // let the scripts' promise chains run, as frames do in the browser
    await new Promise((res) => setTimeout(res, 0))
    most = Math.max(most, fxs.length)
    shake = Math.max(shake, scene.shake)
    flash = Math.max(flash, scene.flashScreen)
  }
  if (errors.length) throw errors[0]
  return { most, shake, flash }
}

describe('flourish on the replay stage', () => {
  it('stays out of an Adult skill and grows with the tier', async () => {
    const adult = await play(skill({ id: 'zz_a', name: 'a', src: 'flame_adultGood' }))
    const perfect = await play(skill({ id: 'zz_p', name: 'p', src: 'flame_perfectGood' }))
    const ultimate = await play(skill({ id: 'zz_u', name: 'u', src: 'flame_ultimate' }))
    const fused = await play(skill({ id: 'zz_f', name: 'f', src: 'fused_flame_tide' }))
    expect(adult.most).toBe(0)
    expect(perfect.most).toBeGreaterThan(0)
    expect(ultimate.most).toBeGreaterThan(perfect.most)
    expect(fused.most).toBeGreaterThan(ultimate.most)
    expect(fused.shake).toBeGreaterThan(ultimate.shake)
    expect(ultimate.shake).toBeGreaterThan(perfect.shake)
  })

  it('raises a pillar for a self skill instead of a beam', async () => {
    const self = await play(skill({ id: 'zz_s', name: 's', kind: 'self', src: 'flame_ultimate' }))
    expect(self.most).toBeGreaterThan(0)
  })
})
