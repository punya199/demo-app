import { describe, expect, it } from 'vitest'
import {
  getShopBlocker,
  describeBattleEvent,
  hpAfter,
  describeWorldBossReward,
  describeSetEffect,
  getWorldBossBlocker,
  formatFriendCode,
  getRaidBlocker,
  pickRefineTier,
  describePctBonus,
  formatRatingChange,
  formatTimeLeft,
  getDefenseBlocker,
  getGiftBlocker,
  getSupportBlocker,
  getPvpBlocker,
} from '.'
import {
  EnumEquipmentGrade,
  EnumMonsterLine,
  EnumMonsterStage,
  IBattleData,
  IBattleEvent,
} from '../tamagotchi-interface'
import { monster } from './test-fixtures'

describe('pickRefineTier', () => {
  const tiers = [
    { material: 'c', maxLevel: 4, coin: 50 },
    { material: 'r', maxLevel: 8, coin: 100 },
    { material: 'e', maxLevel: 12, coin: 200 },
  ]
  const owns =
    (...owned: string[]) =>
    (material: string) =>
      owned.includes(material) ? 1 : 0

  it('spends the lowest owned tier that covers the enhance level', () => {
    expect(pickRefineTier(tiers, 3, owns('c', 'e'))?.material).toBe('c')
    expect(pickRefineTier(tiers, 3, owns('e', 'r'))?.material).toBe('r')
    expect(pickRefineTier(tiers, 5, owns('c', 'r'))?.material).toBe('r')
    expect(pickRefineTier(tiers, 12, owns('c', 'r', 'e'))?.material).toBe('e')
  })

  it('is null when no owned stone reaches the level', () => {
    expect(pickRefineTier(tiers, 5, owns('c'))).toBeNull()
    expect(pickRefineTier(tiers, 13, owns('c', 'r', 'e'))).toBeNull()
    expect(pickRefineTier(tiers, 0, owns())).toBeNull()
  })
})

describe('getPvpBlocker', () => {
  const status = (overrides = {}) =>
    ({
      season: '2026-05',
      resetsAt: '',
      rating: 1000,
      wins: 0,
      losses: 0,
      rank: null,
      attemptsLeft: 10,
      defense: { displayName: 'x', fighter: {}, stage: 'adult', setAt: '', readyAt: '' },
      claimableSeasons: [],
      ...overrides,
    }) as never

  it('mirrors the server order of checks', () => {
    expect(getPvpBlocker(monster(), status())).toBeNull()
    expect(getPvpBlocker(null, status())).toBe('ต้องมีมอนที่มีชีวิต')
    expect(getPvpBlocker(monster({ stage: EnumMonsterStage.BABY_2 }), status())).toBe(
      'ต้องเป็นร่างโตขึ้นไปถึงเข้าสนามได้'
    )
    expect(getPvpBlocker(monster({ isSick: true }), status())).toBe('ป่วยอยู่ สู้ไม่ได้')
    expect(getPvpBlocker(monster({ expeditionAreaId: 'meadow' }), status())).toBe('มอนออกสำรวจอยู่')
    expect(getPvpBlocker(monster(), status({ defense: null }))).toBe('ตั้งทีมป้องกันก่อน')
    expect(getPvpBlocker(monster(), status({ attemptsLeft: 0 }))).toBe('ท้าครบจำนวนของวันนี้แล้ว')
  })

  it('explains the defense cooldown and ineligible forms', () => {
    const now = new Date('2026-01-01T00:10:00Z')
    const cooling = status({ defense: { readyAt: '2026-01-01T00:30:00Z' } })
    expect(getDefenseBlocker(monster(), cooling, now)).toBe(
      'เปลี่ยนทีมป้องกันได้อีกครั้งใน 20 นาที'
    )
    expect(getDefenseBlocker(monster(), status(), now)).toBeNull()
    expect(getDefenseBlocker(monster({ stage: EnumMonsterStage.FUSED }), status(), now)).toBeNull()
    expect(getDefenseBlocker(monster({ stage: EnumMonsterStage.EGG }), status(), now)).toBe(
      'ต้องเป็นร่างโตขึ้นไปถึงเข้าสนามได้'
    )
  })

  it('formats a rating change with its sign', () => {
    expect(formatRatingChange(1000, 1016)).toBe('1000 → 1016 (+16)')
    expect(formatRatingChange(1000, 992)).toBe('1000 → 992 (-8)')
  })
})

describe('set effects in replays', () => {
  const player = { name: 'เรา', emoji: '🦎', element: EnumMonsterLine.FLAME } as never
  const enemy = { name: 'บอส', emoji: '👹', element: EnumMonsterLine.LEAF } as never
  const battle = { player, enemy } as unknown as IBattleData
  const event = (overrides: Partial<IBattleEvent>): IBattleEvent => ({
    round: 1,
    actor: 'player',
    moveName: 'โจมตี',
    isSkill: false,
    damage: 7,
    isCritical: false,
    effectiveness: 'normal',
    targetHp: 50,
    ...overrides,
  })

  it('describes a burn tick against the side opposite to the actor', () => {
    expect(describeBattleEvent(event({ kind: 'burn', actor: 'player' }), battle)).toBe(
      'บอส ติดเผาไหม้ เสีย 7 HP'
    )
  })

  it('describes regeneration as healing the opposite side of the actor', () => {
    expect(describeBattleEvent(event({ kind: 'regen', actor: 'enemy' }), battle)).toBe(
      'เรา ฟื้นฟู +7 HP'
    )
  })

  it('names a double strike and mentions shield absorption', () => {
    expect(describeBattleEvent(event({ kind: 'double' }), battle)).toContain('โจมตีซ้ำ')
    expect(describeBattleEvent(event({ absorbed: 4 }), battle)).toContain('โล่ดูด 4')
  })

  it('writes effects and percent bonuses in Thai', () => {
    expect(describeSetEffect({ burnTurns: 1.6, burnBonus: 0.1 })).toBe(
      'ตีปกติมีโอกาส 30% ทำให้ติดเผาไหม้ 1.6 วิ · ตีศัตรูที่ติดเผาไหม้แรงขึ้น 10%'
    )
    expect(describeSetEffect({ shieldPct: 0.04, shieldRefresh: 0.04 })).toBe(
      'เริ่มสู้ด้วยโล่ 4% ของ HP · ได้โล่ 4% ของ HP ทุก 12 วิ'
    )
    expect(describeSetEffect({ regenPct: 0.00135 })).toBe('ฟื้น HP 0.14% ของ HP สูงสุดทุกวินาที')
    expect(describeSetEffect({ evasion: 0.15, dodgeCdCutSec: 4, afterDodgeBonus: 0.85 })).toBe(
      'EVA +15 · คูลดาวน์สกิลหลบลดลง 4 วิ · หลบได้แล้ว การโจมตีครั้งถัดไปติดคริและแรงขึ้น 85%'
    )
    expect(describeSetEffect({ lastStandShield: 0.14 })).toContain('ต่ำกว่า 35% ได้โล่ 14%')
    expect(describeSetEffect({ cooldownCut: 0.18 })).toBe('คูลดาวน์สกิลสั้นลง 18%')
    expect(describeSetEffect({})).toBe('')
    expect(describePctBonus({ atk: 0.15, def: 0 })).toBe('ATK +15%')
  })
})

describe('getRaidBlocker', () => {
  const open = { unlocked: true }

  it('mirrors the server checks in order', () => {
    expect(getRaidBlocker(monster(), open, 3)).toBeNull()
    expect(getRaidBlocker(null, open, 3)).toBe('ต้องมีมอนที่มีชีวิต')
    expect(getRaidBlocker(monster({ isSick: true }), open, 3)).toBe('ป่วยอยู่ สู้ไม่ได้')
    expect(getRaidBlocker(monster({ expeditionAreaId: 'meadow' }), open, 3)).toBe('มอนออกสำรวจอยู่')
    expect(getRaidBlocker(monster(), { unlocked: false }, 3)).toContain('ยังไม่ปลดล็อก')
    expect(getRaidBlocker(monster(), open, 0)).toBe('สู้บอสครบจำนวนแล้ว รอรีเซ็ต')
  })

  it('names the currency in the shop blocker', () => {
    expect(getShopBlocker(6, 5, 'Raid Token')).toBe('Raid Tokenไม่พอ')
    expect(getShopBlocker(6, 6, 'Raid Token')).toBeNull()
  })
})

describe('getWorldBossBlocker', () => {
  const status = (overrides = {}) =>
    ({
      week: '2026-W19',
      endsAt: '2026-05-10T17:00:00Z',
      boss: {
        id: 'storm_golem',
        name: 'x',
        emoji: 'x',
        setId: 's',
        setName: 's',
        element: 'lightning',
        shield: 0,
        enrage: null,
        hp: 100,
        maxHp: 100,
        isDefeated: false,
      },
      hitsLeft: 3,
      participants: 0,
      myDamage: 0,
      myHits: 0,
      myRank: null,
      claimable: [],
      ...overrides,
    }) as never

  it('mirrors the server order of checks', () => {
    expect(getWorldBossBlocker(monster(), status())).toBeNull()
    expect(getWorldBossBlocker(null, status())).toBe('ต้องมีมอนที่มีชีวิต')
    expect(getWorldBossBlocker(monster({ stage: EnumMonsterStage.BABY_2 }), status())).toBe(
      'ต้องเป็นร่างโตขึ้นไปถึงตีบอสโลกได้'
    )
    expect(getWorldBossBlocker(monster({ isSick: true }), status())).toBe('ป่วยอยู่ สู้ไม่ได้')
    expect(getWorldBossBlocker(monster({ expeditionAreaId: 'meadow' }), status())).toBe(
      'มอนออกสำรวจอยู่'
    )
    expect(
      getWorldBossBlocker(monster(), status({ boss: { isDefeated: true, hp: 0, maxHp: 100 } }))
    ).toBe('บอสตัวนี้ถูกล้มแล้ว รอบอสสัปดาห์หน้า')
    expect(getWorldBossBlocker(monster(), status({ hitsLeft: 0 }))).toBe('ตีครบจำนวนแล้ว รอรีเซ็ต')
  })

  it('describes a reward and the time left', () => {
    expect(
      describeWorldBossReward({
        coin: 100,
        raidToken: 3,
        bossToken: 0,
        pieceGrade: null,
        refineStones: {},
      })
    ).toBe('🪙 100 · 🎖️ 3')
    expect(
      describeWorldBossReward({
        coin: 50,
        raidToken: 0,
        bossToken: 2,
        pieceGrade: EnumEquipmentGrade.EPIC,
        refineStones: { refine_stone_epic: 2, refine_stone_legendary: 1 },
      })
    ).toBe('🪙 50 · 🎫 2 · ชิ้นเซ็ต (มหากาพย์) · 💠 รีไฟน์มหากาพย์ ×2 · 💠 รีไฟน์ตำนาน ×1')
    const now = new Date('2026-05-04T00:00:00Z')
    expect(formatTimeLeft('2026-05-06T03:00:00Z', now)).toBe('2 วัน 3 ชม.')
    expect(formatTimeLeft('2026-05-04T05:30:00Z', now)).toBe('5 ชม. 30 นาที')
    expect(formatTimeLeft('2026-05-03T00:00:00Z', now)).toBe('0 นาที')
  })
})

describe('friends and rental helpers', () => {
  it('groups a friend code for reading aloud', () => {
    expect(formatFriendCode('ABCD2345')).toBe('ABCD-2345')
  })

  it('explains why a support unit cannot be set yet', () => {
    const now = new Date('2026-01-01T00:10:00Z')
    expect(getSupportBlocker(monster(), null, now)).toBeNull()
    expect(getSupportBlocker(monster({ stage: EnumMonsterStage.FUSED }), null, now)).toBeNull()
    expect(getSupportBlocker(monster({ stage: EnumMonsterStage.BABY_2 }), null, now)).toBe(
      'ต้องเป็นร่างโตขึ้นไปถึงตั้งเป็นตัวซัพพอร์ตได้'
    )
    const cooling = { readyAt: '2026-01-01T00:30:00Z' } as never
    expect(getSupportBlocker(monster(), cooling, now)).toBe(
      'เปลี่ยนตัวซัพพอร์ตได้อีกครั้งใน 20 นาที'
    )
  })

  it('needs a gift left today and an item to give', () => {
    expect(getGiftBlocker(3, 2)).toBeNull()
    expect(getGiftBlocker(0, 2)).toBe('ส่งของขวัญครบจำนวนของวันนี้แล้ว')
    expect(getGiftBlocker(3, 0)).toBe('ไม่มีไอเทมในกระเป๋าให้ส่ง')
  })
})

describe('team replays with a rented ally', () => {
  const fighter = (name: string) => ({ name, emoji: name, element: EnumMonsterLine.FLAME }) as never
  const battle = {
    player: fighter('me'),
    team: [fighter('me'), fighter('ally')],
    enemy: fighter('boss'),
  } as unknown as IBattleData
  const event = (overrides: Partial<IBattleEvent>): IBattleEvent => ({
    round: 1,
    actor: 'player',
    moveName: 'โจมตี',
    isSkill: false,
    damage: 9,
    isCritical: false,
    effectiveness: 'normal',
    targetHp: 100,
    member: 0,
    ...overrides,
  })

  it('names the ally when the ally attacks', () => {
    expect(describeBattleEvent(event({ member: 1 }), battle)).toContain('ally')
    expect(describeBattleEvent(event({ member: 0 }), battle)).toContain('me')
  })

  it('keeps the player’s HP bar on the player, not on hits to the ally', () => {
    const events = [
      event({ actor: 'enemy', member: 0, targetHp: 80 }),
      event({ actor: 'enemy', member: 1, targetHp: 30 }),
    ]
    expect(hpAfter(events, 2, 'player', 100)).toBe(80)
    // the boss's bar follows everyone who hit it
    const hitsOnBoss = [event({ member: 0, targetHp: 900 }), event({ member: 1, targetHp: 850 })]
    expect(hpAfter(hitsOnBoss, 2, 'enemy', 1000)).toBe(850)
  })
})
