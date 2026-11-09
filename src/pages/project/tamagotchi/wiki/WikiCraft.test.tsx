import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EnumEquipmentGrade, EnumMonsterStage, IWikiData } from '../core/tamagotchi-interface'
import { CraftWikiTab } from './WikiCraft'
import { StatusEffectsSection } from './WikiStatus'

// A trimmed copy of what GET /monster/wiki sends for the parts these two sections read.
const wiki = {
  idle: { expeditionDropEveryMinutes: 240 },
  adventure: {
    areas: [
      { id: 'coast', name: 'ชายฝั่ง', emoji: '🏖️' },
      { id: 'meadow', name: 'ทุ่งหญ้า', emoji: '🌾' },
    ],
  },
  equipment: {
    capacity: 200,
    gradeMultiplier: { legendary: 3, mythic: 3 },
    subStatCount: { legendary: { min: 3, max: 4 }, mythic: { min: 4, max: 5 } },
    minStageByGrade: { mythic: EnumMonsterStage.PERFECT },
    special: {
      totalCapMultiplier: 2,
      byGrade: { mythic: { chance: 1, secondChance: 0.25, lo: 0.95, hi: 1, guaranteed: 2 } },
    },
    sets: {
      bulwark: {
        name: 'ชุดปราการศิลา',
        bonuses: [
          { pieces: 2, pct: { def: 0.1 } },
          { pieces: 4, effect: { damageCut: 0.11 } },
        ],
      },
      caretaker: {
        name: 'ชุดผู้ดูแล',
        bonuses: [
          { pieces: 2, pct: { hp: 0.05 }, care: { slowHunger: 10, tidyPet: 15 } },
          { pieces: 4, effect: { regenPct: 0.13 } },
        ],
      },
    },
  },
  craft: {
    tiers: {
      standard: {
        coin: 300,
        minutes: 30,
        baseGrade: EnumEquipmentGrade.EPIC,
        maxGrade: EnumEquipmentGrade.LEGENDARY,
      },
      flagship: {
        coin: 800,
        minutes: 240,
        baseGrade: EnumEquipmentGrade.LEGENDARY,
        maxGrade: EnumEquipmentGrade.MYTHIC,
      },
    },
    catalystChance: 0.15,
    pityAfterFails: 8,
    skipCoinMultiplier: 2,
    adventureEssence: { chance: 0.06, min: 1, max: 2, areaElement: { coast: 'tide' } },
    raidCores: { normal: 1, hard: 2, nightmare: 3 },
    worldBoss: { unique: 1, catalyst: 1, topRank: 3, topUnique: 1, topCatalyst: 1 },
    materials: [
      {
        id: 'craft_essence_earth',
        name: 'เอสเซนซ์ดิน',
        emoji: '🪨',
        description: '',
        source: 'adventure',
        tier: 'common',
      },
      {
        id: 'craft_forge_core',
        name: 'แกนหลอมศึก',
        emoji: '⚒️',
        description: '',
        source: 'raid',
        tier: 'rare',
      },
      {
        id: 'craft_catalyst',
        name: 'ตัวเร่งคราฟต์',
        emoji: '🧿',
        description: '',
        source: 'world_boss',
        tier: 'catalyst',
      },
    ],
    sets: [
      {
        id: 'bulwark',
        name: 'ชุดปราการศิลา',
        style: 'tank',
        flagship: false,
        care: false,
        essence: 'earth',
        rare: 'forge',
        unique: null,
      },
      {
        id: 'caretaker',
        name: 'ชุดผู้ดูแล',
        style: 'care',
        flagship: false,
        care: true,
        essence: 'holy',
        rare: 'rune',
        unique: null,
      },
    ],
  },
  arena: {
    maxResist: 70,
    statuses: {
      static: {
        label: 'ไฟฟ้าสถิต',
        icon: '⚡',
        kind: 'debuff',
        note: 'มีโอกาส 30% ชะงัก 0.4 วินาที',
      },
      stun: { label: 'สตัน', icon: '💫', kind: 'debuff', cc: true, note: 'ทำอะไรไม่ได้เลย' },
      haste: { label: 'เร่งความเร็ว', icon: '💨', kind: 'buff', note: 'เดินเร็วขึ้น 30%' },
    },
    statusNumbers: { ccWindowSec: 6, ccSteps: [100, 50, 0], poisonMaxStacks: 3 },
  },
} as unknown as IWikiData

describe('CraftWikiTab', () => {
  it('shows tiers, Catalyst, Mythic, materials with sources and the craft sets', () => {
    render(<CraftWikiTab wiki={wiki} />)
    expect(screen.getByText(/อัปเกรดพลาดติดกัน 8 ครั้ง/)).toBeTruthy()
    expect(screen.getByText(/เกรด มิธิก/)).toBeTruthy()
    expect(screen.getByText('🧿 ตัวเร่งคราฟต์')).toBeTruthy()
    expect(screen.getByText(/กล่องปริศนาไซส์ M/)).toBeTruthy()
    // The earth essence is used by Bulwark only; the area list falls back to "random".
    expect(screen.getAllByText('ชุดปราการศิลา').length).toBeGreaterThan(0)
    expect(screen.getByText(/ทุ่งหญ้า → สุ่ม/)).toBeTruthy()
    // Care set: the 2-piece perks are shown next to the % bonus.
    expect(screen.getByText(/หิวช้าลง 10% · อึน้อยลง 15%/)).toBeTruthy()
  })
})

describe('StatusEffectsSection', () => {
  it('lists every status with its kind and explains repeated crowd control', () => {
    render(<StatusEffectsSection arena={wiki.arena} />)
    expect(screen.getByText('⚡ ไฟฟ้าสถิต')).toBeTruthy()
    expect(screen.getByText('มีโอกาส 30% ชะงัก 0.4 วินาที')).toBeTruthy()
    expect(screen.getByText('คุมตัว (CC)')).toBeTruthy()
    expect(screen.getByText('💨 เร่งความเร็ว')).toBeTruthy()
    expect(screen.getByText(/100% → 50% → ไม่ติด/)).toBeTruthy()
  })
})
