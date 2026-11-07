import { describe, expect, it } from 'vitest'
import { groupArenaStats } from './status-tabs'
import { IArenaStats } from './tamagotchi-interface'

const NONE: IArenaStats = {
  fightHp: 0,
  eva: 0,
  acc: 0,
  res: 0,
  attackSpeed: 0,
  cdCut: 0,
  doubleStrike: 0,
  firstStrike: false,
  executeBonus: 0,
  burnChance: 0,
  burnBonus: 0,
  poisonBonus: 0,
  onBasic: [],
  afterDodgeBonus: 0,
  noCrit: false,
  regenPct: 0,
  regenPerSec: 0,
  lifesteal: 0,
  thorns: 0,
  damageCut: 0,
  startShield: 0,
  periodicShield: null,
  lastStand: null,
  dodgeCdCut: 0,
  retort: 0,
}

describe('groupArenaStats', () => {
  it('leaves every tab empty for a pet with nothing', () => {
    expect(groupArenaStats(NONE)).toEqual({ offense: [], defense: [], other: [] })
  })

  it('puts regen and lifesteal under defense and attack speed under offense', () => {
    const groups = groupArenaStats({
      ...NONE,
      regenPct: 1.5,
      regenPerSec: 18,
      lifesteal: 6,
      attackSpeed: 12,
    })
    expect(groups.defense.map((row) => row.label)).toEqual(['ฟื้น HP ต่อวินาที', 'ดูดเลือด'])
    expect(groups.defense[0].value).toContain('18/วิ')
    expect(groups.offense.map((row) => row.label)).toEqual(['ความเร็วโจมตี'])
  })

  it('names the status a basic attack applies and skips zero chances', () => {
    const groups = groupArenaStats({
      ...NONE,
      onBasic: [
        { status: 'stun', chance: 10 },
        { status: 'poison', chance: 0 },
      ],
    })
    expect(groups.offense).toEqual([{ label: 'ตีธรรมดาติดสตัน', value: '10%', hint: undefined }])
  })

  it('shows the fight HP on the other tab', () => {
    expect(groupArenaStats({ ...NONE, fightHp: 4200 }).other[0].value).toBe('4200')
  })
})
