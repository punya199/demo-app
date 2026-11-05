import { describe, expect, it } from 'vitest'
import {
  canEquipSkill,
  describeArenaEvent,
  fighterCooldowns,
  skillNumbers,
  skillTags,
} from './arena-helper'
import { IArenaSkill, IArenaStatusInfo, StatusId } from './arena-interface'

const skill = (over: Partial<IArenaSkill>): IArenaSkill => ({
  id: 'x',
  name: 'x',
  icon: '🔥',
  el: 'flame',
  src: 'flame_adultGood',
  slot: 'active',
  kind: 'melee',
  cd: 6,
  wind: 8,
  power: 150,
  hits: 1,
  ...over,
})

describe('arena helper', () => {
  it('offers only the pet element, neutral skills and one passive', () => {
    const pet = { elements: ['flame'], innate: 'tail' }
    expect(canEquipSkill(pet, skill({ id: 'a' }), [])).toBe(true)
    expect(canEquipSkill(pet, skill({ id: 'b', el: 'tide' }), [])).toBe(false)
    expect(canEquipSkill(pet, skill({ id: 'c', el: 'neutral' }), [])).toBe(true)
    expect(canEquipSkill(pet, skill({ id: 'tail' }), [])).toBe(false)
    const passive = skill({ id: 'p', slot: 'passive', kind: 'passive' })
    expect(
      canEquipSkill(pet, passive, [skill({ id: 'q', slot: 'passive', kind: 'passive' })])
    ).toBe(false)
    expect(
      canEquipSkill(pet, skill({ id: 'd', el: 'neutral', slot: 'dodge', kind: 'dodge' }), [])
    ).toBe(true)
  })

  it('tags trade-offs from the numbers', () => {
    const heavy = skillTags(skill({ power: 250, cd: 11, wind: 14 })).map(([t]) => t)
    expect(heavy).toEqual(
      expect.arrayContaining(['แรง', 'คูลดาวน์นาน', 'ร่ายนาน หลบง่าย', 'ต้องประชิด'])
    )
    const dodge = skillTags(
      skill({ slot: 'dodge', kind: 'dodge', dodge: { cd: 2, chance: -12 } })
    ).map(([t]) => t)
    // The arena never lets a dodge come back faster than 4 seconds.
    expect(dodge).toEqual(['คูลดาวน์สั้น', 'หลบยาก'])
    expect(skillNumbers(skill({ slot: 'dodge', kind: 'dodge', dodge: { cd: 2, chance: 0 } }))).toBe(
      'คูลดาวน์ 4 วิ'
    )
  })

  it('reads cooldowns from a replay frame row', () => {
    const skills = {
      fire: skill({ id: 'fire', name: 'ไฟ', cd: 10 }),
      step: skill({
        id: 'step',
        name: 'ก้าว',
        icon: '💨',
        slot: 'dodge',
        kind: 'dodge',
        dodge: { cd: 2, chance: 0 },
      }),
    }
    // Eleven fixed fields, the dodge cooldown last, then one cooldown per active skill (in ticks).
    const row = [0, 0, 100, 0, -1, 0, 0, 1, 0, 0, 40, 100, 0]
    const cooldowns = fighterCooldowns(row, { skills: ['fire', 'unknown'], dodge: 'step' }, skills)
    expect(cooldowns).toEqual([
      { id: 'fire', name: 'ไฟ', icon: '🔥', left: 5, fraction: 0.5 },
      { id: 'unknown', name: 'unknown', icon: '✨', left: 0, fraction: 0 },
      // The dodge's 2 second cooldown counts as the arena's 4 second minimum.
      { id: 'step', name: 'ก้าว', icon: '💨', left: 2, fraction: 0.5 },
    ])
    // The shared skill delay can hold a skill past its own cooldown; the fill stays full.
    expect(
      fighterCooldowns([...row.slice(0, 11), 400], { skills: ['fire'], dodge: null }, skills)[0]
        .fraction
    ).toBe(1)
  })

  it('describes replay events', () => {
    const statuses = { burn: { label: 'เผาไหม้', icon: '🔥', kind: 'debuff', note: '' } } as Record<
      StatusId,
      IArenaStatusInfo
    >
    const fighters = [{ name: 'A' }, { name: 'B' }] as never
    expect(
      describeArenaEvent(
        { t: 1, kind: 'hit', who: 0, target: 1, dmg: 12, skill: 'หางเพลิง', crit: true },
        fighters,
        statuses
      )
    ).toEqual(['crit', 'หางเพลิง ของA โดนB 12 (คริติคอล!)'])
    expect(
      describeArenaEvent({ t: 1, kind: 'dot', who: 1, st: 'burn', dmg: 3 }, fighters, statuses)?.[1]
    ).toBe('B เสีย 3 จากเผาไหม้')
    expect(
      describeArenaEvent({ t: 1, kind: 'thorns', who: 0, by: 1, dmg: 4 }, fighters, statuses)?.[1]
    ).toBe('A โดนสะท้อน 4 จากB')
    expect(describeArenaEvent({ t: 1, kind: 'burst' }, fighters, statuses)).toBeNull()
  })
})
