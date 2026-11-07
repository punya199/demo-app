import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EnumMonsterStage, IWikiData } from '../core/tamagotchi-interface'
import { SkillsWikiTab } from './WikiSkills'

const wiki = {
  arena: {
    skilledStages: [
      EnumMonsterStage.ADULT,
      EnumMonsterStage.PERFECT,
      EnumMonsterStage.ULTIMATE,
      EnumMonsterStage.FUSED,
    ],
    skillDelaySec: 1.35,
  },
} as unknown as IWikiData

describe('SkillsWikiTab', () => {
  it('explains who has skills, the equip rules, the shared delay and every skill kind', () => {
    render(<SkillsWikiTab wiki={wiki} />)
    expect(screen.getByText(/ไข่และร่างเด็กสู้ด้วยตีธรรมดาอย่างเดียว/)).toBeTruthy()
    expect(screen.getByText(/สกิลพาสซีฟใส่ได้เพียง 1 ในทั้งชุด/)).toBeTruthy()
    expect(screen.getByText(/ทุกสกิลต้องรอ 1\.35 วินาที/)).toBeTruthy()
    // One row per skill kind, e.g. the dodge and the zone.
    expect(screen.getByText('สกิลหลบ')).toBeTruthy()
    expect(screen.getByText('วงพื้นที่')).toBeTruthy()
  })
})
