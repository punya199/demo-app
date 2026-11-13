import {
  ADVANTAGE_PCT,
  CORE_DAMAGE_PCT,
  CORE_RARITIES,
  CORE_SLOTS,
  CRIT_OUTPUT_PCT,
  DISADVANTAGE_PCT,
  ELEMENT_BEATS,
  LEVEL_OUTPUT_PCT,
  MAX_CRIT_PCT,
  MAX_LEVEL,
  MAX_STAR,
  PENALTY_OUTPUT_PCT,
  RELIC_SKILL_DAMAGE_PCT,
  RESONANCE_CRIT_PCT,
  ROUND_COUNT,
  SIDE_OUTPUT_PCT,
  START_HP,
  STAGE_COUNT,
  STAR_DAMAGE_PCT,
  STRONG_SKILL_STAR,
  SUMMON_COST,
  type Element,
} from '../../../../td-sim/src'
import { t, type Lang, type StringKey } from './strings'
import { REGEN_SECONDS, type ITdProfile } from './td-energy'
import { RARITIES, type ITdGachaConfig } from './td-gacha'
import { SWEEP_MIN_STARS } from './td-stage'

/** Numbers that only the server sends (GET /td/profile, GET /td/gacha) show a dash until they load. */
const MISSING = '–'

export interface IWikiInput {
  gacha: ITdGachaConfig | undefined
  energy: ITdProfile['energy'] | undefined
}

/** Follows the advantage rule from fire (or whichever element has a target) until it closes into a loop, e.g. fire, nature, ice, fire. */
export const elementCycle = (): Element[] => {
  const start = (Object.keys(ELEMENT_BEATS) as Element[]).find((e) => ELEMENT_BEATS[e] !== null)
  if (!start) return []
  const path: Element[] = [start]
  for (let next = ELEMENT_BEATS[start]; next !== null; next = ELEMENT_BEATS[next]) {
    path.push(next)
    if (next === start || path.length > 8) break
  }
  return path
}

const dash = (value: number | undefined) => (value === undefined ? MISSING : value)

const wikiParams = (lang: Lang, { gacha, energy }: IWikiInput) => {
  const params: Record<string, string | number> = {
    hp: START_HP,
    rounds: ROUND_COUNT,
    stages: STAGE_COUNT,
    summon: SUMMON_COST,
    side: SIDE_OUTPUT_PCT,
    penalty: PENALTY_OUTPUT_PCT,
    maxLevel: MAX_LEVEL,
    maxLevelPct: LEVEL_OUTPUT_PCT[MAX_LEVEL - 1],
    res: RESONANCE_CRIT_PCT,
    resCap: MAX_CRIT_PCT,
    crit: CRIT_OUTPUT_PCT,
    stageCost: dash(energy?.stageCost),
    cap: dash(energy?.cap),
    regen: REGEN_SECONDS / 60,
    single: dash(gacha?.singleCost),
    ten: dash(gacha?.tenCost),
    pity: dash(gacha?.pityLimit),
    maxStar: MAX_STAR,
    starPct: STAR_DAMAGE_PCT[MAX_STAR - 1],
    strongStar: STRONG_SKILL_STAR,
    sweepStars: SWEEP_MIN_STARS,
    slots: CORE_SLOTS,
    adv: ADVANTAGE_PCT,
    dis: DISADVANTAGE_PCT,
    cycle: elementCycle()
      .map((e) => t(lang, `el_${e}`))
      .join(' > '),
    relic: RELIC_SKILL_DAMAGE_PCT,
  }
  for (const r of RARITIES) {
    params[`rate_${r}`] = dash(gacha?.rates[r])
    params[`dup_${r}`] = dash(gacha?.duplicateShards[r])
  }
  for (const r of CORE_RARITIES) params[`core_${r}`] = CORE_DAMAGE_PCT[r]
  return params
}

const SECTIONS = [
  ['battle', 3],
  ['charging', 3],
  ['merging', 2],
  ['resonance', 2],
  ['energy', 2],
  ['gacha', 4],
  ['stars', 3],
  ['cores', 2],
  ['relics', 2],
  ['sweep', 2],
] as const

export interface IWikiSection {
  id: (typeof SECTIONS)[number][0]
  title: string
  lines: string[]
}

/** The wiki text. Every number comes from the td-sim config or from the server data the page already loads, never typed into a string. */
export const wikiSections = (lang: Lang, input: IWikiInput): IWikiSection[] => {
  const params = wikiParams(lang, input)
  return SECTIONS.map(([id, count]) => ({
    id,
    title: t(lang, `wiki_${id}_title` as StringKey),
    lines: Array.from({ length: count }, (_, i) =>
      t(lang, `wiki_${id}_${i + 1}` as StringKey, params)
    ),
  }))
}

