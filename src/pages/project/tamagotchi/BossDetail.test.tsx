import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { BossSkills, BossStats, RaidStatTable } from './BossDetail'
import { defCutPct, describeDef } from './tamagotchi-helper'
import { IBossDetail, IRaidDifficultyInfo } from './tamagotchi-interface'

const detail: IBossDetail = {
  stats: { hp: 5200, atk: 148, def: 60, spd: 34 },
  defReductionPct: 60,
  skills: [
    {
      id: 'e_volcano',
      name: 'ลมหายใจภูเขาไฟ',
      icon: '🌋',
      element: 'flame',
      kind: 'beam',
      slot: 'active',
      cooldown: 9,
      description: 'ประเภท: ลำแสง',
    },
  ],
  passives: ['สะท้อนดาเมจ 15%'],
  dodge: null,
}

describe('boss detail', () => {
  it('shows ATK, DEF with the damage it cuts, and SPD', () => {
    render(<BossStats detail={detail} showHp={false} />)
    expect(screen.getByText('148')).toBeTruthy()
    expect(screen.getByText('ลดดาเมจ 60%')).toBeTruthy()
    expect(screen.queryByText('HP')).toBeNull()
  })

  it('lists the skills and passive traits', () => {
    render(<BossSkills detail={detail} />)
    expect(screen.getByLabelText('ลมหายใจภูเขาไฟ')).toBeTruthy()
    expect(screen.getByText('สะท้อนดาเมจ 15%')).toBeTruthy()
  })

  it('compares every difficulty side by side', () => {
    const difficulties = ['normal', 'hard'].map((difficulty, index) => ({
      difficulty,
      defReductionPct: 60 + index * 10,
      enemy: { stats: { hp: 100 * (index + 1), atk: 10, def: 60, spd: 5 } },
    })) as unknown as IRaidDifficultyInfo[]
    render(<RaidStatTable difficulties={difficulties} />)
    expect(screen.getByText('Normal')).toBeTruthy()
    expect(screen.getByText('Hard')).toBeTruthy()
    expect(screen.getByText('(−70%)')).toBeTruthy()
  })
})

describe('defCutPct', () => {
  it('is DEF / (DEF + K), capped', () => {
    expect(defCutPct(0, 40, 0.75)).toBe(0)
    expect(defCutPct(40, 40, 0.75)).toBe(50)
    expect(defCutPct(10_000, 40, 0.75)).toBe(75)
    expect(describeDef(60, 60)).toBe('DEF 60 (ลดดาเมจ 60%)')
  })
})
