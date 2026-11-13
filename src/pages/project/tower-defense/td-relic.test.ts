import { describe, expect, it } from 'vitest'
import { RELICS, RELIC_IDS, RELIC_SKILL_DAMAGE_PCT } from '../../../../td-sim/src'
import { skillLabel } from './strings'
import { canUnlockRelic, relicEffectText, type ITdRelic } from './td-relic'

const relic = (over: Partial<ITdRelic> = {}): ITdRelic => ({
  id: 'ember-brand',
  hero: 'cinder-witch',
  element: 'fire',
  skill: 'ember-surge',
  cost: { coins: 100, shards: 10 },
  unlocked: false,
  eligible: true,
  ...over,
})
const rich = { coins: 100, shards: 10 }

describe('canUnlockRelic', () => {
  it('needs an eligible, locked relic and enough of both materials', () => {
    expect(canUnlockRelic(relic(), rich)).toBe(true)
    expect(canUnlockRelic(relic({ eligible: false }), rich)).toBe(false)
    expect(canUnlockRelic(relic({ unlocked: true }), rich)).toBe(false)
    expect(canUnlockRelic(relic(), { coins: 99, shards: 10 })).toBe(false)
    expect(canUnlockRelic(relic(), { coins: 100, shards: 9 })).toBe(false)
  })
})

describe('relic skills', () => {
  it('are named in both languages, and the effect text carries the sim percent', () => {
    for (const id of RELIC_IDS) {
      expect(skillLabel('th', RELICS[id].skill)).toBeTruthy()
      expect(skillLabel('en', RELICS[id].skill)).toBeTruthy()
    }
    expect(relicEffectText()).toContain(`+${RELIC_SKILL_DAMAGE_PCT}%`)
  })
})
