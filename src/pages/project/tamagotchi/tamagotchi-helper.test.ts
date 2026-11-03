import { describe, expect, it } from 'vitest'
import {
  filterBag,
  getAdventureBlocker,
  getMinigameBlocker,
  getStaminaRefillBlocker,
  isInZone,
  minigameBarPosition,
  staminaFullInMinutes,
} from './tamagotchi-helper'
import {
  describeBattleEvent,
  describeConditions,
  describeMissingConditions,
  formatAge,
  getActionBlocker,
  getBattleBlocker,
  getEvolutionCountdown,
  describePctBonus,
  describeWorldBossReward,
  formatFriendCode,
  getGiftBlocker,
  getSupportBlocker,
  formatTimeLeft,
  getWorldBossBlocker,
  describeSetEffect,
  compareEquipment,
  canAllocatePassive,
  canDeallocatePassive,
  getBranchRespecCost,
  getPassiveBranch,
  searchPassiveNodes,
  describePassiveEffect,
  describeReset,
  foldSelectedMonster,
  elementLabel,
  lineOptions,
  potentialPercent,
  signed,
  findMergeForm,
  getMergeBlocker,
  getRespecCost,
  sumPassiveEffects,
  describeSetTier,
  isSetComplete,
  isSetTierActive,
  setPieceLabel,
  describeSpecials,
  describeStats,
  describeCostumePrice,
  getCostumeBuyBlocker,
  resolveLoadout,
  petLabel,
  isWornBy,
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
  toHearts,
  toThaiErrorMessage,
} from './tamagotchi-helper'
import {
  EnumEquipmentGrade,
  EnumEquipmentSlot,
  EnumMonsterAction,
  EnumMonsterLine,
  EnumMonsterStage,
  IBattleData,
  IBattleEvent,
  IBattleStats,
  ICostume,
  ICostumeState,
  EnumCostumeSlot,
  IEquipmentItem,
  ISetProgress,
  IMergeForm,
  IEvolutionRuleInfo,
  IPassiveNode,
  IMonsterData,
} from './tamagotchi-interface'

const NOW = new Date('2026-01-01T03:00:00Z')

const monster = (overrides: Partial<IMonsterData> = {}): IMonsterData => ({
  id: 'monster-1',
  line: EnumMonsterLine.FLAME,
  speciesId: 'flame_adultGood',
  stage: EnumMonsterStage.ADULT,
  name: 'เพลิงจอมซน',
  nickname: null,
  displayName: 'เพลิงจอมซน',
  costume: {},
  emoji: '🦎',
  fullness: 4,
  strength: 4,
  stamina: 100,
  weight: 20,
  poops: 1,
  isSick: false,
  careMistakes: 0,
  trainCount: 0,
  wins: 0,
  losses: 0,
  ageMinutes: 0,
  bornAt: NOW.toISOString(),
  trainReadyAt: null,
  battleStats: null,
  potentialView: { isLegacy: true, grade: null, average: null, stats: {} as never },
  autoBattleReadyAt: null,
  minigameReadyAt: null,
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

  it('still allows fighting with no strength', () => {
    expect(getBattleBlocker(monster({ strength: 0 }))).toBeNull()
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

describe('describeSpecials', () => {
  it('lists the options with their percent, empty without any', () => {
    expect(
      describeSpecials([
        { key: 'slowHunger', value: 12 },
        { key: 'tidyPet', value: 20 },
      ])
    ).toBe('หิวช้าลง 12% · อึน้อยลง 20%')
    expect(describeSpecials([])).toBe('')
    expect(describeSpecials(undefined)).toBe('')
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

describe('compareEquipment', () => {
  const piece = (stats: Partial<IBattleStats>) =>
    ({ stats: { hp: 0, atk: 0, def: 0, spd: 0, ...stats } }) as IEquipmentItem

  it('lists what rises and falls against the worn piece, skipping unchanged stats', () => {
    expect(compareEquipment(piece({ atk: 8, hp: 5 }), piece({ atk: 5, def: 2, hp: 5 }))).toEqual([
      { key: 'atk', diff: 3 },
      { key: 'def', diff: -2 },
    ])
  })

  it('treats an empty slot as zero stats', () => {
    expect(compareEquipment(piece({ spd: 4 }), undefined)).toEqual([{ key: 'spd', diff: 4 }])
  })
})

describe('describeReset', () => {
  it('shows the time left and the Thai clock time of the reset', () => {
    // 11:00Z is 18:00 in Thailand
    expect(describeReset('2026-01-01T11:00:00Z', new Date('2026-01-01T08:45:00Z'))).toBe(
      'รีเซ็ตใน 2 ชม. 15 นาที (18:00 น.)'
    )
  })
})

describe('passive tree helpers', () => {
  const node = (id: string, adj: string[], fx: IPassiveNode['fx'] = {}) =>
    ({ id, adj, fx }) as IPassiveNode
  const nodes = [
    node('hub', ['a']),
    node('a', ['hub', 'b'], { atk: 3 }),
    node('b', ['a'], { atk: 3, hp: -20 }),
  ]

  it('allocates only next to the hub or an owned node', () => {
    expect(canAllocatePassive(nodes, [], 'a')).toBe(true)
    expect(canAllocatePassive(nodes, [], 'b')).toBe(false)
    expect(canAllocatePassive(nodes, ['a'], 'b')).toBe(true)
    expect(canAllocatePassive(nodes, ['a'], 'a')).toBe(false)
  })

  it('drops only a node that keeps the rest connected', () => {
    expect(canDeallocatePassive(nodes, ['a', 'b'], 'b')).toBe(true)
    expect(canDeallocatePassive(nodes, ['a', 'b'], 'a')).toBe(false)
  })

  it('sums and describes effects', () => {
    expect(sumPassiveEffects(nodes, ['a', 'b'])).toEqual([
      { key: 'atk', value: 6 },
      { key: 'hp', value: -20 },
    ])
    expect(describePassiveEffect('hp', -20)).toBe('−20% HP')
    expect(describePassiveEffect('burn', 1)).toBe('เทิร์นเผาไหม้ของท่าพิเศษ +1')
  })

  it('charges gems only past the free refunds', () => {
    const respec = { refunded: 8, freeLeft: 2, gemPrice: 1 }
    expect(getRespecCost(respec, 2)).toBe(0)
    expect(getRespecCost(respec, 5)).toBe(3)
  })
})

describe('merge helpers', () => {
  const cost = { coin: 2000, gem: 20 }
  const rich = { coin: 5000, gem: 50 }
  const ultimate = (over: Partial<IMonsterData> = {}) =>
    monster({ stage: EnumMonsterStage.ULTIMATE, ...over })

  it('finds the form for a pair of lines in either order', () => {
    const forms = [
      { id: 'a', lines: [EnumMonsterLine.FLAME, EnumMonsterLine.TIDE] },
      { id: 'b', lines: [EnumMonsterLine.LEAF, EnumMonsterLine.LEAF] },
    ] as IMergeForm[]
    expect(findMergeForm(forms, EnumMonsterLine.TIDE, EnumMonsterLine.FLAME)?.id).toBe('a')
    expect(findMergeForm(forms, EnumMonsterLine.LEAF, EnumMonsterLine.LEAF)?.id).toBe('b')
    expect(findMergeForm(forms, EnumMonsterLine.LEAF, EnumMonsterLine.TIDE)).toBeUndefined()
  })

  it('explains what blocks a merge, in the order the server checks', () => {
    const a = ultimate({ id: 'a' })
    const b = ultimate({ id: 'b' })
    expect(getMergeBlocker(a, undefined, rich, cost)).toBe('เลือกมอนสองตัว')
    expect(getMergeBlocker(a, monster({ stage: EnumMonsterStage.PERFECT }), rich, cost)).toBe(
      'ต้องเป็นร่างสูงสุด (ยังไม่ใช่ร่างสุดท้าย)'
    )
    expect(getMergeBlocker(a, ultimate({ isSick: true }), rich, cost)).toBe('ป่วยอยู่')
    expect(getMergeBlocker(a, ultimate({ expeditionAreaId: 'meadow' }), rich, cost)).toBe(
      'ออกสำรวจอยู่'
    )
    expect(getMergeBlocker(a, b, { coin: 1999, gem: 50 }, cost)).toBe('เหรียญไม่พอ')
    expect(getMergeBlocker(a, b, { coin: 5000, gem: 19 }, cost)).toBe('เพชรไม่พอ')
    expect(getMergeBlocker(a, b, rich, cost)).toBeNull()
    const spirit = [EnumMonsterLine.HOLY, EnumMonsterLine.DARK, EnumMonsterLine.SHADOW]
    expect(getMergeBlocker(a, ultimate({ line: EnumMonsterLine.HOLY }), rich, cost, spirit)).toBe(
      'ธาตุธรรมชาติกับธาตุจิตวิญญาณรวมกันไม่ได้'
    )
    expect(
      getMergeBlocker(
        ultimate({ line: EnumMonsterLine.DARK }),
        ultimate({ line: EnumMonsterLine.HOLY }),
        rich,
        cost,
        spirit
      )
    ).toBeNull()
  })
})

describe('potential helpers', () => {
  it('places a rolled value inside its range, and a fixed stat at 0', () => {
    expect(potentialPercent({ min: 100, max: 120, value: 115 })).toBe(75)
    expect(potentialPercent({ min: 5, max: 5, value: 5 })).toBe(0)
  })

  it('signs the breakdown numbers', () => {
    expect(signed(3)).toBe('+3')
    expect(signed(-2.5)).toBe('−2.5')
    expect(signed(0)).toBe('+0')
  })

  it('describes a dodged hit', () => {
    const battle = {
      player: { name: 'A' },
      enemy: { name: 'B' },
    } as IBattleData
    const event = { actor: 'player', isDodged: true, damage: 0 } as IBattleEvent
    expect(describeBattleEvent(event, battle)).toBe('B หลบการโจมตีของ A ได้')
  })
})

describe('elements', () => {
  it('labels every element and offers an egg for each normal one', () => {
    for (const line of Object.values(EnumMonsterLine)) {
      expect(elementLabel[line]).toBeTruthy()
    }
    expect(lineOptions.map((option) => option.line)).toEqual(Object.values(EnumMonsterLine))
    expect(lineOptions.filter((option) => option.isRare).map((option) => option.line)).toEqual([
      EnumMonsterLine.HOLY,
      EnumMonsterLine.DARK,
      EnumMonsterLine.SHADOW,
    ])
  })
})

describe('foldSelectedMonster', () => {
  const pet = (id: string, over: Partial<IMonsterData> = {}) => monster({ id, ...over })
  const cached = (...pets: IMonsterData[]) => ({ monster: pets[0], monsters: pets, maxMonsters: 4 })

  it('keeps the old pets when a new egg is hatched, and selects the new one', () => {
    const old = cached(pet('a'), pet('b'))
    const next = foldSelectedMonster(old, pet('c'))
    expect(next.monsters.map((row) => row.id)).toEqual(['a', 'b', 'c'])
    expect(next.monster?.id).toBe('c')
  })

  it('replaces a pet in place when it is updated, without duplicating it', () => {
    const old = cached(pet('a'), pet('b'))
    const next = foldSelectedMonster(old, pet('b', { poops: 3 }))
    expect(next.monsters).toHaveLength(2)
    expect(next.monsters[1].poops).toBe(3)
    expect(next.monster?.id).toBe('b')
  })

  it('starts a list when nothing was cached yet', () => {
    expect(foldSelectedMonster(undefined, pet('a')).monsters.map((row) => row.id)).toEqual(['a'])
  })
})

describe('isWornBy', () => {
  const piece = (over: Partial<IEquipmentItem>) =>
    ({ equipped: true, monsterId: 'a', ...over }) as IEquipmentItem

  it('only counts a piece as worn for the pet that wears it', () => {
    expect(isWornBy(piece({}), 'a')).toBe(true)
    expect(isWornBy(piece({}), 'b')).toBe(false)
    expect(isWornBy(piece({ equipped: false, monsterId: null }), 'a')).toBe(false)
  })
})

describe('petLabel', () => {
  it('puts the nickname first and keeps the species name', () => {
    expect(petLabel('Sun King', 'Mochi')).toBe('Mochi (Sun King)')
    expect(petLabel('Sun King', null)).toBe('Sun King')
  })
})

describe('costumes', () => {
  const costume = (over: Partial<ICostume>): ICostume => ({
    id: 'cap',
    slot: EnumCostumeSlot.HAT,
    name: 'หมวก',
    emoji: '🧢',
    rarity: EnumEquipmentGrade.COMMON,
    theme: null,
    price: { currency: 'coin', amount: 150 },
    ...over,
  })
  const state = (owned: string[] = []): ICostumeState => ({
    catalog: [],
    owned,
    themes: [],
    selectedId: null,
    pets: [],
    showCostume: true,
  })
  const NOW = new Date('2026-06-01T00:00:00Z')

  it('resolves a loadout against the catalog and skips unknown or misplaced ids', () => {
    const hat = costume({})
    const face = costume({ id: 'shades', slot: EnumCostumeSlot.FACE, emoji: '🕶️' })
    const layers = resolveLoadout({ hat: 'cap', face: 'cap', back: 'nope' }, [hat, face])
    expect(layers).toEqual({ hat })
    expect(resolveLoadout(null, [hat])).toEqual({})
    expect(resolveLoadout({ hat: 'cap' }, undefined)).toEqual({})
  })

  it('writes each price source in Thai', () => {
    expect(describeCostumePrice(costume({}))).toBe('🪙 150')
    expect(describeCostumePrice(costume({ price: { currency: 'gem', amount: 40 } }))).toBe('💎 40')
    expect(describeCostumePrice(costume({ price: { currency: 'season', amount: 0 } }))).toBe(
      'รางวัลซีซัน PvP'
    )
    expect(describeCostumePrice(costume({ price: { currency: 'coin', amount: 0 } }))).toBe('ฟรี')
  })

  it('explains why a costume cannot be bought', () => {
    expect(getCostumeBuyBlocker(costume({}), state(['cap']), 999, 0, NOW)).toBe('มีแล้ว')
    expect(getCostumeBuyBlocker(costume({}), state(), 100, 0, NOW)).toBe('เหรียญไม่พอ')
    expect(
      getCostumeBuyBlocker(
        costume({ price: { currency: 'gem', amount: 40 } }),
        state(),
        999,
        10,
        NOW
      )
    ).toBe('เพชรไม่พอ')
    expect(
      getCostumeBuyBlocker(
        costume({ price: { currency: 'season', amount: 0 } }),
        state(),
        999,
        99,
        NOW
      )
    ).toMatch(/ซีซัน/)
    expect(
      getCostumeBuyBlocker(costume({ endsAt: '2026-05-01T00:00:00Z' }), state(), 999, 99, NOW)
    ).toBe('หมดเวลาจำหน่ายแล้ว')
    expect(getCostumeBuyBlocker(costume({}), state(), 150, 0, NOW)).toBeNull()
  })
})

describe('set progress labels', () => {
  const set = (worn: number): ISetProgress => ({
    setId: 'blazing',
    name: 'ชุดเพลิงกัลป์',
    pieceCount: 4,
    worn,
    isEnhanced: false,
    tiers: [
      { pieces: 2, pct: { atk: 0.15 }, effect: null },
      { pieces: 4, pct: null, effect: { burnTurns: 3 } },
    ],
  })

  it('writes worn/full next to the set name', () => {
    expect(setPieceLabel(set(2))).toBe('ชุดเพลิงกัลป์ 2/4')
  })

  it('is green (complete) only when every piece of the set is worn', () => {
    expect(isSetComplete(set(0))).toBe(false)
    expect(isSetComplete(set(3))).toBe(false)
    expect(isSetComplete(set(4))).toBe(true)
  })

  it('turns a tier on from its piece count', () => {
    const [two, four] = set(2).tiers
    expect(isSetTierActive(set(1), two)).toBe(false)
    expect(isSetTierActive(set(2), two)).toBe(true)
    expect(isSetTierActive(set(3), four)).toBe(false)
    expect(isSetTierActive(set(4), four)).toBe(true)
  })

  it('describes a tier by its stat bonus and its effect', () => {
    const [two, four] = set(4).tiers
    expect(describeSetTier(two)).toBe('ATK +15%')
    expect(describeSetTier(four)).toBe('สกิลทำให้ศัตรูติดเผาไหม้ 3 เทิร์น')
  })

  it('also words crit effects', () => {
    expect(describeSetEffect({ critChance: 0.1, critDamage: 0.2 })).toBe(
      'อัตราคริติคอล +10% · ดาเมจคริติคอล +20%'
    )
  })
})

describe('adventure stamina helpers', () => {
  it('adds the stamina gate on top of the normal battle checks', () => {
    expect(getAdventureBlocker(monster({ stamina: 10 }), 10)).toBeNull()
    expect(getAdventureBlocker(monster({ stamina: 9.9 }), 10)).toBe(
      'Stamina ไม่พอ รอฟื้นหรือเติมก่อน'
    )
    expect(getAdventureBlocker(monster({ isSick: true, stamina: 0 }), 10)).toBe(
      'ป่วยอยู่ สู้ไม่ได้'
    )
  })

  it('works out when stamina is full again', () => {
    expect(staminaFullInMinutes(100, 100, 10)).toBe(0)
    expect(staminaFullInMinutes(70, 100, 10)).toBe(180)
    expect(staminaFullInMinutes(99.5, 100, 10)).toBe(3)
  })

  it('blocks the mini-game during its cooldown', () => {
    const readyAt = new Date(NOW.getTime() + 90_000).toISOString()
    expect(getMinigameBlocker(monster({ minigameReadyAt: readyAt }), NOW)).toBe(
      'เล่นได้อีกครั้งใน 2 นาที'
    )
    expect(getMinigameBlocker(monster(), NOW)).toBeNull()
    expect(getMinigameBlocker(monster({ stage: EnumMonsterStage.EGG }), NOW)).toBe(
      'ต้องมีมอนที่ฟักแล้ว'
    )
  })

  it('only allows a gem refill that can happen', () => {
    expect(getStaminaRefillBlocker(monster({ stamina: 100 }), 100, 99, 5)).toBe(
      'Stamina เต็มอยู่แล้ว'
    )
    expect(getStaminaRefillBlocker(monster({ stamina: 40 }), 100, 4, 5)).toBe('เพชรไม่พอ')
    expect(getStaminaRefillBlocker(monster({ stamina: 40 }), 100, 5, 5)).toBeNull()
  })

  it('sweeps the mini-game bar and checks the zone inclusively', () => {
    expect(minigameBarPosition(250, 1000)).toBe(50)
    expect(minigameBarPosition(500, 1000)).toBe(100)
    expect(minigameBarPosition(750, 1000)).toBe(50)
    expect(isInZone(40, { start: 40, width: 20 })).toBe(true)
    expect(isInZone(60.1, { start: 40, width: 20 })).toBe(false)
  })
})

describe('filterBag', () => {
  const item = (over: Partial<IEquipmentItem>) =>
    ({
      id: 'x',
      slot: EnumEquipmentSlot.WEAPON,
      grade: EnumEquipmentGrade.COMMON,
      enhanceLevel: 0,
      equipped: false,
      monsterId: null,
      ...over,
    }) as IEquipmentItem
  const bag = [
    item({ id: 'sword', grade: EnumEquipmentGrade.RARE, enhanceLevel: 1 }),
    item({ id: 'axe', grade: EnumEquipmentGrade.RARE, enhanceLevel: 5 }),
    item({ id: 'helm', slot: EnumEquipmentSlot.HELMET, grade: EnumEquipmentGrade.EPIC }),
    item({ id: 'worn', grade: EnumEquipmentGrade.LEGENDARY, equipped: true, monsterId: 'pet-2' }),
  ]

  it('keeps one slot type, best grade then highest level first', () => {
    expect(
      filterBag(bag, { slot: EnumEquipmentSlot.WEAPON, freeOnly: false }).map((i) => i.id)
    ).toEqual(['worn', 'axe', 'sword'])
    expect(filterBag(bag, { slot: 'all', freeOnly: false })).toHaveLength(4)
  })

  it('can hide pieces another pet is wearing', () => {
    expect(
      filterBag(bag, { slot: EnumEquipmentSlot.WEAPON, freeOnly: true }).map((i) => i.id)
    ).toEqual(['axe', 'sword'])
  })
})

describe('passive branch and search', () => {
  const node = (id: string, adj: string[], name = id, fx: IPassiveNode['fx'] = {}) =>
    ({ id, adj, name, fx }) as IPassiveNode
  const nodes = [
    node('hub', ['a']),
    node('a', ['hub', 'b'], 'Ember Might', { atk: 2 }),
    node('b', ['a', 'c'], 'Deep Pool', { hp: 2 }),
    node('c', ['b'], 'Deep Pool', { hp: 2 }),
  ]

  it('takes the node and everything cut off from the hub', () => {
    expect(getPassiveBranch(nodes, ['a', 'b', 'c'], 'b')).toEqual(['b', 'c'])
    expect(getPassiveBranch(nodes, ['a', 'b', 'c'], 'c')).toEqual(['c'])
    expect(getPassiveBranch(nodes, ['a'], 'b')).toEqual([])
  })

  it('searches names and effect labels, and never the hub', () => {
    expect([...searchPassiveNodes(nodes, 'deep')]).toEqual(['b', 'c'])
    expect([...searchPassiveNodes(nodes, 'atk')]).toEqual(['a'])
    expect(searchPassiveNodes(nodes, '  ').size).toBe(0)
  })

  it('caps a branch refund at the branch cap', () => {
    const respec = { refunded: 10, freeLeft: 0, gemPrice: 1, branchCap: 20 }
    expect(getBranchRespecCost(respec, 12)).toBe(12)
    expect(getBranchRespecCost(respec, 60)).toBe(20)
  })
})
