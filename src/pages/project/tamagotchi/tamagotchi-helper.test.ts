import { describe, expect, it } from 'vitest'
import {
  describeBattleEvent,
  describeConditions,
  describeMissingConditions,
  formatAge,
  getActionBlocker,
  getBattleBlocker,
  getEvolutionCountdown,
  getMinigameBlocker,
  describePctBonus,
  describeWorldBossReward,
  formatFriendCode,
  getGiftBlocker,
  getSupportBlocker,
  formatTimeLeft,
  getWorldBossBlocker,
  describeSetEffect,
  describeStats,
  formatRatingChange,
  getDefenseBlocker,
  getPvpBlocker,
  getRaidBlocker,
  getAutoBattleDelayMs,
  getEnhanceBlocker,
  getEquipBlocker,
  getExpeditionBlocker,
  getShopBlocker,
  getUseItemBlocker,
  hpAfter,
  isInZone,
  minigameBarPosition,
  toHearts,
  toThaiErrorMessage,
} from './tamagotchi-helper'
import {
  EnumEquipmentGrade,
  EnumMonsterAction,
  EnumMonsterLine,
  EnumMonsterStage,
  IBattleData,
  IBattleEvent,
  IEvolutionRuleInfo,
  IMonsterData,
} from './tamagotchi-interface'

const NOW = new Date('2026-01-01T03:00:00Z')

const monster = (overrides: Partial<IMonsterData> = {}): IMonsterData => ({
  id: 'monster-1',
  line: EnumMonsterLine.FLAME,
  speciesId: 'flame_adultGood',
  stage: EnumMonsterStage.ADULT,
  name: 'เพลิงจอมซน',
  emoji: '🦎',
  fullness: 4,
  strength: 4,
  weight: 20,
  poops: 1,
  stamina: 100,
  isSick: false,
  careMistakes: 0,
  trainCount: 0,
  wins: 0,
  losses: 0,
  ageMinutes: 0,
  bornAt: NOW.toISOString(),
  trainReadyAt: null,
  minigameReadyAt: null,
  autoBattleReadyAt: null,
  expeditionAreaId: null,
  expeditionMinutes: 0,
  expeditionReturned: false,
  expeditionPendingCoins: 0,
  expeditionPendingDrops: 0,
  evolution: {
    durationMinutes: 360,
    progressMinutes: 60,
    remainingMinutes: 300,
    onlineMultiplier: 2,
    next: null,
    rules: [],
    lifespanRemainingMinutes: 5000,
  },
  diedAt: null,
  deathCause: null,
  ...overrides,
})

describe('toHearts', () => {
  it('rounds partly-filled hearts up', () => {
    expect(toHearts(2.3)).toBe(3)
    expect(toHearts(0.01)).toBe(1)
    expect(toHearts(0)).toBe(0)
  })

  it('ignores float noise from the server', () => {
    expect(toHearts(3.0000001)).toBe(3)
  })
})

describe('formatAge', () => {
  it('formats minutes, hours and days', () => {
    expect(formatAge(42)).toBe('42 นาที')
    expect(formatAge(125)).toBe('2 ชม. 5 นาที')
    expect(formatAge(1440 * 2 + 180)).toBe('2 วัน 3 ชม.')
    expect(formatAge(240)).toBe('4 ชม.')
    expect(formatAge(1440 * 5)).toBe('5 วัน')
  })
})

describe('getActionBlocker', () => {
  it('allows care actions on an awake, healthy monster', () => {
    expect(getActionBlocker(monster(), EnumMonsterAction.FEED, NOW)).toBeNull()
    expect(getActionBlocker(monster(), EnumMonsterAction.TRAIN, NOW)).toBeNull()
  })

  it('blocks training during the cooldown', () => {
    const resting = monster({ trainReadyAt: new Date(NOW.getTime() + 30_000).toISOString() })
    expect(getActionBlocker(resting, EnumMonsterAction.TRAIN, NOW)).toBe('กำลังพักจากการฝึก')
  })

  it('only allows medicine when sick and cleaning when there is poop', () => {
    expect(getActionBlocker(monster(), EnumMonsterAction.MEDICINE, NOW)).toBe('ไม่ได้ป่วย')
    expect(getActionBlocker(monster({ isSick: true }), EnumMonsterAction.MEDICINE, NOW)).toBeNull()
    expect(getActionBlocker(monster({ poops: 0 }), EnumMonsterAction.CLEAN, NOW)).toBe(
      'สะอาดอยู่แล้ว'
    )
  })

  it('blocks everything on an egg or a dead monster', () => {
    const egg = monster({ stage: EnumMonsterStage.EGG })
    expect(getActionBlocker(egg, EnumMonsterAction.CLEAN, NOW)).toBe('ไข่ยังไม่ฟัก')
    const dead = monster({ diedAt: NOW.toISOString() })
    expect(getActionBlocker(dead, EnumMonsterAction.CLEAN, NOW)).toBe('มอนจากไปแล้ว')
  })
})

describe('toThaiErrorMessage', () => {
  it('translates known server messages and falls back for anything else', () => {
    expect(toThaiErrorMessage('Not enough gems')).toBe('เพชรไม่พอ')
    expect(toThaiErrorMessage('boom')).toBe('ทำรายการไม่สำเร็จ')
    expect(toThaiErrorMessage(undefined)).toBe('ทำรายการไม่สำเร็จ')
  })
})

describe('getBattleBlocker', () => {
  it('allows a ready monster and explains every refusal', () => {
    expect(getBattleBlocker(monster())).toBeNull()
    expect(getBattleBlocker(null)).toBe('ยังไม่มีมอน')
    expect(getBattleBlocker(monster({ isSick: true }))).toBe('ป่วยอยู่ สู้ไม่ได้')
  })

  it('still allows fighting with no strength or stamina (stats are halved instead)', () => {
    expect(getBattleBlocker(monster({ strength: 0, stamina: 0 }))).toBeNull()
  })
})

describe('getShopBlocker', () => {
  it('needs enough coins but no monster', () => {
    expect(getShopBlocker(15, 15)).toBeNull()
    expect(getShopBlocker(15, 14)).toBe('เหรียญไม่พอ')
  })
})

describe('getUseItemBlocker', () => {
  it('needs a hatched, living monster', () => {
    expect(getUseItemBlocker(monster())).toBeNull()
    expect(getUseItemBlocker(null)).toBe('ต้องมีมอนที่ฟักแล้ว')
    expect(getUseItemBlocker(monster({ stage: EnumMonsterStage.EGG }))).toBe('ต้องมีมอนที่ฟักแล้ว')
    expect(getUseItemBlocker(monster({ diedAt: '2026-01-01T00:00:00Z' }))).toBe(
      'ต้องมีมอนที่ฟักแล้ว'
    )
  })
})

const hit = (overrides: Partial<IBattleEvent>): IBattleEvent => ({
  round: 1,
  actor: 'player',
  moveName: 'โจมตี',
  isSkill: false,
  damage: 5,
  isCritical: false,
  effectiveness: 'normal',
  targetHp: 0,
  ...overrides,
})

describe('hpAfter', () => {
  const events = [
    hit({ actor: 'player', targetHp: 25 }),
    hit({ actor: 'enemy', targetHp: 32 }),
    hit({ actor: 'player', targetHp: 18 }),
  ]

  it('starts at full HP and follows the latest hit on that side', () => {
    expect(hpAfter(events, 0, 'enemy', 30)).toBe(30)
    expect(hpAfter(events, 1, 'enemy', 30)).toBe(25)
    expect(hpAfter(events, 1, 'player', 40)).toBe(40)
    expect(hpAfter(events, 3, 'enemy', 30)).toBe(18)
    expect(hpAfter(events, 3, 'player', 40)).toBe(32)
  })
})

describe('describeBattleEvent', () => {
  const fighter = (name: string) => ({
    name,
    emoji: '🧪',
    element: EnumMonsterLine.FLAME,
    stats: { hp: 10, atk: 1, def: 1, spd: 1 },
    skill: { name: 'skill', power: 1.6 },
  })
  const battle = { player: fighter('ถ่านน้อย'), enemy: fighter('หนอนใบไม้') } as IBattleData

  it('names the attacker, move and damage with any notes', () => {
    expect(describeBattleEvent(hit({ damage: 7 }), battle)).toBe('ถ่านน้อย ใช้ โจมตี 7 ดาเมจ')
    expect(
      describeBattleEvent(
        hit({
          actor: 'enemy',
          moveName: 'ใยเหนียว',
          damage: 12,
          effectiveness: 'strong',
          isCritical: true,
        }),
        battle
      )
    ).toBe('หนอนใบไม้ ใช้ ใยเหนียว 12 ดาเมจ (ได้เปรียบธาตุ! คริติคอล!)')
  })
})

describe('getEvolutionCountdown', () => {
  const evolution = monster().evolution

  it('converts remaining stage progress into online and offline time', () => {
    const fetchedAt = NOW.getTime()
    expect(getEvolutionCountdown(evolution, fetchedAt, NOW)).toEqual({
      percent: 17,
      onlineMinutes: 150,
      offlineMinutes: 300,
    })
  })

  it('keeps counting down at the online rate between polls', () => {
    const fetchedAt = NOW.getTime() - 10 * 60_000
    expect(getEvolutionCountdown(evolution, fetchedAt, NOW)).toMatchObject({
      onlineMinutes: 140,
      offlineMinutes: 280,
    })
  })

  it('has nothing to count for a final form', () => {
    const final = { ...evolution, durationMinutes: null, remainingMinutes: null }
    expect(getEvolutionCountdown(final, NOW.getTime(), NOW)).toBeNull()
  })
})

describe('evolution conditions', () => {
  const rule: IEvolutionRuleInfo = {
    to: { id: 'leaf_ultimate', name: 'เทพพนาลัย', emoji: '🌳', stage: EnumMonsterStage.ULTIMATE },
    maxCareMistakes: 1,
    minTrainCount: 10,
    minWins: 5,
    met: false,
  }

  it('describes a rule', () => {
    expect(describeConditions(rule)).toBe('ดูแลพลาด ≤ 1 · ฝึก ≥ 10 · ชนะรวม ≥ 5')
    expect(describeConditions({})).toBe('ไม่มีเงื่อนไข')
  })

  it('lists only what is still missing', () => {
    expect(describeMissingConditions(rule, monster({ trainCount: 7, wins: 5 }))).toEqual([
      'ฝึกอีก 3 ครั้ง',
    ])
    expect(
      describeMissingConditions(rule, monster({ careMistakes: 2, trainCount: 10, wins: 1 }))
    ).toEqual(['ดูแลพลาดเกินแล้ว (ได้ไม่เกิน 1 ครั้ง)', 'ชนะอีก 4 ครั้ง'])
  })
})

describe('mini-game helpers', () => {
  it('sweeps the bar 0 -> 100 -> 0 once per period', () => {
    expect(minigameBarPosition(0, 1000)).toBe(0)
    expect(minigameBarPosition(250, 1000)).toBe(50)
    expect(minigameBarPosition(500, 1000)).toBe(100)
    expect(minigameBarPosition(750, 1000)).toBe(50)
    expect(minigameBarPosition(1000, 1000)).toBe(0)
  })

  it('checks the zone inclusively', () => {
    const zone = { start: 40, width: 20 }
    expect(isInZone(40, zone)).toBe(true)
    expect(isInZone(60, zone)).toBe(true)
    expect(isInZone(39.9, zone)).toBe(false)
  })

  it('blocks the mini-game during its cooldown', () => {
    const readyAt = new Date(NOW.getTime() + 90_000).toISOString()
    expect(getMinigameBlocker(monster({ minigameReadyAt: readyAt }), NOW)).toBe(
      'เล่นได้อีกครั้งใน 2 นาที'
    )
    expect(getMinigameBlocker(monster(), NOW)).toBeNull()
  })
})

describe('getBattleBlocker', () => {
  it('blocks a monster that is out on an expedition', () => {
    expect(getBattleBlocker(monster({ expeditionAreaId: 'meadow' }))).toBe('มอนออกสำรวจอยู่')
  })
})

describe('getExpeditionBlocker', () => {
  it('needs a healthy, fed monster at home and an unlocked area', () => {
    expect(getExpeditionBlocker(monster(), true)).toBeNull()
    expect(getExpeditionBlocker(monster(), false)).toBe('ชนะบอสพื้นที่ก่อนหน้าก่อน')
    expect(getExpeditionBlocker(monster({ isSick: true }), true)).toBe(
      'มอนป่วยหรือหิว ดูแลก่อนออกสำรวจ'
    )
    expect(getExpeditionBlocker(monster({ fullness: 0 }), true)).toBe(
      'มอนป่วยหรือหิว ดูแลก่อนออกสำรวจ'
    )
    expect(getExpeditionBlocker(monster({ expeditionAreaId: 'meadow' }), true)).toBe(
      'มอนออกสำรวจอยู่แล้ว'
    )
    expect(getExpeditionBlocker(null, true)).toBe('ต้องมีมอนที่ฟักแล้ว')
  })
})

describe('getAutoBattleDelayMs', () => {
  it('waits for the cooldown and never goes negative', () => {
    const now = new Date('2026-01-01T00:00:30Z').getTime()
    expect(getAutoBattleDelayMs(monster({ autoBattleReadyAt: '2026-01-01T00:01:00Z' }), now)).toBe(
      30_000
    )
    expect(getAutoBattleDelayMs(monster({ autoBattleReadyAt: '2026-01-01T00:00:00Z' }), now)).toBe(
      0
    )
    expect(getAutoBattleDelayMs(monster(), now)).toBe(0)
    expect(getAutoBattleDelayMs(null, now)).toBe(0)
  })
})

describe('describeStats', () => {
  it('lists only the non-zero stats', () => {
    expect(describeStats({ hp: 0, atk: 3, def: 0, spd: 2 })).toBe('+3 ATK · +2 SPD')
    expect(describeStats({})).toBe('')
  })
})

describe('getEquipBlocker', () => {
  it('blocks gear changes while the monster is exploring', () => {
    expect(getEquipBlocker(monster())).toBeNull()
    expect(getEquipBlocker(null)).toBeNull()
    expect(getEquipBlocker(monster({ expeditionAreaId: 'meadow' }))).toBe('มอนออกสำรวจอยู่')
  })
})

describe('getEnhanceBlocker', () => {
  const item = {} as never
  const preview = {
    maxed: false as const,
    item,
    targetLevel: 6,
    baseRate: 0.8,
    rate: 0.8,
    onFail: 'material' as const,
    canProtect: false,
    cost: { coin: 360, stones: 2 },
  }
  const funds = { coin: 360, stones: 2, scrolls: 0 }

  it('needs enough coins, stones and (when asked) a scroll', () => {
    expect(getEnhanceBlocker(preview, funds, false)).toBeNull()
    expect(getEnhanceBlocker(preview, { ...funds, coin: 359 }, false)).toBe('เหรียญไม่พอ')
    expect(getEnhanceBlocker(preview, { ...funds, stones: 1 }, false)).toBe('หินตีบวกไม่พอ')
    expect(getEnhanceBlocker(preview, funds, true)).toBe('ไม่มีใบกันแตก')
    expect(getEnhanceBlocker({ maxed: true, item }, funds, false)).toBe('ตีบวกสูงสุดแล้ว')
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
    expect(describeSetEffect({ burnTurns: 3 })).toBe('สกิลทำให้ศัตรูติดเผาไหม้ 3 เทิร์น')
    expect(describeSetEffect({ shieldPct: 0.15 })).toContain('15%')
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
    expect(getRaidBlocker(monster(), open, 0)).toBe('สู้บอสครบจำนวนของวันนี้แล้ว')
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
    expect(getWorldBossBlocker(monster(), status({ hitsLeft: 0 }))).toBe('ตีครบจำนวนของวันนี้แล้ว')
  })

  it('describes a reward and the time left', () => {
    expect(
      describeWorldBossReward({ coin: 100, raidToken: 3, bossToken: 0, pieceGrade: null })
    ).toBe('🪙 100 · 🎖️ 3')
    expect(
      describeWorldBossReward({
        coin: 50,
        raidToken: 0,
        bossToken: 2,
        pieceGrade: EnumEquipmentGrade.EPIC,
      })
    ).toBe('🪙 50 · 🎫 2 · ชิ้นเซ็ต (มหากาพย์)')
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
