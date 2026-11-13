import {
  RELIC_SKILL_DAMAGE_PCT,
  type Element,
  type HeroId,
  type SkillId,
} from '../../../../td-sim/src'

// Shapes returned by GET /td/relics and the unlock call. Matching rule, prices and effects are the
// server's; the check here only decides whether the unlock button is enabled.
export interface ITdRelic {
  id: string
  hero: HeroId
  element: Element
  skill: SkillId
  cost: { coins: number; shards: number }
  unlocked: boolean
  /** The player owns the hero and a core of its element. */
  eligible: boolean
}

export interface ITdRelics {
  relics: ITdRelic[]
}

export const canUnlockRelic = (relic: ITdRelic, balances: { coins: number; shards: number }) =>
  relic.eligible &&
  !relic.unlocked &&
  balances.coins >= relic.cost.coins &&
  balances.shards >= relic.cost.shards

export const relicEffectText = () =>
  `สกิลเฉพาะในดราฟต์ · ฮีโร่ประจำเรลิกโจมตี +${RELIC_SKILL_DAMAGE_PCT}% ต่อครั้งที่เลือก`
