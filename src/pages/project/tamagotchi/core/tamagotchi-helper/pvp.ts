import {
  ISupportUnit,
  IWorldBossReward,
  IWorldBossStatus,
  IBattleStats,
  IFighterEffects,
  IPvpStatus,
  StatKey,
  EnumMonsterStage,
  IMonsterData,
} from '../tamagotchi-interface'
import { gradeLabel, statLabel, toPercent } from './equipment'

const PVP_STAGES = [EnumMonsterStage.ADULT, EnumMonsterStage.PERFECT, EnumMonsterStage.ULTIMATE]
// The arena, the World Boss and support units take every grown form, fused ones included.
const WORLD_BOSS_STAGES = [...PVP_STAGES, EnumMonsterStage.FUSED]

// Mirrors the server's arena checks so the button explains itself.
export const getPvpBlocker = (
  monster: IMonsterData | null,
  status: IPvpStatus | undefined
): string | null => {
  if (!monster || monster.diedAt) {
    return 'ต้องมีมอนที่มีชีวิต'
  }
  if (!WORLD_BOSS_STAGES.includes(monster.stage)) {
    return 'ต้องเป็นร่างโตขึ้นไปถึงเข้าสนามได้'
  }
  if (monster.isSick) {
    return 'ป่วยอยู่ สู้ไม่ได้'
  }
  if (monster.expeditionAreaId) {
    return 'มอนออกสำรวจอยู่'
  }
  if (!status?.defense) {
    return 'ตั้งทีมป้องกันก่อน'
  }
  if (status.attemptsLeft <= 0) {
    return 'ท้าครบจำนวนของวันนี้แล้ว'
  }
  return null
}

export const getDefenseBlocker = (
  monster: IMonsterData | null,
  status: IPvpStatus | undefined,
  now: Date
): string | null => {
  if (!monster || monster.diedAt || !WORLD_BOSS_STAGES.includes(monster.stage)) {
    return 'ต้องเป็นร่างโตขึ้นไปถึงเข้าสนามได้'
  }
  if (status?.defense && new Date(status.defense.readyAt) > now) {
    const minutesLeft = Math.ceil(
      (new Date(status.defense.readyAt).getTime() - now.getTime()) / 60_000
    )
    return `เปลี่ยนทีมป้องกันได้อีกครั้งใน ${minutesLeft} นาที`
  }
  return null
}

export const formatRatingChange = (before: number, after: number) =>
  `${before} → ${after} (${after >= before ? '+' : ''}${after - before})`

// Mirrors the server's arena rules for set effects (arena-rules.ts).
const SET_BURN_CHANCE = 0.3
const SET_SHIELD_REFRESH_SEC = 12
const SET_LAST_STAND_BELOW = 0.35

// Set effects as they play in the real-time arena.
export const describeSetEffect = (effect: IFighterEffects) =>
  [
    effect.burnTurns &&
      `ตีปกติมีโอกาส ${toPercent(SET_BURN_CHANCE)} ทำให้ติดเผาไหม้ ${effect.burnTurns} วิ`,
    effect.burnBonus && `ตีศัตรูที่ติดเผาไหม้แรงขึ้น ${toPercent(effect.burnBonus)}`,
    effect.shieldPct && `เริ่มสู้ด้วยโล่ ${toPercent(effect.shieldPct)} ของ HP`,
    effect.shieldRefresh &&
      `ได้โล่ ${toPercent(effect.shieldRefresh)} ของ HP ทุก ${SET_SHIELD_REFRESH_SEC} วิ`,
    effect.regenPct &&
      `ฟื้น HP ${Math.round(effect.regenPct * 10000) / 100}% ของ HP สูงสุดทุกวินาที`,
    effect.doubleStrikeChance && `ตีปกติมีโอกาสตีซ้ำ ${toPercent(effect.doubleStrikeChance)}`,
    effect.cooldownCut && `คูลดาวน์สกิลสั้นลง ${toPercent(effect.cooldownCut)}`,
    effect.lastStandShield &&
      `เมื่อ HP ต่ำกว่า ${toPercent(SET_LAST_STAND_BELOW)} ได้โล่ ${toPercent(effect.lastStandShield)} ของ HP ล้างสถานะผิดปกติ และกันการควบคุม 2 วิ (ครั้งเดียวต่อไฟต์)`,
    effect.critChance && `อัตราคริติคอล +${toPercent(effect.critChance)}`,
    effect.critDamage && `ดาเมจคริติคอล +${toPercent(effect.critDamage)}`,
    effect.evasion && `EVA +${Math.round(effect.evasion * 100)}`,
    effect.damageCut && `ลดดาเมจที่ได้รับ ${toPercent(effect.damageCut)}`,
    effect.executeBonus && `โจมตีศัตรูที่ HP ต่ำกว่า 30% แรงขึ้น ${toPercent(effect.executeBonus)}`,
    effect.slowOnBasic && `ตีปกติมีโอกาส ${effect.slowOnBasic}% ทำให้ช้าลง`,
    effect.defDownOnBasic && `ตีปกติมีโอกาส ${effect.defDownOnBasic}% ลด DEF ศัตรู`,
    effect.poisonOnBasic && `ตีปกติมีโอกาส ${effect.poisonOnBasic}% ทำให้ติดพิษ`,
    effect.curseOnBasic && `ตีปกติมีโอกาส ${effect.curseOnBasic}% ทำให้ติดคำสาป`,
    effect.stunOnBasic && `ตีปกติมีโอกาส ${effect.stunOnBasic}% ทำให้สตัน`,
    effect.poisonBonus && `ตีศัตรูที่ติดพิษแรงขึ้น ${toPercent(effect.poisonBonus)}`,
    effect.retort &&
      `โดนตีระยะประชิดแล้วสวนกลับ ${toPercent(effect.retort)} ของดาเมจ และทำให้ผู้ตีบอด`,
    effect.lifesteal && `ดูดเลือด ${toPercent(effect.lifesteal)} ของดาเมจ`,
    effect.firstStrike && `ได้ตีก่อนในไฟต์`,
    effect.thorns && `สะท้อนดาเมจ ${toPercent(effect.thorns)}`,
    effect.dodgeCdCutSec && `คูลดาวน์สกิลหลบลดลง ${effect.dodgeCdCutSec} วิ`,
    effect.afterDodgeBonus &&
      `หลบได้แล้ว การโจมตีครั้งถัดไปติดคริและแรงขึ้น ${toPercent(effect.afterDodgeBonus)}`,
  ]
    .filter(Boolean)
    .join(' · ')

export const describePctBonus = (pct: Partial<IBattleStats>) =>
  (Object.keys(statLabel) as StatKey[])
    .filter((key) => (pct[key] ?? 0) > 0)
    .map((key) => `${statLabel[key]} +${toPercent(pct[key] ?? 0)}`)
    .join(' · ')

// Mirrors the server's raid checks so the button explains itself.
export const getRaidBlocker = (
  monster: IMonsterData | null,
  difficulty: { unlocked: boolean },
  attemptsLeft: number
): string | null => {
  if (!monster || monster.diedAt) {
    return 'ต้องมีมอนที่มีชีวิต'
  }
  if (monster.isSick) {
    return 'ป่วยอยู่ สู้ไม่ได้'
  }
  if (monster.expeditionAreaId) {
    return 'มอนออกสำรวจอยู่'
  }
  if (!difficulty.unlocked) {
    return 'ยังไม่ปลดล็อก (ต้องถึงร่างที่กำหนด และชนะระดับก่อนหน้า)'
  }
  if (attemptsLeft <= 0) {
    return 'สู้บอสครบจำนวนแล้ว รอรีเซ็ต'
  }
  return null
}

// Mirrors the server's world boss checks so the button explains itself.
export const getWorldBossBlocker = (
  monster: IMonsterData | null,
  status: IWorldBossStatus | undefined
): string | null => {
  if (!monster || monster.diedAt) {
    return 'ต้องมีมอนที่มีชีวิต'
  }
  if (!WORLD_BOSS_STAGES.includes(monster.stage)) {
    return 'ต้องเป็นร่างโตขึ้นไปถึงตีบอสโลกได้'
  }
  if (monster.isSick) {
    return 'ป่วยอยู่ สู้ไม่ได้'
  }
  if (monster.expeditionAreaId) {
    return 'มอนออกสำรวจอยู่'
  }
  if (status?.boss.isDefeated) {
    return 'บอสตัวนี้ถูกล้มแล้ว รอบอสสัปดาห์หน้า'
  }
  if (status && status.hitsLeft <= 0) {
    return 'ตีครบจำนวนแล้ว รอรีเซ็ต'
  }
  return null
}

export const describeWorldBossReward = (reward: IWorldBossReward, bossTokenName = '🎫') =>
  [
    `🪙 ${reward.coin}`,
    reward.raidToken > 0 && `🎖️ ${reward.raidToken}`,
    reward.bossToken > 0 && `${bossTokenName} ${reward.bossToken}`,
    reward.pieceGrade && `ชิ้นเซ็ต (${gradeLabel[reward.pieceGrade]})`,
    describeRefineStones(reward.refineStones),
  ]
    .filter(Boolean)
    .join(' · ')

export const refineStoneLabel: Record<string, string> = {
  refine_stone_common: '💠 รีไฟน์ธรรมดา',
  refine_stone_rare: '💠 รีไฟน์หายาก',
  refine_stone_epic: '💠 รีไฟน์มหากาพย์',
  refine_stone_legendary: '💠 รีไฟน์ตำนาน',
}

// "💠 รีไฟน์มหากาพย์ ×2 · ..." (empty when there are none).
export const describeRefineStones = (stones: Record<string, number>) =>
  Object.entries(stones)
    .filter(([, quantity]) => quantity > 0)
    .map(([material, quantity]) => `${refineStoneLabel[material] ?? material} ×${quantity}`)
    .join(' · ')

interface IRefineTier {
  material: string
  maxLevel: number
  coin: number
}

// The tier a refine will spend, mirroring the server: the lowest one that covers the piece's
// enhance level and that the player owns (null when none).
export const pickRefineTier = (
  tiers: IRefineTier[],
  enhanceLevel: number,
  quantityOf: (material: string) => number
) => tiers.find((tier) => tier.maxLevel >= enhanceLevel && quantityOf(tier.material) > 0) ?? null

// Time left until `endsAt`, in days/hours/minutes ("2 วัน 3 ชม.").
export const formatTimeLeft = (endsAt: string, now: Date) => {
  const minutes = Math.max(0, Math.floor((new Date(endsAt).getTime() - now.getTime()) / 60_000))
  const days = Math.floor(minutes / 1440)
  const hours = Math.floor((minutes % 1440) / 60)
  if (days > 0) {
    return `${days} วัน ${hours} ชม.`
  }
  return hours > 0 ? `${hours} ชม. ${minutes % 60} นาที` : `${minutes} นาที`
}

// "ABCD2345" -> "ABCD-2345", easier to read out loud.
export const formatFriendCode = (code: string) => `${code.slice(0, 4)}-${code.slice(4)}`

export const getSupportBlocker = (
  monster: IMonsterData | null,
  support: ISupportUnit | null | undefined,
  now: Date
): string | null => {
  if (!monster || monster.diedAt || !WORLD_BOSS_STAGES.includes(monster.stage)) {
    return 'ต้องเป็นร่างโตขึ้นไปถึงตั้งเป็นตัวซัพพอร์ตได้'
  }
  if (support && new Date(support.readyAt) > now) {
    const minutesLeft = Math.ceil((new Date(support.readyAt).getTime() - now.getTime()) / 60_000)
    return `เปลี่ยนตัวซัพพอร์ตได้อีกครั้งใน ${minutesLeft} นาที`
  }
  return null
}

export const getGiftBlocker = (giftsLeft: number, ownedItems: number): string | null => {
  if (giftsLeft <= 0) {
    return 'ส่งของขวัญครบจำนวนของวันนี้แล้ว'
  }
  return ownedItems <= 0 ? 'ไม่มีไอเทมในกระเป๋าให้ส่ง' : null
}
